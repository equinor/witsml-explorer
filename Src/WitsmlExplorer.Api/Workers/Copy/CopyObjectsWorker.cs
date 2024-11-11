using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml.Data;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers.Copy
{
    public interface ICopyObjectsWorker
    {
        Task<(WorkerResult, RefreshAction)> Execute(CopyObjectsJob job, CancellationToken? cancellationToken = null);
    }

    public class CopyObjectsWorker : BaseWorker<CopyObjectsJob>, IWorker, ICopyObjectsWorker
    {
        private readonly ICopyUtils _copyUtils;
        private readonly ICopyLogWorker _copyLogWorker;
        public JobType JobType => JobType.CopyObjects;

        public CopyObjectsWorker(ILogger<CopyObjectsJob> logger, IWitsmlClientProvider witsmlClientProvider, ICopyUtils copyUtils, ICopyLogWorker copyLogWorker) : base(witsmlClientProvider, logger)
        {
            _copyUtils = copyUtils;
            _copyLogWorker = copyLogWorker;
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(CopyObjectsJob job, CancellationToken? cancellationToken = null)
        {
            if (job.Source.ObjectType == EntityType.Log)
            {
                return await _copyLogWorker.Execute(job, cancellationToken);
            }
            return await GenericCopy(job, cancellationToken);
        }

        private async Task<(WorkerResult, RefreshAction)> GenericCopy(CopyObjectsJob job, CancellationToken? cancellationToken = null)
        {
            var duplicate = job.TargetObjectUid != null;
            Witsml.IWitsmlClient targetClient = GetTargetWitsmlClientOrThrow();
            Witsml.IWitsmlClient sourceClient = GetSourceWitsmlClientOrThrow();
            IWitsmlObjectList fetchObjectsQuery = ObjectQueries.GetWitsmlObjectsByIds(job.Source.WellUid, job.Source.WellboreUid, job.Source.ObjectUids, job.Source.ObjectType);
            Task<IWitsmlObjectList> fetchObjectsTask = sourceClient.GetFromStoreNullableAsync(fetchObjectsQuery, new OptionsIn(ReturnElements.All));
            Task<WitsmlWellbore> fetchWellboreTask = WorkerTools.GetWellbore(targetClient, job.Target, retry: true);
            await Task.WhenAll(fetchObjectsTask, fetchWellboreTask);
            IWitsmlObjectList objectsToCopy = fetchObjectsTask.Result;
            WitsmlWellbore targetWellbore = fetchWellboreTask.Result;

            if (objectsToCopy == null)
            {
                return (new WorkerResult(targetClient.GetServerHostname(), false, "Failed to deserialize response from Witsml server when fetching objects to copy", sourceServerUrl: sourceClient.GetServerHostname()), null);
            }
            if (!objectsToCopy.Objects.Any())
            {
                return (new WorkerResult(targetClient.GetServerHostname(), false, "Could not find any objects to copy", sourceServerUrl: sourceClient.GetServerHostname()), null);
            }
            if (cancellationToken is { IsCancellationRequested: true })
            {
                return (new WorkerResult(targetClient.GetServerHostname(), false, CancellationMessage(), CancellationReason(), sourceServerUrl: sourceClient.GetServerHostname()), null);
            }

            ICollection<WitsmlObjectOnWellbore> queries = ObjectQueries.CopyObjectsQuery(objectsToCopy.Objects, targetWellbore);
            if (duplicate)
            {
                queries.First().Uid = job.TargetObjectUid;
                queries.First().Name = job.TargetObjectName;
            }
            RefreshObjects refreshAction = new(targetClient.GetServerHostname(), job.Target.WellUid, job.Target.WellboreUid, job.Source.ObjectType);
            return await _copyUtils.CopyObjectsOnWellbore(targetClient, sourceClient, queries, refreshAction, job.Source.WellUid, job.Source.WellboreUid);
        }
    }
}
