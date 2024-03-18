using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
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

using Index = Witsml.Data.Curves.Index;

namespace WitsmlExplorer.Api.Workers
{
    public class TrimLogObjectWorker : BaseWorker<TrimLogDataJob>, IWorker
    {
        public JobType JobType => JobType.TrimLogObject;

        public TrimLogObjectWorker(ILogger<TrimLogDataJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider, logger) { }

        public override async Task<(WorkerResult, RefreshAction)> Execute(TrimLogDataJob job, CancellationToken? cancellationToken = null)
        {
            WitsmlLogs witsmlLogQuery = LogQueries.GetWitsmlLogById(job.LogObject.WellUid, job.LogObject.WellboreUid, job.LogObject.Uid);
            WitsmlLogs witsmlLogs = await GetTargetWitsmlClientOrThrow().GetFromStoreAsync(witsmlLogQuery, new OptionsIn(ReturnElements.HeaderOnly));
            WitsmlLog witsmlLog = witsmlLogs.Logs.First();

            Index currentStartIndex = Index.Start(witsmlLog);
            Index newStartIndex = Index.Start(witsmlLog, job.StartIndex);
            Index currentEndIndex = Index.End(witsmlLog);
            Index newEndIndex = Index.End(witsmlLog, job.EndIndex);
            bool isDescending = string.Equals(witsmlLog.Direction, WitsmlLog.WITSML_DIRECTION_DECREASING, StringComparison.InvariantCultureIgnoreCase);

            // Added because of issue reported by Jan Burak, see #1975, pull request #2003
            if (isDescending)
            {
                return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, "Trimming of decreasing log temporarily disabled because of potential server issue", string.Empty, witsmlLog.GetDescription()), null);
            }


            if ((currentStartIndex == newStartIndex) && (newEndIndex == currentEndIndex))
            {
                return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, "No update needed", string.Empty, witsmlLog.GetDescription()), null);
            }

            bool trimStart = isDescending
                ? currentStartIndex > newStartIndex && newStartIndex > currentEndIndex
                : currentStartIndex < newStartIndex && newStartIndex < currentEndIndex;
            bool trimEnd = isDescending
                ? currentEndIndex < newEndIndex && newEndIndex < currentStartIndex
                : currentEndIndex > newEndIndex && newEndIndex > currentStartIndex;

            bool trimmedStartOfLog = false;
            if (trimStart)
            {
                WitsmlLogs trimLogObjectStartQuery = CreateRequest(
                    job.LogObject.WellUid,
                    job.LogObject.WellboreUid,
                    job.LogObject.Uid,
                    witsmlLog.IndexType,
                    deleteTo: isDescending ? newEndIndex : newStartIndex);

                QueryResult result = await GetTargetWitsmlClientOrThrow().DeleteFromStoreAsync(trimLogObjectStartQuery);
                if (result.IsSuccessful)
                {
                    trimmedStartOfLog = true;
                }
                else
                {
                    Logger.LogError("Job failed. An error occurred when trimming log object start: {Job}", job.PrintProperties());
                    return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, "Failed to update start of log", result.Reason, witsmlLog.GetDescription()), null);
                }
            }

            bool trimmedEndOfLog = false;
            if (trimEnd)
            {
                WitsmlLogs trimLogObjectEndQuery = CreateRequest(
                    job.LogObject.WellUid,
                    job.LogObject.WellboreUid,
                    job.LogObject.Uid,
                    witsmlLog.IndexType,
                    deleteFrom: isDescending ? newStartIndex : newEndIndex);

                QueryResult result = await GetTargetWitsmlClientOrThrow().DeleteFromStoreAsync(trimLogObjectEndQuery);
                if (result.IsSuccessful)
                {
                    trimmedEndOfLog = true;
                }
                else
                {
                    Logger.LogError("Job failed. An error occurred when trimming log object end: {Job}", job.PrintProperties());
                    return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, "Failed to update end of log", result.Reason, witsmlLog.GetDescription()), null);
                }
            }

            RefreshObjects refreshAction = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), job.LogObject.WellUid, job.LogObject.WellboreUid, EntityType.Log, job.LogObject.Uid);

            return trimmedStartOfLog && trimmedEndOfLog
                ? ((WorkerResult, RefreshAction))(new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, $"Updated start/end of log [{job.LogObject.Uid}]"), refreshAction)
                : trimmedStartOfLog
                ? ((WorkerResult, RefreshAction))(new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, $"Updated start of log [{job.LogObject.Uid}]"), refreshAction)
                : trimmedEndOfLog
                ? ((WorkerResult, RefreshAction))(new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, $"Updated end of log [{job.LogObject.Uid}]"), refreshAction)
                : (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, $"Failed to update start/end of log [{job.LogObject.Uid}]", "Invalid index range"), null);
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
