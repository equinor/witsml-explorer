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
        private const string WellUid = "wellUid";
        private const string WellboreUid = "wellboreUid";
        private const string TsUid = "ts_uid";
        private const string Uom = "uom";
        private const string GeometrySectionUid = "GeometrySectionUid";
        private const decimal Value = 20;

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
        public async Task Update_TrajectoryStation_ResultOK()
        {
            ModifyTrajectoryStationJob job = CreateJobTemplate();
            List<WitsmlTrajectories> updatedTrajectories = new();
            _witsmlClient.Setup(client =>
                    client.UpdateInStoreAsync(It.IsAny<WitsmlTrajectories>())).Callback<WitsmlTrajectories>(trajectories => updatedTrajectories.Add(trajectories))
                .ReturnsAsync(new QueryResult(true));

            var (workerResult, _) = await _worker.Execute(job);
            Assert.True(workerResult.IsSuccess);
            Assert.Single(updatedTrajectories);
            Assert.NotNull(updatedTrajectories);
            var ts = updatedTrajectories.FirstOrDefault().Trajectories.FirstOrDefault().TrajectoryStations.FirstOrDefault();
            Assert.NotNull(ts);
            Assert.Equal(Uom, ts.Md.Uom);
            Assert.Equal(Value.ToString(), ts.Md.Value);
            Assert.Equal(Uom, ts.Tvd.Uom);
            Assert.Equal(Value.ToString(), ts.Tvd.Value);
            Assert.Equal(Uom, ts.Incl.Uom);
            Assert.Equal(Value.ToString(), ts.Incl.Value);
            Assert.Equal(Uom, ts.Azi.Uom);
            Assert.Equal(Value.ToString(), ts.Azi.Value);
        }

        private static ModifyTrajectoryStationJob CreateJobTemplate()
        {
            return new ModifyTrajectoryStationJob
            {
                TrajectoryStation = new TrajectoryStation()
                {
                    Uid = TsUid,
                    Md = new LengthMeasure()
                    {
                        Uom = Uom,
                        Value = Value
                    },
                    Tvd = new LengthMeasure()
                    {
                        Uom = Uom,
                        Value = Value
                    },
                    Incl = new LengthMeasure()
                    {
                        Uom = Uom,
                        Value = Value
                    },
                    Azi = new LengthMeasure()
                    {
                        Uom = Uom,
                        Value = Value
                    }
                },
                TrajectoryReference = new ObjectReference()
                {
                    WellUid = WellUid,
                    WellboreUid = WellboreUid,
                    Uid = GeometrySectionUid
                }
            };
        }
    }
}
