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
    public class CopyRiskWorker : BaseWorker<CopyRiskJob>, IWorker
    {
        private readonly ICopyUtils _copyUtils;
        public JobType JobType => JobType.CopyRisk;

        public CopyRiskWorker(ILogger<CopyRiskJob> logger, IWitsmlClientProvider witsmlClientProvider, ICopyUtils copyUtils) : base(witsmlClientProvider, logger)
        {
            _copyUtils = copyUtils;
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(CopyRiskJob job)
        {
            (WitsmlRisks risks, WitsmlWellbore targetWellbore) = await FetchData(job);
            IEnumerable<WitsmlRisk> queries = RiskQueries.CopyWitsmlRisks(risks, targetWellbore);
            RefreshObjects refreshAction = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), job.Target.WellUid, job.Target.WellboreUid, EntityType.Risks);
            return await _copyUtils.CopyObjectsOnWellbore(GetTargetWitsmlClientOrThrow(), queries, refreshAction, job.Source.WellUid, job.Source.WellboreUid);
        }

        private async Task<Tuple<WitsmlRisks, WitsmlWellbore>> FetchData(CopyRiskJob job)
        {
            Task<WitsmlRisks> risksQuery = GetRisks(GetSourceWitsmlClientOrThrow(), job.Source);
            Task<WitsmlWellbore> wellboreQuery = WorkerTools.GetWellbore(GetTargetWitsmlClientOrThrow(), job.Target);
            await Task.WhenAll(risksQuery, wellboreQuery);
            WitsmlRisks risks = risksQuery.Result;
            WitsmlWellbore targetWellbore = wellboreQuery.Result;
            return Tuple.Create(risks, targetWellbore);
        }

        private static async Task<WitsmlRisks> GetRisks(IWitsmlClient client, ObjectReferences riskReferences)
        {
            WitsmlRisks witsmlRisk = RiskQueries.QueryByIds(riskReferences.WellUid, riskReferences.WellboreUid, riskReferences.ObjectUids);
            return await client.GetFromStoreAsync(witsmlRisk, new OptionsIn(ReturnElements.All));
        }
    }
}
