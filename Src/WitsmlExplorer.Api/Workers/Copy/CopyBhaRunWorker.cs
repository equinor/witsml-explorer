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

namespace WitsmlExplorer.Api.Workers.Copy
{
    public class CopyBhaRunWorker : BaseWorker<CopyBhaRunJob>, IWorker
    {
        private readonly IWitsmlClient _witsmlClient;
        private readonly IWitsmlClient _witsmlSourceClient;
        public JobType JobType => JobType.CopyBhaRun;

        public CopyBhaRunWorker(ILogger<CopyBhaRunJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(logger)
        {
            _witsmlClient = witsmlClientProvider.GetClient();
            _witsmlSourceClient = witsmlClientProvider.GetSourceClient() ?? _witsmlClient;
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(CopyBhaRunJob job)
        {
            (WitsmlBhaRuns bhaRuns, WitsmlWellbore targetWellbore) = await FetchData(job);
            IEnumerable<WitsmlBhaRuns> queries = BhaRunQueries.CopyWitsmlBhaRuns(bhaRuns, targetWellbore);

            bool error = false;
            List<string> successUids = new();
            List<string> errorReasons = new();
            List<EntityDescription> errorEnitities = new();
            QueryResult[] results = await Task.WhenAll(queries.Select(async (query) =>
            {
                QueryResult result = await _witsmlClient.AddToStoreAsync(query);
                WitsmlBhaRun bhaRun = query.BhaRuns.First();
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

            RefreshWellbore refreshAction = new(_witsmlClient.GetServerHostname(), targetWellbore.UidWell, targetWellbore.Uid, RefreshType.Update);
            string successString = successUids.Count > 0 ? $"Copied bhaRuns: {string.Join(", ", successUids)}." : "";
            return !error
                ? ((WorkerResult, RefreshAction))(new WorkerResult(_witsmlClient.GetServerHostname(), true, successString), refreshAction)
                : (new WorkerResult(_witsmlClient.GetServerHostname(), false, $"{successString} Failed to copy some bhaRuns", errorReasons.First(), errorEnitities.First()), successUids.Count > 0 ? refreshAction : null);
        }

        private async Task<Tuple<WitsmlBhaRuns, WitsmlWellbore>> FetchData(CopyBhaRunJob job)
        {
            Task<WitsmlBhaRuns> bhaRunsQuery = GetBhaRuns(_witsmlSourceClient, job.Source);
            Task<WitsmlWellbore> wellboreQuery = GetWellbore(_witsmlClient, job.Target);
            await Task.WhenAll(bhaRunsQuery, wellboreQuery);
            WitsmlBhaRuns bhaRuns = bhaRunsQuery.Result;
            WitsmlWellbore targetWellbore = wellboreQuery.Result;
            return Tuple.Create(bhaRuns, targetWellbore);
        }

        private static async Task<WitsmlBhaRuns> GetBhaRuns(IWitsmlClient client, BhaRunReferences bhaRunReferences)
        {
            WitsmlBhaRuns witsmlBhaRun = BhaRunQueries.GetWitsmlBhaRunsById(bhaRunReferences.WellUid, bhaRunReferences.WellboreUid, bhaRunReferences.BhaRunUids);
            return await client.GetFromStoreAsync(witsmlBhaRun, new OptionsIn(ReturnElements.All));
        }

        private static async Task<WitsmlWellbore> GetWellbore(IWitsmlClient client, WellboreReference wellboreReference)
        {
            WitsmlWellbores witsmlWellbore = WellboreQueries.GetWitsmlWellboreByUid(wellboreReference.WellUid, wellboreReference.WellboreUid);
            WitsmlWellbores wellbores = await client.GetFromStoreAsync(witsmlWellbore, new OptionsIn(ReturnElements.Requested));
            return !wellbores.Wellbores.Any() ? null : wellbores.Wellbores.First();
        }
    }
}
