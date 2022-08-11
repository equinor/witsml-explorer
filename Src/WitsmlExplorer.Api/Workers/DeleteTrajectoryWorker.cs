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
    public class DeleteTrajectoryWorker : BaseWorker<DeleteTrajectoryJob>, IWorker
    {
        private readonly IWitsmlClient _witsmlClient;
        public JobType JobType => JobType.DeleteTrajectory;

        public DeleteTrajectoryWorker(IWitsmlClientProvider witsmlClientProvider)
        {
            _witsmlClient = witsmlClientProvider.GetClient();
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(DeleteTrajectoryJob job)
        {
            var wellUid = job.Source.WellUid;
            var wellboreUid = job.Source.WellboreUid;
            var trajectoryUid = job.Source.TrajectoryUid;

            var witsmlTrajectory = TrajectoryQueries.GetWitsmlTrajectoryById(wellUid, wellboreUid, trajectoryUid);
            var result = await _witsmlClient.DeleteFromStoreAsync(witsmlTrajectory);
            if (result.IsSuccessful)
            {
                Log.Information("{JobType} - Job successful", GetType().Name);
                var refreshAction = new RefreshWellbore(_witsmlClient.GetServerHostname(), wellUid, wellboreUid, RefreshType.Update);
                return (new WorkerResult(_witsmlClient.GetServerHostname(), true, $"Deleted trajectory: ${trajectoryUid}"), refreshAction);
            }

            Log.Error("Failed to delete trajectory. WellUid: {WellUid}, WellboreUid: {WellboreUid}, Uid: {TrajectoryUid}",
                wellUid,
                wellboreUid,
                trajectoryUid);

            witsmlTrajectory = TrajectoryQueries.GetWitsmlTrajectoryById(wellUid, wellboreUid, trajectoryUid);
            var queryResult = await _witsmlClient.GetFromStoreAsync(witsmlTrajectory, new OptionsIn(ReturnElements.IdOnly));

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
            return (new WorkerResult(_witsmlClient.GetServerHostname(), false, "Failed to delete trajectory", result.Reason, description), null);
        }
    }
}
