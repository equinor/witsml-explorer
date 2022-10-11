using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.Data.Tubular;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers.Copy
{
    public class CopyTubularComponentsWorker : BaseWorker<CopyTubularComponentsJob>, IWorker
    {
        private readonly IWitsmlClient _witsmlClient;
        private readonly IWitsmlClient _witsmlSourceClient;
        public JobType JobType => JobType.CopyTubularComponents;

        public CopyTubularComponentsWorker(ILogger<CopyTubularComponentsJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(logger)
        {
            _witsmlClient = witsmlClientProvider.GetClient();
            _witsmlSourceClient = witsmlClientProvider.GetSourceClient() ?? throw new WitsmlClientProviderException("Missing WitsmlSource in CopyJob", 500);
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(CopyTubularComponentsJob job)
        {
            (WitsmlTubular targetTubular, IEnumerable<WitsmlTubularComponent> componentsToCopy) = await FetchData(job);
            if (componentsToCopy.Count() != job.Source.TubularComponentUids.Count())
            {
                string errorMessage = "Failed to copy tubular components.";
                string missingUids = string.Join(", ", componentsToCopy.Select((ts) => ts.Uid).Where((uid) => !job.Source.TubularComponentUids.Contains(uid)));
                string reason = $"Could not retrieve all tubular components, missing uids: {missingUids}.";
                Logger.LogError("{errorMessage} {reason} - {description}", errorMessage, reason, job.Description());
                return (new WorkerResult(_witsmlClient.GetServerHostname(), false, errorMessage, reason), null);
            }
            WitsmlTubulars updatedTubularQuery = TubularQueries.CopyTubularComponents(targetTubular, componentsToCopy);
            QueryResult copyResult = await _witsmlClient.UpdateInStoreAsync(updatedTubularQuery);
            string tubularComponentsString = string.Join(", ", job.Source.TubularComponentUids);
            if (!copyResult.IsSuccessful)
            {
                string errorMessage = "Failed to copy tubular components.";
                Logger.LogError("{errorMessage} - {job.Description()}", errorMessage, job.Description());
                return (new WorkerResult(_witsmlClient.GetServerHostname(), false, errorMessage, copyResult.Reason), null);
            }

            Logger.LogInformation("{JobType} - Job successful. {Description}", GetType().Name, job.Description());
            RefreshTubulars refreshAction = new(_witsmlClient.GetServerHostname(), job.Target.WellUid, job.Target.WellboreUid, RefreshType.Update);
            WorkerResult workerResult = new(_witsmlClient.GetServerHostname(), true, $"TubularComponents {tubularComponentsString} copied to: {targetTubular.Name}");

            return (workerResult, refreshAction);
        }

        private async Task<Tuple<WitsmlTubular, IEnumerable<WitsmlTubularComponent>>> FetchData(CopyTubularComponentsJob job)
        {
            Task<WitsmlTubular> targetTubularQuery = GetTubular(_witsmlClient, job.Target);
            Task<IEnumerable<WitsmlTubularComponent>> sourceTubularComponentsQuery = GetTubularComponents(_witsmlSourceClient, job.Source.TubularReference, job.Source.TubularComponentUids);
            await Task.WhenAll(targetTubularQuery, sourceTubularComponentsQuery);
            WitsmlTubular targetTubular = targetTubularQuery.Result;
            IEnumerable<WitsmlTubularComponent> sourceTubularComponents = sourceTubularComponentsQuery.Result;
            return Tuple.Create(targetTubular, sourceTubularComponents);
        }

        private static async Task<WitsmlTubular> GetTubular(IWitsmlClient client, ObjectReference tubularReference)
        {
            WitsmlTubulars witsmlTubular = TubularQueries.GetWitsmlTubular(tubularReference.WellUid, tubularReference.WellboreUid, tubularReference.Uid);
            WitsmlTubulars result = await client.GetFromStoreAsync(witsmlTubular, new OptionsIn(ReturnElements.All));
            return !result.Tubulars.Any() ? null : result.Tubulars.First();
        }

        private static async Task<IEnumerable<WitsmlTubularComponent>> GetTubularComponents(IWitsmlClient client, ObjectReference tubularReference, IEnumerable<string> tubularComponentsUids)
        {
            WitsmlTubular witsmlTubular = await GetTubular(client, tubularReference);
            return witsmlTubular?.TubularComponents.FindAll((WitsmlTubularComponent tc) => tubularComponentsUids.Contains(tc.Uid));
        }
    }
}
