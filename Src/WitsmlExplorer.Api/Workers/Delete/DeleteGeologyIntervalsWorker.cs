using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.Data.MudLog;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers.Delete
{
    public class DeleteGeologyIntervalsWorker : BaseWorker<DeleteGeologyIntervalsJob>, IWorker
    {
        public JobType JobType => JobType.DeleteGeologyIntervals;

        public DeleteGeologyIntervalsWorker(ILogger<DeleteGeologyIntervalsJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider, logger) { }

        public override async Task<(WorkerResult, RefreshAction)> Execute(DeleteGeologyIntervalsJob job)
        {
            string wellUid = job.ToDelete.Parent.WellUid;
            string wellboreUid = job.ToDelete.Parent.WellboreUid;
            string mudLogUid = job.ToDelete.Parent.Uid;
            ReadOnlyCollection<string> geologyIntervals = new(job.ToDelete.ComponentUids.ToList());
            string geologyIntervalsString = string.Join(", ", geologyIntervals);

            WitsmlMudLogs query = MudLogQueries.DeleteGeologyIntervals(wellUid, wellboreUid, mudLogUid, geologyIntervals);
            QueryResult result = await GetTargetWitsmlClientOrThrow().DeleteFromStoreAsync(query);
            if (result.IsSuccessful)
            {
                Logger.LogInformation("Deleted geologyIntervals for mudLog object. WellUid: {WellUid}, WellboreUid: {WellboreUid}, Uid: {MudLogUid}, GeologyIntervals: {GeologyIntervalsString}",
                    wellUid,
                    wellboreUid,
                    mudLogUid,
                    geologyIntervals);
                RefreshObjects refreshAction = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), wellUid, wellboreUid, EntityType.MudLog, mudLogUid);
                WorkerResult workerResult = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, $"Deleted geologyIntervals: {geologyIntervalsString} for mudLog: {mudLogUid}");
                return (workerResult, refreshAction);
            }
            Logger.LogError("Failed to delete geologyIntervals for mudLog object. WellUid: {WellUid}, WellboreUid: {WellboreUid}, Uid: {MudLogUid}, GeologyIntervals: {GeologyIntervalsString}",
                wellUid,
                wellboreUid,
                mudLogUid,
                geologyIntervals);

            EntityDescription description = new()
            {
                WellName = job.ToDelete.Parent.WellName,
                WellboreName = job.ToDelete.Parent.WellboreName,
                ObjectName = job.ToDelete.Parent.Name
            };

            return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, "Failed to delete mudLog components", result.Reason, description), null);
        }
    }
}
