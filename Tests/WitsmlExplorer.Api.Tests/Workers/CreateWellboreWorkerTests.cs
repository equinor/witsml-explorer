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
    public class CreateWellboreWorkerTests
    {
        private const string WellUid = "wellUid";
        private const string WellName = "wellName";
        private const string WellboreUid = "wellboreUid";
        private const string WellboreName = "wellboreName";
        private readonly Mock<IWitsmlClient> witsmlClient;
        private readonly CreateWellboreWorker worker;

        public CreateWellboreWorkerTests()
        {
            var witsmlClientProvider = new Mock<IWitsmlClientProvider>();
            witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(witsmlClient.Object);
            worker = new CreateWellboreWorker(witsmlClientProvider.Object);
        }

        [Fact]
        public async Task MissingUid_Execute_ThrowsException()
        {
            var job = CreateJobTemplate(null);
            var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => worker.Execute(job));
            Assert.Equal("Uid cannot be empty", exception.Message);
            job = CreateJobTemplate("");
            exception = await Assert.ThrowsAsync<InvalidOperationException>(() => worker.Execute(job));
            Assert.Equal("Uid cannot be empty", exception.Message);
            witsmlClient.Verify(client => client.AddToStoreAsync(It.IsAny<WitsmlWells>()), Times.Never);
        }

        [Fact]
        public async Task MissingName_Execute_ThrowsException()
        {
            var job = CreateJobTemplate(name: null);
            var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => worker.Execute(job));
            Assert.Equal("Name cannot be empty", exception.Message);
            job = CreateJobTemplate(name: "");
            exception = await Assert.ThrowsAsync<InvalidOperationException>(() => worker.Execute(job));
            Assert.Equal("Name cannot be empty", exception.Message);
            witsmlClient.Verify(client => client.AddToStoreAsync(It.IsAny<WitsmlWells>()), Times.Never);
        }

        [Fact]
        public async Task MissingWellUid_Execute_ThrowsException()
        {
            var job = CreateJobTemplate(wellUid: null);
            var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => worker.Execute(job));
            Assert.Equal("WellUid cannot be empty", exception.Message);
            job = CreateJobTemplate(wellUid: "");
            exception = await Assert.ThrowsAsync<InvalidOperationException>(() => worker.Execute(job));
            Assert.Equal("WellUid cannot be empty", exception.Message);
            witsmlClient.Verify(client => client.AddToStoreAsync(It.IsAny<WitsmlWells>()), Times.Never);
        }

        [Fact]
        public async Task MissingWellName_Execute_ThrowsException()
        {
            var job = CreateJobTemplate(wellName: null);
            var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => worker.Execute(job));
            Assert.Equal("WellName cannot be empty", exception.Message);
            job = CreateJobTemplate(wellName: "");
            exception = await Assert.ThrowsAsync<InvalidOperationException>(() => worker.Execute(job));
            Assert.Equal("WellName cannot be empty", exception.Message);
            witsmlClient.Verify(client => client.AddToStoreAsync(It.IsAny<WitsmlWells>()), Times.Never);
        }

        [Fact]
        public async Task ValidCreateWellboreJob_Execute_StoresWellboreCorrectly()
        {
            var job = CreateJobTemplate();

            var createdWellbores = new List<WitsmlWellbores>();
            witsmlClient.Setup(client =>
                    client.AddToStoreAsync(It.IsAny<WitsmlWellbores>()))
                .Callback<WitsmlWellbores>(wellbores => createdWellbores.Add(wellbores))
                .ReturnsAsync(new QueryResult(true));
            witsmlClient.Setup(client => client.GetFromStoreAsync(It.IsAny<WitsmlWellbores>(), It.IsAny<OptionsIn>()))
                .ReturnsAsync(new WitsmlWellbores { Wellbores = new List<WitsmlWellbore> { new WitsmlWellbore() }});

            await worker.Execute(job);

            Assert.Single(createdWellbores);
            Assert.Single(createdWellbores.First().Wellbores);
            var createdWellbore = createdWellbores.First().Wellbores.First();
            Assert.Equal(WellboreUid, createdWellbore.Uid);
            Assert.Equal(WellboreName, createdWellbore.Name);
            Assert.Equal(WellUid, createdWellbore.UidWell);
            Assert.Equal(WellName, createdWellbore.NameWell);
        }

        private static CreateWellboreJob CreateJobTemplate(string uid = WellboreUid, string name = WellboreName,
            string wellUid = WellUid, string wellName = WellName)
        {
            return new CreateWellboreJob
            {
                Wellbore = new Wellbore
                {
                    Uid = uid,
                    Name = name,
                    WellUid = wellUid,
                    WellName = wellName
                }
            };
        }
    }
}
