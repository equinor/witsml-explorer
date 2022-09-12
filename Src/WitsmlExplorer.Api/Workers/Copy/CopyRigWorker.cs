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
        private readonly IWitsmlClient _witsmlClient;
        private readonly IWitsmlClient _witsmlSourceClient;
        private readonly ICopyUtils _copyUtils;
        public JobType JobType => JobType.CopyRig;

        public CopyRigWorker(ILogger<CopyRigJob> logger, IWitsmlClientProvider witsmlClientProvider, ICopyUtils copyUtils) : base(logger)
        {
            _witsmlClient = witsmlClientProvider.GetClient();
            _witsmlSourceClient = witsmlClientProvider.GetSourceClient() ?? _witsmlClient;
            _copyUtils = copyUtils;
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(CopyRigJob job)
        {
            (WitsmlRigs rigs, WitsmlWellbore targetWellbore) = await FetchData(job);
            IEnumerable<WitsmlRig> queries = RigQueries.CopyWitsmlRigs(rigs, targetWellbore);
            RefreshRigs refreshAction = new(_witsmlClient.GetServerHostname(), job.Target.WellUid, job.Target.WellboreUid, RefreshType.Update);
            return await _copyUtils.CopyObjectsOnWellbore(queries, refreshAction, job.Source.WellUid, job.Source.WellboreUid);
        }

        private async Task<Tuple<WitsmlRigs, WitsmlWellbore>> FetchData(CopyRigJob job)
        {
            Task<WitsmlRigs> rigsQuery = GetRigs(_witsmlSourceClient, job.Source);
            Task<WitsmlWellbore> wellboreQuery = WorkerTools.GetWellbore(_witsmlClient, job.Target);
            await Task.WhenAll(rigsQuery, wellboreQuery);
            WitsmlRigs rigs = rigsQuery.Result;
            WitsmlWellbore targetWellbore = wellboreQuery.Result;
            return Tuple.Create(rigs, targetWellbore);
        }

        private static async Task<WitsmlRigs> GetRigs(IWitsmlClient client, ObjectReferences objectReferences)
        {
            WitsmlRigs witsmlRig = RigQueries.QueryByIds(objectReferences.WellUid, objectReferences.WellboreUid, objectReferences.ObjectUids);
            return await client.GetFromStoreAsync(witsmlRig, new OptionsIn(ReturnElements.All));
        }
    }
}
