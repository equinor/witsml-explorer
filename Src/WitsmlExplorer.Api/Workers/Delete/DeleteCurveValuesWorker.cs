using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.Data;
using Witsml.Data.Curves;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Extensions;
using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers.Delete
{
    public class DeleteCurveValuesWorker : BaseWorker<DeleteCurveValuesJob>, IWorker
    {
        public JobType JobType => JobType.DeleteCurveValues;

        public DeleteCurveValuesWorker(ILogger<DeleteCurveValuesJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider, logger) { }

        public override async Task<(WorkerResult, RefreshAction)> Execute(DeleteCurveValuesJob job, CancellationToken? cancellationToken = null)
        {
            string wellUid = job.LogReference.WellUid;
            string wellboreUid = job.LogReference.WellboreUid;
            string logUid = job.LogReference.Uid;
            WitsmlLog witsmlLog = await GetLogHeader(wellUid, wellboreUid, logUid);
            if (witsmlLog == null)
            {
                string reason = $"Did not find witsml log for wellUid: {wellUid}, wellboreUid: {wellboreUid}, logUid: {logUid}";
                return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, "Unable to find log", reason), null);
            }

            List<WitsmlLogCurveInfo> logCurveInfos = witsmlLog.LogCurveInfo.Where(logCurveInfo => job.Mnemonics.Contains(logCurveInfo.Mnemonic)).ToList();
            IEnumerable<WitsmlLogs> deleteQueries = CreateDeleteQueries(job, witsmlLog, logCurveInfos);
            foreach (WitsmlLogs query in deleteQueries)
            {
                QueryResult result = await GetTargetWitsmlClientOrThrow().DeleteFromStoreAsync(query);
                if (result.IsSuccessful)
                {
                    Logger.LogInformation("Deleted mnemonic for log object. WellUid: {WellUid}, WellboreUid: {WellboreUid}, Uid: {LogUid}, Mnemonic: {Mnemonics}",
                        wellUid,
                        wellboreUid,
                        logUid,
                        query.Logs.FirstOrDefault()?.LogCurveInfo?.FirstOrDefault()?.Mnemonic);
                }
                else
                {
                    Logger.LogError("Failed to delete mnemonics for log object. WellUid: {WellUid}, WellboreUid: {WellboreUid}, Uid: {LogUid}, Mnemonics: {MnemonicsString}",
                        wellUid,
                        wellboreUid,
                        logUid,
                        string.Join(", ", job.Mnemonics));

                    return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, "Failed to delete mnemonics", result.Reason, witsmlLog.GetDescription()), null);
                }
            }

            RefreshObjects refreshAction = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), wellUid, wellboreUid, EntityType.Log, logUid);
            string mnemonicsOnLog = string.Join(", ", logCurveInfos.Select(logCurveInfo => logCurveInfo.Mnemonic));
            WorkerResult workerResult = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, $"Deleted curve info values for mnemonics: {mnemonicsOnLog}, for log: {logUid}");
            return (workerResult, refreshAction);
        }

        private async Task<WitsmlLog> GetLogHeader(string wellUid, string wellboreUid, string logUid)
        {
            WitsmlLogs query = LogQueries.GetWitsmlLogById(wellUid, wellboreUid, logUid);
            WitsmlLogs result = await GetTargetWitsmlClientOrThrow().GetFromStoreAsync(query, new OptionsIn(ReturnElements.HeaderOnly));
            return result.Logs.FirstOrDefault();
        }

        private static ICollection<WitsmlLogs> CreateDeleteQueries(DeleteCurveValuesJob job, WitsmlLog witsmlLog, List<WitsmlLogCurveInfo> logCurveInfos)
        {
            var isDecreasing = witsmlLog.Direction == WitsmlLog.WITSML_DIRECTION_DECREASING;
            Index logStart = Index.Start(witsmlLog);
            Index logEnd = Index.End(witsmlLog);
            return job.IndexRanges
                .Select(range => (
                    Start: Index.Start(witsmlLog, range.StartIndex),
                    End: Index.End(witsmlLog, range.EndIndex)
                ))
                .Where(range => isDecreasing
                    ? range.Start <= logStart && range.End >= logEnd
                    : range.Start >= logStart && range.End <= logEnd)
                .Select(range => LogQueries.DeleteLogCurveContent(
                    job.LogReference.WellUid,
                    job.LogReference.WellboreUid,
                    job.LogReference.Uid,
                    witsmlLog.IndexType,
                    logCurveInfos,
                    range.Start,
                    range.End))
                .ToList();
        }
    }
}
