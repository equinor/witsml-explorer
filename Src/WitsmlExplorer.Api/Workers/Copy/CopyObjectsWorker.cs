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
    public class CopyObjectsWorker : BaseWorker<CopyObjectsJob>, IWorker
    {
        private readonly ICopyUtils _copyUtils;
        public JobType JobType => JobType.CopyObjects;

        public CopyObjectsWorker(ILogger<CopyObjectsJob> logger, IWitsmlClientProvider witsmlClientProvider, ICopyUtils copyUtils) : base(witsmlClientProvider, logger)
        {
            _copyUtils = copyUtils;
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(CopyObjectsJob job)
        {
            Witsml.IWitsmlClient client = GetTargetWitsmlClientOrThrow();
            IWitsmlObjectList witsmlObject = ObjectQueries.GetWitsmlObjectsByIds(job.Source.WellUid, job.Source.WellboreUid, job.Source.ObjectUids, job.Source.ObjectType);
            Task<IWitsmlObjectList> objectsQuery = GetTargetWitsmlClientOrThrow().GetFromStoreNullableAsync(witsmlObject, new OptionsIn(ReturnElements.All));
            Task<WitsmlWellbore> wellboreQuery = WorkerTools.GetWellbore(GetTargetWitsmlClientOrThrow(), job.Target);
            await Task.WhenAll(objectsQuery, wellboreQuery);
            IWitsmlObjectList objectList = objectsQuery.Result;
            WitsmlWellbore targetWellbore = wellboreQuery.Result;

            if (objectList == null)
            {
                return (new WorkerResult(client.GetServerHostname(), false, "Failed to deserialize response from Witsml server when fetching objects to copy"), null);
            }

            IEnumerable<WitsmlObjectOnWellbore> queries = ObjectQueries.CopyObjectsQuery(objectList.Objects, targetWellbore);
            RefreshObjects refreshAction = new(client.GetServerHostname(), job.Target.WellUid, job.Target.WellboreUid, job.Source.ObjectType);
            return await _copyUtils.CopyObjectsOnWellbore(client, queries, refreshAction, job.Source.WellUid, job.Source.WellboreUid);
        }
    }
}
