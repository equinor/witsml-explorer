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
    public class CreateWellWorkerTests
    {
        private const string WellUid = "wellUid";
        private const string WellName = "wellName";
        private const string TimeZone = "+02:00";
        private const string Field = "SomeField";
        private const string Country = "Norway";
        private const string Operator = "Equinor";
        private const string NumLicense = "123";
        private readonly Mock<IWitsmlClient> _witsmlClient;
        private readonly CreateWellWorker _worker;

        public CreateWellWorkerTests()
        {
            Mock<IWitsmlClientProvider> witsmlClientProvider = new();
            _witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_witsmlClient.Object);
            ILoggerFactory loggerFactory = new LoggerFactory();
            loggerFactory.AddSerilog(Log.Logger);
            ILogger<CreateWellJob> logger = loggerFactory.CreateLogger<CreateWellJob>();
            _worker = new CreateWellWorker(logger, witsmlClientProvider.Object);
        }

        [Fact]
        public async Task MissingUid_Execute_ThrowsException()
        {
            CreateWellJob job = CreateJobTemplate(null);
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
            CreateWellJob job = CreateJobTemplate(name: null);
            InvalidOperationException exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _worker.Execute(job));
            Assert.Equal("Name cannot be empty", exception.Message);
            job = CreateJobTemplate(name: string.Empty);
            exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _worker.Execute(job));
            Assert.Equal("Name cannot be empty", exception.Message);
            _witsmlClient.Verify(client => client.AddToStoreAsync(It.IsAny<WitsmlWells>()), Times.Never);
        }

        [Fact]
        public async Task MissingTimeZone_Execute_ThrowsException()
        {
            CreateWellJob job = CreateJobTemplate(timeZone: null);
            InvalidOperationException exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _worker.Execute(job));
            Assert.Equal("TimeZone cannot be empty", exception.Message);
            job = CreateJobTemplate(timeZone: string.Empty);
            exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _worker.Execute(job));
            Assert.Equal("TimeZone cannot be empty", exception.Message);
            _witsmlClient.Verify(client => client.AddToStoreAsync(It.IsAny<WitsmlWells>()), Times.Never);
        }

        [Fact]
        public async Task ValidCreateWellJob_Execute_StoresWellCorrectly()
        {
            CreateWellJob job = CreateJobTemplate();

            List<WitsmlWells> createdWells = new();
            _witsmlClient.Setup(client =>
                client.AddToStoreAsync(It.IsAny<WitsmlWells>()))
                .Callback<WitsmlWells>(createdWells.Add)
                .ReturnsAsync(new QueryResult(true));
            _witsmlClient.Setup(client => client.GetFromStoreAsync(It.IsAny<WitsmlWells>(), It.IsAny<OptionsIn>(), null))
                .ReturnsAsync(new WitsmlWells() { Wells = new List<WitsmlWell>() { new WitsmlWell() } });

            await _worker.Execute(job);

            Assert.Single(createdWells);
            Assert.Single(createdWells.First().Wells);
            WitsmlWell createdWell = createdWells.First().Wells.First();
            Assert.Equal(WellUid, createdWell.Uid);
            Assert.Equal(WellName, createdWell.Name);
            Assert.Equal(Field, createdWell.Field);
            Assert.Equal(Country, createdWell.Country);
            Assert.Equal(Operator, createdWell.Operator);
            Assert.Equal(NumLicense, createdWell.NumLicense);
            Assert.Equal(TimeZone, createdWell.TimeZone);
        }

        private static CreateWellJob CreateJobTemplate(string uid = WellUid, string name = WellName, string timeZone = TimeZone,
            string field = Field, string country = Country, string @operator = Operator, string numLicense = NumLicense)
        {
            return new CreateWellJob
            {
                Well = new Well
                {
                    Uid = uid,
                    Name = name,
                    Field = field,
                    Country = country,
                    Operator = @operator,
                    NumLicense = numLicense,
                    TimeZone = timeZone
                }
            };
        }
    }
}
