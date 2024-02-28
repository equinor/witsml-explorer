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
        private readonly CreateLogWorker _worker;

        public CreateLogWorkerTests()
        {
            Mock<IWitsmlClientProvider> witsmlClientProvider = new();
            _witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_witsmlClient.Object);
            ILoggerFactory loggerFactory = new LoggerFactory();
            loggerFactory.AddSerilog(Log.Logger);
            ILogger<CreateLogJob> logger = loggerFactory.CreateLogger<CreateLogJob>();
            _worker = new CreateLogWorker(logger, witsmlClientProvider.Object);
        }

        [Fact]
        public async Task CreateDepthIndexedLog_OK()
        {
            CreateLogJob job = CreateJobTemplate();
            SetupGetWellbore();
            List<WitsmlLogs> createdLogs = new();
            _witsmlClient.Setup(client =>
                    client.AddToStoreAsync(It.IsAny<WitsmlLogs>()))
                .Callback<WitsmlLogs>(createdLogs.Add)
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
            CreateLogJob job = CreateJobTemplate("Time");
            SetupGetWellbore();
            List<WitsmlLogs> createdLogs = new();
            _witsmlClient.Setup(client =>
                    client.AddToStoreAsync(It.IsAny<WitsmlLogs>()))
                .Callback<WitsmlLogs>(createdLogs.Add)
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

        [Fact]
        public async Task CreateTimeIndexedLog_UseTimeAsIndexIfUnknown()
        {
            CreateLogJob job = CreateJobTemplate("strange");
            SetupGetWellbore();
            List<WitsmlLogs> createdLogs = new();
            _witsmlClient.Setup(client =>
                    client.AddToStoreAsync(It.IsAny<WitsmlLogs>()))
                .Callback<WitsmlLogs>(createdLogs.Add)
                .ReturnsAsync(new QueryResult(true));

            await _worker.Execute(job);
            WitsmlLog createdLog = createdLogs.First().Logs.First();
            WitsmlLogCurveInfo indexLogCurve = createdLog.LogCurveInfo.First();
            Assert.Equal("Time", indexLogCurve.Mnemonic);
            Assert.Equal(CommonConstants.Unit.Second, indexLogCurve.Unit);
        }

        private static CreateLogJob CreateJobTemplate(string indexCurve = "Depth")
        {
            return new CreateLogJob
            {
                LogObject = new LogObject
                {
                    Uid = LogUid,
                    Name = LogName,
                    WellUid = WellUid,
                    WellboreUid = WellboreUid,
                    IndexCurve = indexCurve
                }
            };
        }

        private void SetupGetWellbore()
        {
            _witsmlClient.Setup(client =>
                    client.GetFromStoreAsync(It.IsAny<WitsmlWellbores>(), It.Is<OptionsIn>((ops) => ops.ReturnElements == ReturnElements.Requested)))
                .ReturnsAsync(new WitsmlWellbores
                {
                    Wellbores = new List<WitsmlWellbore>
                    {
                        new WitsmlWellbore
                        {
                            UidWell = WellUid,
                            Uid = WellboreUid,
                            Name = WellboreName,
                            NameWell = WellName
                        }
                    }
                });
        }
    }
}
