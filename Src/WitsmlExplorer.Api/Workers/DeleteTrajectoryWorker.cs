using System.Linq;
using System.Threading.Tasks;
using Serilog;
using Witsml;
using Witsml.ServiceReference;
using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers
{
    public interface IDeleteTrajectoryWorker
    {
        Task<WorkerResult> Execute(DeleteTrajectoryJob job);
    }

    public class DeleteTrajectoryWorker: IDeleteTrajectoryWorker
    {
        private readonly IWitsmlClient witsmlClient;

        public DeleteTrajectoryWorker(IWitsmlClientProvider witsmlClientProvider)
        {
            witsmlClient = witsmlClientProvider.GetClient();
        }

        public async Task<WorkerResult> Execute(DeleteTrajectoryJob job)
        {
            var wellUid = job.TrajectoryReference.WellUid;
            var wellboreUid = job.TrajectoryReference.WellboreUid;
            var trajectoryUid = job.TrajectoryReference.TrajectoryUid;

            var witsmlTrajectory = TrajectoryQueries.GetWitsmlTrajectoryById(wellUid, wellboreUid, trajectoryUid);
            var result = await witsmlClient.DeleteFromStoreAsync(witsmlTrajectory);
            if (result.IsSuccessful)
            {
                Log.Information("{JobType} - Job successful", GetType().Name);
                return new WorkerResult(witsmlClient.GetServerHostname(), true, $"Deleted trajectory: ${trajectoryUid}");
            }

            Log.Error("Failed to delete trajectory. WellUid: {WellUid}, WellboreUid: {WellboreUid}, Uid: {TrajectoryUid}",
                wellUid,
                wellboreUid,
                trajectoryUid);

            witsmlTrajectory = TrajectoryQueries.GetWitsmlTrajectoryById(wellUid, wellboreUid, trajectoryUid);
            var queryResult = await witsmlClient.GetFromStoreAsync(witsmlTrajectory, new OptionsIn(ReturnElements.IdOnly));

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
            return new WorkerResult(witsmlClient.GetServerHostname(), false, "Failed to delete trajectory", result.Reason, description);
        }
    }
}
