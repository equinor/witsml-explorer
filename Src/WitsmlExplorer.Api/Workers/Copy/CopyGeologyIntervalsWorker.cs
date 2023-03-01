using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.Data.MudLog;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers.Copy
{
    public class CopyGeologyIntervalsWorker : BaseWorker<CopyGeologyIntervalsJob>, IWorker
    {

        public JobType JobType => JobType.CopyGeologyIntervals;

        public CopyGeologyIntervalsWorker(ILogger<CopyGeologyIntervalsJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider, logger) { }

        public override async Task<(WorkerResult, RefreshAction)> Execute(CopyGeologyIntervalsJob job)
        {
            IWitsmlClient targetClient = GetTargetWitsmlClientOrThrow();
            Uri targetHostname = targetClient.GetServerHostname();

            WitsmlMudLogs sourceQuery = (WitsmlMudLogs)ObjectQueries.GetWitsmlObjectsByIds(
                job.Source.Parent.WellUid,
                job.Source.Parent.WellboreUid,
                new string[] { job.Source.Parent.Uid },
                EntityType.MudLog);
            WitsmlMudLogs source = await GetSourceWitsmlClientOrThrow().GetFromStoreAsync(sourceQuery, new OptionsIn(ReturnElements.All));
            IEnumerable<WitsmlMudLogGeologyInterval> toCopy = source.MudLogs.First().GeologyInterval.FindAll(gi => job.Source.ComponentUids.Contains(gi.Uid));

            if (toCopy.Count() != job.Source.ComponentUids.Length)
            {
                string errorMessage = "Failed to copy geology intervals.";
                string missingUids = string.Join(", ", toCopy.Select((ts) => ts.Uid).Where((uid) => !job.Source.ComponentUids.Contains(uid)));
                string reason = $"Could not retrieve all geology intervals, missing uids: {missingUids}.";
                Logger.LogError("{errorMessage} {reason} - {description}", errorMessage, reason, job.Description());
                return (new WorkerResult(targetHostname, false, errorMessage, reason), null);
            }
            WitsmlMudLogs updatedMudLogQuery = MudLogQueries.CopyGeologyIntervals(toCopy, job.Target);
            QueryResult copyResult = await targetClient.UpdateInStoreAsync(updatedMudLogQuery);
            string geologyIntervalsString = string.Join(", ", job.Source.ComponentUids);
            if (!copyResult.IsSuccessful)
            {
                string errorMessage = "Failed to copy geology intervals.";
                Logger.LogError("{errorMessage} - {job.Description()}", errorMessage, job.Description());
                return (new WorkerResult(targetHostname, false, errorMessage, copyResult.Reason), null);
            }

            Logger.LogInformation("{JobType} - Job successful. {Description}", GetType().Name, job.Description());
            RefreshObjects refreshAction = new(targetHostname, job.Target.WellUid, job.Target.WellboreUid, EntityType.MudLog, job.Target.Uid);
            WorkerResult workerResult = new(targetHostname, true, $"GeologyIntervals {geologyIntervalsString} copied to: {job.Target.Name}");

            return (workerResult, refreshAction);
        }
    }
}
