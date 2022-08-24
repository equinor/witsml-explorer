using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.Data;
using Witsml.Data.Curves;
using Witsml.Extensions;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Extensions;
using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers
{
    public class TrimLogObjectWorker : BaseWorker<TrimLogDataJob>, IWorker
    {
        private readonly IWitsmlClient _witsmlClient;
        public JobType JobType => JobType.TrimLogObject;

        public TrimLogObjectWorker(ILogger<TrimLogDataJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(logger)
        {
            _witsmlClient = witsmlClientProvider.GetClient();
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(TrimLogDataJob job)
        {
            WitsmlLogs witsmlLogQuery = LogQueries.GetWitsmlLogById(job.LogObject.WellUid, job.LogObject.WellboreUid, job.LogObject.LogUid);
            WitsmlLogs witsmlLogs = await _witsmlClient.GetFromStoreAsync(witsmlLogQuery, new OptionsIn(ReturnElements.HeaderOnly));
            WitsmlLog witsmlLog = witsmlLogs.Logs.First();

            Index currentStartIndex = Index.Start(witsmlLog);
            Index newStartIndex = Index.Start(witsmlLog, job.StartIndex);
            Index currentEndIndex = Index.End(witsmlLog);
            Index newEndIndex = Index.End(witsmlLog, job.EndIndex);

            bool trimmedStartOfLog = false;
            if (currentStartIndex < newStartIndex && newStartIndex < currentEndIndex)
            {
                WitsmlLogs trimLogObjectStartQuery = CreateRequest(
                    job.LogObject.WellUid,
                    job.LogObject.WellboreUid,
                    job.LogObject.LogUid,
                    witsmlLog.IndexType,
                    deleteTo: newStartIndex);

                QueryResult result = await _witsmlClient.DeleteFromStoreAsync(trimLogObjectStartQuery);
                if (result.IsSuccessful)
                {
                    trimmedStartOfLog = true;
                }
                else
                {
                    Logger.LogError("Job failed. An error occurred when trimming log object start: {Job}", job.PrintProperties());
                    return (new WorkerResult(_witsmlClient.GetServerHostname(), false, "Failed to update start of log", result.Reason, witsmlLog.GetDescription()), null);
                }
            }

            bool trimmedEndOfLog = false;
            if (currentEndIndex > newEndIndex && newEndIndex > currentStartIndex)
            {
                WitsmlLogs trimLogObjectEndQuery = CreateRequest(
                    job.LogObject.WellUid,
                    job.LogObject.WellboreUid,
                    job.LogObject.LogUid,
                    witsmlLog.IndexType,
                    deleteFrom: newEndIndex);

                QueryResult result = await _witsmlClient.DeleteFromStoreAsync(trimLogObjectEndQuery);
                if (result.IsSuccessful)
                {
                    trimmedEndOfLog = true;
                }
                else
                {
                    Logger.LogError("Job failed. An error occurred when trimming log object end: {Job}", job.PrintProperties());
                    return (new WorkerResult(_witsmlClient.GetServerHostname(), false, "Failed to update end of log", result.Reason, witsmlLog.GetDescription()), null);
                }
            }

            RefreshLogObject refreshAction = new(_witsmlClient.GetServerHostname(), job.LogObject.WellUid, job.LogObject.WellboreUid, job.LogObject.LogUid, RefreshType.Update);

            return trimmedStartOfLog && trimmedEndOfLog
                ? ((WorkerResult, RefreshAction))(new WorkerResult(_witsmlClient.GetServerHostname(), true, $"Updated start/end of log [{job.LogObject.LogUid}]"), refreshAction)
                : trimmedStartOfLog
                ? ((WorkerResult, RefreshAction))(new WorkerResult(_witsmlClient.GetServerHostname(), true, $"Updated start of log [{job.LogObject.LogUid}]"), refreshAction)
                : trimmedEndOfLog
                ? ((WorkerResult, RefreshAction))(new WorkerResult(_witsmlClient.GetServerHostname(), true, $"Updated end of log [{job.LogObject.LogUid}]"), refreshAction)
                : (new WorkerResult(_witsmlClient.GetServerHostname(), false, $"Failed to update start/end of log [{job.LogObject.LogUid}]", "Invalid index range"), null);
        }

        private static WitsmlLogs CreateRequest(string wellUid, string wellboreUid, string logUid, string indexType, Index deleteTo = null, Index deleteFrom = null)
        {
            WitsmlLog witsmlLog = new()
            {
                UidWell = wellUid,
                UidWellbore = wellboreUid,
                Uid = logUid
            };

            switch (indexType)
            {
                case WitsmlLog.WITSML_INDEX_TYPE_MD:
                    witsmlLog.StartIndex = deleteFrom != null ? new WitsmlIndex((DepthIndex)deleteFrom) : null;
                    witsmlLog.EndIndex = deleteTo != null ? new WitsmlIndex((DepthIndex)deleteTo) : null;
                    break;
                case WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME:
                    witsmlLog.StartDateTimeIndex = deleteFrom?.GetValueAsString();
                    witsmlLog.EndDateTimeIndex = deleteTo?.GetValueAsString();
                    break;
                default:
                    break;
            }

            return new WitsmlLogs
            {
                Logs = new List<WitsmlLog> { witsmlLog }
            };
        }
    }
}
