using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml.Data;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers.Copy
{
    public interface ICopyWellboreWorker
    {
        Task<(WorkerResult, RefreshAction)> Execute(CopyWellboreJob job, CancellationToken? cancellationToken = null);
    }

    public class CopyWellboreWorker : BaseWorker<CopyWellboreJob>, IWorker, ICopyWellboreWorker
    {
        public CopyWellboreWorker(ILogger<CopyWellboreJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider, logger)
        {
        }

        public JobType JobType => JobType.CopyWellbore;

        public override async Task<(WorkerResult, RefreshAction)> Execute(CopyWellboreJob job, CancellationToken? cancellationToken = null)
        {
            Witsml.IWitsmlClient sourceClient = GetSourceWitsmlClientOrThrow();
            Witsml.IWitsmlClient targetClient = GetTargetWitsmlClientOrThrow();

            WitsmlWellbore existingWellbore = await WorkerTools.GetWellbore(targetClient, job.Target, Witsml.ServiceReference.ReturnElements.Requested);

            if (existingWellbore != null)
            {
                string message = "Target wellbore already exists";
                Logger.LogWarning("{WarningMessage} - {JobDescription}", message, job.Description());
                return (new WorkerResult(targetClient.GetServerHostname(), true, message, sourceServerUrl: sourceClient.GetServerHostname()), null);
            }

            WitsmlWellbore sourceWellbore = await WorkerTools.GetWellbore(sourceClient, job.Source, Witsml.ServiceReference.ReturnElements.All);

            string errorMessage = "Failed to copy wellbore.";

            if (sourceWellbore == null)
            {
                Logger.LogError("{ErrorMessage} - {JobDescription}", errorMessage, job.Description());
                return (new WorkerResult(targetClient.GetServerHostname(), false, errorMessage, sourceServerUrl: sourceClient.GetServerHostname()), null);
            }

            if (cancellationToken is { IsCancellationRequested: true })
            {
                return (new WorkerResult(targetClient.GetServerHostname(), false, CancellationMessage(), CancellationReason(), sourceServerUrl: sourceClient.GetServerHostname()), null);
            }

            // May be the same UID and name or a different one
            sourceWellbore.Uid = job.Target.WellboreUid;
            sourceWellbore.Name = job.Target.WellboreName;
            sourceWellbore.UidWell = job.Target.WellUid;
            sourceWellbore.NameWell = job.Target.WellName;

            WitsmlWellbores wellbores = new() { Wellbores = { sourceWellbore } };

            Witsml.QueryResult result = await targetClient.AddToStoreAsync(wellbores);

            if (!result.IsSuccessful)
            {
                Logger.LogError("{ErrorMessage} {Reason} - {JobDescription}", errorMessage, result.Reason, job.Description());
                return (new WorkerResult(targetClient.GetServerHostname(), false, errorMessage, result.Reason, sourceServerUrl: sourceClient.GetServerHostname()), null);
            }

            Logger.LogInformation("{JobType} - Job successful. {Description}", GetType().Name, job.Description());

            WorkerResult workerResult = new(targetClient.GetServerHostname(), true, $"Successfully copied wellbore: {job.Source.WellboreUid} -> {job.Target.WellboreUid}", sourceServerUrl: sourceClient.GetServerHostname());

            RefreshWellbore refreshAction = new(targetClient.GetServerHostname(), job.Target.WellUid, job.Target.WellboreUid, RefreshType.Add);

            return (workerResult, refreshAction);
        }
    }
}
