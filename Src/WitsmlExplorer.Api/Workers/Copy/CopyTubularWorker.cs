using System;
using System.Collections.Generic;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.Data;
using Witsml.Data.Tubular;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers.Copy
{
    public class CopyTubularWorker : BaseWorker<CopyTubularJob>, IWorker
    {

        private readonly ICopyUtils _copyUtils;
        public JobType JobType => JobType.CopyTubular;

        public CopyTubularWorker(ILogger<CopyTubularJob> logger, IWitsmlClientProvider witsmlClientProvider, ICopyUtils copyUtils) : base(witsmlClientProvider, logger)
        {
            _copyUtils = copyUtils;
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(CopyTubularJob job)
        {
            (WitsmlTubulars tubulars, WitsmlWellbore targetWellbore) = await FetchData(job);
            IEnumerable<WitsmlTubular> queries = TubularQueries.CopyWitsmlTubulars(tubulars, targetWellbore);
            RefreshObjects refreshAction = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), job.Target.WellUid, job.Target.WellboreUid, EntityType.Tubular);
            return await _copyUtils.CopyObjectsOnWellbore(GetTargetWitsmlClientOrThrow(), queries, refreshAction, job.Source.WellUid, job.Source.WellboreUid);
        }

        private async Task<Tuple<WitsmlTubulars, WitsmlWellbore>> FetchData(CopyTubularJob job)
        {
            Task<WitsmlTubulars> tubularsQuery = GetTubulars(GetSourceWitsmlClientOrThrow(), job.Source);
            Task<WitsmlWellbore> wellboreQuery = WorkerTools.GetWellbore(GetTargetWitsmlClientOrThrow(), job.Target);
            await Task.WhenAll(tubularsQuery, wellboreQuery);
            WitsmlTubulars tubulars = tubularsQuery.Result;
            WitsmlWellbore targetWellbore = wellboreQuery.Result;
            return Tuple.Create(tubulars, targetWellbore);
        }

        private static async Task<WitsmlTubulars> GetTubulars(IWitsmlClient client, ObjectReferences tubularReferences)
        {
            WitsmlTubulars witsmlTubular = TubularQueries.GetWitsmlTubularsById(tubularReferences.WellUid, tubularReferences.WellboreUid, tubularReferences.ObjectUids);
            return await client.GetFromStoreAsync(witsmlTubular, new OptionsIn(ReturnElements.All));
        }
    }
}
