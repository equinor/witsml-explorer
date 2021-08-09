using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Serilog;
using Witsml;
using Witsml.Data;
using Witsml.Extensions;
using Witsml.ServiceReference;
using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;
using Index = Witsml.Data.Curves.Index;

namespace WitsmlExplorer.Api.Workers
{
    public class CopyLogDataWorker : IWorker<CopyLogDataJob>
    {
        private readonly IWitsmlClient witsmlClient;
        private readonly IWitsmlClient witsmlSourceClient;

        public CopyLogDataWorker(IWitsmlClientProvider witsmlClientProvider)
        {
            witsmlClient = witsmlClientProvider.GetClient();
            witsmlSourceClient = witsmlClientProvider.GetSourceClient() ?? witsmlClient;
        }

        public async Task<(WorkerResult, RefreshAction)> Execute(CopyLogDataJob job)
        {
            var (sourceLog, targetLog) = await GetLogs(job);
            var mnemonicsToCopy = job.SourceLogCurvesReference.Mnemonics.Any()
                ? job.SourceLogCurvesReference.Mnemonics.Distinct().ToList()
                : sourceLog.LogCurveInfo.Select(lci => lci.Mnemonic).ToList();

            var targetLogMnemonics = targetLog.LogCurveInfo.Select(lci => lci.Mnemonic);
            var existingMnemonicsInTarget = mnemonicsToCopy.Where(mnemonic => targetLogMnemonics.Contains(mnemonic)).ToList();
            var newMnemonicsInTarget = mnemonicsToCopy.Where(mnemonic => !targetLogMnemonics.Contains(mnemonic)).ToList();

            try
            {
                VerifyMatchingIndexTypes(sourceLog, targetLog);
                VerifyValidInterval(sourceLog);
                VerifyMatchingIndexCurves(sourceLog, targetLog);
                VerifyIndexCurveIsIncludedInMnemonics(sourceLog, newMnemonicsInTarget, existingMnemonicsInTarget);
            }
            catch (Exception e)
            {
                Log.Error("Failed to copy log data", e);
                return (new WorkerResult(witsmlClient.GetServerHostname(), false, "Failed to copy log data", e.Message), null);
            }

            var copyResultForExistingMnemonics = await CopyLogData(sourceLog, targetLog, job, existingMnemonicsInTarget);
            if (!copyResultForExistingMnemonics.Success)
            {
                var message = $"Failed to copy curves for existing mnemonics to log. Copied a total of {copyResultForExistingMnemonics.NumberOfRowsCopied} rows";
                return LogAndReturnErrorResult(message);
            }

            var copyResultForNewMnemonics = await CopyLogData(sourceLog, targetLog, job, newMnemonicsInTarget);
            if (!copyResultForNewMnemonics.Success)
            {
                var message = $"Failed to copy curves for new mnemonics to log. Copied a total of {copyResultForNewMnemonics.NumberOfRowsCopied} rows";
                return LogAndReturnErrorResult(message);
            }

            var totalRowsCopied = copyResultForExistingMnemonics.NumberOfRowsCopied + copyResultForNewMnemonics.NumberOfRowsCopied;
            Log.Information("{JobType} - Job successful. {Count} rows copied", GetType().Name, totalRowsCopied);
            var workerResult = new WorkerResult(witsmlClient.GetServerHostname(), true, $"{totalRowsCopied} rows copied");
            var refreshAction = new RefreshLogObject(witsmlClient.GetServerHostname(), job.TargetLogReference.WellUid, job.TargetLogReference.WellboreUid, job.TargetLogReference.LogUid, RefreshType.Update);
            return (workerResult, refreshAction);
        }

        private (WorkerResult, RefreshAction) LogAndReturnErrorResult(string message)
        {
            Log.Error(message);
            return (new WorkerResult(witsmlClient.GetServerHostname(), false, "Failed to copy log data", message), null);
        }

        private async Task<CopyResult> CopyLogData(WitsmlLog sourceLog, WitsmlLog targetLog, CopyLogDataJob job, IReadOnlyCollection<string> mnemonics)
        {
            var startIndex = Index.Start(sourceLog);
            var endIndex = Index.End(sourceLog);
            var numberOfDataRowsCopied = 0;

            while (startIndex < endIndex)
            {
                var query = LogQueries.GetLogContent(job.SourceLogCurvesReference.LogReference.WellUid, job.SourceLogCurvesReference.LogReference.WellboreUid,
                    job.SourceLogCurvesReference.LogReference.LogUid, sourceLog.IndexType, mnemonics, startIndex, endIndex);
                var sourceData = await witsmlSourceClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.DataOnly));
                if (!sourceData.Logs.Any()) break;
                var sourceLogWithData = sourceData.Logs.First();
                var copyNewCurvesQuery = CreateCopyQuery(targetLog, sourceLog, sourceLogWithData);
                var result = await witsmlClient.UpdateInStoreAsync(copyNewCurvesQuery);
                if (result.IsSuccessful)
                {
                    numberOfDataRowsCopied += copyNewCurvesQuery.Logs.First().LogData.Data.Count;
                    startIndex = Index.End(sourceLogWithData).AddEpsilon();
                }
                else
                {
                    Log.Error(
                        "Failed to copy log data. " +
                        "Source: UidWell: {SourceWellUid}, UidWellbore: {SourceWellboreUid}, Uid: {SourceLogUid}. " +
                        "Target: UidWell: {TargetWellUid}, UidWellbore: {TargetWellboreUid}, Uid: {TargetLogUid}. " +
                        "Current index: {startIndex}",
                        job.SourceLogCurvesReference.LogReference.WellUid, job.SourceLogCurvesReference.LogReference.WellboreUid, job.SourceLogCurvesReference.LogReference.LogUid,
                        job.TargetLogReference.WellUid, job.TargetLogReference.WellboreUid, job.TargetLogReference.LogUid,
                        startIndex);
                    return new CopyResult { Success = false, NumberOfRowsCopied = numberOfDataRowsCopied };
                }
            }

