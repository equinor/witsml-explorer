using System;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

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

            obj = ModifyUtils.PrepareModification(obj, objectType, Logger);

            try
            {
                ModifyUtils.VerifyModification(obj);
            }
            catch (Exception e)
            {
                Logger.LogError("{JobType} - Job validation failed", JobType);
                return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, e.Message, ""), null);
            }

            IWitsmlQueryType query = obj.ToWitsml();
            QueryResult modifyResult = await GetTargetWitsmlClientOrThrow().UpdateInStoreAsync(query);

            if (!modifyResult.IsSuccessful)
            {
                string errorMessage = $"Failed to modify {objectType}";
                Logger.LogError("{ErrorMessage}. {jobDescription}", errorMessage, job.Description());
                return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, errorMessage, modifyResult.Reason), null);
            }

            Logger.LogInformation("{objectType} modified. {jobDescription}", objectType, job.Description());
            RefreshObjects refreshAction = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), obj.WellUid, obj.WellboreUid, objectType, JobType);
            WorkerResult workerResult = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, $"{objectType} {obj.Name} updated for {obj.WellboreName}");

            return (workerResult, refreshAction);
        }
    }
}
