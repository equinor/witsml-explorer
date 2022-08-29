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
    public class DeleteTrajectoryWorker : BaseWorker<DeleteTrajectoryJob>, IWorker
    {
        private readonly IWitsmlClient _witsmlClient;
        public JobType JobType => JobType.DeleteTrajectory;

        public DeleteTrajectoryWorker(ILogger<DeleteTrajectoryJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(logger)
        {
            _witsmlClient = witsmlClientProvider.GetClient();
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(DeleteTrajectoryJob job)
        {
            string wellUid = job.ToDelete.WellUid;
            string wellboreUid = job.ToDelete.WellboreUid;
            string trajectoryUid = job.ToDelete.TrajectoryUid;

            WitsmlTrajectories witsmlTrajectory = TrajectoryQueries.GetWitsmlTrajectoryById(wellUid, wellboreUid, trajectoryUid);
            QueryResult result = await _witsmlClient.DeleteFromStoreAsync(witsmlTrajectory);
            if (result.IsSuccessful)
            {
                Logger.LogInformation("Deleted trajectory. WellUid: {WellUid}, WellboreUid: {WellboreUid}, Uid: {Uid}",
                        wellUid,
                        wellboreUid,
                        trajectoryUid);
                RefreshWellbore refreshAction = new(_witsmlClient.GetServerHostname(), wellUid, wellboreUid, RefreshType.Update);
                return (new WorkerResult(_witsmlClient.GetServerHostname(), true, $"Deleted trajectory: ${trajectoryUid}"), refreshAction);
            }

            Logger.LogError("Failed to delete trajectory. WellUid: {WellUid}, WellboreUid: {WellboreUid}, Uid: {TrajectoryUid}",
                wellUid,
                wellboreUid,
                trajectoryUid);

            witsmlTrajectory = TrajectoryQueries.GetWitsmlTrajectoryById(wellUid, wellboreUid, trajectoryUid);
            WitsmlTrajectories queryResult = await _witsmlClient.GetFromStoreAsync(witsmlTrajectory, new OptionsIn(ReturnElements.IdOnly));

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
            return (new WorkerResult(_witsmlClient.GetServerHostname(), false, "Failed to delete trajectory", result.Reason, description), null);
        }
    }
}
