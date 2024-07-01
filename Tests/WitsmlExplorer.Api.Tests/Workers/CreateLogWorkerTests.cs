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
using WitsmlExplorer.Api.Workers.Create;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Workers
{
    public class CreateLogWorkerTests
    {
        private const string LogUid = "8cfad887-3e81-40f0-9034-178be642df65";
        private const string LogName = "Test log";
        private const string WellUid = "W-5209671";
        private const string WellName = "NO 34/10-A-25 C";
        private const string WellboreUid = "B-5209671";
        private const string WellboreName = "NO 34/10-A-25 C - Main Wellbore";
        private readonly Mock<IWitsmlClient> _witsmlClient;
        private readonly CreateObjectOnWellboreWorker _worker;

        public CreateLogWorkerTests()
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
        public async Task CreateDepthIndexedLog_OK()
        {
            CreateObjectOnWellboreJob job = CreateJobTemplate(WitsmlLog.WITSML_INDEX_TYPE_MD);
            List<WitsmlLogs> createdLogs = new();
            _witsmlClient.Setup(client =>
                    client.AddToStoreAsync(It.IsAny<IWitsmlQueryType>()))
                .Callback<IWitsmlQueryType>(logs => createdLogs.Add(logs as WitsmlLogs))
                .ReturnsAsync(new QueryResult(true));

            await _worker.Execute(job);

            Assert.Single(createdLogs);
            Assert.Single(createdLogs.First().Logs);
            WitsmlLog createdLog = createdLogs.First().Logs.First();
            Assert.Equal(LogUid, createdLog.Uid);
            Assert.Equal(LogName, createdLog.Name);
            Assert.Equal(WellboreUid, createdLog.UidWellbore);
            Assert.Equal(WellboreName, createdLog.NameWellbore);
            Assert.Equal(WellUid, createdLog.UidWell);
            Assert.Equal(WellName, createdLog.NameWell);
            WitsmlLogCurveInfo indexLogCurve = createdLog.LogCurveInfo.First();
            Assert.Equal("Depth", indexLogCurve.Mnemonic);
            Assert.Equal(CommonConstants.Unit.Meter, indexLogCurve.Unit);
        }

        [Fact]
        public async Task CreateTimeIndexedLog_OK()
        {
            CreateObjectOnWellboreJob job = CreateJobTemplate(WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME);
            List<WitsmlLogs> createdLogs = new();
            _witsmlClient.Setup(client =>
                    client.AddToStoreAsync(It.IsAny<IWitsmlQueryType>()))
                .Callback<IWitsmlQueryType>(logs => createdLogs.Add(logs as WitsmlLogs))
                .ReturnsAsync(new QueryResult(true));

            await _worker.Execute(job);

            Assert.Single(createdLogs);
            Assert.Single(createdLogs.First().Logs);
            WitsmlLog createdLog = createdLogs.First().Logs.First();
            Assert.Equal(LogUid, createdLog.Uid);
            Assert.Equal(LogName, createdLog.Name);
            Assert.Equal(WellboreUid, createdLog.UidWellbore);
            Assert.Equal(WellboreName, createdLog.NameWellbore);
            Assert.Equal(WellUid, createdLog.UidWell);
            Assert.Equal(WellName, createdLog.NameWell);
            WitsmlLogCurveInfo indexLogCurve = createdLog.LogCurveInfo.First();
            Assert.Equal("Time", indexLogCurve.Mnemonic);
            Assert.Equal(CommonConstants.Unit.Second, indexLogCurve.Unit);
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
