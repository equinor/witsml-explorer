using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Serilog;
using Witsml;
using Witsml.Data.Tubular;
using Witsml.ServiceReference;
using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers
{
    public class CopyTubularComponentsWorker : BaseWorker<CopyTubularComponentsJob>, IWorker
    {
        private readonly IWitsmlClient witsmlClient;
        private readonly IWitsmlClient witsmlSourceClient;
        public JobType JobType => JobType.CopyTubularComponents;

        public CopyTubularComponentsWorker(IWitsmlClientProvider witsmlClientProvider)
        {
            witsmlClient = witsmlClientProvider.GetClient();
            witsmlSourceClient = witsmlClientProvider.GetSourceClient() ?? witsmlClient;
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(CopyTubularComponentsJob job)
        {
            var (targetTubular, componentsToCopy) = await FetchData(job);
            var updatedTubularQuery = TubularQueries.CopyTubularComponents(targetTubular, componentsToCopy);
            var copyResult = await witsmlClient.UpdateInStoreAsync(updatedTubularQuery);
            var tubularComponentsString = string.Join(", ", job.Source.TubularComponentUids);
            if (!copyResult.IsSuccessful)
            {
                WorkerTools.LogError(GetType().Name, job.Source.TubularReference.WellUid, job.Source.TubularReference.WellboreUid, "tubular", job.Source.TubularReference.TubularUid, "tubularComponent", job.Source.TubularComponentUids, job.Target.WellUid, job.Target.WellboreUid);
                var errorMessage = "Failed to copy tubular components.";
                return (new WorkerResult(witsmlClient.GetServerHostname(), false, errorMessage, copyResult.Reason), null);
            }

            WorkerTools.LogSuccess(GetType().Name, job.Source.TubularReference.WellUid, job.Source.TubularReference.WellboreUid, "tubular", job.Source.TubularReference.TubularUid, "tubularComponent", job.Source.TubularComponentUids, job.Target.WellUid, job.Target.WellboreUid);
            var refreshAction = new RefreshTubular(witsmlClient.GetServerHostname(), job.Target.WellUid, job.Target.WellboreUid, job.Target.TubularUid, RefreshType.Update);
            var workerResult = new WorkerResult(witsmlClient.GetServerHostname(), true, $"TubularComponents {tubularComponentsString} copied to: {targetTubular.Name}");

            return (workerResult, refreshAction);
        }

        private async Task<Tuple<WitsmlTubular, IEnumerable<WitsmlTubularComponent>>> FetchData(CopyTubularComponentsJob job)
        {
            var targetTubularQuery = GetTubular(witsmlClient, job.Target);
            var sourceTubularComponentsQuery = GetTubularComponents(witsmlSourceClient, job.Source.TubularReference, job.Source.TubularComponentUids);
            await Task.WhenAll(targetTubularQuery, sourceTubularComponentsQuery);
            var targetTubular = targetTubularQuery.Result;
            var sourceTubularComponents = sourceTubularComponentsQuery.Result;
            return Tuple.Create(targetTubular, sourceTubularComponents);
        }

        private static async Task<WitsmlTubular> GetTubular(IWitsmlClient client, TubularReference tubularReference)
        {
            var witsmlTubular = TubularQueries.GetWitsmlTubularById(tubularReference.WellUid, tubularReference.WellboreUid, tubularReference.TubularUid);
            var result = await client.GetFromStoreAsync(witsmlTubular, new OptionsIn(ReturnElements.All));
            return !result.Tubulars.Any() ? null : result.Tubulars.First();
        }

        private static async Task<IEnumerable<WitsmlTubularComponent>> GetTubularComponents(IWitsmlClient client, TubularReference tubularReference, IEnumerable<string> tubularComponentsUids)
        {
            var witsmlTubular = await GetTubular(client, tubularReference);
            return witsmlTubular?.TubularComponents.FindAll((WitsmlTubularComponent tc) => tubularComponentsUids.Contains(tc.Uid));
        }
    }
}
