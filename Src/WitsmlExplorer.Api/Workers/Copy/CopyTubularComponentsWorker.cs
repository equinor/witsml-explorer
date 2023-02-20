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

        public JobType JobType => JobType.CopyTubularComponents;

        public CopyTubularComponentsWorker(ILogger<CopyTubularComponentsJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider, logger) { }

        public override async Task<(WorkerResult, RefreshAction)> Execute(CopyTubularComponentsJob job)
        {
            (WitsmlTubular targetTubular, IEnumerable<WitsmlTubularComponent> componentsToCopy) = await FetchData(job);
            if (componentsToCopy.Count() != job.Source.ComponentUids.Length)
            {
                string errorMessage = "Failed to copy tubular components.";
                string missingUids = string.Join(", ", componentsToCopy.Select((ts) => ts.Uid).Where((uid) => !job.Source.ComponentUids.Contains(uid)));
                string reason = $"Could not retrieve all tubular components, missing uids: {missingUids}.";
                Logger.LogError("{errorMessage} {reason} - {description}", errorMessage, reason, job.Description());
                return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, errorMessage, reason), null);
            }
            WitsmlTubulars updatedTubularQuery = TubularQueries.CopyTubularComponents(targetTubular, componentsToCopy);
            QueryResult copyResult = await GetTargetWitsmlClientOrThrow().UpdateInStoreAsync(updatedTubularQuery);
            string tubularComponentsString = string.Join(", ", job.Source.ComponentUids);
            if (!copyResult.IsSuccessful)
            {
                string errorMessage = "Failed to copy tubular components.";
                Logger.LogError("{errorMessage} - {job.Description()}", errorMessage, job.Description());
                return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, errorMessage, copyResult.Reason), null);
            }

            Logger.LogInformation("{JobType} - Job successful. {Description}", GetType().Name, job.Description());
            RefreshObjects refreshAction = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), job.Target.WellUid, job.Target.WellboreUid, job.Target.Uid, EntityType.Tubular);
            WorkerResult workerResult = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, $"TubularComponents {tubularComponentsString} copied to: {targetTubular.Name}");

            return (workerResult, refreshAction);
        }

        private async Task<Tuple<WitsmlTubular, IEnumerable<WitsmlTubularComponent>>> FetchData(CopyTubularComponentsJob job)
        {
            Task<WitsmlTubular> targetTubularQuery = GetTubular(GetTargetWitsmlClientOrThrow(), job.Target);
            Task<IEnumerable<WitsmlTubularComponent>> sourceTubularComponentsQuery = GetTubularComponents(GetSourceWitsmlClientOrThrow(), job.Source.Parent, job.Source.ComponentUids);
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