            return new CopyResult { Success = true, NumberOfRowsCopied = numberOfDataRowsCopied };
        }

        private static WitsmlLogs CreateCopyQuery(WitsmlLog targetLog, WitsmlLog sourceLog, WitsmlLog sourceLogWithData)
        {
            var sourceMnemonics = sourceLogWithData.LogData.MnemonicList.Split(",");
            var updatedData = new WitsmlLog
            {
                UidWell = targetLog.UidWell,
                UidWellbore = targetLog.UidWellbore,
                Uid = targetLog.Uid,
                LogCurveInfo = sourceLog.LogCurveInfo
                    .Where(LogCurveHasMnemonic(sourceMnemonics))
                    .Select(lci => new WitsmlLogCurveInfo
                    {
                        Uid = GetTargetUidForCurve(lci, targetLog),
                        Mnemonic = GetTargetNameForCurve(lci, targetLog),
                        ClassWitsml = lci.ClassWitsml.NullIfEmpty(),
                        ClassIndex = lci.ClassIndex.NullIfEmpty(),
                        Unit = lci.Unit.NullIfEmpty(),
                        MnemAlias = lci.MnemAlias.NullIfEmpty(),
                        NullValue = lci.NullValue.NullIfEmpty(),
                        AlternateIndex = lci.AlternateIndex.NullIfEmpty(),
                        WellDatum = lci.WellDatum.NullIfEmpty(),
                        MinIndex = null,
                        MaxIndex = null,
                        MinDateTimeIndex = null,
                        MaxDateTimeIndex = null,
                        CurveDescription = lci.CurveDescription.NullIfEmpty(),
                        SensorOffset = lci.SensorOffset.NullIfEmpty(),
                        DataSource = lci.DataSource.NullIfEmpty(),
                        DensData = lci.DensData.NullIfEmpty(),
                        TraceState = lci.TraceState.NullIfEmpty(),
                        TraceOrigin = lci.TraceOrigin.NullIfEmpty(),
                        TypeLogData = lci.TypeLogData.NullIfEmpty(),
                        AxisDefinition = lci.AxisDefinition,
                        ExtensionNameValue = lci.ExtensionNameValue.NullIfEmpty()
                    }).ToList(),
                LogData = sourceLogWithData.LogData
            };

            var updatedWitsmlLog = new WitsmlLogs
            {
                Logs = new List<WitsmlLog> { updatedData }
            };
            return updatedWitsmlLog;
        }

        private static Func<WitsmlLogCurveInfo, bool> LogCurveHasMnemonic(string[] mnemonics)
        {
            return lci => mnemonics.Contains(lci.Mnemonic);
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

        private static void VerifyIndexCurveIsIncludedInMnemonics(WitsmlLog log, List<string> newMnemonics, List<string> existingMnemonics)
        {
            var indexMnemonic = log.IndexCurve.Value;
            if (!newMnemonics.Contains(indexMnemonic))
                newMnemonics.Insert(0, indexMnemonic);

            if (!existingMnemonics.Contains(indexMnemonic))
                existingMnemonics.Insert(0, indexMnemonic);
        }

        private async Task<(WitsmlLog sourceLog, WitsmlLog targetLog)> GetLogs(CopyLogDataJob job)
        {
            var sourceLog = WorkerTools.GetLog(witsmlSourceClient, job.SourceLogCurvesReference.LogReference, ReturnElements.HeaderOnly);
            var targetLog = WorkerTools.GetLog(witsmlClient, job.TargetLogReference, ReturnElements.HeaderOnly);
            await Task.WhenAll(sourceLog, targetLog);

            if (sourceLog.Result == null)
                throw new Exception($"Could not find source log object: UidWell: {job.SourceLogCurvesReference.LogReference.WellUid}, " +
                                    $"UidWellbore: {job.SourceLogCurvesReference.LogReference.WellboreUid}, Uid: {job.SourceLogCurvesReference.LogReference.LogUid}");
            if (targetLog.Result == null)
                throw new Exception($"Could not find target log object: UidWell: {job.SourceLogCurvesReference.LogReference.WellUid}, " +
                                    $"UidWellbore: {job.SourceLogCurvesReference.LogReference.WellboreUid}, Uid: {job.SourceLogCurvesReference.LogReference.LogUid}");

            return (sourceLog.Result, targetLog.Result);
        }

        private static string GetTargetUidForCurve(WitsmlLogCurveInfo lci, WitsmlLog targetLog)
        {
            return targetLog.LogCurveInfo.Find(GetTargetCurveIfExists(lci))?.Uid ?? lci.Uid;
        }

        private static string GetTargetNameForCurve(WitsmlLogCurveInfo lci, WitsmlLog targetLog)
        {
            return targetLog.LogCurveInfo.Find(GetTargetCurveIfExists(lci))?.Mnemonic ?? lci.Mnemonic;
        }

        private static Predicate<WitsmlLogCurveInfo> GetTargetCurveIfExists(WitsmlLogCurveInfo lci)
        {
            return curve => curve.Mnemonic.Equals(lci.Mnemonic, StringComparison.OrdinalIgnoreCase);
        }

        private class CopyResult
        {
            public bool Success { get; set; }
            public int NumberOfRowsCopied { get; set; }
        }
    }
}
