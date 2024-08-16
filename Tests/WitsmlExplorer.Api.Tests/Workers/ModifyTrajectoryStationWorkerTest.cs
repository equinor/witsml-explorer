using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Moq;

using Serilog;

using Witsml;
using Witsml.Data;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Models.Measure;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers.Modify;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Workers
{
    public class ModifyTrajectoryStationWorkerTest
    {
        private readonly Mock<IWitsmlClient> _witsmlClient;
        private readonly ModifyTrajectoryStationWorker _worker;

        public ModifyTrajectoryStationWorkerTest()
        {
            Mock<IWitsmlClientProvider> witsmlClientProvider = new();
            _witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_witsmlClient.Object);
            ILoggerFactory loggerFactory = new LoggerFactory();
            loggerFactory.AddSerilog(Log.Logger);
            ILogger<ModifyTrajectoryStationJob> logger = loggerFactory.CreateLogger<ModifyTrajectoryStationJob>();
            _worker = new ModifyTrajectoryStationWorker(logger, witsmlClientProvider.Object);
        }

        [Fact]
        public async Task Update_GeometryStation()
        {
            string expectedGrade = "a";
            ModifyTrajectoryStationJob job = CreateJobTemplate();
            List<WitsmlTrajectories> updatedGeometrys = await MockJob(job);

            Assert.Single(updatedGeometrys);
           // Assert.Equal(expectedGrade, updatedGeometrys.First().TypeTrajStation.First());
        }

        private async Task<List<WitsmlTrajectories>> MockJob(ModifyTrajectoryStationJob job)
        {
            List<WitsmlTrajectories> updatedTrajectories = new();
            _witsmlClient.Setup(client =>
                client.UpdateInStoreAsync(It.IsAny<WitsmlTrajectories>())).Callback<WitsmlTrajectories>(trajectories => updatedTrajectories.Add(trajectories))
                .ReturnsAsync(new QueryResult(true));

            await _worker.Execute(job);
            return updatedTrajectories;
        }

        private static ModifyTrajectoryStationJob CreateJobTemplate()
        {
            return new ModifyTrajectoryStationJob
            {
                TrajectoryStation = new TrajectoryStation()
                {
                    Uid = "gs_uid",
                    Md = new LengthMeasure()
                    {
                        Uom = "uom",
                        Value = 20
                    }
                },

                TrajectoryReference = new ObjectReference()
                {
                    WellUid = "welluid",
                    WellboreUid = "wellboreuid",
                    Uid = "geometrysectionuid"
                }
            };
        }
    }
}
