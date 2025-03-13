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

using Xunit;

namespace WitsmlExplorer.Api.Tests.Workers
{
    public class LogWorkerToolsTests
    {
        private const string LogUid = "51bb71c2-5e6f-4e15-ae5f-0fbc866bdad6";
        private const string LogName = "Test log";
        private const string WellUid = "welluid";
        private const string WellName = "wellname";
        private const string WellboreUid = "wellboreuid";
        private const string WellboreName = "wellborename";
        private readonly Mock<IWitsmlClient> _witsmlClient;

        public LogWorkerToolsTests()
        {
            Mock<IWitsmlClientProvider> witsmlClientProvider = new();
            _witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_witsmlClient.Object);
            ILoggerFactory loggerFactory = new LoggerFactory();
            loggerFactory.AddSerilog(Log.Logger);
        }

        [Fact]
        public async Task GetLogTest_OK()
        {
            WitsmlLog expectedLog = CreateLog();
            CreateObjectOnWellboreJob job = CreateJobTemplate(WitsmlLog.WITSML_INDEX_TYPE_MD);
            _witsmlClient.Setup(client =>
                client.GetFromStoreAsync(It.IsAny<WitsmlLogs>(), It.Is<OptionsIn>((ops) => ops.ReturnElements == ReturnElements.HeaderOnly), null)).ReturnsAsync(expectedLog.AsItemInWitsmlList());

            var log = await LogWorkerTools.GetLog(_witsmlClient.Object, job.Object, ReturnElements.HeaderOnly);
            Assert.Equal(expectedLog.Uid, log.Uid);
            Assert.Equal(expectedLog.EndDateTimeIndex, log.EndDateTimeIndex);
            Assert.Equal(expectedLog.StartDateTimeIndex, log.StartDateTimeIndex);
            Assert.Equal(expectedLog.LogCurveInfo.Count, log.LogCurveInfo.Count);
        }

        [Fact]
        public async Task GetLogDataForCurveTest_OK()
        {
            WitsmlLog expectedLog = CreateLog();
            _witsmlClient.Setup(client =>
                client.GetFromStoreAsync(It.IsAny<WitsmlLogs>(), It.Is<OptionsIn>((ops) => ops.ReturnElements == ReturnElements.HeaderOnly), null)).ReturnsAsync(expectedLog.AsItemInWitsmlList);
            WitsmlLog log = LogUtils.GetSourceLogs(WitsmlLog.WITSML_INDEX_TYPE_MD, 123.11, 123.12, "Depth").Logs.First();
            LogUtils.SetupGetDepthIndexed(_witsmlClient, (logs) => logs.Logs.First().StartIndex?.Value == "123.11",
                new() { new() { Data = "123.11,1," }, new() { Data = "123.12,,2" } });

            LogUtils.SetupGetDepthIndexed(_witsmlClient, (logs) => logs.Logs.First().StartIndex?.Value == "123.12",
                new() { new() { Data = "123.12,,2" } });
            var sourceLog = await LogWorkerTools.GetLogDataForCurve(_witsmlClient.Object, log, "mnemonic", null);
            Assert.Equal("123.11,1,", sourceLog.Data[0].Data);
            Assert.Equal("123.12,,2", sourceLog.Data[1].Data);
            Assert.Equal("data", sourceLog.Data[0].TypeName);
            Assert.Equal("data", sourceLog.Data[1].TypeName);
            Assert.Equal("Depth,DepthBit,DepthHole", sourceLog.MnemonicList);
            Assert.Equal("data", sourceLog.TypeName);
            Assert.Equal("m,m,m", sourceLog.UnitList);
        }

        [Fact]
        public void CalculateProgressBasedOnIndexTest_OK()
        {
            var log = CreateLog();
            string mnemonicList = "Depth,BPOS";
            var witmslLogData = GetTestLogData(mnemonicList);
            var result = LogWorkerTools.CalculateProgressBasedOnIndex(log, witmslLogData);
            Assert.Equal(0.5, result);
        }

        [Fact]
        public void GetUpdateLogDataQueriesTest_OK()
        {
            string mnemonicList = "Depth,BPOS";
            var witmslLogData = GetTestLogData(mnemonicList);
            var batchedQuueries = LogWorkerTools.GetUpdateLogDataQueries("uid",
                "uidwell", "uidwellbore", witmslLogData, 2, mnemonicList);
            Assert.Equal(5, batchedQuueries.Count);
        }

        private static WitsmlLog CreateLog()
        {
            return new WitsmlLog
            {
                UidWell = WellUid,
                UidWellbore = WellboreUid,
                Uid = LogUid,
                StartDateTimeIndex = "2023-04-19T00:00:00Z",
                EndDateTimeIndex = "2023-04-19T00:00:20Z",
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
