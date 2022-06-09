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
            var tubularcomponentToCopy = TubularQueries.CopyTubularComponents(targetTubular, componentsToCopy);
            var copyResult = await witsmlClient.UpdateInStoreAsync(tubularcomponentToCopy);
            var tubularComponentsString = string.Join(", ", job.Source.TubularComponentUids);
            if (!copyResult.IsSuccessful)
            {
                var errorMessage = "Failed to copy tubular components.";
                Log.Error(
                    "{ErrorMessage} Source: UidWell: {SourceWellUid}, UidWellbore: {SourceWellboreUid}, Uid: {SourceTubularUid}. " +
                    "Target: UidWell: {TargetWellUid}, UidWellbore: {TargetWellboreUid}, Uid: {TargetTubularUid} " +
                    "Tubular Component Uids: {tubularComponentsString}",
                    errorMessage,
                    job.Source.TubularReference.WellUid, job.Source.TubularReference.WellboreUid, job.Source.TubularReference.TubularUid,
                    job.Target.WellUid, job.Target.WellboreUid, job.Target.TubularUid, tubularComponentsString);
                return (new WorkerResult(witsmlClient.GetServerHostname(), false, errorMessage, copyResult.Reason), null);
            }

            Log.Information("{JobType} - Job successful. TubularComponents copied", GetType().Name);
            var refreshAction = new RefreshTubular(witsmlClient.GetServerHostname(), job.Target.WellUid, job.Target.WellboreUid, job.Target.TubularUid, RefreshType.Update);
            var workerResult = new WorkerResult(witsmlClient.GetServerHostname(), true, $"TubularComponents {tubularComponentsString} copied to: {targetTubular.Name}");

            return (workerResult, refreshAction);
        }

        private async Task<Tuple<WitsmlTubular, IEnumerable<WitsmlTubularComponent>>> FetchData(CopyTubularComponentsJob job)
        {
            var tubularQuery = GetTubular(witsmlSourceClient, job.Target);
            var tubularComponentsQuery = GetTubularComponents(witsmlClient, job.Source.TubularReference, job.Source.TubularComponentUids);
            await Task.WhenAll(tubularQuery, tubularComponentsQuery);
            var tubular = await tubularQuery;
            var tubularComponents = await tubularComponentsQuery;
            return Tuple.Create(tubular, tubularComponents);
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
