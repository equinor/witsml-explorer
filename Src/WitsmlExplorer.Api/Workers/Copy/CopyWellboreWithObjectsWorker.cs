using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml.Data;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers.Copy
{
    public interface ICopyWellboreWithObjectsWorker
    {
        Task<(WorkerResult, RefreshAction)> Execute(CopyWellboreWithObjectsJob job, CancellationToken? cancellationToken = null);
    }

    public class CopyWellboreWithObjectsWorker : BaseWorker<CopyWellboreWithObjectsJob>, IWorker, ICopyWellboreWithObjectsWorker
    {
        public CopyWellboreWithObjectsWorker(ILogger<CopyWellboreWithObjectsJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider, logger)
        {
        }

        public JobType JobType => JobType.CopyWellboreWithObjects;

        public override async Task<(WorkerResult, RefreshAction)> Execute(CopyWellboreWithObjectsJob job, CancellationToken? cancellationToken = null)
        {
            Witsml.IWitsmlClient sourceClient = GetSourceWitsmlClientOrThrow();
            Witsml.IWitsmlClient targetClient = GetTargetWitsmlClientOrThrow();
            WorkerResult workerResult = new(targetClient.GetServerHostname(), true, $"Successfully copied wellbore: {job.Source.WellboreUid} -> {job.Target.WellboreUid}", sourceServerUrl: sourceClient.GetServerHostname());

            RefreshWellbore refreshAction = new(targetClient.GetServerHostname(), job.Target.WellUid, job.Target.WellboreUid, RefreshType.Add);

            return (workerResult, refreshAction);
        }
    }
}
