using System;
using System.Collections.Generic;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.Data;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers.Copy
{
    public class CopyBhaRunWorker : BaseWorker<CopyBhaRunJob>, IWorker
    {
        private readonly IWitsmlClient _witsmlClient;
        private readonly IWitsmlClient _witsmlSourceClient;
        private readonly ICopyUtils _copyUtils;

        public JobType JobType => JobType.CopyBhaRun;

        public CopyBhaRunWorker(ILogger<CopyBhaRunJob> logger, IWitsmlClientProvider witsmlClientProvider, ICopyUtils copyUtils) : base(logger)
        {
            _witsmlClient = witsmlClientProvider.GetClient();
            _witsmlSourceClient = witsmlClientProvider.GetSourceClient() ?? _witsmlClient;
            _copyUtils = copyUtils;
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(CopyBhaRunJob job)
        {
            (WitsmlBhaRuns bhaRuns, WitsmlWellbore targetWellbore) = await FetchData(job);
            IEnumerable<WitsmlBhaRun> queries = BhaRunQueries.CopyWitsmlBhaRuns(bhaRuns, targetWellbore);
            RefreshBhaRuns refreshAction = new(_witsmlClient.GetServerHostname(), job.Target.WellUid, job.Target.WellboreUid, RefreshType.Update);
            return await _copyUtils.CopyObjectsOnWellbore(queries, refreshAction, job.Source.WellUid, job.Source.WellboreUid);
        }

        private async Task<Tuple<WitsmlBhaRuns, WitsmlWellbore>> FetchData(CopyBhaRunJob job)
        {
            Task<WitsmlBhaRuns> bhaRunsQuery = GetBhaRuns(_witsmlSourceClient, job.Source);
            Task<WitsmlWellbore> wellboreQuery = WorkerTools.GetWellbore(_witsmlClient, job.Target);
            await Task.WhenAll(bhaRunsQuery, wellboreQuery);
            WitsmlBhaRuns bhaRuns = bhaRunsQuery.Result;
            WitsmlWellbore targetWellbore = wellboreQuery.Result;
            return Tuple.Create(bhaRuns, targetWellbore);
        }

        private static async Task<WitsmlBhaRuns> GetBhaRuns(IWitsmlClient client, BhaRunReferences bhaRunReferences)
        {
            WitsmlBhaRuns witsmlBhaRun = BhaRunQueries.GetWitsmlBhaRunsById(bhaRunReferences.WellUid, bhaRunReferences.WellboreUid, bhaRunReferences.BhaRunUids);
            return await client.GetFromStoreAsync(witsmlBhaRun, new OptionsIn(ReturnElements.All));
        }
    }
}
