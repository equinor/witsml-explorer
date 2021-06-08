using System;
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
    public class CreateLogObjectWorkerTests
    {
        private const string WellUid = "wellUid";
        private const string WellName = "wellName";
        private const string WellboreUid = "wellboreUid";
        private const string LogName = "logName";
        private readonly Mock<IWitsmlClient> witsmlClient;
        private readonly CreateLogObjectWorker worker;

        public CreateLogObjectWorkerTests()
        {
            var witsmlClientProvider = new Mock<IWitsmlClientProvider>();
            witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(witsmlClient.Object);
            worker = new CreateLogObjectWorker(witsmlClientProvider.Object);
        }

      

        [Fact]
        public async Task ValidLogObjectJob_Execute()
        {
            var job = CreateJobTemplate();

            var createdlogs = new List<WitsmlLogs>();
            witsmlClient.Setup(client =>
                    client.AddToStoreAsync(It.IsAny<WitsmlLogs>(), It.IsAny<OptionsIn>()))
                .Callback<WitsmlLogs, OptionsIn>((logs, optionsIn) => createdlogs.Add(logs))
                .ReturnsAsync(new QueryResult(true));
            witsmlClient.Setup(client => client.GetFromStoreAsync(It.IsAny<WitsmlLogs>(), It.IsAny<OptionsIn>()))
                .ReturnsAsync(new WitsmlLogs() { Logs = new List<WitsmlLog>() { new WitsmlLog() }});

            await worker.Execute(job);

            Assert.Single(createdlogs);
            Assert.Single(createdlogs.First().Logs);
            var createdTrajectory = createdlogs.First().Logs.First();
            Assert.Equal(LogName, createdTrajectory.Name);
            Assert.Equal(WellUid, createdTrajectory.UidWell);
            Assert.Equal(WellName, createdTrajectory.NameWell);
        }

        private static CreateLogObjectJob CreateJobTemplate(string uid = WellboreUid, string name = LogName,
            string wellUid = WellUid, string wellName = WellName)
        {

            var curveInfos = new List<LogCurveInfo>();
            var logData = new LogData { DataCsv = new List<string>() { "1,2,3" } };
            return new CreateLogObjectJob
            {
                LogObject = new LogObject
                {
                    Uid = uid,
                    Name = name,
                    WellUid = wellUid,
                    WellName = wellName,
                    CommonData = new CommonData
                    {
                        ItemState = "plan",
                        SourceName = "SourceName"
                    },
                    LogCurveInfo = curveInfos,
                    LogData = logData
            
                }
            };
        }
    }
}
