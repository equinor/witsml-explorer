using System;
using System.Collections.Generic;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.Data;
using Witsml.Data.MudLog;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers.Copy
{
    public class CopyMudLogWorker : BaseWorker<CopyMudLogJob>, IWorker
    {

        private readonly ICopyUtils _copyUtils;
        public JobType JobType => JobType.CopyMudLog;

        public CopyMudLogWorker(ILogger<CopyMudLogJob> logger, IWitsmlClientProvider witsmlClientProvider, ICopyUtils copyUtils) : base(witsmlClientProvider, logger)
        {
            _copyUtils = copyUtils;
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(CopyMudLogJob job)
        {
            (WitsmlMudLogs mudlogs, WitsmlWellbore targetWellbore) = await FetchData(job);
            IEnumerable<WitsmlMudLog> queries = MudLogQueries.CopyWitsmlMudLogs(mudlogs, targetWellbore);
            RefreshMudLogs refreshAction = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), job.Target.WellUid, job.Target.WellboreUid, RefreshType.Update);
            return await _copyUtils.CopyObjectsOnWellbore(GetTargetWitsmlClientOrThrow(), queries, refreshAction, job.Source.WellUid, job.Source.WellboreUid);
        }

        private async Task<Tuple<WitsmlMudLogs, WitsmlWellbore>> FetchData(CopyMudLogJob job)
        {
            Task<WitsmlMudLogs> mudlogsQuery = GetMudLogs(GetSourceWitsmlClientOrThrow(), job.Source);
            Task<WitsmlWellbore> wellboreQuery = WorkerTools.GetWellbore(GetTargetWitsmlClientOrThrow(), job.Target);
            await Task.WhenAll(mudlogsQuery, wellboreQuery);
            WitsmlMudLogs mudlogs = mudlogsQuery.Result;
            WitsmlWellbore targetWellbore = wellboreQuery.Result;
            return Tuple.Create(mudlogs, targetWellbore);
        }

        private static async Task<WitsmlMudLogs> GetMudLogs(IWitsmlClient client, ObjectReferences mudlogReferences)
        {
            WitsmlMudLogs witsmlMudLog = MudLogQueries.QueryById(mudlogReferences.WellUid, mudlogReferences.WellboreUid, mudlogReferences.ObjectUids);
            return await client.GetFromStoreAsync(witsmlMudLog, new OptionsIn(ReturnElements.All));
        }
    }
}
