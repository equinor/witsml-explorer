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
using WitsmlExplorer.Api.Services;

using Index = Witsml.Data.Curves.Index;

namespace WitsmlExplorer.Api.Workers
{
    public interface ICopyLogDataWorker
    {
        Task<(WorkerResult, RefreshAction)> Execute(CopyLogDataJob job);
    }

    public class CopyLogDataWorker : BaseWorker<CopyLogDataJob>, IWorker, ICopyLogDataWorker
    {
        private readonly IWitsmlClient _witsmlClient;
        private readonly IWitsmlClient _witsmlSourceClient;
        public JobType JobType => JobType.CopyLogData;

        public CopyLogDataWorker(IWitsmlClientProvider witsmlClientProvider, ILogger<CopyLogDataJob> logger = null) : base(logger)
        {
            _witsmlClient = witsmlClientProvider.GetClient();
            _witsmlSourceClient = witsmlClientProvider.GetSourceClient() ?? _witsmlClient;
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(CopyLogDataJob job)
        {
            (WitsmlLog sourceLog, WitsmlLog targetLog) = await GetLogs(job);
            List<string> mnemonicsToCopy = job.Source.Mnemonics.Any()
                ? job.Source.Mnemonics.Distinct().ToList()
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
                await VerifyTargetHasRequiredLogCurveInfos(sourceLog, job.Source.Mnemonics, targetLog);
            }
            catch (Exception e)
            {
                string errorMessage = "Failed to copy log data.";
                Logger.LogError("{errorMessage} - {Description}", errorMessage, job.Description());
                return (new WorkerResult(_witsmlClient.GetServerHostname(), false, errorMessage, e.Message), null);
            }

            CopyResult copyResultForExistingMnemonics = await CopyLogData(sourceLog, targetLog, job, existingMnemonicsInTarget);
            if (!copyResultForExistingMnemonics.Success)
            {
                string message = $"Failed to copy curves for existing mnemonics to log. Copied a total of {copyResultForExistingMnemonics.NumberOfRowsCopied} rows";
                return LogAndReturnErrorResult(message, job);
            }

            CopyResult copyResultForNewMnemonics = await CopyLogData(sourceLog, targetLog, job, newMnemonicsInTarget);
            if (!copyResultForNewMnemonics.Success)
            {
                string message = $"Failed to copy curves for new mnemonics to log. Copied a total of {copyResultForNewMnemonics.NumberOfRowsCopied} rows";
                return LogAndReturnErrorResult(message, job);
            }

            int totalRowsCopied = copyResultForExistingMnemonics.NumberOfRowsCopied + copyResultForNewMnemonics.NumberOfRowsCopied;
            Logger.LogInformation("{JobType} - Job successful. {Count} rows copied. {Description}", GetType().Name, totalRowsCopied, job.Description());
            WorkerResult workerResult = new(_witsmlClient.GetServerHostname(), true, $"{totalRowsCopied} rows copied");
            RefreshLogObject refreshAction = new(_witsmlClient.GetServerHostname(), job.Target.WellUid, job.Target.WellboreUid, job.Target.LogUid, RefreshType.Update);
            return (workerResult, refreshAction);
        }

        private (WorkerResult, RefreshAction) LogAndReturnErrorResult(string message, CopyLogDataJob job)
        {
            Logger.LogError("{message} - {Description}", message, job.Description());
            return (new WorkerResult(_witsmlClient.GetServerHostname(), false, "Failed to copy log data", message), null);
        }

        private async Task<CopyResult> CopyLogData(WitsmlLog sourceLog, WitsmlLog targetLog, CopyLogDataJob job, IReadOnlyCollection<string> mnemonics)
        {
            Index startIndex = Index.Start(sourceLog);
            Index endIndex = Index.End(sourceLog);
            int numberOfDataRowsCopied = 0;

            while (startIndex < endIndex)
            {
                WitsmlLogs query = LogQueries.GetLogContent(job.Source.LogReference.WellUid, job.Source.LogReference.WellboreUid,
                    job.Source.LogReference.LogUid, sourceLog.IndexType, mnemonics, startIndex, endIndex);
                WitsmlLogs sourceData = await _witsmlSourceClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.DataOnly));
                if (!sourceData.Logs.Any())
                {
                    break;
                }

                WitsmlLog sourceLogWithData = sourceData.Logs.First();
                WitsmlLogs copyNewCurvesQuery = CreateCopyQuery(targetLog, sourceLogWithData);
                QueryResult result = await _witsmlClient.UpdateInStoreAsync(copyNewCurvesQuery);
                if (result.IsSuccessful)
                {
                    numberOfDataRowsCopied += copyNewCurvesQuery.Logs.First().LogData.Data.Count;
                    startIndex = Index.End(sourceLogWithData).AddEpsilon();
                }
                else
                {
                    Logger.LogError("Failed to copy log data. - {Description} - Current index: {StartIndex}", job.Description(), startIndex.GetValueAsString());
                    return new CopyResult { Success = false, NumberOfRowsCopied = numberOfDataRowsCopied };
                }
            }

            return new CopyResult { Success = true, NumberOfRowsCopied = numberOfDataRowsCopied };
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

                QueryResult result = await _witsmlClient.UpdateInStoreAsync(query);
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
            Task<WitsmlLog> sourceLog = WorkerTools.GetLog(_witsmlSourceClient, job.Source.LogReference, ReturnElements.HeaderOnly);
            Task<WitsmlLog> targetLog = WorkerTools.GetLog(_witsmlClient, job.Target, ReturnElements.HeaderOnly);
            await Task.WhenAll(sourceLog, targetLog);

            return sourceLog.Result == null
                ? throw new Exception($"Could not find source log object: UidWell: {job.Source.LogReference.WellUid}, " +
                                    $"UidWellbore: {job.Source.LogReference.WellboreUid}, Uid: {job.Source.LogReference.LogUid}")
                : targetLog.Result == null
                ? throw new Exception($"Could not find target log object: UidWell: {job.Source.LogReference.WellUid}, " +
                                    $"UidWellbore: {job.Source.LogReference.WellboreUid}, Uid: {job.Source.LogReference.LogUid}")
                : ((WitsmlLog sourceLog, WitsmlLog targetLog))(sourceLog.Result, targetLog.Result);
        }

        private class CopyResult
        {
            public bool Success { get; set; }
            public int NumberOfRowsCopied { get; set; }
        }
    }
}
