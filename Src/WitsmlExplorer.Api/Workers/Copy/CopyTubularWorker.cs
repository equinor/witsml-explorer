using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.Data;
using Witsml.Data.Tubular;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers.Copy
{
    public class CopyTubularWorker : BaseWorker<CopyTubularJob>, IWorker
    {
        private readonly IWitsmlClient _witsmlClient;
        private readonly IWitsmlClient _witsmlSourceClient;
        public JobType JobType => JobType.CopyTubular;

        public CopyTubularWorker(ILogger<CopyTubularJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(logger)
        {
            _witsmlClient = witsmlClientProvider.GetClient();
            _witsmlSourceClient = witsmlClientProvider.GetSourceClient() ?? _witsmlClient;
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(CopyTubularJob job)
        {
            (WitsmlTubulars tubulars, WitsmlWellbore targetWellbore) = await FetchData(job);
            IEnumerable<WitsmlTubulars> queries = TubularQueries.CopyWitsmlTubulars(tubulars, targetWellbore);

            bool error = false;
            List<string> successUids = new();
            List<string> errorReasons = new();
            List<EntityDescription> errorEnitities = new();
            QueryResult[] results = await Task.WhenAll(queries.Select(async (query) =>
            {
                QueryResult result = await _witsmlClient.AddToStoreAsync(query);
                WitsmlTubular tubular = query.Tubulars.First();
                if (result.IsSuccessful)
                {
                    Logger.LogInformation(
                    "Copied tubular successfully, Source: UidWell: {SourceWellUid}, UidWellbore: {SourceWellboreUid}, TubularUid: {SourceTubularUid}. " +
                    "Target: UidWell: {TargetWellUid}, UidWellbore: {TargetWellboreUid}",
                    job.Source.WellUid, job.Source.WellboreUid, tubular.Uid,
                    job.Target.WellUid, job.Target.WellboreUid);
                    successUids.Add(tubular.Uid);
                }
                else
                {
                    Logger.LogError(
                    "Failed to copy tubular, Source: UidWell: {SourceWellUid}, UidWellbore: {SourceWellboreUid}, TubularUid: {SourceTubularUid}. " +
                    "Target: UidWell: {TargetWellUid}, UidWellbore: {TargetWellboreUid}",
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

            RefreshWellbore refreshAction = new(_witsmlClient.GetServerHostname(), targetWellbore.UidWell, targetWellbore.Uid, RefreshType.Update);
            string successString = successUids.Count > 0 ? $"Copied tubulars: {string.Join(", ", successUids)}." : "";
            return !error
                ? ((WorkerResult, RefreshAction))(new WorkerResult(_witsmlClient.GetServerHostname(), true, successString), refreshAction)
                : (new WorkerResult(_witsmlClient.GetServerHostname(), false, $"{successString} Failed to copy some tubulars", errorReasons.First(), errorEnitities.First()), successUids.Count > 0 ? refreshAction : null);
        }

        private async Task<Tuple<WitsmlTubulars, WitsmlWellbore>> FetchData(CopyTubularJob job)
        {
            Task<WitsmlTubulars> tubularsQuery = GetTubulars(_witsmlSourceClient, job.Source);
            Task<WitsmlWellbore> wellboreQuery = GetWellbore(_witsmlClient, job.Target);
            await Task.WhenAll(tubularsQuery, wellboreQuery);
            WitsmlTubulars tubulars = tubularsQuery.Result;
            WitsmlWellbore targetWellbore = wellboreQuery.Result;
            return Tuple.Create(tubulars, targetWellbore);
        }

        private static async Task<WitsmlTubulars> GetTubulars(IWitsmlClient client, TubularReferences tubularReferences)
        {
            WitsmlTubulars witsmlTubular = TubularQueries.GetWitsmlTubularsById(tubularReferences.WellUid, tubularReferences.WellboreUid, tubularReferences.TubularUids);
            return await client.GetFromStoreAsync(witsmlTubular, new OptionsIn(ReturnElements.All));
        }

        private static async Task<WitsmlWellbore> GetWellbore(IWitsmlClient client, WellboreReference wellboreReference)
        {
            WitsmlWellbores witsmlWellbore = WellboreQueries.GetWitsmlWellboreByUid(wellboreReference.WellUid, wellboreReference.WellboreUid);
            WitsmlWellbores wellbores = await client.GetFromStoreAsync(witsmlWellbore, new OptionsIn(ReturnElements.Requested));
            return !wellbores.Wellbores.Any() ? null : wellbores.Wellbores.First();
        }
    }
}
