using System;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.Data.Rig;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers.Create;

/// <summary>
/// Worker for creating new rig by specific well and wellbore.
/// </summary>
public class CreateRigWorker : BaseWorker<CreateRigJob>, IWorker
{
    public CreateRigWorker(ILogger<CreateRigJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider, logger) { }
    public JobType JobType => JobType.CreateRig;

    /// <summary>
    /// Create new rig on wellbore for witsml client.
    /// </summary>
    /// <param name="job">Job info of created rig.</param>
    /// <returns>Task of workerResult with refresh objects.</returns>
    public override async Task<(WorkerResult, RefreshAction)> Execute(CreateRigJob job, CancellationToken? cancellationToken = null)
    {
        Verify(job.Rig);

        WitsmlRigs rigToCreate = job.Rig.ToWitsml();

        QueryResult addToStoreResult = await GetTargetWitsmlClientOrThrow().AddToStoreAsync(rigToCreate);

        if (!addToStoreResult.IsSuccessful)
        {
            string errorMessage = "Failed to create rig.";
            Logger.LogError("{ErrorMessage}. {jobDescription}", errorMessage, job.Description());
            return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, errorMessage, addToStoreResult.Reason), null);
        }

        Logger.LogInformation("Rig created. {jobDescription}", job.Description());
        RefreshObjects refreshAction = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), job.Rig.WellUid, job.Rig.WellboreUid, EntityType.Rig);
        WorkerResult workerResult = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, $"Rig {job.Rig.Name} add for {job.Rig.WellboreName}");

        return (workerResult, refreshAction);
    }

    private static void Verify(Rig rig)
    {
        if (string.IsNullOrEmpty(rig.Uid))
        {
            throw new InvalidOperationException($"{nameof(rig.Uid)} cannot be empty");
        }

        if (string.IsNullOrEmpty(rig.Name))
        {
            throw new InvalidOperationException($"{nameof(rig.Name)} cannot be empty");
        }
    }
}
