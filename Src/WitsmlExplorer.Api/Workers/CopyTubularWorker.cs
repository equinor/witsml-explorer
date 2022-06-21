using System;
using System.Linq;
using System.Threading.Tasks;
using Serilog;
using Witsml;
using Witsml.Data;
using Witsml.Data.Tubular;
using Witsml.ServiceReference;
using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers
{
    public class CopyTubularWorker : BaseWorker<CopyTubularJob>, IWorker
    {
        private readonly IWitsmlClient witsmlClient;
        private readonly IWitsmlClient witsmlSourceClient;
        public JobType JobType => JobType.CopyTubular;

        public CopyTubularWorker(IWitsmlClientProvider witsmlClientProvider)
        {
            witsmlClient = witsmlClientProvider.GetClient();
            witsmlSourceClient = witsmlClientProvider.GetSourceClient() ?? witsmlClient;
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(CopyTubularJob job)
        {
            var (tubular, targetWellbore) = await FetchData(job);
            var tubularToCopy = TubularQueries.CopyWitsmlTubular(tubular, targetWellbore);
            var copyLogResult = await witsmlClient.AddToStoreAsync(tubularToCopy);
            if (!copyLogResult.IsSuccessful)
            {
                var errorMessage = "Failed to copy tubular.";
                Log.Error(
                    "{ErrorMessage} Source: UidWell: {SourceWellUid}, UidWellbore: {SourceWellboreUid}, Uid: {SourceTubularUid}. " +
                    "Target: UidWell: {TargetWellUid}, UidWellbore: {TargetWellboreUid}",
                    errorMessage,
                    job.Source.WellUid, job.Source.WellboreUid, job.Source.TubularUid,
                    job.Target.WellUid, job.Target.WellboreUid);
                return (new WorkerResult(witsmlClient.GetServerHostname(), false, errorMessage, copyLogResult.Reason), null);
            }

            Log.Information("{JobType} - Job successful. Tubular copied", GetType().Name);
            var refreshAction = new RefreshWellbore(witsmlClient.GetServerHostname(), job.Target.WellUid, job.Target.WellboreUid, RefreshType.Update);
            var workerResult = new WorkerResult(witsmlClient.GetServerHostname(), true, $"Tubular {tubular.Name} copied to: {targetWellbore.Name}");

            return (workerResult, refreshAction);
        }

        private async Task<Tuple<WitsmlTubular, WitsmlWellbore>> FetchData(CopyTubularJob job)
        {
            var sourceTubularQuery = GetTubular(witsmlSourceClient, job.Source);
            var targetWellboreQuery = GetWellbore(witsmlClient, job.Target);
            await Task.WhenAll(sourceTubularQuery, targetWellboreQuery);
            var sourceTubular = sourceTubularQuery.Result;
            var targetWellbore = targetWellboreQuery.Result;
            return Tuple.Create(sourceTubular, targetWellbore);
        }

        private static async Task<WitsmlTubular> GetTubular(IWitsmlClient client, TubularReference tubularReference)
        {
            var witsmlTubular = TubularQueries.GetWitsmlTubularById(tubularReference.WellUid, tubularReference.WellboreUid, tubularReference.TubularUid);
            var result = await client.GetFromStoreAsync(witsmlTubular, new OptionsIn(ReturnElements.All));
            return !result.Tubulars.Any() ? null : result.Tubulars.First();
        }

        private static async Task<WitsmlWellbore> GetWellbore(IWitsmlClient client, WellboreReference wellboreReference)
        {
            var witsmlWellbore = WellboreQueries.GetWitsmlWellboreByUid(wellboreReference.WellUid, wellboreReference.WellboreUid);
            var wellbores = await client.GetFromStoreAsync(witsmlWellbore, new OptionsIn(ReturnElements.Requested));
            return !wellbores.Wellbores.Any() ? null : wellbores.Wellbores.First();
        }
    }
}
