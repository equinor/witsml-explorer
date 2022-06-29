using System;
using System.Collections.Generic;
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
            var (tubulars, targetWellbore) = await FetchData(job);
            var queries = TubularQueries.CopyWitsmlTubulars(tubulars, targetWellbore);

            bool error = false;
            var successUids = new List<string>();
            var errorReasons = new List<string>();
            var errorEnitities = new List<EntityDescription>();
            var results = await Task.WhenAll(queries.Select(async (query) =>
            {
                var result = await witsmlClient.AddToStoreAsync(query);
                var tubular = query.Tubulars.First();
                if (result.IsSuccessful)
                {
                    Log.Information("{JobType} - Job successful", GetType().Name);
                    successUids.Add(tubular.Uid);
                }
                else
                {
                    var errorMessage = "Failed to copy tubular.";
                    Log.Error(
                    "{ErrorMessage} Source: UidWell: {SourceWellUid}, UidWellbore: {SourceWellboreUid}, TubularUid: {SourceTubularUid}. " +
                    "Target: UidWell: {TargetWellUid}, UidWellbore: {TargetWellboreUid}",
                    errorMessage,
                    job.Source.WellUid, job.Source.WellboreUid, tubular.Uid,
                    job.Target.WellUid, job.Target.WellboreUid);
                    error = true;
                    errorReasons.Add(result.Reason);
                    errorEnitities.Add(new EntityDescription
                    {
                        WellName = tubular.NameWell,
                        WellboreName = tubular.NameWellbore,
                        ObjectName = tubular.Name
                    });
                }
                return result;
            }));

            var refreshAction = new RefreshWellbore(witsmlClient.GetServerHostname(), targetWellbore.UidWell, targetWellbore.Uid, RefreshType.Update);
            var successString = successUids.Count > 0 ? $"Copied tubulars: {string.Join(", ", successUids)}." : "";
            if (!error)
            {
                return (new WorkerResult(witsmlClient.GetServerHostname(), true, successString), refreshAction);
            }

            return (new WorkerResult(witsmlClient.GetServerHostname(), false, $"{successString} Failed to copy some tubulars", errorReasons.First(), errorEnitities.First()), successUids.Count > 0 ? refreshAction : null);
        }

        private async Task<Tuple<WitsmlTubulars, WitsmlWellbore>> FetchData(CopyTubularJob job)
        {
            var tubularsQuery = GetTubulars(witsmlSourceClient, job.Source);
            var wellboreQuery = GetWellbore(witsmlClient, job.Target);
            await Task.WhenAll(tubularsQuery, wellboreQuery);
            var tubulars = tubularsQuery.Result;
            var targetWellbore = wellboreQuery.Result;
            return Tuple.Create(tubulars, targetWellbore);
        }

        private static async Task<WitsmlTubulars> GetTubulars(IWitsmlClient client, TubularReferences tubularReferences)
        {
            var witsmlTubular = TubularQueries.GetWitsmlTubularsById(tubularReferences.WellUid, tubularReferences.WellboreUid, tubularReferences.TubularUids);
            return await client.GetFromStoreAsync(witsmlTubular, new OptionsIn(ReturnElements.All));
        }

        private static async Task<WitsmlWellbore> GetWellbore(IWitsmlClient client, WellboreReference wellboreReference)
        {
            var witsmlWellbore = WellboreQueries.GetWitsmlWellboreByUid(wellboreReference.WellUid, wellboreReference.WellboreUid);
            var wellbores = await client.GetFromStoreAsync(witsmlWellbore, new OptionsIn(ReturnElements.Requested));
            return !wellbores.Wellbores.Any() ? null : wellbores.Wellbores.First();
        }
    }
}
