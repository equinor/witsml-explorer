using System;
using System.Linq;
using System.Threading;
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

namespace WitsmlExplorer.Api.Workers.Modify
{
    public class ModifyTubularComponentWorker : BaseWorker<ModifyTubularComponentJob>, IWorker
    {
        public JobType JobType => JobType.ModifyTubularComponent;

        public ModifyTubularComponentWorker(ILogger<ModifyTubularComponentJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider, logger) { }

        public override async Task<(WorkerResult, RefreshAction)> Execute(ModifyTubularComponentJob job, CancellationToken? cancellationToken = null)
        {
            Verify(job.TubularComponent, job.TubularReference);

            string wellUid = job.TubularReference.WellUid;
            string wellboreUid = job.TubularReference.WellboreUid;
            string tubularUid = job.TubularReference.Uid;

            WitsmlTubulars query = TubularQueries.UpdateTubularComponent(job.TubularComponent, job.TubularReference);
            QueryResult result = await GetTargetWitsmlClientOrThrow().UpdateInStoreAsync(query);
            if (result.IsSuccessful)
            {
                Logger.LogInformation("TubularComponent modified. {jobDescription}", job.Description());
                RefreshObjects refreshAction = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), wellUid, wellboreUid, EntityType.Tubular, tubularUid);
                return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, $"TubularComponent updated ({job.TubularComponent.Uid})"), refreshAction);
            }

            const string errorMessage = "Failed to update tubularComponent";
            Logger.LogError("{ErrorMessage}. {jobDescription}", errorMessage, job.Description());
            WitsmlTubulars tubularComponentQuery = TubularQueries.GetWitsmlTubular(wellUid, wellboreUid, tubularUid);
            WitsmlTubulars tubularComponents = await GetTargetWitsmlClientOrThrow().GetFromStoreAsync(tubularComponentQuery, new OptionsIn(ReturnElements.IdOnly));
            WitsmlTubular tubular = tubularComponents.Tubulars.FirstOrDefault();
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

            return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, errorMessage, result.Reason, description), null);
        }

        private static void Verify(TubularComponent tubularComponent, ObjectReference tubularReference)
        {
            if (string.IsNullOrEmpty(tubularReference.WellUid))
            {
                throw new InvalidOperationException($"{nameof(tubularReference.WellUid)} cannot be empty");
            }

            if (string.IsNullOrEmpty(tubularReference.WellboreUid))
            {
                throw new InvalidOperationException($"{nameof(tubularReference.WellboreUid)} cannot be empty");
            }

            if (string.IsNullOrEmpty(tubularReference.Uid))
            {
                throw new InvalidOperationException($"{nameof(tubularReference.Uid)} cannot be empty");
            }

            if (string.IsNullOrEmpty(tubularComponent.Uid))
            {
                throw new InvalidOperationException($"{nameof(tubularComponent.Uid)} cannot be empty");
            }

            if (tubularComponent.Sequence is not null and < 1)
            {
                throw new InvalidOperationException($"{nameof(tubularComponent.Sequence)} must be a positive non-zero integer");
            }

            if (tubularComponent.NumJointStand is not null and < 1)
            {
                throw new InvalidOperationException($"{nameof(tubularComponent.NumJointStand)} must be a positive non-zero integer");
            }

            if (tubularComponent.Id != null && string.IsNullOrEmpty(tubularComponent.Id.Uom))
            {
                throw new InvalidOperationException($"unit of measure for {nameof(tubularComponent.Id)} cannot be empty");
            }

            if (tubularComponent.Od != null && string.IsNullOrEmpty(tubularComponent.Od.Uom))
            {
                throw new InvalidOperationException($"unit of measure for {nameof(tubularComponent.Od)} cannot be empty");
            }

            if (tubularComponent.Len != null && string.IsNullOrEmpty(tubularComponent.Len.Uom))
            {
                throw new InvalidOperationException($"unit of measure for {nameof(tubularComponent.Len)} cannot be empty");
            }

            if (tubularComponent.WtPerLen != null && string.IsNullOrEmpty(tubularComponent.WtPerLen.Uom))
            {
                throw new InvalidOperationException($"unit of measure for {nameof(tubularComponent.WtPerLen)} cannot be empty");
            }
        }
    }
}
