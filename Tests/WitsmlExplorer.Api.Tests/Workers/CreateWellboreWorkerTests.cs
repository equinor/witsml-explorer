using System;
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
    public class CreateWellboreWorkerTests
    {
        private const string WellUid = "wellUid";
        private const string WellName = "wellName";
        private const string WellboreUid = "wellboreUid";
        private const string WellboreName = "wellboreName";
        private readonly Mock<IWitsmlClient> _witsmlClient;
        private readonly CreateWellboreWorker _worker;

        public CreateWellboreWorkerTests()
        {
            Mock<IWitsmlClientProvider> witsmlClientProvider = new();
            _witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_witsmlClient.Object);
            ILoggerFactory loggerFactory = new LoggerFactory();
            loggerFactory.AddSerilog(Log.Logger);
            ILogger<CreateWellboreJob> logger = loggerFactory.CreateLogger<CreateWellboreJob>();
            _worker = new CreateWellboreWorker(logger, witsmlClientProvider.Object);
        }

        [Fact]
        public async Task MissingUid_Execute_ThrowsException()
        {
            CreateWellboreJob job = CreateJobTemplate(null);
            InvalidOperationException exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _worker.Execute(job));
            Assert.Equal("Uid cannot be empty", exception.Message);
            job = CreateJobTemplate(string.Empty);
            exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _worker.Execute(job));
            Assert.Equal("Uid cannot be empty", exception.Message);
            _witsmlClient.Verify(client => client.AddToStoreAsync(It.IsAny<WitsmlWells>()), Times.Never);
        }

        [Fact]
        public async Task MissingName_Execute_ThrowsException()
        {
            CreateWellboreJob job = CreateJobTemplate(name: null);
            InvalidOperationException exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _worker.Execute(job));
            Assert.Equal("Name cannot be empty", exception.Message);
            job = CreateJobTemplate(name: string.Empty);
            exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _worker.Execute(job));
            Assert.Equal("Name cannot be empty", exception.Message);
            _witsmlClient.Verify(client => client.AddToStoreAsync(It.IsAny<WitsmlWells>()), Times.Never);
        }

        [Fact]
        public async Task MissingWellUid_Execute_ThrowsException()
        {
            CreateWellboreJob job = CreateJobTemplate(wellUid: null);
            InvalidOperationException exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _worker.Execute(job));
            Assert.Equal("WellUid cannot be empty", exception.Message);
            job = CreateJobTemplate(wellUid: string.Empty);
            exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _worker.Execute(job));
            Assert.Equal("WellUid cannot be empty", exception.Message);
            _witsmlClient.Verify(client => client.AddToStoreAsync(It.IsAny<WitsmlWells>()), Times.Never);
        }

        [Fact]
        public async Task MissingWellName_Execute_ThrowsException()
        {
            CreateWellboreJob job = CreateJobTemplate(wellName: null);
            InvalidOperationException exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _worker.Execute(job));
            Assert.Equal("WellName cannot be empty", exception.Message);
            job = CreateJobTemplate(wellName: string.Empty);
            exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _worker.Execute(job));
            Assert.Equal("WellName cannot be empty", exception.Message);
            _witsmlClient.Verify(client => client.AddToStoreAsync(It.IsAny<WitsmlWells>()), Times.Never);
        }

        [Fact]
        public async Task ValidCreateWellboreJob_Execute_StoresWellboreCorrectly()
        {
            CreateWellboreJob job = CreateJobTemplate();

            List<WitsmlWellbores> createdWellbores = new();
            _witsmlClient.Setup(client =>
                    client.AddToStoreAsync(It.IsAny<WitsmlWellbores>()))
                .Callback<WitsmlWellbores>(wellbores => createdWellbores.Add(wellbores))
                .ReturnsAsync(new QueryResult(true));
            _witsmlClient.Setup(client => client.GetFromStoreAsync(It.IsAny<WitsmlWellbores>(), It.IsAny<OptionsIn>(), null))
                .ReturnsAsync(new WitsmlWellbores { Wellbores = new List<WitsmlWellbore> { new WitsmlWellbore() } });

            await _worker.Execute(job);

            Assert.Single(createdWellbores);
            Assert.Single(createdWellbores.First().Wellbores);
            WitsmlWellbore createdWellbore = createdWellbores.First().Wellbores.First();
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
