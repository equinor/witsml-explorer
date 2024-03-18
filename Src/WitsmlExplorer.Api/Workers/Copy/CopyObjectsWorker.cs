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
                return await _copyLogWorker.Execute(job);
            }
            return await GenericCopy(job);
        }

        private async Task<(WorkerResult, RefreshAction)> GenericCopy(CopyObjectsJob job)
        {
            Witsml.IWitsmlClient targetClient = GetTargetWitsmlClientOrThrow();
            IWitsmlObjectList fetchObjectsQuery = ObjectQueries.GetWitsmlObjectsByIds(job.Source.WellUid, job.Source.WellboreUid, job.Source.ObjectUids, job.Source.ObjectType);
            Task<IWitsmlObjectList> fetchObjectsTask = GetSourceWitsmlClientOrThrow().GetFromStoreNullableAsync(fetchObjectsQuery, new OptionsIn(ReturnElements.All));
            Task<WitsmlWellbore> fetchWellboreTask = WorkerTools.GetWellbore(targetClient, job.Target, retry: true);
            await Task.WhenAll(fetchObjectsTask, fetchWellboreTask);
            IWitsmlObjectList objectsToCopy = fetchObjectsTask.Result;
            WitsmlWellbore targetWellbore = fetchWellboreTask.Result;

            if (objectsToCopy == null)
            {
                return (new WorkerResult(targetClient.GetServerHostname(), false, "Failed to deserialize response from Witsml server when fetching objects to copy"), null);
            }
            if (!objectsToCopy.Objects.Any())
            {
                return (new WorkerResult(targetClient.GetServerHostname(), false, "Could not find any objects to copy"), null);
            }

            ICollection<WitsmlObjectOnWellbore> queries = ObjectQueries.CopyObjectsQuery(objectsToCopy.Objects, targetWellbore);
            RefreshObjects refreshAction = new(targetClient.GetServerHostname(), job.Target.WellUid, job.Target.WellboreUid, job.Source.ObjectType);
            return await _copyUtils.CopyObjectsOnWellbore(targetClient, queries, refreshAction, job.Source.WellUid, job.Source.WellboreUid);
        }
    }
}
