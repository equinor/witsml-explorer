using System.Collections.Generic;
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
        Task<(WorkerResult, RefreshAction)> Execute(CopyObjectsJob job);
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

        public override async Task<(WorkerResult, RefreshAction)> Execute(CopyObjectsJob job)
        {
            if (job.Source.ObjectType == EntityType.Log)
            {
                return await _copyLogWorker.Execute(job);
            }
            return await GenericCopy(job);
        }

        private async Task<(WorkerResult, RefreshAction)> GenericCopy(CopyObjectsJob job)
        {
            Witsml.IWitsmlClient client = GetTargetWitsmlClientOrThrow();
            IWitsmlObjectList fetchObjectsQuery = ObjectQueries.GetWitsmlObjectsByIds(job.Source.WellUid, job.Source.WellboreUid, job.Source.ObjectUids, job.Source.ObjectType);
            Task<IWitsmlObjectList> fetchObjectsTask = GetSourceWitsmlClientOrThrow().GetFromStoreNullableAsync(fetchObjectsQuery, new OptionsIn(ReturnElements.All));
            Task<WitsmlWellbore> wellboreQuery = WorkerTools.GetWellbore(client, job.Target, retry: true);
            await Task.WhenAll(fetchObjectsTask, wellboreQuery);
            IWitsmlObjectList objectsToCopy = fetchObjectsTask.Result;
            WitsmlWellbore targetWellbore = wellboreQuery.Result;

            if (objectsToCopy == null)
            {
                return (new WorkerResult(client.GetServerHostname(), false, "Failed to deserialize response from Witsml server when fetching objects to copy"), null);
            }

            IEnumerable<WitsmlObjectOnWellbore> queries = ObjectQueries.CopyObjectsQuery(objectsToCopy.Objects, targetWellbore);
            RefreshObjects refreshAction = new(client.GetServerHostname(), job.Target.WellUid, job.Target.WellboreUid, job.Source.ObjectType);
            return await _copyUtils.CopyObjectsOnWellbore(client, queries, refreshAction, job.Source.WellUid, job.Source.WellboreUid);
        }
    }
}
