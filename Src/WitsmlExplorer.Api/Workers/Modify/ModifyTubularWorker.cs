using System;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.Data.Tubular;
using Witsml.Extensions;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers.Modify
{
    public class ModifyTubularWorker : BaseWorker<ModifyTubularJob>, IWorker
    {
        public JobType JobType => JobType.ModifyTubular;

        public ModifyTubularWorker(ILogger<ModifyTubularJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider, logger) { }

        public override async Task<(WorkerResult, RefreshAction)> Execute(ModifyTubularJob job)
        {
            Verify(job.Tubular);

            string wellUid = job.Tubular.WellUid;
            string wellboreUid = job.Tubular.WellboreUid;
            string tubularUid = job.Tubular.Uid;

            WitsmlTubulars query = CreateRequest(wellUid, wellboreUid, tubularUid,
                new WitsmlTubular
                {
                    Uid = tubularUid,
                    UidWell = wellUid,
                    UidWellbore = wellboreUid,
                    Name = job.Tubular.Name,
                    TypeTubularAssy = job.Tubular.TypeTubularAssy
                });
            QueryResult result = await GetTargetWitsmlClientOrThrow().UpdateInStoreAsync(query);
            if (result.IsSuccessful)
            {
                Logger.LogInformation("Tubular modified. {jobDescription}", job.Description());
                RefreshObjects refreshAction = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), wellUid, wellboreUid, tubularUid, EntityType.Tubular);
                return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, $"Tubular updated ({job.Tubular.Name} [{tubularUid}])"), refreshAction);
            }

            const string errorMessage = "Failed to update tubular";
            Logger.LogError("{ErrorMessage}. {jobDescription}}", errorMessage, job.Description());
            WitsmlTubulars tubularQuery = TubularQueries.GetWitsmlTubular(wellUid, wellboreUid, tubularUid);
            WitsmlTubulars tubulars = await GetTargetWitsmlClientOrThrow().GetFromStoreAsync(tubularQuery, new OptionsIn(ReturnElements.IdOnly));
            WitsmlTubular tubular = tubulars.Tubulars.FirstOrDefault();
            EntityDescription description = null;
            if (tubular != null)
            {
                description = new EntityDescription
                {
                    WellName = tubular.NameWell,
                    WellboreName = tubular.NameWellbore,
                    ObjectName = tubular.Name
                };
            }

            return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, errorMessage, result.Reason, description), null);
        }

        private static WitsmlTubulars CreateRequest(string wellUid, string wellboreUid, string tubularUid, WitsmlTubular tubular)
        {
            return new WitsmlTubulars
            {
                Tubulars = new WitsmlTubular
                {
                    UidWell = wellUid,
                    UidWellbore = wellboreUid,
                    Uid = tubularUid,
                    Name = tubular.Name,
                    TypeTubularAssy = tubular.TypeTubularAssy
                }.AsSingletonList()
            };
        }

        private static void Verify(Tubular tubular)
        {
            if (string.IsNullOrEmpty(tubular.Name))
            {
                throw new InvalidOperationException($"{nameof(tubular.Name)} cannot be empty");
            }
        }
    }
}
