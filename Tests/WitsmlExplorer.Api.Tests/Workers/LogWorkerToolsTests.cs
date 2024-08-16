using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Moq;

using Serilog;

using Witsml;
using Witsml.Data;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;
using WitsmlExplorer.Api.Workers.Create;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Workers
{
    public class LogWorkerToolsTests
    {
        private const string LogUid = "8cfad887-3e81-40f0-9034-178be642df65";
        private const string LogName = "Test log";
        private const string WellUid = "W-5209671";
        private const string WellName = "NO 34/10-A-25 C";
        private const string WellboreUid = "B-5209671";
        private const string WellboreName = "NO 34/10-A-25 C - Main Wellbore";
        private readonly Mock<IWitsmlClient> _witsmlClient;
        private readonly CreateObjectOnWellboreWorker _worker;

        public LogWorkerToolsTests()
        {
            Mock<IWitsmlClientProvider> witsmlClientProvider = new();
            _witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_witsmlClient.Object);
            ILoggerFactory loggerFactory = new LoggerFactory();
            loggerFactory.AddSerilog(Log.Logger);
            ILogger<CreateObjectOnWellboreJob> logger = loggerFactory.CreateLogger<CreateObjectOnWellboreJob>();
            _worker = new CreateObjectOnWellboreWorker(logger, witsmlClientProvider.Object);
        }

        [Fact]
        public async Task GetLogTest_OK()
        {
            WitsmlLogs returnedWitsmlLog = ReturnedWitsmlLog();
            CreateObjectOnWellboreJob job = CreateJobTemplate(WitsmlLog.WITSML_INDEX_TYPE_MD);
            List<WitsmlLogs> createdLogs = new();
            _witsmlClient.Setup(client =>
                client.GetFromStoreAsync(It.IsAny<WitsmlLogs>(), It.Is<OptionsIn>((ops) => ops.ReturnElements == ReturnElements.HeaderOnly))).ReturnsAsync(returnedWitsmlLog);

            var log = await LogWorkerTools.GetLog(_witsmlClient.Object, job.Object, ReturnElements.HeaderOnly);
        }

        [Fact]
        public async Task GetLogDataForCurveTest_OK()
        {
            WitsmlLogs returnedWitsmlLog = ReturnedWitsmlLog();
            CreateObjectOnWellboreJob job = CreateJobTemplate(WitsmlLog.WITSML_INDEX_TYPE_MD);
            List<WitsmlLogs> createdLogs = new();
            _witsmlClient.Setup(client =>
                client.GetFromStoreAsync(It.IsAny<WitsmlLogs>(), It.Is<OptionsIn>((ops) => ops.ReturnElements == ReturnElements.HeaderOnly))).ReturnsAsync(returnedWitsmlLog);
            WitsmlLog log = LogUtils.GetSourceLogs(WitsmlLog.WITSML_INDEX_TYPE_MD, 123.11, 123.12, "Depth").Logs.First();
            LogUtils.SetupGetDepthIndexed(_witsmlClient, (logs) => logs.Logs.First().StartIndex?.Value == "123.11",
                new() { new() { Data = "123.11,1," }, new() { Data = "123.12,,2" } });

            LogUtils.SetupGetDepthIndexed(_witsmlClient, (logs) => logs.Logs.First().StartIndex?.Value == "123.12",
                new() { new() { Data = "123.12,,2" } });
            var sourceLog = await LogWorkerTools.GetLogDataForCurve(_witsmlClient.Object, log, "mnemonic", null );
        }

        [Fact]
        public void CalculateProgressBasedOnIndexTest_OK()
        {
            var log = CreateLog();
            string mnemonicList = "Depth,BPOS";
            var witmslLogData = GetTestLogData(mnemonicList);
            var result = LogWorkerTools.CalculateProgressBasedOnIndex(log, witmslLogData);
        }

        [Fact]
        public void GetUpdateLogDataQueriesTest_OK()
        {
            string mnemonicList = "Depth,BPOS";
            var witmslLogData = GetTestLogData(mnemonicList);
            var batchedQuueries = LogWorkerTools.GetUpdateLogDataQueries("uid",
                "uidwell", "uidwellbore", witmslLogData, 2, mnemonicList);
        }

        private static WitsmlLogs ReturnedWitsmlLog()
        {
            WitsmlLogs returnedWitsmlLog = new()
            {
                Logs = new List<WitsmlLog>
                {
                    CreateLog()
                }
            };
            return returnedWitsmlLog;
        }

        private static WitsmlLog CreateLog()
        {
            return new WitsmlLog
            {
                UidWell = WellUid,
                UidWellbore = WellboreUid,
                Uid = LogUid,
                StartDateTimeIndex = "2023-04-19T00:00:04Z",
                EndDateTimeIndex = "2023-04-19T00:00:09Z",
                LogCurveInfo = new List<WitsmlLogCurveInfo>
                {
                    new WitsmlLogCurveInfo
                    {
                        Mnemonic = "Time",
                        Unit = "date time"
                    },
                    new WitsmlLogCurveInfo
                    {
                        Mnemonic = "mnemo1",
                        Unit =
                            CommonConstants.Unit
                                .Unitless
                    },
                    new WitsmlLogCurveInfo
                    {
                        Mnemonic = "mnemo2",
                        Unit = CommonConstants.Unit
                            .Unitless
                    }
                }
            };
        }

        private static WitsmlLogData GetTestLogData(string mnemonicList)
        {
            var data = new List<WitsmlData>()
            {
                new() { Data = "2023-04-19T00:00:00Z,101" },
                new() { Data = "2023-04-19T00:00:01Z,102" },
                new() { Data = "2023-04-19T00:00:02Z,103" },
                new() { Data = "2023-04-19T00:00:03Z,104" },
                new() { Data = "2023-04-19T00:00:04Z,105" },
                new() { Data = "2023-04-19T00:00:05Z,106" },
                new() { Data = "2023-04-19T00:00:07Z,107" },
                new() { Data = "2023-04-19T00:00:08Z,108" },
                new() { Data = "2023-04-19T00:00:09Z,109" },
                new() { Data = "2023-04-19T00:00:10Z,110" },
            };



            return new WitsmlLogData() { MnemonicList = mnemonicList, Data = data };
        }
        private static CreateObjectOnWellboreJob CreateJobTemplate(string indexType)
        {
            return new CreateObjectOnWellboreJob
            {
                Object = new LogObject
                {
                    Uid = LogUid,
                    Name = LogName,
                    WellUid = WellUid,
                    WellName = WellName,
                    WellboreUid = WellboreUid,
                    WellboreName = WellboreName,
                    IndexCurve = indexType == WitsmlLog.WITSML_INDEX_TYPE_MD ? "Depth" : "Time",
                    IndexType = indexType
                },
                ObjectType = EntityType.Log
            };
        }
    }
}
