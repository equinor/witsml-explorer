using System;
using System.Collections.Generic;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.Data;
using Witsml.Data.Rig;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers.Copy
{
    public class CopyRigWorker : BaseWorker<CopyRigJob>, IWorker
    {

        private readonly ICopyUtils _copyUtils;
        public JobType JobType => JobType.CopyRig;

        public CopyRigWorker(ILogger<CopyRigJob> logger, IWitsmlClientProvider witsmlClientProvider, ICopyUtils copyUtils) : base(witsmlClientProvider, logger)
        {
            _copyUtils = copyUtils;
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(CopyRigJob job)
        {
            (WitsmlRigs rigs, WitsmlWellbore targetWellbore) = await FetchData(job);
            IEnumerable<WitsmlRig> queries = RigQueries.CopyWitsmlRigs(rigs, targetWellbore);
            RefreshObjects refreshAction = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), job.Target.WellUid, job.Target.WellboreUid, EntityType.Rig);
            return await _copyUtils.CopyObjectsOnWellbore(GetTargetWitsmlClientOrThrow(), queries, refreshAction, job.Source.WellUid, job.Source.WellboreUid);
        }

        private async Task<Tuple<WitsmlRigs, WitsmlWellbore>> FetchData(CopyRigJob job)
        {
            Task<WitsmlRigs> rigsQuery = GetRigs(GetSourceWitsmlClientOrThrow(), job.Source);
            Task<WitsmlWellbore> wellboreQuery = WorkerTools.GetWellbore(GetTargetWitsmlClientOrThrow(), job.Target);
            await Task.WhenAll(rigsQuery, wellboreQuery);
            WitsmlRigs rigs = rigsQuery.Result;
            WitsmlWellbore targetWellbore = wellboreQuery.Result;
            return Tuple.Create(rigs, targetWellbore);
        }

        private static async Task<WitsmlRigs> GetRigs(IWitsmlClient client, ObjectReferences rigReferences)
        {
            WitsmlRigs witsmlRig = RigQueries.QueryByIds(rigReferences.WellUid, rigReferences.WellboreUid, rigReferences.ObjectUids);
            return await client.GetFromStoreAsync(witsmlRig, new OptionsIn(ReturnElements.All));
        }
    }
}
