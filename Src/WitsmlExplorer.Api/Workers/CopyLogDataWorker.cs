using System;
using System.Collections.Generic;
using System.IO;
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
        Task<(WorkerResult, RefreshAction)> Execute(Stream jobStream);
    }

    public class CopyLogDataWorker : BaseWorker<CopyLogDataJob>, IWorker, ICopyLogDataWorker
    {
        private readonly IWitsmlClient witsmlClient;
        private readonly IWitsmlClient witsmlSourceClient;
        public JobType JobType => JobType.CopyLogData;

        public CopyLogDataWorker(IWitsmlClientProvider witsmlClientProvider, ILogger<CopyLogDataJob> logger = null) : base(logger)
        {
            witsmlClient = witsmlClientProvider.GetClient();
            witsmlSourceClient = witsmlClientProvider.GetSourceClient() ?? witsmlClient;
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(CopyLogDataJob job)
        {
            var (sourceLog, targetLog) = await GetLogs(job);
            var mnemonicsToCopy = job.Source.Mnemonics.Any()
                ? job.Source.Mnemonics.Distinct().ToList()
                : sourceLog.LogCurveInfo.Select(lci => lci.Mnemonic).ToList();

            var targetLogMnemonics = targetLog.LogCurveInfo.Select(lci => lci.Mnemonic);
            var existingMnemonicsInTarget = mnemonicsToCopy.Where(mnemonic => targetLogMnemonics.Contains(mnemonic, StringComparer.OrdinalIgnoreCase)).ToList();
            var newMnemonicsInTarget = mnemonicsToCopy.Where(mnemonic => !targetLogMnemonics.Contains(mnemonic, StringComparer.OrdinalIgnoreCase)).ToList();

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
                var errorMessage = "Failed to copy log data.";
                Logger.LogError("{errorMessage} - {Description}", errorMessage, job.Description());
                return (new WorkerResult(witsmlClient.GetServerHostname(), false, errorMessage, e.Message), null);
            }

            var copyResultForExistingMnemonics = await CopyLogData(sourceLog, targetLog, job, existingMnemonicsInTarget);
            if (!copyResultForExistingMnemonics.Success)
            {
                var message = $"Failed to copy curves for existing mnemonics to log. Copied a total of {copyResultForExistingMnemonics.NumberOfRowsCopied} rows";
                return LogAndReturnErrorResult(message, job);
            }

            var copyResultForNewMnemonics = await CopyLogData(sourceLog, targetLog, job, newMnemonicsInTarget);
            if (!copyResultForNewMnemonics.Success)
            {
                var message = $"Failed to copy curves for new mnemonics to log. Copied a total of {copyResultForNewMnemonics.NumberOfRowsCopied} rows";
                return LogAndReturnErrorResult(message, job);
            }

            var totalRowsCopied = copyResultForExistingMnemonics.NumberOfRowsCopied + copyResultForNewMnemonics.NumberOfRowsCopied;
            Logger.LogInformation("{JobType} - Job successful. {Count} rows copied. {Description}", GetType().Name, totalRowsCopied, job.Description());
            var workerResult = new WorkerResult(witsmlClient.GetServerHostname(), true, $"{totalRowsCopied} rows copied");
            var refreshAction = new RefreshLogObject(witsmlClient.GetServerHostname(), job.Target.WellUid, job.Target.WellboreUid, job.Target.LogUid, RefreshType.Update);
            return (workerResult, refreshAction);
        }

        private (WorkerResult, RefreshAction) LogAndReturnErrorResult(string message, CopyLogDataJob job)
        {
            Logger.LogError("{message} - {Description}", message, job.Description());
            return (new WorkerResult(witsmlClient.GetServerHostname(), false, "Failed to copy log data", message), null);
        }

        private async Task<CopyResult> CopyLogData(WitsmlLog sourceLog, WitsmlLog targetLog, CopyLogDataJob job, IReadOnlyCollection<string> mnemonics)
        {
            var startIndex = Index.Start(sourceLog);
            var endIndex = Index.End(sourceLog);
            var numberOfDataRowsCopied = 0;

            while (startIndex < endIndex)
            {
                var query = LogQueries.GetLogContent(job.Source.LogReference.WellUid, job.Source.LogReference.WellboreUid,
                    job.Source.LogReference.LogUid, sourceLog.IndexType, mnemonics, startIndex, endIndex);
                var sourceData = await witsmlSourceClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.DataOnly));
                if (!sourceData.Logs.Any()) break;
                var sourceLogWithData = sourceData.Logs.First();
                var copyNewCurvesQuery = CreateCopyQuery(targetLog, sourceLogWithData);
                var result = await witsmlClient.UpdateInStoreAsync(copyNewCurvesQuery);
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
            var newLogCurveInfos = new List<WitsmlLogCurveInfo>();
            foreach (var mnemonic in sourceMnemonics.Where(mnemonic => !string.Equals(targetLog.IndexCurve.Value, mnemonic, StringComparison.OrdinalIgnoreCase)))
            {
                if (targetLog.LogCurveInfo.All(lci => !string.Equals(lci.Mnemonic, mnemonic, StringComparison.OrdinalIgnoreCase)))
                    newLogCurveInfos.Add(sourceLog.LogCurveInfo.Find(lci => lci.Mnemonic == mnemonic));
            }

            if (newLogCurveInfos.Any())
            {
                targetLog.LogCurveInfo.AddRange(newLogCurveInfos);
                var query = new WitsmlLogs { Logs = new List<WitsmlLog> { targetLog } };

                var result = await witsmlClient.UpdateInStoreAsync(query);
                if (!result.IsSuccessful)
                {
                    var newMnemonics = string.Join(",", newLogCurveInfos.Select(lci => lci.Mnemonic));
                    Logger.LogError("Failed to update LogCurveInfo for wellbore during copy data. Mnemonics: {Mnemonics}. " +
                              "Target: UidWell: {TargetWellUid}, UidWellbore: {TargetWellboreUid}, Uid: {TargetLogUid}. ",
                        newMnemonics, targetLog.UidWell, targetLog.UidWellbore, targetLog.Uid);
                }
            }
        }

        private static WitsmlLogs CreateCopyQuery(WitsmlLog targetLog, WitsmlLog sourceLogWithData)
        {
            var updatedData = new WitsmlLog
            {
                UidWell = targetLog.UidWell,
                UidWellbore = targetLog.UidWellbore,
                Uid = targetLog.Uid,
                LogData = sourceLogWithData.LogData
            };

            var updatedWitsmlLog = new WitsmlLogs
            {
                Logs = new List<WitsmlLog> { updatedData }
            };
            return updatedWitsmlLog;
        }

        private static void VerifyMatchingIndexTypes(WitsmlLog sourceLog, WitsmlLog targetLog)
        {
            if (sourceLog.IndexType != targetLog.IndexType)
                throw new Exception($"{nameof(sourceLog)} and {nameof(targetLog)} has mismatching index types");
        }

        private static void VerifyValidInterval(WitsmlLog sourceLog)
        {
            var sourceStart = Index.Start(sourceLog);
            var sourceEnd = Index.End(sourceLog);

            if (sourceStart > sourceEnd)
                throw new Exception($"Invalid interval. Start must be before End. Start: {sourceStart}, End: {sourceEnd}");
        }

        private static void VerifyMatchingIndexCurves(WitsmlLog sourceLog, WitsmlLog targetLog)
        {
            var sourceIndexMnemonic = sourceLog.IndexCurve.Value;
            var targetIndexMnemonic = targetLog.IndexCurve.Value;
            if (sourceIndexMnemonic.Equals(targetIndexMnemonic, StringComparison.OrdinalIgnoreCase))
                return;

            throw new Exception($"Source and Target has different index mnemonics. Source: {sourceIndexMnemonic}, Target: {targetIndexMnemonic}");
        }

        private static void VerifyIndexCurveIsIncludedInMnemonics(WitsmlLog log, IList<string> newMnemonics, IList<string> existingMnemonics)
        {
            var indexMnemonic = log.IndexCurve.Value;
            if (!newMnemonics.Contains(indexMnemonic, StringComparer.InvariantCultureIgnoreCase))
                newMnemonics.Insert(0, indexMnemonic);

            if (!existingMnemonics.Contains(indexMnemonic, StringComparer.InvariantCultureIgnoreCase))
                existingMnemonics.Insert(0, indexMnemonic);
        }

        private async Task<(WitsmlLog sourceLog, WitsmlLog targetLog)> GetLogs(CopyLogDataJob job)
        {
            var sourceLog = WorkerTools.GetLog(witsmlSourceClient, job.Source.LogReference, ReturnElements.HeaderOnly);
            var targetLog = WorkerTools.GetLog(witsmlClient, job.Target, ReturnElements.HeaderOnly);
            await Task.WhenAll(sourceLog, targetLog);

            if (sourceLog.Result == null)
                throw new Exception($"Could not find source log object: UidWell: {job.Source.LogReference.WellUid}, " +
                                    $"UidWellbore: {job.Source.LogReference.WellboreUid}, Uid: {job.Source.LogReference.LogUid}");
            if (targetLog.Result == null)
                throw new Exception($"Could not find target log object: UidWell: {job.Source.LogReference.WellUid}, " +
                                    $"UidWellbore: {job.Source.LogReference.WellboreUid}, Uid: {job.Source.LogReference.LogUid}");

            return (sourceLog.Result, targetLog.Result);
        }

        private class CopyResult
        {
            public bool Success { get; set; }
            public int NumberOfRowsCopied { get; set; }
        }
    }
}
