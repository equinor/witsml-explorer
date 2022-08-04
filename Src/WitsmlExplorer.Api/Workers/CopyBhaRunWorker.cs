using System;
using System.Collections.Generic;
using System.Linq;
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

namespace WitsmlExplorer.Api.Workers
{
    public class CopyBhaRunWorker : BaseWorker<CopyBhaRunJob>, IWorker
    {
        private readonly IWitsmlClient witsmlClient;
        private readonly IWitsmlClient witsmlSourceClient;
        public JobType JobType => JobType.CopyBhaRun;

        public CopyBhaRunWorker(ILogger<CopyBhaRunJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(logger)
        {
            witsmlClient = witsmlClientProvider.GetClient();
            witsmlSourceClient = witsmlClientProvider.GetSourceClient() ?? witsmlClient;
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(CopyBhaRunJob job)
        {
            var (bhaRuns, targetWellbore) = await FetchData(job);
            var queries = BhaRunQueries.CopyWitsmlBhaRuns(bhaRuns, targetWellbore);

            bool error = false;
            var successUids = new List<string>();
            var errorReasons = new List<string>();
            var errorEnitities = new List<EntityDescription>();
            var results = await Task.WhenAll(queries.Select(async (query) =>
            {
                var result = await witsmlClient.AddToStoreAsync(query);
                var bhaRun = query.BhaRuns.First();
                if (result.IsSuccessful)
                {
                    Logger.LogInformation(
                    "Copied bhaRun successfully, Source: UidWell: {SourceWellUid}, UidWellbore: {SourceWellboreUid}, BhaRunUid: {SourceBhaRunUid}. " +
                    "Target: UidWell: {TargetWellUid}, UidWellbore: {TargetWellboreUid}",
                    job.Source.WellUid, job.Source.WellboreUid, bhaRun.Uid,
                    job.Target.WellUid, job.Target.WellboreUid);
                    successUids.Add(bhaRun.Uid);
                }
                else
                {
                    Logger.LogError(
                    "Failed to copy bhaRun, Source: UidWell: {SourceWellUid}, UidWellbore: {SourceWellboreUid}, BhaRunUid: {SourceBhaRunUid}. " +
                    "Target: UidWell: {TargetWellUid}, UidWellbore: {TargetWellboreUid}",
                    job.Source.WellUid, job.Source.WellboreUid, bhaRun.Uid,
                    job.Target.WellUid, job.Target.WellboreUid);
                    error = true;
                    errorReasons.Add(result.Reason);
                    errorEnitities.Add(new EntityDescription
                    {
                        WellName = bhaRun.NameWell,
                        WellboreName = bhaRun.NameWellbore,
                        ObjectName = bhaRun.Name
                    });
                }
                return result;
            }));

            var refreshAction = new RefreshWellbore(witsmlClient.GetServerHostname(), targetWellbore.UidWell, targetWellbore.Uid, RefreshType.Update);
            var successString = successUids.Count > 0 ? $"Copied bhaRuns: {string.Join(", ", successUids)}." : "";
            if (!error)
            {
                return (new WorkerResult(witsmlClient.GetServerHostname(), true, successString), refreshAction);
            }

            return (new WorkerResult(witsmlClient.GetServerHostname(), false, $"{successString} Failed to copy some bhaRuns", errorReasons.First(), errorEnitities.First()), successUids.Count > 0 ? refreshAction : null);
        }

        private async Task<Tuple<WitsmlBhaRuns, WitsmlWellbore>> FetchData(CopyBhaRunJob job)
        {
            var bhaRunsQuery = GetBhaRuns(witsmlSourceClient, job.Source);
            var wellboreQuery = GetWellbore(witsmlClient, job.Target);
            await Task.WhenAll(bhaRunsQuery, wellboreQuery);
            var bhaRuns = bhaRunsQuery.Result;
            var targetWellbore = wellboreQuery.Result;
            return Tuple.Create(bhaRuns, targetWellbore);
        }

        private static async Task<WitsmlBhaRuns> GetBhaRuns(IWitsmlClient client, BhaRunReferences BhaRunReferences)
        {
            var witsmlBhaRun = BhaRunQueries.GetWitsmlBhaRunsById(BhaRunReferences.WellUid, BhaRunReferences.WellboreUid, BhaRunReferences.BhaRunUids);
            return await client.GetFromStoreAsync(witsmlBhaRun, new OptionsIn(ReturnElements.All));
        }

        private static async Task<WitsmlWellbore> GetWellbore(IWitsmlClient client, WellboreReference wellboreReference)
        {
            var witsmlWellbore = WellboreQueries.GetWitsmlWellboreByUid(wellboreReference.WellUid, wellboreReference.WellboreUid);
            var wellbores = await client.GetFromStoreAsync(witsmlWellbore, new OptionsIn(ReturnElements.Requested));
            return !wellbores.Wellbores.Any() ? null : wellbores.Wellbores.First();
        }
    }
}
