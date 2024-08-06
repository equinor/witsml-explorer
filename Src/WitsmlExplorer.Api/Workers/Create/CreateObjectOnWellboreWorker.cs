using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.Data;
using Witsml.Data.Curves;
using Witsml.Extensions;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers.Modify;

namespace WitsmlExplorer.Api.Workers.Create
{
    public class CreateObjectOnWellboreWorker : BaseWorker<CreateObjectOnWellboreJob>, IWorker
    {
        public JobType JobType => JobType.CreateObjectOnWellbore;

        public CreateObjectOnWellboreWorker(ILogger<CreateObjectOnWellboreJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider, logger) { }

        public override async Task<(WorkerResult, RefreshAction)> Execute(CreateObjectOnWellboreJob job, CancellationToken? cancellationToken = null)
        {
            ObjectOnWellbore obj = job.Object;
            EntityType objectType = job.ObjectType;

            Logger.LogInformation("Started {JobType}. {jobDescription}", JobType, job.Description());

            try
            {
                ModifyUtils.VerifyCreationValues(obj);
            }
            catch (Exception e)
            {
                Logger.LogError("{JobType} - Job validation failed", JobType);
                return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, e.Message, ""), null);
            }

            IWitsmlQueryType query = obj.ToWitsml();

            if (job.ObjectType == EntityType.Log)
            {
                LogObject log = (LogObject)job.Object;
                ((WitsmlLogs)query).Logs.First().LogCurveInfo = new WitsmlLogCurveInfo
                {
                    Uid = Guid.NewGuid().ToString(),
                    Mnemonic = log.IndexCurve,
                    Unit = log.IndexType == WitsmlLog.WITSML_INDEX_TYPE_MD ? DepthUnit.Meter.ToString() : Unit.TimeUnit.ToString(),
                    TypeLogData = log.IndexType == WitsmlLog.WITSML_INDEX_TYPE_MD ? WitsmlLogCurveInfo.LogDataTypeDouble : WitsmlLogCurveInfo.LogDataTypeDatetime
                }.AsItemInList();
            }

            QueryResult createResult = await GetTargetWitsmlClientOrThrow().AddToStoreAsync(query);

            if (!createResult.IsSuccessful)
            {
                string errorMessage = $"Failed to create {objectType}";
                Logger.LogError("{ErrorMessage}. {jobDescription}", errorMessage, job.Description());
                return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, errorMessage, createResult.Reason), null);
            }

            Logger.LogInformation("{objectType} created. {jobDescription}", objectType, job.Description());
            RefreshObjects refreshAction = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), obj.WellUid, obj.WellboreUid, objectType);
            WorkerResult workerResult = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, $"{objectType} {obj.Name} updated for {obj.WellboreName}");

            return (workerResult, refreshAction);
        }
    }
}
