using System;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.Data;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers.Create;

/// <summary>
/// Worker for creating new trajectory by specific well and wellbore.
/// </summary>
public class CreateTrajectoryWorker : BaseWorker<CreateTrajectoryJob>, IWorker
{
    public CreateTrajectoryWorker(ILogger<CreateTrajectoryJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider, logger) { }
    public JobType JobType => JobType.CreateTrajectory;

    /// <summary>
    /// Create new trajectory on wellbore for witsml client.
    /// </summary>
    /// <param name="job">Job info of created trajectory.</param>
    /// <returns>Task of workerResult with refresh objects.</returns>
    public override async Task<(WorkerResult, RefreshAction)> Execute(CreateTrajectoryJob job, CancellationToken? cancellationToken = null)
    {
        Verify(job.Trajectory);

        WitsmlTrajectories trajectoryToCreate = job.Trajectory.ToWitsml();

        QueryResult addToStoreResult = await GetTargetWitsmlClientOrThrow().AddToStoreAsync(trajectoryToCreate);

        if (!addToStoreResult.IsSuccessful)
        {
            string errorMessage = "Failed to create trajectory.";
            Logger.LogError("{ErrorMessage}. {jobDescription}", errorMessage, job.Description());
            return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, errorMessage, addToStoreResult.Reason), null);
        }

        Logger.LogInformation("Trajectory created. {jobDescription}", job.Description());
        RefreshObjects refreshAction = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), job.Trajectory.WellUid, job.Trajectory.WellboreUid, EntityType.Trajectory);
        WorkerResult workerResult = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, $"Trajectory {job.Trajectory.Name} add for {job.Trajectory.WellboreName}");

        return (workerResult, refreshAction);
    }

    private static void Verify(Trajectory trajectory)
    {
        if (string.IsNullOrEmpty(trajectory.Uid))
        {
            throw new InvalidOperationException($"{nameof(trajectory.Uid)} cannot be empty");
        }

        if (string.IsNullOrEmpty(trajectory.Name))
        {
            throw new InvalidOperationException($"{nameof(trajectory.Name)} cannot be empty");
        }
    }
}
