using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml.Data;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers.Copy
{
    public interface ICopyWellWorker
    {
        Task<(WorkerResult, RefreshAction)> Execute(CopyWellJob job, CancellationToken? cancellationToken = null);
    }

    public class CopyWellWorker : BaseWorker<CopyWellJob>, IWorker, ICopyWellWorker
    {
        public CopyWellWorker(ILogger<CopyWellJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider, logger)
        {
        }

        public JobType JobType => JobType.CopyWell;

        public override async Task<(WorkerResult, RefreshAction)> Execute(CopyWellJob job, CancellationToken? cancellationToken = null)
        {
            Witsml.IWitsmlClient sourceClient = GetSourceWitsmlClientOrThrow();
            Witsml.IWitsmlClient targetClient = GetTargetWitsmlClientOrThrow();

            WitsmlWell existingWell = await WorkerTools.GetWell(targetClient, job.Target, Witsml.ServiceReference.ReturnElements.Requested);

            if (existingWell != null)
            {
                string message = "Target well already exists";
                Logger.LogWarning("{WarningMessage} - {JobDescription}", message, job.Description());
                return (new WorkerResult(targetClient.GetServerHostname(), true, message, sourceServerUrl: sourceClient.GetServerHostname()), null);
            }

            WitsmlWell sourceWell = await WorkerTools.GetWell(sourceClient, job.Source, Witsml.ServiceReference.ReturnElements.All);

            string errorMessage = "Failed to copy well.";

            if (sourceWell == null)
            {
                Logger.LogError("{ErrorMessage} - {JobDescription}", errorMessage, job.Description());
                return (new WorkerResult(targetClient.GetServerHostname(), false, errorMessage, sourceServerUrl: sourceClient.GetServerHostname()), null);
            }

            if (cancellationToken is { IsCancellationRequested: true })
            {
                return (new WorkerResult(targetClient.GetServerHostname(), false, CancellationMessage(), CancellationReason(), sourceServerUrl: sourceClient.GetServerHostname()), null);
            }

            // May be the same UID and name or a different one
            sourceWell.Uid = job.Target.WellUid;
            sourceWell.Name = job.Target.WellName;

            WitsmlWells wells = new() { Wells = { sourceWell } };

            Witsml.QueryResult result = await targetClient.AddToStoreAsync(wells);

            if (!result.IsSuccessful)
            {
                Logger.LogError("{ErrorMessage} {Reason} - {JobDescription}", errorMessage, result.Reason, job.Description());
                return (new WorkerResult(targetClient.GetServerHostname(), false, errorMessage, result.Reason, sourceServerUrl: sourceClient.GetServerHostname()), null);
            }

            Logger.LogInformation("{JobType} - Job successful. {Description}", GetType().Name, job.Description());

            WorkerResult workerResult = new(targetClient.GetServerHostname(), true, $"Successfully copied well: {job.Source.WellUid} -> {job.Target.WellUid}", sourceServerUrl: sourceClient.GetServerHostname());

            RefreshWell refreshAction = new(targetClient.GetServerHostname(), job.Target.WellUid, RefreshType.Add);

            return (workerResult, refreshAction);
        }
    }
}
