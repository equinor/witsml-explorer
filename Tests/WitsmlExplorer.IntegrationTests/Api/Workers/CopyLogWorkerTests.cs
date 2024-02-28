using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Serilog;

using Witsml;
using Witsml.Data;
using Witsml.Data.Curves;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers.Copy;
using WitsmlExplorer.Api.Workers.Delete;

using Xunit;

namespace WitsmlExplorer.IntegrationTests.Api.Workers
{
    public class CopyLogWorkerTests
    {
        private readonly CopyLogWorker _worker;
        private readonly DeleteObjectsWorker _deleteLogsWorker;
        private readonly IWitsmlClient _client;
        private readonly LogObjectService _logObjectService;

        public CopyLogWorkerTests()
        {
            Microsoft.Extensions.Configuration.IConfiguration configuration = ConfigurationReader.GetConfig();
            WitsmlClientProvider witsmlClientProvider = new(configuration);
            _client = witsmlClientProvider.GetClient();
            ILoggerFactory loggerFactory = new LoggerFactory();
            loggerFactory.AddSerilog(Log.Logger);
            ILogger<CopyLogDataJob> logger = loggerFactory.CreateLogger<CopyLogDataJob>();
            CopyLogDataWorker copyLogDataWorker = new(witsmlClientProvider, logger);
            ILogger<CopyObjectsJob> logger2 = loggerFactory.CreateLogger<CopyObjectsJob>();
            _worker = new CopyLogWorker(logger2, witsmlClientProvider, copyLogDataWorker);
            _logObjectService = new LogObjectService(witsmlClientProvider);

            ILogger<DeleteObjectsJob> logger3 = loggerFactory.CreateLogger<DeleteObjectsJob>();
            _deleteLogsWorker = new DeleteObjectsWorker(logger3, witsmlClientProvider);
        }

        [Fact(Skip = "Should only be run manually")]
        public async Task CopyLog()
        {
            CopyObjectsJob job = new()
            {
                Source = new ObjectReferences
                {
                    WellUid = "",
                    WellboreUid = "",
                    ObjectUids = new string[] { "" }
                },
                Target = new WellboreReference
                {
                    WellUid = "",
                    WellboreUid = ""
                }
            };
            await _worker.Execute(job);
        }

        [Fact(Skip = "Should only be run manually")]
        public async Task CopyLog_VerifyLogDataIsCopied()
        {
            const string logUid = "";
            ObjectReferences sourceReference = new()
            {
                WellUid = "",
                WellboreUid = "",
                ObjectUids = new string[] { "" }
            };
            ObjectReference targetReference = new()
            {
                WellUid = "",
                WellboreUid = "",
                Uid = logUid
            };

            await _deleteLogsWorker.Execute(
                new DeleteObjectsJob
                {
                    ToDelete = new ObjectReferences()
                    {
                        WellUid = "",
                        WellboreUid = "",
                        ObjectUids = new string[] { logUid },
                        ObjectType = EntityType.Log
                    }
                }
                );

            CopyObjectsJob job = new()
            {
                Source = sourceReference,
                Target = new WellboreReference
                {
                    WellUid = targetReference.WellUid,
                    WellboreUid = targetReference.WellboreUid
                }
            };

            await _worker.Execute(job);

            WitsmlLog sourceLog = await GetLog(sourceReference.ObjectUids.First(), sourceReference.WellboreUid, sourceReference.WellUid);
            WitsmlLog targetLog = await GetLog(targetReference);

            Index currentIndex = Index.Start(sourceLog);
            Index endIndex = await GetEndIndex(targetReference);
            while (currentIndex != endIndex)
            {
                LogData sourceLogData = await _logObjectService.ReadLogData(sourceReference.WellUid,
                    sourceReference.WellboreUid, logUid,
                    new List<string>(sourceLog.LogData.MnemonicList.Split(CommonConstants.DataSeparator)), currentIndex.Equals(Index.Start(sourceLog)),
                    currentIndex.GetValueAsString(), endIndex.ToString(), false);
                LogData targetLogData = await _logObjectService.ReadLogData(targetReference.WellUid, targetReference.WellboreUid, logUid,
                    new List<string>(targetLog.LogData.MnemonicList.Split(CommonConstants.DataSeparator)), currentIndex.Equals(Index.Start(targetLog)),
                    currentIndex.GetValueAsString(), endIndex.ToString(), false);

                Assert.Equal(sourceLogData.EndIndex, targetLogData.EndIndex);
                Assert.Equal(sourceLogData.CurveSpecifications.Count(), targetLogData.CurveSpecifications.Count());
                Assert.Equal(sourceLogData.Data.Count(), targetLogData.Data.Count());

                currentIndex = Index.End(sourceLog, sourceLogData.EndIndex);
            }
        }

        private async Task<WitsmlLog> GetLog(ObjectReference logReference)
        {
            WitsmlLogs logQuery = LogQueries.GetWitsmlLogById(logReference.WellUid, logReference.WellboreUid, logReference.Uid);
            WitsmlLogs logs = await _client.GetFromStoreAsync(logQuery, new OptionsIn(ReturnElements.All));
            return !logs.Logs.Any() ? null : logs.Logs.First();
        }

        private async Task<WitsmlLog> GetLog(string logUid, string wellboreUid, string wellUid)
        {
            WitsmlLogs logQuery = LogQueries.GetWitsmlLogById(wellUid, wellboreUid, logUid);
            WitsmlLogs logs = await _client.GetFromStoreAsync(logQuery, new OptionsIn(ReturnElements.All));
            return !logs.Logs.Any() ? null : logs.Logs.First();
        }

        private async Task<Index> GetEndIndex(ObjectReference logReference)
        {
            WitsmlLogs logQuery = LogQueries.GetWitsmlLogById(logReference.WellUid, logReference.WellboreUid, logReference.Uid);
            WitsmlLogs logs = await _client.GetFromStoreAsync(logQuery, new OptionsIn(ReturnElements.HeaderOnly));
            return Index.End(logs.Logs.First());
        }
    }
}
