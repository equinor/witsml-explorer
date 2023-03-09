using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.Data;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Repositories;
using WitsmlExplorer.Api.Services;

using Index = Witsml.Data.Curves.Index;

namespace WitsmlExplorer.Api.Workers.Copy
{
    public interface ICopyLogDataWorker
    {
        Task<(WorkerResult, RefreshAction)> Execute(CopyLogDataJob job);
    }

    public class CopyLogDataWorker : BaseWorker<CopyLogDataJob>, IWorker, ICopyLogDataWorker
    {
        private readonly IDocumentRepository<Server, Guid> _witsmlServerRepository;
        public JobType JobType => JobType.CopyLogData;

        public CopyLogDataWorker(IWitsmlClientProvider witsmlClientProvider, ILogger<CopyLogDataJob> logger = null, IDocumentRepository<Server, Guid> witsmlServerRepository = null) : base(witsmlClientProvider, logger)
        {
            _witsmlServerRepository = witsmlServerRepository;
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(CopyLogDataJob job)
        {
            Uri targetHostname = GetTargetWitsmlClientOrThrow().GetServerHostname();
            Uri sourceHostname = GetSourceWitsmlClientOrThrow().GetServerHostname();
            IEnumerable<Server> servers = _witsmlServerRepository == null ? new List<Server>() : await _witsmlServerRepository.GetDocumentsAsync();
            int targetDepthLogDecimals = servers.FirstOrDefault((server) => server.Url == targetHostname)?.DepthLogDecimals ?? 0;
            int sourceDepthLogDecimals = servers.FirstOrDefault((server) => server.Url == sourceHostname)?.DepthLogDecimals ?? 0;

            (WitsmlLog sourceLog, WitsmlLog targetLog) = await GetLogs(job);
            List<string> mnemonicsToCopy = job.Source.ComponentUids.Any()
                ? job.Source.ComponentUids.Distinct().ToList()
                : sourceLog.LogCurveInfo.Select(lci => lci.Mnemonic).ToList();

            IEnumerable<string> targetLogMnemonics = targetLog.LogCurveInfo.Select(lci => lci.Mnemonic);
            List<string> existingMnemonicsInTarget = mnemonicsToCopy.Where(mnemonic => targetLogMnemonics.Contains(mnemonic, StringComparer.OrdinalIgnoreCase)).ToList();
            List<string> newMnemonicsInTarget = mnemonicsToCopy.Where(mnemonic => !targetLogMnemonics.Contains(mnemonic, StringComparer.OrdinalIgnoreCase)).ToList();

            try
            {
                VerifyMatchingIndexTypes(sourceLog, targetLog);
                VerifyValidInterval(sourceLog);
                VerifyMatchingIndexCurves(sourceLog, targetLog);
                VerifyIndexCurveIsIncludedInMnemonics(sourceLog, newMnemonicsInTarget, existingMnemonicsInTarget);
                await VerifyTargetHasRequiredLogCurveInfos(sourceLog, job.Source.ComponentUids, targetLog);
            }
            catch (Exception e)
            {
                string errorMessage = "Failed to copy log data.";
                Logger.LogError("{errorMessage} - {Description}", errorMessage, job.Description());
                return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, errorMessage, e.Message), null);
            }

            CopyResult copyResultForExistingMnemonics = await CopyLogData(sourceLog, targetLog, job, existingMnemonicsInTarget, sourceDepthLogDecimals, targetDepthLogDecimals);
            if (!copyResultForExistingMnemonics.Success)
            {
                string message = $"Failed to copy curves for existing mnemonics to log. {copyResultForExistingMnemonics.ErrorReason}. Copied a total of {copyResultForExistingMnemonics.NumberOfRowsCopied} rows.";
                return LogAndReturnErrorResult(message, job);
            }

