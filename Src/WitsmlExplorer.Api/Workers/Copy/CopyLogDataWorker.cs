using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.Data;
using Witsml.Extensions;
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
        Task<(WorkerResult, RefreshAction)> Execute(CopyLogDataJob job, CancellationToken? cancellationToken = null);
    }

    public class CopyLogDataWorker : BaseWorker<CopyLogDataJob>, IWorker, ICopyLogDataWorker
    {
        private readonly IDocumentRepository<Server, Guid> _witsmlServerRepository;
        public JobType JobType => JobType.CopyLogData;

        public CopyLogDataWorker(IWitsmlClientProvider witsmlClientProvider, ILogger<CopyLogDataJob> logger = null, IDocumentRepository<Server, Guid> witsmlServerRepository = null) : base(witsmlClientProvider, logger)
        {
            _witsmlServerRepository = witsmlServerRepository;
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(CopyLogDataJob job, CancellationToken? cancellationToken = null)
        {
            Uri targetHostname = GetTargetWitsmlClientOrThrow().GetServerHostname();
            Uri sourceHostname = GetSourceWitsmlClientOrThrow().GetServerHostname();
            ICollection<Server> servers = _witsmlServerRepository == null ? new List<Server>() : await _witsmlServerRepository.GetDocumentsAsync();
            int targetDepthLogDecimals = servers.FirstOrDefault((server) => server.Url.EqualsIgnoreCase(targetHostname))?.DepthLogDecimals ?? 0;
            int sourceDepthLogDecimals = servers.FirstOrDefault((server) => server.Url.EqualsIgnoreCase(sourceHostname))?.DepthLogDecimals ?? 0;

            (WitsmlLog sourceLog, WitsmlLog targetLog) = await GetLogs(job);
            List<string> mnemonicsToCopy = job.Source.ComponentUids.Any()
                ? job.Source.ComponentUids.Distinct().ToList()
                : sourceLog.LogCurveInfo.Select(lci => lci.Mnemonic).ToList();

            ICollection<string> targetLogMnemonics = targetLog.LogCurveInfo.Select(lci => lci.Mnemonic).ToList();
            List<string> existingMnemonicsInTarget = mnemonicsToCopy.Where(mnemonic => targetLogMnemonics.Contains(mnemonic, StringComparer.OrdinalIgnoreCase)).ToList();
            List<string> newMnemonicsInTarget = mnemonicsToCopy.Where(mnemonic => !targetLogMnemonics.Contains(mnemonic, StringComparer.OrdinalIgnoreCase)).ToList();

            SetIndexesOnSourceLogs(sourceLog, job);

            try
            {
                VerifyNormalSourceMnemonicsDoesNotMatchIndexCurveOnTarget(sourceLog, targetLog, mnemonicsToCopy);
                VerifyMatchingIndexTypes(sourceLog, targetLog);
                VerifyValidInterval(sourceLog);
                VerifyIndexCurveIsIncludedInMnemonics(sourceLog, newMnemonicsInTarget, existingMnemonicsInTarget);
                await VerifyTargetHasRequiredLogCurveInfos(sourceLog, job.Source.ComponentUids, targetLog);
            }
            catch (Exception e)
            {
                string errorMessage = "Failed to copy log data.";
                Logger.LogError("{errorMessage} - {error} - {Description}", errorMessage, e.Message, job.Description());
                return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, errorMessage, e.Message, sourceServerUrl: GetSourceWitsmlClientOrThrow().GetServerHostname()), null);
            }

            int totalRowsCopied = 0;
            int originalRows = 0;
            if (existingMnemonicsInTarget.Any())
            {
                CopyResult copyResultForExistingMnemonics = await CopyLogData(sourceLog, targetLog, job, existingMnemonicsInTarget, sourceDepthLogDecimals, targetDepthLogDecimals, cancellationToken);
                totalRowsCopied += copyResultForExistingMnemonics.NumberOfRowsCopied;
                originalRows += copyResultForExistingMnemonics.OriginalNumberOfRows;
                if (!copyResultForExistingMnemonics.Success)
                {
                    string message = $"Failed to copy curves for existing mnemonics to log. {copyResultForExistingMnemonics.ErrorReason}. Copied a total of {copyResultForExistingMnemonics.NumberOfRowsCopied} rows.";
                    return LogAndReturnErrorResult(message, job);
                }
            }

            if (newMnemonicsInTarget.Any())
            {
                CopyResult copyResultForNewMnemonics = await CopyLogData(sourceLog, targetLog, job, newMnemonicsInTarget, sourceDepthLogDecimals, targetDepthLogDecimals, cancellationToken);
                totalRowsCopied += copyResultForNewMnemonics.NumberOfRowsCopied;
                originalRows += copyResultForNewMnemonics.OriginalNumberOfRows;
                if (!copyResultForNewMnemonics.Success)
                {
                    string message = $"Failed to copy curves for new mnemonics to log. {copyResultForNewMnemonics.ErrorReason}. Copied a total of {copyResultForNewMnemonics.NumberOfRowsCopied} rows";
                    return LogAndReturnErrorResult(message, job);
                }
            }

            string resultMessage = $"{totalRowsCopied} rows copied";
            if (originalRows > 0)
            {
                resultMessage = $"{originalRows} rows collated into {totalRowsCopied} rows in the target";
                Logger.LogInformation("{JobType} - Job successful. {Original} rows collated into {Count} rows in the target. {Description}", GetType().Name, originalRows, totalRowsCopied, job.Description());
            }
            else
            {
                Logger.LogInformation("{JobType} - Job successful. {Count} rows copied. {Description}", GetType().Name, totalRowsCopied, job.Description());
            }
            WorkerResult workerResult = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, resultMessage, sourceServerUrl: GetSourceWitsmlClientOrThrow().GetServerHostname());
            RefreshObjects refreshAction = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), job.Target.WellUid, job.Target.WellboreUid, EntityType.Log, job.Target.Uid);
            return (workerResult, refreshAction);
        }

        private static void SetIndexesOnSourceLogs(WitsmlLog sourceLog, CopyLogDataJob job)
        {
            if (!string.IsNullOrEmpty(job.StartIndex))
            {
                if (sourceLog.IndexType == WitsmlLog.WITSML_INDEX_TYPE_MD)
                {
                    sourceLog.StartIndex = new WitsmlIndex(job.StartIndex)
                    {
                        Uom = sourceLog.StartIndex.Uom
                    };
                }
                else
                {
                    sourceLog.StartDateTimeIndex = job.StartIndex;
                }
            }
            if (!string.IsNullOrEmpty(job.EndIndex))
            {
                if (sourceLog.IndexType == WitsmlLog.WITSML_INDEX_TYPE_MD)
                {
                    sourceLog.EndIndex = new WitsmlIndex(job.EndIndex)
                    {
                        Uom = sourceLog.EndIndex.Uom
                    };
                }
                else
                {
                    sourceLog.EndDateTimeIndex = job.EndIndex;
                }
            }
        }

        private (WorkerResult, RefreshAction) LogAndReturnErrorResult(string message, CopyLogDataJob job)
        {
            Logger.LogError("{message} - {Description}", message, job.Description());
            if (message.Contains("Error while updating store: -463"))
            {
                message += $" \nIf copying to a target server with lower number of depth log decimals than the source server, make sure that the \"Number of decimals in depth log index\" field is filled out for both the target and the source server.";
            }
            return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, "Failed to copy log data", message, sourceServerUrl: GetSourceWitsmlClientOrThrow().GetServerHostname()), null);
        }

        private async Task<CopyResult> CopyLogData(WitsmlLog sourceLog, WitsmlLog targetLog, CopyLogDataJob job, List<string> mnemonics, int sourceDepthLogDecimals, int targetDepthLogDecimals, CancellationToken? cancellationToken = null)
        {
            if (cancellationToken is { IsCancellationRequested: true })
            {
                return new CopyResult { Success = false, NumberOfRowsCopied = 0, ErrorReason = CancellationReason() };
            }
            if (sourceLog.IsEmpty())
            {
                return new CopyResult { Success = true, NumberOfRowsCopied = 0 };
            }

            if (targetDepthLogDecimals > 0 && targetDepthLogDecimals < sourceDepthLogDecimals && sourceLog.IndexType == WitsmlLog.WITSML_INDEX_TYPE_MD)
            {
                return await CopyLogDataWithoutDuplicates(sourceLog, targetLog, job, mnemonics, targetDepthLogDecimals);
            }

            int numberOfDataRowsCopied = 0;

            await using LogDataReader logDataReader = new(GetSourceWitsmlClientOrThrow(), sourceLog, mnemonics, Logger);
            WitsmlLogData sourceLogData = await logDataReader.GetNextBatch();
            var chunkMaxSize = await GetMaxBatchSize(mnemonics.Count, CommonConstants.WitsmlFunctionType.WMLSUpdateInStore, CommonConstants.WitsmlQueryTypeName.Log);

            while (sourceLogData != null)
            {
                var mnemonicList = targetLog.IndexCurve.Value + sourceLogData.MnemonicList[sourceLogData.MnemonicList.IndexOf(CommonConstants.DataSeparator, StringComparison.InvariantCulture)..];
                var updateLogDataQueries = LogWorkerTools.GetUpdateLogDataQueries(targetLog.Uid, targetLog.UidWell, targetLog.UidWellbore, sourceLogData, chunkMaxSize, mnemonicList);
                if (cancellationToken is { IsCancellationRequested: true })
                {
                    return new CopyResult { Success = false, NumberOfRowsCopied = numberOfDataRowsCopied, ErrorReason = CancellationReason() };
                }
                foreach (var query in updateLogDataQueries)
                {

                    var result = await RequestUtils.WithRetry(async () => await GetTargetWitsmlClientOrThrow().UpdateInStoreAsync(query), Logger);
                    if (!result.IsSuccessful)
                    {
                        Logger.LogError("Failed to copy log data. - {Description} - Current index: {StartIndex}", job.Description(), logDataReader.StartIndex);
                        return new CopyResult { Success = false, NumberOfRowsCopied = numberOfDataRowsCopied, ErrorReason = result.Reason };
                    }
                }
                numberOfDataRowsCopied += sourceLogData.Data.Count;
                UpdateJobProgress(job, sourceLog, sourceLogData);
                sourceLogData = await logDataReader.GetNextBatch();
            }

            return new CopyResult { Success = true, NumberOfRowsCopied = numberOfDataRowsCopied };
        }

        private void UpdateJobProgress(CopyLogDataJob job, WitsmlLog sourceLog, WitsmlLogData copiedData)
        {
            double progress = LogWorkerTools.CalculateProgressBasedOnIndex(sourceLog, copiedData);
            job.ProgressReporter?.Report(progress);
            if (job.JobInfo != null) job.JobInfo.Progress = progress;
        }

        private async Task<CopyResult> CopyLogDataWithoutDuplicates(WitsmlLog sourceLog, WitsmlLog targetLog, CopyLogDataJob job, IReadOnlyCollection<string> mnemonics, int targetDepthLogDecimals)
        {
            double startIndex = StringHelpers.ToDouble(sourceLog.StartIndex.Value);
            double endIndex = StringHelpers.ToDouble(sourceLog.EndIndex.Value);
            int numberOfDataRowsCopied = 0;
            int originalNumberOfRows = 0;
            do
            {
                WitsmlLogs query = LogQueries.GetLogContent(
                    job.Source.Parent.WellUid,
                    job.Source.Parent.WellboreUid,
                    job.Source.Parent.Uid,
                    sourceLog.IndexType, mnemonics,
                    Index.Start(sourceLog, startIndex.ToString(CultureInfo.InvariantCulture)),
                    Index.End(sourceLog, endIndex.ToString(CultureInfo.InvariantCulture)));
                WitsmlLogs sourceData = await RequestUtils.WithRetry(async () => await GetSourceWitsmlClientOrThrow().GetFromStoreAsync(query, new OptionsIn(ReturnElements.DataOnly)), Logger);
                WitsmlLog sourceLogWithData = sourceData?.Logs?.FirstOrDefault();

                if (sourceLogWithData?.LogData == null)
                {
                    break;
                }

                List<WitsmlData> data = sourceLogWithData.LogData.Data;
                List<WitsmlData> newData = new();
                List<string[]> rowsToCollate = new();
                double difference = Math.Pow(0.1, targetDepthLogDecimals + 1);
                double firstSourceRowIndex = double.MinValue;
                double lastSourceRowIndex = double.MinValue;
                double targetIndex = double.MinValue;
                foreach (WitsmlData row in data)
                {
                    string[] split = row.Data.Split(CommonConstants.DataSeparator);
                    lastSourceRowIndex = StringHelpers.ToDouble(split[0]);
                    double nextTargetIndex = Math.Round(lastSourceRowIndex, targetDepthLogDecimals, MidpointRounding.AwayFromZero);
                    if (Math.Abs(targetIndex - nextTargetIndex) > difference)
                    {
                        if (rowsToCollate.Any())
                        {
                            newData.Add(CollateData(rowsToCollate, targetIndex));
                            rowsToCollate.Clear();
                        }
                        firstSourceRowIndex = lastSourceRowIndex;
                        targetIndex = nextTargetIndex;
                    }
                    rowsToCollate.Add(split[1..]);
                }
                newData.Add(CollateData(rowsToCollate, targetIndex));
                startIndex = lastSourceRowIndex >= endIndex ? endIndex : firstSourceRowIndex;

                sourceLogWithData.LogData.Data = newData;

                WitsmlLogs copyNewCurvesQuery = CreateCopyQuery(targetLog, sourceLogWithData.LogData);
                QueryResult result = await RequestUtils.WithRetry(async () => await GetTargetWitsmlClientOrThrow().UpdateInStoreAsync(copyNewCurvesQuery), Logger);
                if (result.IsSuccessful)
                {
                    numberOfDataRowsCopied += newData.Count;
                    originalNumberOfRows += data.Count;
                    UpdateJobProgress(job, sourceLog, sourceLogWithData.LogData);
                }
                else
                {
                    Logger.LogError("Failed to copy log data. - {Description} - Current index: {StartIndex}", job.Description(), startIndex.ToString());
                    return new CopyResult { Success = false, NumberOfRowsCopied = numberOfDataRowsCopied, ErrorReason = result.Reason };
                }
            } while (startIndex < endIndex);

            return new CopyResult { Success = true, NumberOfRowsCopied = numberOfDataRowsCopied, OriginalNumberOfRows = originalNumberOfRows };
        }

        private static WitsmlData CollateData(List<string[]> oldRows, double index)
        {
            string[] newRow = new string[oldRows.First().Length];
            Array.Fill(newRow, "");
            for (int i = 0; i < newRow.Length; i++)
            {
                for (int j = 0; j < oldRows.Count; j++)
                {
                    if (oldRows[j][i] != string.Empty)
                    {
                        newRow[i] = oldRows[j][i];
                        break;
                    }
                }
            }
            return new() { Data = index.ToString(CultureInfo.InvariantCulture) + CommonConstants.DataSeparator + string.Join(CommonConstants.DataSeparator, newRow) };
        }

        private async Task VerifyTargetHasRequiredLogCurveInfos(WitsmlLog sourceLog, IEnumerable<string> sourceMnemonics, WitsmlLog targetLog)
        {
            List<WitsmlLogCurveInfo> logCurveInfosToUpdate = new();
            foreach (string mnemonic in sourceMnemonics)
            {
                bool isIndexCurve = string.Equals(mnemonic, sourceLog.IndexCurve.Value, StringComparison.OrdinalIgnoreCase);
                string targetIndexCurveMnemonic = targetLog.IndexCurve.Value;

                var sourceLogCurveInfo = sourceLog.LogCurveInfo.Find(lci => string.Equals(lci.Mnemonic, mnemonic, StringComparison.OrdinalIgnoreCase));
                var targetLogCurveInfo = targetLog.LogCurveInfo.Find(lci => string.Equals(lci.Mnemonic, isIndexCurve ? targetIndexCurveMnemonic : mnemonic, StringComparison.OrdinalIgnoreCase));

                if (targetLogCurveInfo == null || !LogCurveInfosAreEqual(sourceLogCurveInfo, targetLogCurveInfo))
                {
                    if (isIndexCurve)
                    {
                        // We should not copy the uid or mnemonic of the index curve.
                        sourceLogCurveInfo.Uid = targetLogCurveInfo.Uid;
                        sourceLogCurveInfo.Mnemonic = targetLogCurveInfo.Mnemonic;
                    }
                    logCurveInfosToUpdate.Add(sourceLogCurveInfo);
                }
            }

            if (logCurveInfosToUpdate.Any())
            {
                WitsmlLogs query = LogQueries.GetWitsmlLogById(targetLog.UidWell, targetLog.UidWellbore, targetLog.Uid);
                query.Logs.First().LogCurveInfo = logCurveInfosToUpdate;

                QueryResult result = await GetTargetWitsmlClientOrThrow().UpdateInStoreAsync(query);
                if (!result.IsSuccessful)
                {
                    string newMnemonics = string.Join(CommonConstants.DataSeparator, logCurveInfosToUpdate.Select(lci => lci.Mnemonic));
                    Logger.LogError("Failed to update LogCurveInfo for log during copy data. Mnemonics: {Mnemonics}. " +
                              "Target: UidWell: {TargetWellUid}, UidWellbore: {TargetWellboreUid}, Uid: {TargetLogUid}. ",
                        newMnemonics, targetLog.UidWell, targetLog.UidWellbore, targetLog.Uid);
                }
            }
        }

        private bool LogCurveInfosAreEqual(WitsmlLogCurveInfo source, WitsmlLogCurveInfo target)
        {
            var sourceJson = JsonSerializer.Serialize(source);
            var targetJson = JsonSerializer.Serialize(target);
            return sourceJson == targetJson;
        }

        private static WitsmlLogs CreateCopyQuery(WitsmlLog targetLog, WitsmlLogData logData)
        {
            logData.MnemonicList = targetLog.IndexCurve.Value + logData.MnemonicList[logData.MnemonicList.IndexOf(CommonConstants.DataSeparator, StringComparison.InvariantCulture)..];
            return new()
            {
                Logs = new List<WitsmlLog> {
                    new(){
                        UidWell = targetLog.UidWell,
                        UidWellbore = targetLog.UidWellbore,
                        Uid = targetLog.Uid,
                        LogData = logData
                    }
                }
            };
        }

        private static void VerifyNormalSourceMnemonicsDoesNotMatchIndexCurveOnTarget(WitsmlLog sourceLog, WitsmlLog targetLog, IEnumerable<string> mnemonics)
        {
            foreach (string mnemonic in mnemonics)
            {
                if (!string.Equals(mnemonic, sourceLog.IndexCurve.Value, StringComparison.OrdinalIgnoreCase) &&
                    string.Equals(mnemonic, targetLog.IndexCurve.Value, StringComparison.OrdinalIgnoreCase))
                {
                    throw new Exception($"The source log mnemonic '{mnemonic}' is not the index curve of the source log, but still has the same name as the target log index curve '{targetLog.IndexCurve.Value}'.");
                }
            }
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
            // Log may not have any data
            if (sourceLog.IsEmpty())
            {
                return;
            }

            Index sourceStart = Index.Start(sourceLog);
            Index sourceEnd = Index.End(sourceLog);

            if (sourceLog.IsIncreasing())
            {
                if (sourceStart > sourceEnd)
                {
                    throw new Exception($"Invalid interval. Start must be less than End for increasing log. Start: {sourceStart}, End: {sourceEnd}");
                }
            }
            else
            {
                if (sourceStart < sourceEnd)
                {
                    throw new Exception($"Invalid interval. Start must be greater than End for decreasing log. Start: {sourceStart}, End: {sourceEnd}");
                }
            }
        }

        private static void VerifyIndexCurveIsIncludedInMnemonics(WitsmlLog log, IList<string> newMnemonics, IList<string> existingMnemonics)
        {
            string indexMnemonic = log.IndexCurve.Value;
            if (newMnemonics.Any() && !newMnemonics.Contains(indexMnemonic, StringComparer.InvariantCultureIgnoreCase))
            {
                newMnemonics.Insert(0, indexMnemonic);
            }

            if (existingMnemonics.Any() && !existingMnemonics.Contains(indexMnemonic, StringComparer.InvariantCultureIgnoreCase))
            {
                existingMnemonics.Insert(0, indexMnemonic);
            }
        }

        private async Task<(WitsmlLog sourceLog, WitsmlLog targetLog)> GetLogs(CopyLogDataJob job)
        {
            Task<WitsmlLog> sourceLog = LogWorkerTools.GetLog(GetSourceWitsmlClientOrThrow(), job.Source.Parent, ReturnElements.HeaderOnly);
            Task<WitsmlLog> targetLog = LogWorkerTools.GetLog(GetTargetWitsmlClientOrThrow(), job.Target, ReturnElements.HeaderOnly);
            await Task.WhenAll(sourceLog, targetLog);

            return sourceLog.Result == null
                ? throw new Exception($"Could not find source log object: {job.Source.Parent.Description()}")
                : targetLog.Result == null
                ? throw new Exception($"Could not find target log object: UidWell: {job.Target.Description()}")
                : (sourceLog.Result, targetLog.Result);
        }

        private class CopyResult
        {
            public bool Success { get; init; }
            public int NumberOfRowsCopied { get; init; }
            public int OriginalNumberOfRows { get; init; }
            public string ErrorReason { get; init; }
        }
    }
}
