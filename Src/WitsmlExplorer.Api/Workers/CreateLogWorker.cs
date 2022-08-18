using System;
using System.Linq;
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

namespace WitsmlExplorer.Api.Workers
{
    public class CreateLogWorker : BaseWorker<CreateLogJob>, IWorker
    {
        private readonly IWitsmlClient _witsmlClient;
        public JobType JobType => JobType.CreateLogObject;

        public CreateLogWorker(ILogger<CreateLogJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(logger)
        {
            _witsmlClient = witsmlClientProvider.GetClient();
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(CreateLogJob job)
        {
            var targetWellbore = await GetWellbore(_witsmlClient, job.LogObject);
            var copyLogQuery = CreateLogQuery(job, targetWellbore);
            var createLogResult = await _witsmlClient.AddToStoreAsync(copyLogQuery);
            if (!createLogResult.IsSuccessful)
            {
                var errorMessage = "Failed to create log.";
                Logger.LogError("{ErrorMessage}. {jobDescription}", errorMessage, job.Description());
                return (new WorkerResult(_witsmlClient.GetServerHostname(), false, errorMessage, createLogResult.Reason), null);
            }

            Logger.LogInformation("Log object created. {jobDescription}", job.Description());
            var refreshAction = new RefreshWellbore(_witsmlClient.GetServerHostname(), job.LogObject.WellUid, job.LogObject.WellboreUid, RefreshType.Update);
            var workerResult = new WorkerResult(_witsmlClient.GetServerHostname(), true, $"Log object {job.LogObject.Name} created for {targetWellbore.Name}");

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
            var query = WellboreQueries.GetWitsmlWellboreByUid(logObject.WellUid, logObject.WellboreUid);
            var wellbores = await client.GetFromStoreAsync(query, new OptionsIn(ReturnElements.Requested));
            return !wellbores.Wellbores.Any() ? null : wellbores.Wellbores.First();
        }
    }
}
