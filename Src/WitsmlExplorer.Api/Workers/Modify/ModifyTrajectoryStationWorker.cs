using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.Data;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers.Modify
{
    public class ModifyTrajectoryStationWorker : BaseWorker<ModifyTrajectoryStationJob>, IWorker
    {
        public JobType JobType => JobType.ModifyTrajectoryStation;

        public ModifyTrajectoryStationWorker(ILogger<ModifyTrajectoryStationJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider, logger) { }

        public override async Task<(WorkerResult, RefreshAction)> Execute(ModifyTrajectoryStationJob job, CancellationToken? cancellationToken = null)
        {
            Verify(job.TrajectoryStation, job.TrajectoryReference);

            string wellUid = job.TrajectoryReference.WellUid;
            string wellboreUid = job.TrajectoryReference.WellboreUid;
            string trajectoryUid = job.TrajectoryReference.Uid;

            WitsmlTrajectories query = TrajectoryQueries.UpdateTrajectoryStation(job.TrajectoryStation, job.TrajectoryReference);
            QueryResult result = await GetTargetWitsmlClientOrThrow().UpdateInStoreAsync(query);
            if (result.IsSuccessful)
            {
                Logger.LogInformation("TrajectoryStation modified. {jobDescription}", job.Description());
                RefreshObjects refreshAction = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), wellUid, wellboreUid, EntityType.Trajectory, trajectoryUid);
                return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, $"TrajectoryStation updated ({job.TrajectoryStation.Uid})"), refreshAction);
            }

            const string errorMessage = "Failed to update TrajectoryStation";
            Logger.LogError("{ErrorMessage}. {jobDescription}", errorMessage, job.Description());
            WitsmlTrajectories trajectoryStationQuery = TrajectoryQueries.GetWitsmlTrajectoryById(wellUid, wellboreUid, trajectoryUid);
            WitsmlTrajectories trajectoryStations = await GetTargetWitsmlClientOrThrow().GetFromStoreAsync(trajectoryStationQuery, new OptionsIn(ReturnElements.IdOnly));
            WitsmlTrajectory trajectory = trajectoryStations.Trajectories.FirstOrDefault();
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

            return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, errorMessage, result.Reason, description), null);
        }

        private static void Verify(TrajectoryStation trajectoryStation, ObjectReference trajectoryReference)
        {
            if (string.IsNullOrEmpty(trajectoryReference.WellUid))
            {
                throw new InvalidOperationException($"{nameof(trajectoryReference.WellUid)} cannot be empty");
            }

            if (string.IsNullOrEmpty(trajectoryReference.WellboreUid))
            {
                throw new InvalidOperationException($"{nameof(trajectoryReference.WellboreUid)} cannot be empty");
            }

            if (string.IsNullOrEmpty(trajectoryReference.Uid))
            {
                throw new InvalidOperationException($"{nameof(trajectoryReference.Uid)} cannot be empty");
            }

            if (string.IsNullOrEmpty(trajectoryStation.Uid))
            {
                throw new InvalidOperationException($"{nameof(TrajectoryStation.Uid)} cannot be empty");
            }
        }
    }
}