            CopyResult copyResultForNewMnemonics = await CopyLogData(sourceLog, targetLog, job, newMnemonicsInTarget, sourceDepthLogDecimals, targetDepthLogDecimals);
            if (!copyResultForNewMnemonics.Success)
            {
                string message = $"Failed to copy curves for new mnemonics to log. {copyResultForNewMnemonics.ErrorReason}. Copied a total of {copyResultForNewMnemonics.NumberOfRowsCopied} rows";
                return LogAndReturnErrorResult(message, job);
            }

            int totalRowsCopied = copyResultForExistingMnemonics.NumberOfRowsCopied + copyResultForNewMnemonics.NumberOfRowsCopied;
            Logger.LogInformation("{JobType} - Job successful. {Count} rows copied. {Description}", GetType().Name, totalRowsCopied, job.Description());
            WorkerResult workerResult = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, $"{totalRowsCopied} rows copied");
            RefreshObjects refreshAction = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), job.Target.WellUid, job.Target.WellboreUid, EntityType.Log, job.Target.Uid);
            return (workerResult, refreshAction);
        }

        private (WorkerResult, RefreshAction) LogAndReturnErrorResult(string message, CopyLogDataJob job)
        {
            Logger.LogError("{message} - {Description}", message, job.Description());
            return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, "Failed to copy log data", message), null);
        }

        private async Task<CopyResult> CopyLogData(WitsmlLog sourceLog, WitsmlLog targetLog, CopyLogDataJob job, IReadOnlyCollection<string> mnemonics, int sourceDepthLogDecimals, int targetDepthLogDecimals)
        {
            if (targetDepthLogDecimals > 0 && targetDepthLogDecimals < sourceDepthLogDecimals && sourceLog.IndexType == WitsmlLog.WITSML_INDEX_TYPE_MD)
            {
                return await CopyLogDataWithoutDuplicates(sourceLog, targetLog, job, mnemonics, targetDepthLogDecimals);
            }

            Index startIndex = Index.Start(sourceLog);
            Index endIndex = Index.End(sourceLog);
            int numberOfDataRowsCopied = 0;

            while (startIndex < endIndex)
            {
                WitsmlLogs query = LogQueries.GetLogContent(job.Source.Parent.WellUid, job.Source.Parent.WellboreUid,
                    job.Source.Parent.Uid, sourceLog.IndexType, mnemonics, startIndex, endIndex);
                WitsmlLogs sourceData = await GetSourceWitsmlClientOrThrow().GetFromStoreAsync(query, new OptionsIn(ReturnElements.DataOnly));
                if (!sourceData.Logs.Any())
                {
                    break;
                }

                WitsmlLog sourceLogWithData = sourceData.Logs.First();
                WitsmlLogs copyNewCurvesQuery = CreateCopyQuery(targetLog, sourceLogWithData);
                QueryResult result = await GetTargetWitsmlClientOrThrow().UpdateInStoreAsync(copyNewCurvesQuery);
                if (result.IsSuccessful)
                {
                    numberOfDataRowsCopied += copyNewCurvesQuery.Logs.First().LogData.Data.Count;
                    sourceLogWithData.IndexType = sourceLog.IndexType;
                    startIndex = Index.End(sourceLogWithData).AddEpsilon();
                }
                else
                {
                    Logger.LogError("Failed to copy log data. - {Description} - Current index: {StartIndex}", job.Description(), startIndex.GetValueAsString());
                    return new CopyResult { Success = false, NumberOfRowsCopied = numberOfDataRowsCopied, ErrorReason = result.Reason };
                }
            }

            return new CopyResult { Success = true, NumberOfRowsCopied = numberOfDataRowsCopied };
        }

        private async Task<CopyResult> CopyLogDataWithoutDuplicates(WitsmlLog sourceLog, WitsmlLog targetLog, CopyLogDataJob job, IReadOnlyCollection<string> mnemonics, int targetDepthLogDecimals)
        {
            Index startIndex = Index.Start(sourceLog);
            Index endIndex = Index.End(sourceLog);
            int numberOfDataRowsCopied = 0;

            while (startIndex < endIndex)
            {
                WitsmlLogs query = LogQueries.GetLogContent(job.Source.Parent.WellUid, job.Source.Parent.WellboreUid,
                    job.Source.Parent.Uid, sourceLog.IndexType, mnemonics, startIndex, endIndex);
                WitsmlLogs sourceData = await GetSourceWitsmlClientOrThrow().GetFromStoreAsync(query, new OptionsIn(ReturnElements.DataOnly));
                if (!sourceData.Logs.Any())
                {
                    break;
                }

                WitsmlLog sourceLogWithData = sourceData.Logs.First();

                List<WitsmlData> data = sourceLogWithData.LogData.Data;
                List<WitsmlData> newData = new();
                List<string[]> temp = new();
                double lastIndex = double.MinValue;
                double difference = Math.Pow(0.1, targetDepthLogDecimals + 1);
                foreach (WitsmlData row in data)
                {
                    string[] split = row.Data.Split(",");
                    double index = Math.Round(StringHelpers.ToDouble(split[0]), targetDepthLogDecimals);
                    if (Math.Abs(lastIndex - index) > difference)
                    {
                        if (temp.Any())
                        {
                            newData.Add(CollateData(temp, lastIndex));
                        }
                        lastIndex = index;
                        temp = new();
                    }
                    temp.Add(split[1..]);
                }
                newData.Add(CollateData(temp, lastIndex));
                sourceLogWithData.LogData.Data = newData;

                WitsmlLogs copyNewCurvesQuery = CreateCopyQuery(targetLog, sourceLogWithData);
                QueryResult result = await GetTargetWitsmlClientOrThrow().UpdateInStoreAsync(copyNewCurvesQuery);
                if (result.IsSuccessful)
                {
                    numberOfDataRowsCopied += copyNewCurvesQuery.Logs.First().LogData.Data.Count;
                    sourceLogWithData.IndexType = sourceLog.IndexType;
                    startIndex = Index.End(sourceLogWithData).AddEpsilon();
                }
                else
                {
                    Logger.LogError("Failed to copy log data. - {Description} - Current index: {StartIndex}", job.Description(), startIndex.GetValueAsString());
                    return new CopyResult { Success = false, NumberOfRowsCopied = numberOfDataRowsCopied, ErrorReason = result.Reason };
                }
            }

            return new CopyResult { Success = true, NumberOfRowsCopied = numberOfDataRowsCopied };
        }

        private static WitsmlData CollateData(List<string[]> temp, double lastIndex)
        {
            string[] newRow = new string[temp.First().Length];
            Array.Fill(newRow, "");
            foreach (string[] oldRow in temp)
            {
                for (int i = 0; i < newRow.Length; i++)
                {
                    if (newRow[i] == "" && oldRow[i] != "")
                    {
                        newRow[i] = oldRow[i];
                    }
                }
            }
            return new() { Data = lastIndex + "," + string.Join(",", newRow) };
        }

        private async Task VerifyTargetHasRequiredLogCurveInfos(WitsmlLog sourceLog, IEnumerable<string> sourceMnemonics, WitsmlLog targetLog)
        {
            List<WitsmlLogCurveInfo> newLogCurveInfos = new();
            foreach (string mnemonic in sourceMnemonics.Where(mnemonic => !string.Equals(targetLog.IndexCurve.Value, mnemonic, StringComparison.OrdinalIgnoreCase)))
            {
                if (targetLog.LogCurveInfo.All(lci => !string.Equals(lci.Mnemonic, mnemonic, StringComparison.OrdinalIgnoreCase)))
                {
                    newLogCurveInfos.Add(sourceLog.LogCurveInfo.Find(lci => lci.Mnemonic == mnemonic));
                }
            }

            if (newLogCurveInfos.Any())
            {
                targetLog.LogCurveInfo.AddRange(newLogCurveInfos);
                WitsmlLogs query = new() { Logs = new List<WitsmlLog> { targetLog } };

                QueryResult result = await GetTargetWitsmlClientOrThrow().UpdateInStoreAsync(query);
                if (!result.IsSuccessful)
                {
                    string newMnemonics = string.Join(",", newLogCurveInfos.Select(lci => lci.Mnemonic));
                    Logger.LogError("Failed to update LogCurveInfo for wellbore during copy data. Mnemonics: {Mnemonics}. " +
                              "Target: UidWell: {TargetWellUid}, UidWellbore: {TargetWellboreUid}, Uid: {TargetLogUid}. ",
                        newMnemonics, targetLog.UidWell, targetLog.UidWellbore, targetLog.Uid);
                }
            }
        }

        private static WitsmlLogs CreateCopyQuery(WitsmlLog targetLog, WitsmlLog sourceLogWithData)
        {
            WitsmlLog updatedData = new()
            {
                UidWell = targetLog.UidWell,
                UidWellbore = targetLog.UidWellbore,
                Uid = targetLog.Uid,
                LogData = sourceLogWithData.LogData
            };

            WitsmlLogs updatedWitsmlLog = new()
            {
                Logs = new List<WitsmlLog> { updatedData }
            };
            return updatedWitsmlLog;
        }

        private static void VerifyMatchingIndexTypes(WitsmlLog sourceLog, WitsmlLog targetLog)
        {
            if (sourceLog.IndexType != targetLog.IndexType)
            {
                throw new Exception($"{nameof(sourceLog)} and {nameof(targetLog)} has mismatching index types");
            }
        }

        private static void VerifyValidInterval(WitsmlLog sourceLog)
        {
            Index sourceStart = Index.Start(sourceLog);
            Index sourceEnd = Index.End(sourceLog);

            if (sourceStart > sourceEnd)
            {
                throw new Exception($"Invalid interval. Start must be before End. Start: {sourceStart}, End: {sourceEnd}");
            }
        }

        private static void VerifyMatchingIndexCurves(WitsmlLog sourceLog, WitsmlLog targetLog)
        {
            string sourceIndexMnemonic = sourceLog.IndexCurve.Value;
            string targetIndexMnemonic = targetLog.IndexCurve.Value;
            if (sourceIndexMnemonic.Equals(targetIndexMnemonic, StringComparison.OrdinalIgnoreCase))
            {
                return;
            }

            throw new Exception($"Source and Target has different index mnemonics. Source: {sourceIndexMnemonic}, Target: {targetIndexMnemonic}");
        }

        private static void VerifyIndexCurveIsIncludedInMnemonics(WitsmlLog log, IList<string> newMnemonics, IList<string> existingMnemonics)
        {
            string indexMnemonic = log.IndexCurve.Value;
            if (!newMnemonics.Contains(indexMnemonic, StringComparer.InvariantCultureIgnoreCase))
            {
                newMnemonics.Insert(0, indexMnemonic);
            }

            if (!existingMnemonics.Contains(indexMnemonic, StringComparer.InvariantCultureIgnoreCase))
            {
                existingMnemonics.Insert(0, indexMnemonic);
            }
        }

        private async Task<(WitsmlLog sourceLog, WitsmlLog targetLog)> GetLogs(CopyLogDataJob job)
        {
            Task<WitsmlLog> sourceLog = WorkerTools.GetLog(GetSourceWitsmlClientOrThrow(), job.Source.Parent, ReturnElements.HeaderOnly);
            Task<WitsmlLog> targetLog = WorkerTools.GetLog(GetTargetWitsmlClientOrThrow(), job.Target, ReturnElements.HeaderOnly);
            await Task.WhenAll(sourceLog, targetLog);

            return sourceLog.Result == null
                ? throw new Exception($"Could not find source log object: {job.Source.Parent.Description()}")
                : targetLog.Result == null
                ? throw new Exception($"Could not find target log object: UidWell: {job.Target.Description()}")
                : ((WitsmlLog sourceLog, WitsmlLog targetLog))(sourceLog.Result, targetLog.Result);
        }

        private class CopyResult
        {
            public bool Success { get; set; }
            public int NumberOfRowsCopied { get; set; }
            public string ErrorReason { get; set; }
        }
    }
}
