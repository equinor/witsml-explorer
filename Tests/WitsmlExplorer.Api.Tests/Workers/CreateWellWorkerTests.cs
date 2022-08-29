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
using WitsmlExplorer.Api.Workers;
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
        private readonly Mock<IWitsmlClient> _witsmlClient;
        private readonly CreateWellWorker _worker;

        public CreateWellWorkerTests()
        {
            var witsmlClientProvider = new Mock<IWitsmlClientProvider>();
            _witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_witsmlClient.Object);
            var loggerFactory = (ILoggerFactory)new LoggerFactory();
            loggerFactory.AddSerilog(Log.Logger);
            var logger = loggerFactory.CreateLogger<CreateWellJob>();
            _worker = new CreateWellWorker(logger, witsmlClientProvider.Object);
        }

        [Fact]
        public async Task MissingUid_Execute_ThrowsException()
        {
            var job = CreateJobTemplate(null);
            var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _worker.Execute(job));
            Assert.Equal("Uid cannot be empty", exception.Message);
            job = CreateJobTemplate("");
            exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _worker.Execute(job));
            Assert.Equal("Uid cannot be empty", exception.Message);
            _witsmlClient.Verify(client => client.AddToStoreAsync(It.IsAny<WitsmlWells>()), Times.Never);
        }

        [Fact]
        public async Task MissingName_Execute_ThrowsException()
        {
            var job = CreateJobTemplate(name: null);
            var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _worker.Execute(job));
            Assert.Equal("Name cannot be empty", exception.Message);
            job = CreateJobTemplate(name: "");
            exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _worker.Execute(job));
            Assert.Equal("Name cannot be empty", exception.Message);
            _witsmlClient.Verify(client => client.AddToStoreAsync(It.IsAny<WitsmlWells>()), Times.Never);
        }

        [Fact]
        public async Task MissingTimeZone_Execute_ThrowsException()
        {
            var job = CreateJobTemplate(timeZone: null);
            var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _worker.Execute(job));
            Assert.Equal("TimeZone cannot be empty", exception.Message);
            job = CreateJobTemplate(timeZone: "");
            exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _worker.Execute(job));
            Assert.Equal("TimeZone cannot be empty", exception.Message);
            _witsmlClient.Verify(client => client.AddToStoreAsync(It.IsAny<WitsmlWells>()), Times.Never);
        }

        [Fact]
        public async Task ValidCreateWellJob_Execute_StoresWellCorrectly()
        {
            var job = CreateJobTemplate();

            var createdWells = new List<WitsmlWells>();
            _witsmlClient.Setup(client =>
                client.AddToStoreAsync(It.IsAny<WitsmlWells>()))
                .Callback<WitsmlWells>(wells => createdWells.Add(wells))
                .ReturnsAsync(new QueryResult(true));
            _witsmlClient.Setup(client => client.GetFromStoreAsync(It.IsAny<WitsmlWells>(), It.IsAny<OptionsIn>()))
                .ReturnsAsync(new WitsmlWells() { Wells = new List<WitsmlWell>() { new WitsmlWell() } });

            await _worker.Execute(job);

            Assert.Single(createdWells);
            Assert.Single(createdWells.First().Wells);
            var createdWell = createdWells.First().Wells.First();
            Assert.Equal(WellUid, createdWell.Uid);
            Assert.Equal(WellName, createdWell.Name);
            Assert.Equal(Field, createdWell.Field);
            Assert.Equal(Country, createdWell.Country);
            Assert.Equal(Operator, createdWell.Operator);
            Assert.Equal(TimeZone, createdWell.TimeZone);
        }

        private static CreateWellJob CreateJobTemplate(string uid = WellUid, string name = WellName, string timeZone = TimeZone,
            string field = Field, string country = Country, string @operator = Operator)
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
                    TimeZone = timeZone
                }
            };
        }
    }
}
