using System.Collections.Generic;
using System.Linq;
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
        private readonly IWitsmlClient _witsmlClient;
        public JobType JobType => JobType.DeleteCurveValues;

        public DeleteCurveValuesWorker(ILogger<DeleteCurveValuesJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(logger)
        {
            _witsmlClient = witsmlClientProvider.GetClient();
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(DeleteCurveValuesJob job)
        {
            string wellUid = job.LogReference.WellUid;
            string wellboreUid = job.LogReference.WellboreUid;
            string logUid = job.LogReference.LogUid;
            WitsmlLog witsmlLog = await GetLogHeader(wellUid, wellboreUid, logUid);
            if (witsmlLog == null)
            {
                string reason = $"Did not find witsml log for wellUid: {wellUid}, wellboreUid: {wellboreUid}, logUid: {logUid}";
                return (new WorkerResult(_witsmlClient.GetServerHostname(), false, "Unable to find log", reason), null);
            }

            List<WitsmlLogCurveInfo> logCurveInfos = witsmlLog.LogCurveInfo.Where(logCurveInfo => job.Mnemonics.Contains(logCurveInfo.Mnemonic)).ToList();
            IEnumerable<WitsmlLogs> deleteQueries = CreateDeleteQueries(job, witsmlLog, logCurveInfos);
            foreach (WitsmlLogs query in deleteQueries)
            {
                QueryResult result = await _witsmlClient.DeleteFromStoreAsync(query);
                if (result.IsSuccessful)
                {
                    Logger.LogInformation("Deleted mnemonic for log object. WellUid: {WellUid}, WellboreUid: {WellboreUid}, Uid: {LogUid}, Mnemonic: {Mnemonics}",
                        wellUid,
                        wellboreUid,
                        logUid,
                        query.Logs.First().LogCurveInfo.First().Mnemonic);
                }
                else
                {
                    Logger.LogError("Failed to delete mnemonics for log object. WellUid: {WellUid}, WellboreUid: {WellboreUid}, Uid: {LogUid}, Mnemonics: {MnemonicsString}",
                        wellUid,
                        wellboreUid,
                        logUid,
                        string.Join(", ", job.Mnemonics));

                    return (new WorkerResult(_witsmlClient.GetServerHostname(), false, "Failed to delete mnemonics", result.Reason, witsmlLog.GetDescription()), null);
                }
            }

            RefreshLogObject refreshAction = new(_witsmlClient.GetServerHostname(), wellUid, wellboreUid, logUid, RefreshType.Update);
            string mnemonicsOnLog = string.Join(", ", logCurveInfos.Select(logCurveInfo => logCurveInfo.Mnemonic));
            WorkerResult workerResult = new(_witsmlClient.GetServerHostname(), true, $"Deleted curve info values for mnemonics: {mnemonicsOnLog}, for log: {logUid}");
            return (workerResult, refreshAction);
        }

        private async Task<WitsmlLog> GetLogHeader(string wellUid, string wellboreUid, string logUid)
        {
            WitsmlLogs query = LogQueries.GetWitsmlLogById(wellUid, wellboreUid, logUid);
            WitsmlLogs result = await _witsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.HeaderOnly));
            return result.Logs.FirstOrDefault();
        }

        private static IEnumerable<WitsmlLogs> CreateDeleteQueries(DeleteCurveValuesJob job, WitsmlLog witsmlLog, List<WitsmlLogCurveInfo> logCurveInfos)
        {
            IEnumerable<(Index, Index)> indexRanges = job.IndexRanges.ToList().Select(range => (Index.Start(witsmlLog, range.StartIndex), Index.End(witsmlLog, range.EndIndex)));
            return indexRanges
                .Where(range => range.Item1 >= Index.Start(witsmlLog) && range.Item2 <= Index.End(witsmlLog))
                .Select(range => LogQueries.DeleteLogCurveContent(job.LogReference.WellUid, job.LogReference.WellboreUid, job.LogReference.LogUid, witsmlLog.IndexType,
                    logCurveInfos, range.Item1, range.Item2));
        }
    }
}
