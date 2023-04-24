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
        private readonly ModifyFormationMarkerWorker _worker;
        private const string FormationMarkerUid = "uid";

        public ModifyFormationMarkerWorkerTests()
        {
            Mock<IWitsmlClientProvider> witsmlClientProvider = new();
            _witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_witsmlClient.Object);
            ILoggerFactory loggerFactory = new LoggerFactory();
            loggerFactory.AddSerilog(Log.Logger);
            ILogger<ModifyFormationMarkerJob> logger = loggerFactory.CreateLogger<ModifyFormationMarkerJob>();
            _worker = new ModifyFormationMarkerWorker(logger, witsmlClientProvider.Object);
        }

        [Fact]
        public async Task Execute_ValidNewName_NameModified()
        {
            const string expectedNewName = "NewName";
            ModifyFormationMarkerJob job = CreateJobTemplate(FormationMarkerUid, expectedNewName);

            List<WitsmlFormationMarkers> updatedFormationMarkers = new();
            _witsmlClient.Setup(client =>
                client.UpdateInStoreAsync(It.IsAny<WitsmlFormationMarkers>())).Callback<WitsmlFormationMarkers>(updatedFormationMarkers.Add)
                .ReturnsAsync(new QueryResult(true));

            await _worker.Execute(job);

            Assert.Single(updatedFormationMarkers);
            Assert.Equal(expectedNewName, updatedFormationMarkers.First().FormationMarkers.First().Name);
        }

        [Fact]
        public async Task Execute_EmptyNewName_ThrowsException()
        {
            ModifyFormationMarkerJob job = CreateJobTemplate(FormationMarkerUid, "");

            InvalidOperationException exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _worker.Execute(job));
            Assert.Equal("Name cannot be empty", exception.Message);

            _witsmlClient.Verify(client => client.UpdateInStoreAsync(It.IsAny<WitsmlFormationMarkers>()), Times.Never);
        }

        private static ModifyFormationMarkerJob CreateJobTemplate(string uid, string name)
        {
            return new ModifyFormationMarkerJob
            {
                FormationMarker = new FormationMarker
                {
                    Uid = uid,
                    WellboreUid = "wellboreUid",
                    WellUid = "wellUid",
                    Name = name,
                }
            };
        }
    }
}
