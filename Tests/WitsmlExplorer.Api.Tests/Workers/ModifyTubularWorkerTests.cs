using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Moq;

using Serilog;

using Witsml;
using Witsml.Data.Tubular;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers.Modify;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Workers
{
    public class ModifyTubularWorkerTests
    {
        private readonly Mock<IWitsmlClient> _witsmlClient;
        private readonly ModifyTubularWorker _worker;
        private const string TubularUid = "tubularUid";

        public ModifyTubularWorkerTests()
        {
            Mock<IWitsmlClientProvider> witsmlClientProvider = new();
            _witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_witsmlClient.Object);
            ILoggerFactory loggerFactory = new LoggerFactory();
            loggerFactory.AddSerilog(Log.Logger);
            ILogger<ModifyTubularJob> logger = loggerFactory.CreateLogger<ModifyTubularJob>();
            _worker = new ModifyTubularWorker(logger, witsmlClientProvider.Object);
        }

        [Fact]
        public async Task RenameTubular()
        {
            const string expectedNewName = "NewName";
            const string expectedNewType = "drilling";
            ModifyTubularJob job = CreateJobTemplate(TubularUid, expectedNewName, expectedNewType);

            List<WitsmlTubulars> updatedTubulars = new();
            _witsmlClient.Setup(client =>
                client.UpdateInStoreAsync(It.IsAny<WitsmlTubulars>())).Callback<WitsmlTubulars>(tubulars => updatedTubulars.Add(tubulars))
                .ReturnsAsync(new QueryResult(true));

            await _worker.Execute(job);

            Assert.Single(updatedTubulars);
            Assert.Equal(expectedNewName, updatedTubulars.First().Tubulars.First().Name);
            Assert.Equal(expectedNewType, updatedTubulars.First().Tubulars.First().TypeTubularAssy);
        }

        [Fact]
        public async Task RenameTubular_EmptyName_ThrowsException()
        {
            ModifyTubularJob job = CreateJobTemplate(TubularUid, "");

            InvalidOperationException exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _worker.Execute(job));
            Assert.Equal("Name cannot be empty", exception.Message);

            _witsmlClient.Verify(client => client.UpdateInStoreAsync(It.IsAny<WitsmlTubulars>()), Times.Never);
        }

        private static ModifyTubularJob CreateJobTemplate(string uid, string name, string type = null)
        {
            return new ModifyTubularJob
            {
                Tubular = new Tubular
                {
                    Uid = uid,
                    Name = name,
                    TypeTubularAssy = type
                }
            };
        }
    }
}
