using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Threading.Tasks;
using Witsml;
using Witsml.Extensions;
using Witsml.Data;
using Witsml.Data.Curves;
using Witsml.Query;
using Witsml.ServiceReference;
using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;
using Xunit;

namespace WitsmlExplorer.IntegrationTests.Api.Workers
{
    [SuppressMessage("ReSharper", "xUnit1004")]
    public class CopyLogWorkerTests
    {
        private readonly CopyLogWorker worker;
        private readonly DeleteLogObjectsWorker deleteLogsWorker;
        private readonly IWitsmlClient client;
        private readonly LogObjectService logObjectService;

        public CopyLogWorkerTests()
        {
            var configuration = ConfigurationReader.GetConfig();
            var witsmlClientProvider = new WitsmlClientProvider(configuration);
            client = witsmlClientProvider.GetClient();
            worker = new CopyLogWorker(witsmlClientProvider);
            deleteLogsWorker = new DeleteLogObjectsWorker(witsmlClientProvider);
            logObjectService = new LogObjectService(witsmlClientProvider);
        }

        [Fact(Skip = "Should only be run manually")]
        public async Task CopyLog()
        {
            var job = new CopyLogJob
            {
                Source = new LogReference
                {
                    WellUid = "",
                    WellboreUid = "",
                    LogUid = ""
                },
                Target = new WellboreReference
                {
                    WellUid = "",
                    WellboreUid = ""
                }
            };
            await worker.Execute(job);
        }

        [Fact(Skip = "Should only be run manually")]
        public async Task CopyLog_VerifyLogDataIsCopied()
        {
            const string logUid = "";
            var sourceReference = new LogReference
            {
                WellUid = "",
                WellboreUid = "",
                LogUid = logUid
            };
            var targetReference = new LogReference
            {
                WellUid = "",
                WellboreUid = "",
                LogUid = logUid
            };

            await deleteLogsWorker.Execute(new DeleteLogObjectsJob {LogReferences = targetReference.AsSingletonList<LogReference>().ToArray()});

            var job = new CopyLogJob
            {
                Source = sourceReference,
                Target = new WellboreReference
                {
                    WellUid = targetReference.WellUid,
                    WellboreUid = targetReference.WellboreUid
                }
            };

            await worker.Execute(job);

            var sourceLog = await GetLog(sourceReference);
            var targetLog = await GetLog(targetReference);

            var currentIndex = Index.Start(sourceLog);
            var endIndex = await GetEndIndex(targetReference);
            while (currentIndex != endIndex)
            {
                var sourceLogData = await logObjectService.ReadLogData(sourceReference.WellUid, sourceReference.WellboreUid, logUid,
                    new List<string>(sourceLog.LogData.MnemonicList.Split(",")), currentIndex.Equals(Index.Start(sourceLog)),
                    currentIndex.GetValueAsString(), endIndex.ToString());
                var targetLogData = await logObjectService.ReadLogData(targetReference.WellUid, targetReference.WellboreUid, logUid,
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
            var logQuery = LogQueries.QueryById(logReference.WellUid, logReference.WellboreUid, logReference.LogUid);
            var logs = await client.GetFromStoreAsync(logQuery, OptionsIn.All);
            return !logs.Logs.Any() ? null : logs.Logs.First();
        }

        private async Task<Index> GetEndIndex(LogReference logReference)
        {
            var logQuery = LogQueries.QueryById(logReference.WellUid, logReference.WellboreUid, logReference.LogUid);
            var logs = await client.GetFromStoreAsync(logQuery, OptionsIn.HeaderOnly);
            return Index.End(logs.Logs.First());
        }
    }
}
