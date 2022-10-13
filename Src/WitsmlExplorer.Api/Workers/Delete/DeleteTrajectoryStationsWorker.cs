using System.Collections.ObjectModel;
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

namespace WitsmlExplorer.Api.Workers.Delete
{
    public class DeleteTrajectoryStationsWorker : BaseWorker<DeleteTrajectoryStationsJob>, IWorker
    {
        public JobType JobType => JobType.DeleteTrajectoryStations;

        public DeleteTrajectoryStationsWorker(ILogger<DeleteTrajectoryStationsJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider, logger) { }

        public override async Task<(WorkerResult, RefreshAction)> Execute(DeleteTrajectoryStationsJob job)
        {
            string wellUid = job.ToDelete.Parent.WellUid;
            string wellboreUid = job.ToDelete.Parent.WellboreUid;
            string trajectoryUid = job.ToDelete.Parent.Uid;
            ReadOnlyCollection<string> trajectoryStations = new(job.ToDelete.ComponentUids.ToList());
            string trajectoryStationsString = string.Join(", ", trajectoryStations);

            WitsmlTrajectories query = TrajectoryQueries.DeleteTrajectoryStations(wellUid, wellboreUid, trajectoryUid, trajectoryStations);
            QueryResult result = await GetTargetWitsmlClientOrThrow().DeleteFromStoreAsync(query);
            if (result.IsSuccessful)
            {
                Logger.LogInformation("Deleted trajectoryStations for trajectory object. WellUid: {WellUid}, WellboreUid: {WellboreUid}, Uid: {TrajectoryUid}, TrajectoryStations: {TrajectoryStationsString}",
                    wellUid,
                    wellboreUid,
                    trajectoryUid,
                    trajectoryStations);
                RefreshTrajectory refreshAction = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), wellUid, wellboreUid, trajectoryUid, RefreshType.Update);
                WorkerResult workerResult = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, $"Deleted trajectoryStations: {trajectoryStationsString} for trajectory: {trajectoryUid}");
                return (workerResult, refreshAction);
            }

            Logger.LogError("Failed to delete trajectoryStations for trajectory object. WellUid: {WellUid}, WellboreUid: {WellboreUid}, Uid: {TrajectoryUid}, TrajectoryStations: {TrajectoryStationsString}",
                wellUid,
                wellboreUid,
                trajectoryUid,
                trajectoryStations);

            query = TrajectoryQueries.GetWitsmlTrajectoryById(wellUid, wellboreUid, trajectoryUid);
            WitsmlTrajectories queryResult = await GetTargetWitsmlClientOrThrow().GetFromStoreAsync(query, new OptionsIn(ReturnElements.IdOnly));

            WitsmlTrajectory trajectory = queryResult.Trajectories.First();
            EntityDescription description = null;
            if (trajectory != null)
            {
                description = new EntityDescription
                {
                    WellName = trajectory.NameWell,
                    WellboreName = trajectory.NameWellbore,
                    ObjectName = trajectory.Name
                };
            }

            return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, "Failed to delete trajectory stations", result.Reason, description), null);
        }
    }
}
