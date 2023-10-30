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
        private readonly ModifyTrajectoryWorker _worker;
        private const string TrajectoryUid = "trajectoryUid";

        public ModifyTrajectoryWorkerTests()
        {
            Mock<IWitsmlClientProvider> witsmlClientProvider = new();
            _witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_witsmlClient.Object);
            ILoggerFactory loggerFactory = new LoggerFactory();
            loggerFactory.AddSerilog(Log.Logger);
            ILogger<ModifyTrajectoryJob> logger = loggerFactory.CreateLogger<ModifyTrajectoryJob>();
            _worker = new ModifyTrajectoryWorker(logger, witsmlClientProvider.Object);
        }

        [Fact]
        public async Task ModifyTrajectory_ValidResults()
        {
            const string expectedNewName = "NewName";
            ModifyTrajectoryJob job = CreateJobTemplate(TrajectoryUid, expectedNewName);

            List<WitsmlTrajectories> updatedTrajectories = new();
            _witsmlClient.Setup(client =>
                    client.UpdateInStoreAsync(It.IsAny<WitsmlTrajectories>())).Callback<WitsmlTrajectories>(trajectories => updatedTrajectories.Add(trajectories))
                .ReturnsAsync(new QueryResult(true));

            await _worker.Execute(job);

            Assert.Single(updatedTrajectories);
            Assert.Equal(expectedNewName, updatedTrajectories.First().Trajectories.First().Name);
            Assert.Equal(job.Trajectory.ServiceCompany, updatedTrajectories.First().Trajectories.First().ServiceCompany);
            Assert.Equal(job.Trajectory.AziRef, updatedTrajectories.First().Trajectories.First().AziRef);
            Assert.Equal(job.Trajectory.SourceName, updatedTrajectories.First().Trajectories.First().CommonData?.SourceName);
        }

        [Fact]
        public async Task RenameTrajectory_EmptyName_ThrowsException()
        {
            var expectedMessage = "Name cannot be empty";
            ModifyTrajectoryJob job = CreateJobTemplate(TrajectoryUid, "");

            InvalidOperationException exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _worker.Execute(job));
            Assert.Equal(expectedMessage, exception.Message);

            _witsmlClient.Verify(client => client.UpdateInStoreAsync(It.IsAny<WitsmlTrajectories>()), Times.Never);
        }

        private static ModifyTrajectoryJob CreateJobTemplate(string uid, string name)
        {
            return new ModifyTrajectoryJob
            {
                Trajectory = new Trajectory
                {
                    Uid = uid,
                    Name = name,
                    ServiceCompany = "NewServiceCompany",
                    SourceName = "NewSourceName",
                    AziRef = "GridNorth"
                }
            };
        }
    }
}
