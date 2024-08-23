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
    public class ModifyTrajectoryWorkerTests
    {
        private readonly Mock<IWitsmlClient> _witsmlClient;
        private readonly ModifyObjectOnWellboreWorker _worker;
        private const string TrajectoryUid = "trajectoryUid";

        public ModifyTrajectoryWorkerTests()
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
        public async Task ModifyTrajectory_ValidResults()
        {
            const string expectedNewName = "NewName";
            ModifyObjectOnWellboreJob job = CreateJobTemplate(TrajectoryUid, expectedNewName);
            Trajectory trajectory = (Trajectory)job.Object;
            List<WitsmlTrajectories> updatedTrajectories = new();
            _witsmlClient.Setup(client => client.UpdateInStoreAsync(It.IsAny<IWitsmlQueryType>())).Callback<IWitsmlQueryType>(trajectories => updatedTrajectories.Add(trajectories as WitsmlTrajectories))
                .ReturnsAsync(new QueryResult(true));

            await _worker.Execute(job);

            Assert.Single(updatedTrajectories);
            Assert.Equal(expectedNewName, updatedTrajectories.First().Trajectories.First().Name);
            Assert.Equal(trajectory.ServiceCompany, updatedTrajectories.First().Trajectories.First().ServiceCompany);
            Assert.Equal(trajectory.AziRef, updatedTrajectories.First().Trajectories.First().AziRef);
            Assert.Equal(trajectory.CommonData.SourceName, updatedTrajectories.First().Trajectories.First().CommonData?.SourceName);
        }

        [Fact]
        public async Task RenameTrajectory_EmptyName_ThrowsException()
        {
            var expectedMessage = "Name cannot be empty";
            ModifyObjectOnWellboreJob job = CreateJobTemplate(TrajectoryUid, string.Empty);

            var (workerResult, _) = await _worker.Execute(job);

            Assert.False(workerResult.IsSuccess);
            Assert.Equal(expectedMessage, workerResult.Message);

            _witsmlClient.Verify(client => client.UpdateInStoreAsync(It.IsAny<IWitsmlQueryType>()), Times.Never);
        }

        private static ModifyObjectOnWellboreJob CreateJobTemplate(string uid, string name)
        {
            return new ModifyObjectOnWellboreJob
            {
                Object = new Trajectory
                {
                    WellUid = "wellUid",
                    WellboreUid = "wellboreUid",
                    Uid = uid,
                    Name = name,
                    ServiceCompany = "NewServiceCompany",
                    AziRef = "Grid North",
                    CommonData = new CommonData() { SourceName = "NewSourceName" }
                },
                ObjectType = EntityType.Trajectory
            };
        }
    }
}
