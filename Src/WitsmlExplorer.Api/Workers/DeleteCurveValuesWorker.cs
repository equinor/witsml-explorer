using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Serilog;
using Witsml;
using Witsml.Data;
using Witsml.Data.Curves;
using Witsml.ServiceReference;
using WitsmlExplorer.Api.Extensions;
using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers
{
    public interface IDeleteCurveValuesWorker
    {
        Task<(WorkerResult workerResult, RefreshLogObject refreshAction)> Execute(DeleteCurveValuesJob job);
    }

    public class DeleteCurveValuesWorker : IDeleteCurveValuesWorker
    {
        private readonly IWitsmlClient witsmlClient;

        public DeleteCurveValuesWorker(IWitsmlClientProvider witsmlClientProvider)
        {
            witsmlClient = witsmlClientProvider.GetClient();
        }

        public async Task<(WorkerResult workerResult, RefreshLogObject refreshAction)> Execute(DeleteCurveValuesJob job)
        {
            var wellUid = job.LogReference.WellUid;
            var wellboreUid = job.LogReference.WellboreUid;
            var logUid = job.LogReference.LogUid;
            var witsmlLog = await GetLogHeader(wellUid, wellboreUid, logUid);
            if (witsmlLog == null)
            {
                var reason = $"Did not find witsml log for wellUid: {wellUid}, wellboreUid: {wellboreUid}, logUid: {logUid}";
                return (new WorkerResult(witsmlClient.GetServerHostname(), false, "Unable to find log", reason), null);
            }

            var logCurveInfos = witsmlLog.LogCurveInfo.Where(logCurveInfo => job.Mnemonics.Contains(logCurveInfo.Mnemonic)).ToList();
            var deleteQueries = CreateDeleteQueries(job, witsmlLog, logCurveInfos);
            foreach (var query in deleteQueries)
            {
                var result = await witsmlClient.DeleteFromStoreAsync(query);
                if (result.IsSuccessful)
                {
                    Log.Information("{JobType} - Job successful.", GetType().Name);
                }
                else
                {
                    Log.Error("Failed to delete mnemonics for log object. WellUid: {WellUid}, WellboreUid: {WellboreUid}, Uid: {LogUid}, Mnemonics: {MnemonicsString}",
                        wellUid,
                        wellboreUid,
                        logUid,
                        string.Join(", ", job.Mnemonics));

                    return (new WorkerResult(witsmlClient.GetServerHostname(), false, "Failed to delete mnemonics", result.Reason, witsmlLog.GetDescription()), null);
                }
            }

            var refreshAction = new RefreshLogObject(witsmlClient.GetServerHostname(), wellUid, wellboreUid, logUid, RefreshType.Update);
            var mnemonicsOnLog = string.Join(", ", logCurveInfos.Select(logCurveInfo => logCurveInfo.Mnemonic));
            var workerResult = new WorkerResult(witsmlClient.GetServerHostname(), true, $"Deleted curve info values for mnemonics: {mnemonicsOnLog}, for log: {logUid}");
            return (workerResult, refreshAction);
        }

        private async Task<WitsmlLog> GetLogHeader(string wellUid, string wellboreUid, string logUid)
        {
            var query = LogQueries.GetWitsmlLogById(wellUid, wellboreUid, logUid);
            var result = await witsmlClient.GetFromStoreAsync(query, OptionsIn.HeaderOnly);
            return result.Logs.FirstOrDefault();
        }

        private static IEnumerable<WitsmlLogs> CreateDeleteQueries(DeleteCurveValuesJob job, WitsmlLog witsmlLog, List<WitsmlLogCurveInfo> logCurveInfos)
        {
            var indexRanges = job.IndexRanges.ToList().Select(range => (Index.Start(witsmlLog, range.StartIndex), Index.End(witsmlLog, range.EndIndex)));
            return indexRanges
                .Where(range => range.Item1 >= Index.Start(witsmlLog) && range.Item2 <= Index.End(witsmlLog))
                .Select(range => LogQueries.DeleteLogCurveContent(job.LogReference.WellUid, job.LogReference.WellboreUid, job.LogReference.LogUid, witsmlLog.IndexType,
                    logCurveInfos, range.Item1, range.Item2));
        }
    }
}
