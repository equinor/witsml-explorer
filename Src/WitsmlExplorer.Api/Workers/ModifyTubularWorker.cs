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

namespace WitsmlExplorer.Api.Workers
{
    public class ModifyTubularWorker : BaseWorker<ModifyTubularJob>, IWorker
    {
        private readonly IWitsmlClient _witsmlClient;
        public JobType JobType => JobType.ModifyTubular;

        public ModifyTubularWorker(ILogger<ModifyTubularJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(logger)
        {
            _witsmlClient = witsmlClientProvider.GetClient();
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(ModifyTubularJob job)
        {
            Verify(job.Tubular);

            var wellUid = job.Tubular.WellUid;
            var wellboreUid = job.Tubular.WellboreUid;
            var tubularUid = job.Tubular.Uid;

            var query = CreateRequest(wellUid, wellboreUid, tubularUid,
                new WitsmlTubular
                {
                    Uid = tubularUid,
                    UidWell = wellUid,
                    UidWellbore = wellboreUid,
                    Name = job.Tubular.Name,
                    TypeTubularAssy = job.Tubular.TypeTubularAssy
                });
            var result = await _witsmlClient.UpdateInStoreAsync(query);
            if (result.IsSuccessful)
            {
                Logger.LogInformation("Tubular modified. {jobDescription}", job.Description());
                var refreshAction = new RefreshTubulars(_witsmlClient.GetServerHostname(), wellUid, wellboreUid, RefreshType.Update);
                return (new WorkerResult(_witsmlClient.GetServerHostname(), true, $"Tubular updated ({job.Tubular.Name} [{tubularUid}])"), refreshAction);
            }

            const string errorMessage = "Failed to update tubular";
            Logger.LogError("{ErrorMessage}. {jobDescription}}", errorMessage, job.Description());
            var tubularQuery = TubularQueries.GetWitsmlTubularById(wellUid, wellboreUid, tubularUid);
            var tubulars = await _witsmlClient.GetFromStoreAsync(tubularQuery, new OptionsIn(ReturnElements.IdOnly));
            var tubular = tubulars.Tubulars.FirstOrDefault();
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

            return (new WorkerResult(_witsmlClient.GetServerHostname(), false, errorMessage, result.Reason, description), null);
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
            if (string.IsNullOrEmpty(tubular.Name)) throw new InvalidOperationException($"{nameof(tubular.Name)} cannot be empty");
        }
    }
}
