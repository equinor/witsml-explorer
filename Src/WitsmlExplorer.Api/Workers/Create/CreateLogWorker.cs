using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.Data;
using Witsml.Data.Curves;
using Witsml.Extensions;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers.Create
{
    public class CreateLogWorker : BaseWorker<CreateLogJob>, IWorker
    {
        public JobType JobType => JobType.CreateLogObject;

        public CreateLogWorker(ILogger<CreateLogJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider, logger) { }

        public override async Task<(WorkerResult, RefreshAction)> Execute(CreateLogJob job, CancellationToken? cancellationToken = null)
        {
            WitsmlWellbore targetWellbore = await GetWellbore(GetTargetWitsmlClientOrThrow(), job.LogObject);
            WitsmlLogs copyLogQuery = CreateLogQuery(job, targetWellbore);
            QueryResult createLogResult = await GetTargetWitsmlClientOrThrow().AddToStoreAsync(copyLogQuery);
            if (!createLogResult.IsSuccessful)
            {
                string errorMessage = "Failed to create log.";
                Logger.LogError("{ErrorMessage}. {jobDescription}", errorMessage, job.Description());
                return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, errorMessage, createLogResult.Reason), null);
            }

            Logger.LogInformation("Log object created. {jobDescription}", job.Description());
            RefreshObjects refreshAction = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), job.LogObject.WellUid, job.LogObject.WellboreUid, EntityType.Log, JobType);
            WorkerResult workerResult = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, $"Log object {job.LogObject.Name} created for {targetWellbore.Name}");

            return (workerResult, refreshAction);
        }

        private static WitsmlLogs CreateLogQuery(CreateLogJob job, WitsmlWellbore targetWellbore)
        {
            IndexType indexType = job.LogObject.IndexCurve == IndexType.Depth.ToString() ? IndexType.Depth : IndexType.Time;
            string unit = indexType == IndexType.Depth ? DepthUnit.Meter.ToString() : Unit.TimeUnit.ToString();
            return new WitsmlLogs
            {
                Logs = new WitsmlLog
                {
                    UidWell = targetWellbore.UidWell,
                    NameWell = targetWellbore.NameWell,
                    UidWellbore = targetWellbore.Uid,
                    NameWellbore = targetWellbore.Name,
                    Uid = job.LogObject.Uid,
                    Name = job.LogObject.Name,
                    RunNumber = job.LogObject.RunNumber,
                    ServiceCompany = job.LogObject.ServiceCompany,
                    IndexType = indexType == IndexType.Depth ? WitsmlLog.WITSML_INDEX_TYPE_MD : WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME,
                    IndexCurve = new WitsmlIndexCurve()
                    {
                        Value = indexType.ToString()
                    },
                    LogCurveInfo = new WitsmlLogCurveInfo
                    {
                        Uid = Guid.NewGuid().ToString(),
                        Mnemonic = indexType.ToString(),
                        Unit = unit,
                        TypeLogData = indexType == IndexType.Depth ? WitsmlLogCurveInfo.LogDataTypeDouble : WitsmlLogCurveInfo.LogDataTypeDatetime
                    }.AsItemInList()
                }.AsItemInList()
            };
        }

        private enum IndexType
        {
            Depth,
            Time
        }

        private static async Task<WitsmlWellbore> GetWellbore(IWitsmlClient client, LogObject logObject)
        {
            WitsmlWellbores query = WellboreQueries.GetWitsmlWellboreByUid(logObject.WellUid, logObject.WellboreUid);
            WitsmlWellbores wellbores = await client.GetFromStoreAsync(query, new OptionsIn(ReturnElements.Requested));
            return wellbores.Wellbores.FirstOrDefault();
        }
    }
}
