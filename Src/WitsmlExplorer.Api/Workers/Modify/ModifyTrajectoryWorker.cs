using System;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.Data;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common.Interfaces;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers.Modify
{
    /// <summary>
    /// Worker for modifying trajectory by specific well and wellbore.
    /// </summary>
    public class ModifyTrajectoryWorker : BaseWorker<ModifyTrajectoryJob>, IWorker
    {
        public JobType JobType => JobType.ModifyTrajectory;

        public ModifyTrajectoryWorker(ILogger<ModifyTrajectoryJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider, logger) { }

        /// <summary>
        /// Executes the modification of a trajectory on wellbore for Witsml client.
        /// </summary>
        /// <param name="job">Job information for a modified trajectory.</param>
        /// <returns>Task of the workerResult with RefreshAction.</returns>
        public override async Task<(WorkerResult, RefreshAction)> Execute(ModifyTrajectoryJob job)
        {
            Verify(job.Trajectory);

            WitsmlTrajectories modifyQuery = TrajectoryQueries.CreateTrajectory(job.Trajectory);
            QueryResult modifyResult = await GetTargetWitsmlClientOrThrow().UpdateInStoreAsync(modifyQuery);

            if (!modifyResult.IsSuccessful)
            {
                const string errorMessage = "Failed to modify trajectory object";
                Logger.LogError("{ErrorMessage}. {jobDescription}", errorMessage, job.Description());
                return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, errorMessage, modifyResult.Reason), null);
            }

            Logger.LogInformation("Trajectory modified. {jobDescription}", job.Description());
            RefreshObjects refreshAction = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), job.Trajectory.WellUid, job.Trajectory.WellboreUid, EntityType.Trajectory);
            WorkerResult workerResult = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), true,
                $"Trajectory {job.Trajectory.Name} updated for {job.Trajectory.WellboreName}");

            return (workerResult, refreshAction);
        }

        private static void Verify(IObjectReference trajectory)
        {
            if (string.IsNullOrEmpty(trajectory.Name))
            {
                throw new InvalidOperationException($"{nameof(trajectory.Name)} cannot be empty");
            }
        }
    }
}
