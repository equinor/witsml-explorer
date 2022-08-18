using System;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers
{
    public class ModifyTubularComponentWorker : BaseWorker<ModifyTubularComponentJob>, IWorker
    {
        private readonly IWitsmlClient _witsmlClient;
        public JobType JobType => JobType.ModifyTubularComponent;

        public ModifyTubularComponentWorker(ILogger<ModifyTubularComponentJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(logger)
        {
            _witsmlClient = witsmlClientProvider.GetClient();
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(ModifyTubularComponentJob job)
        {
            Verify(job.TubularComponent, job.TubularReference);

            var wellUid = job.TubularReference.WellUid;
            var wellboreUid = job.TubularReference.WellboreUid;
            var tubularUid = job.TubularReference.TubularUid;

            var query = TubularQueries.UpdateTubularComponent(job.TubularComponent, job.TubularReference);
            var result = await _witsmlClient.UpdateInStoreAsync(query);
            if (result.IsSuccessful)
            {
                Logger.LogInformation("TubularComponent modified. {jobDescription}", job.Description());
                var refreshAction = new RefreshTubulars(_witsmlClient.GetServerHostname(), wellUid, wellboreUid, RefreshType.Update);
                return (new WorkerResult(_witsmlClient.GetServerHostname(), true, $"TubularComponent updated ({job.TubularComponent.Uid})"), refreshAction);
            }

            const string errorMessage = "Failed to update tubularComponent";
            Logger.LogError("{ErrorMessage}. {jobDescription}}", errorMessage, job.Description());
            var tubularComponentQuery = TubularQueries.GetWitsmlTubularById(wellUid, wellboreUid, tubularUid);
            var tubularComponents = await _witsmlClient.GetFromStoreAsync(tubularComponentQuery, new OptionsIn(ReturnElements.IdOnly));
            var tubular = tubularComponents.Tubulars.FirstOrDefault();
            EntityDescription description = null;
            if (tubular != null)
            {
                description = new EntityDescription
                {
                    WellName = tubular.NameWell,
                    WellboreName = tubular.NameWellbore,
                    ObjectName = job.TubularComponent.Uid
                };
            }

            return (new WorkerResult(_witsmlClient.GetServerHostname(), false, errorMessage, result.Reason, description), null);
        }

        private static void Verify(TubularComponent tubularComponent, TubularReference tubularReference)
        {
            if (string.IsNullOrEmpty(tubularReference.WellUid)) throw new InvalidOperationException($"{nameof(tubularReference.WellUid)} cannot be empty");
            if (string.IsNullOrEmpty(tubularReference.WellboreUid)) throw new InvalidOperationException($"{nameof(tubularReference.WellboreUid)} cannot be empty");
            if (string.IsNullOrEmpty(tubularReference.TubularUid)) throw new InvalidOperationException($"{nameof(tubularReference.TubularUid)} cannot be empty");

            if (string.IsNullOrEmpty(tubularComponent.Uid)) throw new InvalidOperationException($"{nameof(tubularComponent.Uid)} cannot be empty");
            if (tubularComponent.Sequence != null && tubularComponent.Sequence < 1) throw new InvalidOperationException($"{nameof(tubularComponent.Sequence)} must be a positive non-zero integer");
            if (tubularComponent.Id != null && string.IsNullOrEmpty(tubularComponent.Id.Uom)) throw new InvalidOperationException($"unit of measure for {nameof(tubularComponent.Id)} cannot be empty");
            if (tubularComponent.Od != null && string.IsNullOrEmpty(tubularComponent.Od.Uom)) throw new InvalidOperationException($"unit of measure for {nameof(tubularComponent.Od)} cannot be empty");
            if (tubularComponent.Len != null && string.IsNullOrEmpty(tubularComponent.Len.Uom)) throw new InvalidOperationException($"unit of measure for {nameof(tubularComponent.Len)} cannot be empty");
        }
    }
}
