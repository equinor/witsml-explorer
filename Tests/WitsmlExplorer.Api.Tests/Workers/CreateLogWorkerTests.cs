using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Moq;
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
    public class CreateLogWorkerTests
    {
        private const string LogUid = "8cfad887-3e81-40f0-9034-178be642df65";
        private const string LogName = "Test log";
        private const string WellUid = "W-5209671";
        private const string WellName = "NO 34/10-A-25 C";
        private const string WellboreUid = "B-5209671";
        private const string WellboreName = "NO 34/10-A-25 C - Main Wellbore";
        private readonly Mock<IWitsmlClient> witsmlClient;
        private readonly CreateLogWorker worker;

        public CreateLogWorkerTests()
        {
            var witsmlClientProvider = new Mock<IWitsmlClientProvider>();
            witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(witsmlClient.Object);
            worker = new CreateLogWorker(witsmlClientProvider.Object);
        }

        [Fact]
        public async Task CreateDepthIndexedLog_OK()
        {
            var job = CreateJobTemplate();
            SetupGetWellbore();
            var createdLogs = new List<WitsmlLogs>();
            witsmlClient.Setup(client =>
                    client.AddToStoreAsync(It.IsAny<WitsmlLogs>()))
                .Callback<WitsmlLogs>(logs => createdLogs.Add(logs))
                .ReturnsAsync(new QueryResult(true));

            await worker.Execute(job);

            Assert.Single(createdLogs);
            Assert.Single(createdLogs.First().Logs);
            var createdLog = createdLogs.First().Logs.First();
            Assert.Equal(LogUid, createdLog.Uid);
            Assert.Equal(LogName, createdLog.Name);
            Assert.Equal(WellboreUid, createdLog.UidWellbore);
            Assert.Equal(WellboreName, createdLog.NameWellbore);
            Assert.Equal(WellUid, createdLog.UidWell);
            Assert.Equal(WellName, createdLog.NameWell);
            var indexLogCurve = createdLog.LogCurveInfo.First();
            Assert.Equal("Depth", indexLogCurve.Mnemonic);
            Assert.Equal("m", indexLogCurve.Unit);
        }

        [Fact]
        public async Task CreateTimeIndexedLog_OK()
        {
            var job = CreateJobTemplate("Time");
            SetupGetWellbore();
            var createdLogs = new List<WitsmlLogs>();
            witsmlClient.Setup(client =>
                    client.AddToStoreAsync(It.IsAny<WitsmlLogs>()))
                .Callback<WitsmlLogs>(logs => createdLogs.Add(logs))
                .ReturnsAsync(new QueryResult(true));

            await worker.Execute(job);

            Assert.Single(createdLogs);
            Assert.Single(createdLogs.First().Logs);
            var createdLog = createdLogs.First().Logs.First();
            Assert.Equal(LogUid, createdLog.Uid);
            Assert.Equal(LogName, createdLog.Name);
            Assert.Equal(WellboreUid, createdLog.UidWellbore);
            Assert.Equal(WellboreName, createdLog.NameWellbore);
            Assert.Equal(WellUid, createdLog.UidWell);
            Assert.Equal(WellName, createdLog.NameWell);
            var indexLogCurve = createdLog.LogCurveInfo.First();
            Assert.Equal("Time", indexLogCurve.Mnemonic);
            Assert.Equal("s", indexLogCurve.Unit);
        }

        [Fact]
        public async Task CreateTimeIndexedLog_UseTimeAsIndexIfUnknown()
        {
            var job = CreateJobTemplate("strange");
            SetupGetWellbore();
            var createdLogs = new List<WitsmlLogs>();
            witsmlClient.Setup(client =>
                    client.AddToStoreAsync(It.IsAny<WitsmlLogs>()))
                .Callback<WitsmlLogs>(logs => createdLogs.Add(logs))
                .ReturnsAsync(new QueryResult(true));

            await worker.Execute(job);
            var createdLog = createdLogs.First().Logs.First();
            var indexLogCurve = createdLog.LogCurveInfo.First();
            Assert.Equal("Time", indexLogCurve.Mnemonic);
            Assert.Equal("s", indexLogCurve.Unit);
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
            witsmlClient.Setup(client =>
                    client.GetFromStoreAsync(It.IsAny<WitsmlWellbores>(), new OptionsIn(ReturnElements.Requested, null)))
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
