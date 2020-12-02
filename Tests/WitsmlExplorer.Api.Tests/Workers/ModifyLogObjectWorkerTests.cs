using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Moq;
using Witsml;
using Witsml.Data;
using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;
using Xunit;

namespace WitsmlExplorer.Api.Tests.Workers
{
    public class ModifyLogObjectWorkerTests
    {
        private Mock<IWitsmlClient> witsmlClient;
        private ModifyLogObjectWorker worker;
        private const string WellUid = "wellUid";
        private const string WellboreUid = "wellboreUid";
        private const string LogUid = "logUid";

        public ModifyLogObjectWorkerTests()
        {
            var witsmlClientProvider = new Mock<IWitsmlClientProvider>();
            witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(witsmlClient.Object);
            worker = new ModifyLogObjectWorker(witsmlClientProvider.Object);
        }

        [Fact]
        public async Task RenameLogObject()
        {
            var expectedNewName = "NewName";
            var job = CreateJobTemplate();
            job.LogObject.Name = expectedNewName;

            var updatedLogs = new List<WitsmlLogs>();
            witsmlClient.Setup(client =>
                client.UpdateInStoreAsync(It.IsAny<WitsmlLogs>())).Callback<WitsmlLogs>(logs => updatedLogs.Add(logs))
                .ReturnsAsync(new QueryResult(true));

            await worker.Execute(job);

            Assert.Single(updatedLogs);
            Assert.Equal(expectedNewName, updatedLogs.First().Logs.First().Name);
        }

        [Fact]
        public async Task RenameLogObject_EmptyName_ThrowsException()
        {
            var job = CreateJobTemplate();
            job.LogObject.Name = "";

            var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => worker.Execute(job));
            Assert.Equal("Name cannot be empty", exception.Message);

            witsmlClient.Verify(client => client.UpdateInStoreAsync(It.IsAny<WitsmlLogs>()), Times.Never);
        }

        private ModifyLogObjectJob CreateJobTemplate()
        {
            return new ModifyLogObjectJob
            {
                LogObject = new LogObject
                {
                    WellUid = WellUid,
                    WellboreUid = WellboreUid,
                    Uid = LogUid
                }
            };
        }
    }
}
