using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Serilog;

using Witsml;
using Witsml.Data;
using Witsml.Data.Curves;
using Witsml.Extensions;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;

using Xunit;

namespace WitsmlExplorer.IntegrationTests.Api.Workers
{
    public class CopyLogWorkerTests
    {
        private readonly CopyLogWorker _worker;
        private readonly DeleteLogObjectsWorker _deleteLogsWorker;
        private readonly IWitsmlClient _client;
        private readonly LogObjectService _logObjectService;

        public CopyLogWorkerTests()
        {
            var configuration = ConfigurationReader.GetConfig();
            var witsmlClientProvider = new WitsmlClientProvider(configuration);
            _client = witsmlClientProvider.GetClient();
            var loggerFactory = (ILoggerFactory)new LoggerFactory();
            loggerFactory.AddSerilog(Log.Logger);
            var logger = loggerFactory.CreateLogger<CopyLogDataJob>();
            var copyLogDataWorker = new CopyLogDataWorker(witsmlClientProvider, logger);
            var logger2 = loggerFactory.CreateLogger<CopyLogJob>();
            _worker = new CopyLogWorker(logger2, witsmlClientProvider, copyLogDataWorker);
            _logObjectService = new LogObjectService(witsmlClientProvider);

            var logger3 = loggerFactory.CreateLogger<DeleteLogObjectsJob>();
            var logger4 = loggerFactory.CreateLogger<DeleteUtils>();
            _deleteLogsWorker = new DeleteLogObjectsWorker(logger3, witsmlClientProvider, new DeleteUtils(logger4, witsmlClientProvider));
        }

        [Fact(Skip = "Should only be run manually")]
        public async Task CopyLog()
        {
            var job = new CopyLogJob
            {
                Source = new LogReferences
                {
                    LogReferenceList = new[]
                    {
                        new LogReference
                        {
                            WellUid = "",
                            WellboreUid = "",
                            LogUid = "",
                        }
                    }
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
            var sourceReference = new LogReferences
            {
                LogReferenceList = new[]
                {
                    new LogReference
                    {
                        WellUid = "",
                        WellboreUid = "",
                        LogUid = "",
                    }
                }
            };
            var targetReference = new LogReference
            {
                WellUid = "",
                WellboreUid = "",
                LogUid = logUid
            };

            await _deleteLogsWorker.Execute(
                new DeleteLogObjectsJob
                {
                    ToDelete = new LogReferences()
                    {
                        LogReferenceList = targetReference.AsSingletonList().ToArray()
                    }
                }
                );

            var job = new CopyLogJob
            {
                Source = sourceReference,
                Target = new WellboreReference
                {
                    WellUid = targetReference.WellUid,
                    WellboreUid = targetReference.WellboreUid
                }
            };

            await _worker.Execute(job);

            var sourceLog = await GetLog(sourceReference.LogReferenceList.First());
            var targetLog = await GetLog(targetReference);

            var currentIndex = Index.Start(sourceLog);
            var endIndex = await GetEndIndex(targetReference);
            while (currentIndex != endIndex)
            {
                var sourceLogData = await _logObjectService.ReadLogData(sourceReference.LogReferenceList.FirstOrDefault()?.WellUid,
                    sourceReference.LogReferenceList.FirstOrDefault()?.WellboreUid, logUid,
                    new List<string>(sourceLog.LogData.MnemonicList.Split(",")), currentIndex.Equals(Index.Start(sourceLog)),
                    currentIndex.GetValueAsString(), endIndex.ToString());
                var targetLogData = await _logObjectService.ReadLogData(targetReference.WellUid, targetReference.WellboreUid, logUid,
                    new List<string>(targetLog.LogData.MnemonicList.Split(",")), currentIndex.Equals(Index.Start(targetLog)),
                    currentIndex.GetValueAsString(), endIndex.ToString());

                Assert.Equal(sourceLogData.EndIndex, targetLogData.EndIndex);
                Assert.Equal(sourceLogData.CurveSpecifications.Count(), targetLogData.CurveSpecifications.Count());
                Assert.Equal(sourceLogData.Data.Count(), targetLogData.Data.Count());

                currentIndex = Index.End(sourceLog, sourceLogData.EndIndex);
            }
        }

        private async Task<WitsmlLog> GetLog(LogReference logReference)
        {
            var logQuery = LogQueries.GetWitsmlLogById(logReference.WellUid, logReference.WellboreUid, logReference.LogUid);
            var logs = await _client.GetFromStoreAsync(logQuery, new OptionsIn(ReturnElements.All));
            return !logs.Logs.Any() ? null : logs.Logs.First();
        }

        private async Task<Index> GetEndIndex(LogReference logReference)
        {
            var logQuery = LogQueries.GetWitsmlLogById(logReference.WellUid, logReference.WellboreUid, logReference.LogUid);
            var logs = await _client.GetFromStoreAsync(logQuery, new OptionsIn(ReturnElements.HeaderOnly));
            return Index.End(logs.Logs.First());
        }
    }
}
