using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Serilog;
using Witsml;
using Witsml.Data;
using Witsml.Data.Curves;
using Witsml.Extensions;
using Witsml.Query;
using Witsml.ServiceReference;
using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers
{
    public interface ITrimLogObjectWorker
    {
        Task<(WorkerResult, RefreshAction)> Execute(TrimLogDataJob job);
    }

    public class TrimLogObjectWorker: ITrimLogObjectWorker
    {
        private readonly IWitsmlClient witsmlClient;

        public TrimLogObjectWorker(IWitsmlClientProvider witsmlClientProvider)
        {
            witsmlClient = witsmlClientProvider.GetClient();
        }

        public async Task<(WorkerResult, RefreshAction)> Execute(TrimLogDataJob job)
        {
            var witsmlLogQuery = LogQueries.QueryById(job.LogObject.WellUid, job.LogObject.WellboreUid, job.LogObject.LogUid);
            var witsmlLogs = await witsmlClient.GetFromStoreAsync(witsmlLogQuery, OptionsIn.HeaderOnly);
            var witsmlLog = witsmlLogs.Logs.First();

            var currentStartIndex = Index.Start(witsmlLog);
            var newStartIndex = Index.Start(witsmlLog, job.StartIndex);
            var currentEndIndex = Index.End(witsmlLog);
            var newEndIndex = Index.End(witsmlLog, job.EndIndex);

            bool trimmedStartOfLog = false;
            if (currentStartIndex < newStartIndex && newStartIndex < currentEndIndex)
            {
                var trimLogObjectStartQuery = CreateRequest(
                    job.LogObject.WellUid,
                    job.LogObject.WellboreUid,
                    job.LogObject.LogUid,
                    witsmlLog.IndexType,
                    deleteTo: newStartIndex);

                var result = await witsmlClient.DeleteFromStoreAsync(trimLogObjectStartQuery);
                if (result.IsSuccessful)
                {
                    trimmedStartOfLog = true;
                }
                else
                {
                    Log.Error($"Job failed. An error occurred when trimming logobject start: {job.PrintProperties()}");
                    return (new WorkerResult(witsmlClient.GetServerHostname(), false, "Failed to update start of log", result.Reason, GetDescription(witsmlLog)), null);
                }
            }

            bool trimmedEndOfLog = false;
            if (currentEndIndex > newEndIndex && newEndIndex > currentStartIndex)
            {
                var trimLogObjectEndQuery = CreateRequest(
                    job.LogObject.WellUid,
                    job.LogObject.WellboreUid,
                    job.LogObject.LogUid,
                    witsmlLog.IndexType,
                    deleteFrom: newEndIndex);

                var result = await witsmlClient.DeleteFromStoreAsync(trimLogObjectEndQuery);
                if (result.IsSuccessful)
                {
                    trimmedEndOfLog = true;
                }
                else
                {
                    Log.Error($"Job failed. An error occurred when trimming logobject end: {job.PrintProperties()}");
                    return (new WorkerResult(witsmlClient.GetServerHostname(), false, "Failed to update end of log", result.Reason, GetDescription(witsmlLog)), null);
                }
            }

            var refreshAction = new RefreshLogObject(witsmlClient.GetServerHostname(), job.LogObject.WellUid, job.LogObject.WellboreUid, job.LogObject.LogUid, RefreshType.Update);
            if (trimmedStartOfLog && trimmedEndOfLog)
            {
                return (new WorkerResult(witsmlClient.GetServerHostname(), true, $"Updated start/end of log [{job.LogObject.LogUid}]"), refreshAction);
            }
            if (trimmedStartOfLog)
            {
                return (new WorkerResult(witsmlClient.GetServerHostname(), true, $"Updated start of log [{job.LogObject.LogUid}]"), refreshAction);
            }
            if (trimmedEndOfLog)
            {
                return (new WorkerResult(witsmlClient.GetServerHostname(), true, $"Updated end of log [{job.LogObject.LogUid}]"), refreshAction);
            }

            return (new WorkerResult(witsmlClient.GetServerHostname(), false, $"Failed to update start/end of log [{job.LogObject.LogUid}]", "Invalid index range"), null);
        }

        private static WitsmlLogs CreateRequest(string wellUid, string wellboreUid, string logUid, string indexType, Index deleteTo = null, Index deleteFrom = null)
        {
            var witsmlLog = new WitsmlLog
            {
                UidWell = wellUid,
                UidWellbore = wellboreUid,
                Uid = logUid
            };

            switch (indexType)
            {
                case WitsmlLog.WITSML_INDEX_TYPE_MD:
                    witsmlLog.StartIndex = deleteFrom != null ? new WitsmlIndex((DepthIndex) deleteFrom) : null;
                    witsmlLog.EndIndex = deleteTo != null ? new WitsmlIndex((DepthIndex) deleteTo) : null;
                    break;
                case WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME:
                    witsmlLog.StartDateTimeIndex = deleteFrom?.GetValueAsString();
                    witsmlLog.EndDateTimeIndex = deleteTo?.GetValueAsString();
                    break;
            }

            return new WitsmlLogs
            {
                Logs = new List<WitsmlLog> {witsmlLog}
            };
        }

        private static EntityDescription GetDescription(WitsmlLog witsmlLog)
        {
            return new EntityDescription
            {
                WellName = witsmlLog.NameWell,
                WellboreName = witsmlLog.NameWellbore,
                ObjectName = witsmlLog.Name
            };
        }
    }
}
