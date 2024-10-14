using System;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;

using Witsml;
using Witsml.Data;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers.Modify
{
    public class ModifyObjectOnWellboreWorker : BaseWorker<ModifyObjectOnWellboreJob>, IWorker
    {
        public JobType JobType => JobType.ModifyObjectOnWellbore;

        public ModifyObjectOnWellboreWorker(ILogger<ModifyObjectOnWellboreJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider, logger) { }

        public override async Task<(WorkerResult, RefreshAction)> Execute(ModifyObjectOnWellboreJob job, CancellationToken? cancellationToken = null)
        {
            ObjectOnWellbore obj = job.Object;
            EntityType objectType = job.ObjectType;

            Logger.LogInformation("Started {JobType}. {jobDescription}", JobType, job.Description());

            try
            {
                ModifyUtils.VerifyModificationProperties(obj, objectType, Logger);
                ModifyUtils.VerifyModificationValues(obj);
            }
            catch (Exception e)
            {
                Logger.LogError("{JobType} - Job validation failed", JobType);
                return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, e.Message, ""), null);
            }

            await PreModifyModifications(job);

            IWitsmlQueryType query = obj.ToWitsml();
            QueryResult modifyResult = await GetTargetWitsmlClientOrThrow().UpdateInStoreAsync(query);

            if (!modifyResult.IsSuccessful)
            {
                string errorMessage = $"Failed to modify {objectType}";
                Logger.LogError("{ErrorMessage}. {jobDescription}", errorMessage, job.Description());
                return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, errorMessage, modifyResult.Reason), null);
            }

            Logger.LogInformation("{objectType} modified. {jobDescription}", objectType, job.Description());
            RefreshObjects refreshAction = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), obj.WellUid, obj.WellboreUid, objectType);
            WorkerResult workerResult = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, $"{objectType} {obj.Name} updated for {obj.WellboreName}");

            return (workerResult, refreshAction);
        }

        private async Task PreModifyModifications(ModifyObjectOnWellboreJob job)
        {
            if (job.ObjectType == EntityType.Risk)
            {
                Risk risk = (Risk)job.Object;
                if (!risk.AffectedPersonnel.IsNullOrEmpty())
                {
                    // AffectedPersonnel can't be modified. So we delete it first, and then run the modification as usual.
                    WitsmlRisks test = new WitsmlRisk
                    {
                        Uid = risk.Uid,
                        UidWell = risk.WellUid,
                        UidWellbore = risk.WellboreUid,
                        AffectedPersonnel = [""] // Warning: The empty string must be included to ensure that AffectedPersonnel is serialized correctly and added to the query. Otherwise we risk deleting the entire risk object!
                    }.AsItemInWitsmlList();
                    await GetTargetWitsmlClientOrThrow().DeleteFromStoreAsync(test);
                }
            }
        }
    }
}
