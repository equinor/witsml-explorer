using System;
using System.Linq;
using System.Threading.Tasks;
using Serilog;
using Witsml;
using Witsml.Data;
using Witsml.Data.Curves;
using Witsml.Extensions;
using Witsml.ServiceReference;
using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers
{
    public interface ICreateLogWorker
    {
        Task<(WorkerResult, RefreshAction)> Execute(CreateLogJob job);
    }

    public class CreateLogWorker : ICreateLogWorker
    {
        private readonly IWitsmlClient witsmlClient;

        public CreateLogWorker(IWitsmlClientProvider witsmlClientProvider)
        {
            witsmlClient = witsmlClientProvider.GetClient();
        }

        public async Task<(WorkerResult, RefreshAction)> Execute(CreateLogJob job)
        {
            var targetWellbore = await GetWellbore(witsmlClient, job.LogObject);
            var copyLogQuery = CreateLogQuery(job, targetWellbore);
            var createLogResult = await witsmlClient.AddToStoreAsync(copyLogQuery);
            if (!createLogResult.IsSuccessful)
            {
                var errorMessage = "Failed to create log.";
                Log.Error("{ErrorMessage}. Target: UidWell: {TargetWellUid}, UidWellbore: {TargetWellboreUid}.",
                    errorMessage, job.LogObject.WellUid, job.LogObject.WellboreUid);
                return (new WorkerResult(witsmlClient.GetServerHostname(), false, errorMessage, createLogResult.Reason), null);
            }

            Log.Information("{JobType} - Job successful. Log object created", GetType().Name);
            var refreshAction = new RefreshWellbore(witsmlClient.GetServerHostname(), job.LogObject.WellUid, job.LogObject.WellboreUid, RefreshType.Update);
            var workerResult = new WorkerResult(witsmlClient.GetServerHostname(), true, $"Log object {job.LogObject.Name} created for {targetWellbore.Name}");

            return (workerResult, refreshAction);
        }

        private static WitsmlLogs CreateLogQuery(CreateLogJob job, WitsmlWellbore targetWellbore)
        {
            var indexType = job.LogObject.IndexCurve == IndexType.Depth.ToString() ? IndexType.Depth : IndexType.Time;
            var unit = indexType == IndexType.Depth ? DepthUnit.Meter.ToString() : Unit.TimeUnit.ToString();
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
                        TypeLogData = indexType == IndexType.Depth ? WitsmlLogCurveInfo.LOG_DATA_TYPE_DOUBLE : WitsmlLogCurveInfo.LOG_DATA_TYPE_DATETIME
                    }.AsSingletonList()
                }.AsSingletonList()
            };
        }

        private enum IndexType
        {
            Depth,
            Time
        }

        private static async Task<WitsmlWellbore> GetWellbore(IWitsmlClient client, LogObject logObject)
        {
            var query = WellboreQueries.QueryByUid(logObject.WellUid, logObject.WellboreUid);
            var wellbores = await client.GetFromStoreAsync(query, OptionsIn.Requested);
            return !wellbores.Wellbores.Any() ? null : wellbores.Wellbores.First();
        }
    }
}
