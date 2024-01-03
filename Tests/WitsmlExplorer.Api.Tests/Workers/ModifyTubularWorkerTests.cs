using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Moq;

using Serilog;

using Witsml;
using Witsml.Data;
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
        private readonly ModifyObjectOnWellboreWorker _worker;
        private const string TubularUid = "tubularUid";

        public ModifyTubularWorkerTests()
        {
            Mock<IWitsmlClientProvider> witsmlClientProvider = new();
            _witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_witsmlClient.Object);
            ILoggerFactory loggerFactory = new LoggerFactory();
            loggerFactory.AddSerilog(Log.Logger);
            ILogger<ModifyObjectOnWellboreJob> logger = loggerFactory.CreateLogger<ModifyObjectOnWellboreJob>();
            _worker = new ModifyObjectOnWellboreWorker(logger, witsmlClientProvider.Object);
        }

        [Fact]
        public async Task RenameTubular()
        {
            const string expectedNewName = "NewName";
            const string expectedNewType = "drilling";
            ModifyObjectOnWellboreJob job = CreateJobTemplate(TubularUid, expectedNewName, expectedNewType);

            List<WitsmlTubulars> updatedTubulars = new();
            _witsmlClient.Setup(client =>
                client.UpdateInStoreAsync(It.IsAny<IWitsmlQueryType>())).Callback<IWitsmlQueryType>(tubulars => updatedTubulars.Add(tubulars as WitsmlTubulars))
                .ReturnsAsync(new QueryResult(true));

            await _worker.Execute(job);

            Assert.Single(updatedTubulars);
            Assert.Equal(expectedNewName, updatedTubulars.First().Tubulars.First().Name);
            Assert.Equal(expectedNewType, updatedTubulars.First().Tubulars.First().TypeTubularAssy);
        }

        [Fact]
        public async Task RenameTubular_EmptyName_ThrowsException()
        {
            ModifyObjectOnWellboreJob job = CreateJobTemplate(TubularUid, string.Empty);

            var (workerResult, _) = await _worker.Execute(job);

            Assert.False(workerResult.IsSuccess);
            Assert.Equal("Name cannot be empty", workerResult.Message);

            _witsmlClient.Verify(client => client.UpdateInStoreAsync(It.IsAny<IWitsmlQueryType>()), Times.Never);
        }

        private static ModifyObjectOnWellboreJob CreateJobTemplate(string uid, string name, string type = null)
        {
            return new ModifyObjectOnWellboreJob
            {
                Object = new Tubular
                {
                    WellUid = "wellUid",
                    WellboreUid = "wellboreUid",
                    Uid = uid,
                    Name = name,
                    TypeTubularAssy = type
                },
                ObjectType = EntityType.Tubular
            };
        }
    }
}
