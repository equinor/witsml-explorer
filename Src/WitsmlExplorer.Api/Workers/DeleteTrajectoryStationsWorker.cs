using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;

using Serilog;

using Witsml;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers
{
    public class DeleteTrajectoryStationsWorker : BaseWorker<DeleteTrajectoryStationsJob>, IWorker
    {
        private readonly IWitsmlClient _witsmlClient;
        public JobType JobType => JobType.DeleteTrajectoryStations;

        public DeleteTrajectoryStationsWorker(IWitsmlClientProvider witsmlClientProvider)
        {
            _witsmlClient = witsmlClientProvider.GetClient();
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(DeleteTrajectoryStationsJob job)
        {
            var wellUid = job.Source.TrajectoryReference.WellUid;
            var wellboreUid = job.Source.TrajectoryReference.WellboreUid;
            var trajectoryUid = job.Source.TrajectoryReference.TrajectoryUid;
            var trajectoryStations = new ReadOnlyCollection<string>(job.Source.TrajectoryStationUids.ToList());
            var trajectoryStationsString = string.Join(", ", trajectoryStations);

            var query = TrajectoryQueries.DeleteTrajectoryStations(wellUid, wellboreUid, trajectoryUid, trajectoryStations);
            var result = await _witsmlClient.DeleteFromStoreAsync(query);
            if (result.IsSuccessful)
            {
                Log.Information("{JobType} - Job successful", GetType().Name);
                var refreshAction = new RefreshTrajectory(_witsmlClient.GetServerHostname(), wellUid, wellboreUid, trajectoryUid, RefreshType.Update);
                var workerResult = new WorkerResult(_witsmlClient.GetServerHostname(), true, $"Deleted trajectoryStations: {trajectoryStationsString} for trajectory: {trajectoryUid}");
                return (workerResult, refreshAction);
            }

            Log.Error("Failed to delete trajectoryStations for trajectory object. WellUid: {WellUid}, WellboreUid: {WellboreUid}, Uid: {TrajectoryUid}, TrajectoryStations: {TrajectoryStationsString}",
                wellUid,
                wellboreUid,
                trajectoryUid,
                trajectoryStations);

            query = TrajectoryQueries.GetWitsmlTrajectoryById(wellUid, wellboreUid, trajectoryUid);
            var queryResult = await _witsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.IdOnly));

            var trajectory = queryResult.Trajectories.First();
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

            return (new WorkerResult(_witsmlClient.GetServerHostname(), false, "Failed to delete trajectory stations", result.Reason, description), null);
        }
    }
}
