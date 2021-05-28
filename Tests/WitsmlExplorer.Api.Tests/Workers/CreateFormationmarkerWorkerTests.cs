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
    public class CreateFormationMarkerWorkerTests
    {
        private const string WellUid = "wellUid";
        private const string WellName = "wellName";
        private const string WellboreUid = "wellboreUid";
        private const string Name = "name";
        private readonly Mock<IWitsmlClient> witsmlClient;
        private readonly CreateFormationMarkerWorker worker;

        public CreateFormationMarkerWorkerTests()
        {
            var witsmlClientProvider = new Mock<IWitsmlClientProvider>();
            witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(witsmlClient.Object);
            worker = new CreateFormationMarkerWorker(witsmlClientProvider.Object);
        }


        [Fact]
        public async Task ValidCreateFormationMarkerJob_Execute()
        {
            var job = CreateJobTemplate();

            var createdFormationMarkers = new List<WitsmlFormationMarkers>();
            witsmlClient.Setup(client =>
                    client.AddToStoreAsync(It.IsAny<WitsmlFormationMarkers>(), It.IsAny<OptionsIn>()))
                .Callback<WitsmlFormationMarkers, OptionsIn>((formationMarker, optionsIn) => createdFormationMarkers.Add(formationMarker))
                .ReturnsAsync(new QueryResult(true));
            witsmlClient.Setup(client => client.GetFromStoreAsync(It.IsAny<WitsmlFormationMarkers>(), It.IsAny<OptionsIn>()))
                .ReturnsAsync(new WitsmlFormationMarkers() { FormationMarkers = new List<WitsmlFormationMarker>() { new WitsmlFormationMarker() } });

            await worker.Execute(job);

            Assert.Single(createdFormationMarkers);
            Assert.Single(createdFormationMarkers.First().FormationMarkers);
            var createdFormationMarker = createdFormationMarkers.First().FormationMarkers.First();
            Assert.Equal(Name, createdFormationMarker.Name);
            Assert.Equal(WellUid, createdFormationMarker.UidWell);
            Assert.Equal(WellName, createdFormationMarker.NameWell);
        }

        private static CreateFormationMarkerJob CreateJobTemplate(string uid = WellboreUid, string name = Name,
            string wellUid = WellUid, string wellName = WellName)
        {

            return new CreateFormationMarkerJob
            {
                FormationMarker = new FormationMarker
                {
                    Uid = uid,
                    NameFormation = name,
                    UidWell = wellUid,
                    NameWell = wellName,
                    MdTopSample = "1",
                    TvdTopSample = "2",
                    CommonData = new CommonData
                    {
                        ItemState = "model",
                        SourceName = "SourceName"
                    }
                }
            };
        }
    }
}
