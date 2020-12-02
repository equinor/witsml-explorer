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
    public class ModifyWellboreWorkerTests
    {
        private readonly Mock<IWitsmlClient> witsmlClient;
        private readonly ModifyWellboreWorker worker;
        private const string WellUid = "wellUid";
        private const string WellboreUid = "wellboreUid";

        public ModifyWellboreWorkerTests()
        {
            var witsmlClientProvider = new Mock<IWitsmlClientProvider>();
            witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(witsmlClient.Object);
            worker = new ModifyWellboreWorker(witsmlClientProvider.Object);
        }

        [Fact]
        public async Task RenameWellbore()
        {
            var expectedNewName = "NewName";
            var job = CreateJobTemplate();
            job.Wellbore.Name = expectedNewName;

            var updatedWellbores = new List<WitsmlWellbores>();
            witsmlClient.Setup(client =>
                client.UpdateInStoreAsync(It.IsAny<WitsmlWellbores>())).Callback<WitsmlWellbores>(wellbores => updatedWellbores.Add(wellbores))
                .ReturnsAsync(new QueryResult(true));

            await worker.Execute(job);

            Assert.Single(updatedWellbores);
            Assert.Equal(expectedNewName, updatedWellbores.First().Wellbores.First().Name);
        }

        [Fact]
        public async Task RenameWellbore_EmptyName_ThrowsException()
        {
            var job = CreateJobTemplate();
            job.Wellbore.Name = "";

            var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => worker.Execute(job));
            Assert.Equal("Name cannot be empty", exception.Message);

            witsmlClient.Verify(client => client.UpdateInStoreAsync(It.IsAny<WitsmlWellbores>()), Times.Never);
        }

        private ModifyWellboreJob CreateJobTemplate()
        {
            return new ModifyWellboreJob
            {
                Wellbore = new Wellbore
                {
                    WellUid = WellUid,
                    Uid = WellboreUid
                }
            };
        }
    }
}
