using System;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.Extensions;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers
{
    public class ModifyTrajectoryStationWorker : BaseWorker<ModifyTrajectoryStationJob>, IWorker
    {
        private readonly IWitsmlClient _witsmlClient;
        public JobType JobType => JobType.ModifyTrajectoryStation;

        public ModifyTrajectoryStationWorker(ILogger<ModifyTrajectoryStationJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(logger)
        {
            _witsmlClient = witsmlClientProvider.GetClient();
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(ModifyTrajectoryStationJob job)
        {
            Verify(job.TrajectoryStation, job.TrajectoryReference);

            var wellUid = job.TrajectoryReference.WellUid;
            var wellboreUid = job.TrajectoryReference.WellboreUid;
            var trajectoryUid = job.TrajectoryReference.TrajectoryUid;

            var query = TrajectoryQueries.UpdateTrajectoryStation(job.TrajectoryStation, job.TrajectoryReference);
            var result = await _witsmlClient.UpdateInStoreAsync(query);
            if (result.IsSuccessful)
            {
                Logger.LogInformation("TrajectoryStation modified. {jobDescription}", job.Description());
                var refreshAction = new RefreshTrajectory(_witsmlClient.GetServerHostname(), wellUid, wellboreUid, trajectoryUid, RefreshType.Update);
                return (new WorkerResult(_witsmlClient.GetServerHostname(), true, $"TrajectoryStation updated ({job.TrajectoryStation.Uid})"), refreshAction);
            }

            Logger.LogError("Job failed. An error occurred when modifying TrajectoryStation object: {TrajectoryStation}", job.TrajectoryStation.PrintProperties());
            var trajectoryStationQuery = TrajectoryQueries.GetWitsmlTrajectoryById(wellUid, wellboreUid, trajectoryUid);
            var trajectoryStations = await _witsmlClient.GetFromStoreAsync(trajectoryStationQuery, new OptionsIn(ReturnElements.IdOnly));
            var trajectory = trajectoryStations.Trajectories.FirstOrDefault();
            EntityDescription description = null;
            if (trajectory != null)
            {
                description = new EntityDescription
                {
                    WellName = trajectory.NameWell,
                    WellboreName = trajectory.NameWellbore,
                    ObjectName = job.TrajectoryStation.Uid
                };
            }

            return (new WorkerResult(_witsmlClient.GetServerHostname(), false, "Failed to update TrajectoryStation", result.Reason, description), null);
        }

        private static void Verify(TrajectoryStation trajectoryStation, TrajectoryReference trajectoryReference)
        {
            if (string.IsNullOrEmpty(trajectoryReference.WellUid)) throw new InvalidOperationException($"{nameof(trajectoryReference.WellUid)} cannot be empty");
            if (string.IsNullOrEmpty(trajectoryReference.WellboreUid)) throw new InvalidOperationException($"{nameof(trajectoryReference.WellboreUid)} cannot be empty");
            if (string.IsNullOrEmpty(trajectoryReference.TrajectoryUid)) throw new InvalidOperationException($"{nameof(trajectoryReference.TrajectoryUid)} cannot be empty");

            if (string.IsNullOrEmpty(trajectoryStation.Uid)) throw new InvalidOperationException($"{nameof(TrajectoryStation.Uid)} cannot be empty");
        }
    }
}
