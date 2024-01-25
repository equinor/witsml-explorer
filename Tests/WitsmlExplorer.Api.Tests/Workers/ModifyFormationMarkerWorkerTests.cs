using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Moq;

using Serilog;

using Witsml;
using Witsml.Data;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers.Modify;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Workers
{
    public class ModifyFormationMarkerWorkerTests
    {
        private readonly Mock<IWitsmlClient> _witsmlClient;
        private readonly ModifyObjectOnWellboreWorker _worker;
        private const string FormationMarkerUid = "uid";

        public ModifyFormationMarkerWorkerTests()
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
        public async Task Execute_ValidNewName_NameModified()
        {
            const string expectedNewName = "NewName";
            ModifyObjectOnWellboreJob job = CreateJobTemplate(FormationMarkerUid, expectedNewName);

            List<WitsmlFormationMarkers> updatedFormationMarkers = new();
            _witsmlClient.Setup(client =>
                client.UpdateInStoreAsync(It.IsAny<IWitsmlQueryType>())).Callback<IWitsmlQueryType>(updatedFormationMarker => updatedFormationMarkers.Add(updatedFormationMarker as WitsmlFormationMarkers))
                .ReturnsAsync(new QueryResult(true));

            await _worker.Execute(job);

            Assert.Single(updatedFormationMarkers);
            Assert.Equal(expectedNewName, updatedFormationMarkers.First().FormationMarkers.First().Name);
        }

        [Fact]
        public async Task Execute_EmptyNewName_ThrowsException()
        {
            ModifyObjectOnWellboreJob job = CreateJobTemplate(FormationMarkerUid, string.Empty);

            var (workerResult, _) = await _worker.Execute(job);

            Assert.False(workerResult.IsSuccess);
            Assert.Equal("Name cannot be empty", workerResult.Message);

            _witsmlClient.Verify(client => client.UpdateInStoreAsync(It.IsAny<IWitsmlQueryType>()), Times.Never);
        }

        private static ModifyObjectOnWellboreJob CreateJobTemplate(string uid, string name)
        {
            return new ModifyObjectOnWellboreJob
            {
                Object = new FormationMarker
                {
                    Uid = uid,
                    WellboreUid = "wellboreUid",
                    WellUid = "wellUid",
                    Name = name,
                },
                ObjectType = EntityType.FormationMarker
            };
        }
    }
}
