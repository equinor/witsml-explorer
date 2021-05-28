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
    public class CreateTrajecotryWorkerTests
    {
        private const string WellUid = "wellUid";
        private const string WellName = "wellName";
        private const string WellboreUid = "wellboreUid";
        private const string TrajectoryName = "trajectoryName";
        private readonly Mock<IWitsmlClient> witsmlClient;
        private readonly CreateTrajectoryWorker worker;

        public CreateTrajecotryWorkerTests()
        {
            var witsmlClientProvider = new Mock<IWitsmlClientProvider>();
            witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(witsmlClient.Object);
            worker = new CreateTrajectoryWorker(witsmlClientProvider.Object);
        }
      

        [Fact]
        public async Task ValidCreateTrajectoryJob_Execute()
        {
            var job = CreateJobTemplate();

            var createdTrajectories = new List<WitsmlTrajectories>();
            witsmlClient.Setup(client =>
                    client.AddToStoreAsync(It.IsAny<WitsmlTrajectories>(), It.IsAny<OptionsIn>()))
                .Callback<WitsmlTrajectories, OptionsIn>((trajectories, optionsIn) => createdTrajectories.Add(trajectories))
                .ReturnsAsync(new QueryResult(true));
            witsmlClient.Setup(client => client.GetFromStoreAsync(It.IsAny<WitsmlTrajectories>(), It.IsAny<OptionsIn>()))
                .ReturnsAsync(new WitsmlTrajectories() { Trajectories = new List<WitsmlTrajectory>() { new WitsmlTrajectory() }});

            await worker.Execute(job);

            Assert.Single(createdTrajectories);
            Assert.Single(createdTrajectories.First().Trajectories);
            var createdTrajectory = createdTrajectories.First().Trajectories.First();
            Assert.Equal(TrajectoryName, createdTrajectory.Name);
            Assert.Equal(WellUid, createdTrajectory.UidWell);
            Assert.Equal(WellName, createdTrajectory.NameWell);
        }

        private static CreateTrajectoryJob CreateJobTemplate(string uid = WellboreUid, string name = TrajectoryName,
            string wellUid = WellUid, string wellName = WellName)
        {
            var tStations = new List<TrajectoryStation>();
            return new CreateTrajectoryJob
            {
                Trajectory = new Trajectory
                {
                    Uid = uid,
                    Name = name,
                    WellUid = wellUid,
                    NameWell = wellName,
                    CommonData = new CommonData
                    {
                        ItemState = "plan",
                        SourceName = "SourceName"
                    },
                    TrajectoryStations = tStations

                }
            };
        }
    }
}
