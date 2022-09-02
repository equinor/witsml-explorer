using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Moq;

using Witsml;
using Witsml.Data;
using Witsml.Data.Measures;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;
using WitsmlExplorer.Api.Workers.Copy;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Workers
{
    [SuppressMessage("ReSharper", "InconsistentNaming")]
    public class CopyTrajectoryWorkerTests
    {
        private readonly CopyTrajectoryWorker _copyTrajectoryWorker;
        private readonly Mock<IWitsmlClient> _witsmlClient;
        private const string WellUid = "wellUid";
        private const string SourceWellboreUid = "sourceWellboreUid";
        private const string TargetWellboreUid = "targetWellboreUid";
        private const string TrajectoryUid = "trajectoryUid";

        public CopyTrajectoryWorkerTests()
        {
            Mock<IWitsmlClientProvider> witsmlClientProvider = new();
            _witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_witsmlClient.Object);
            Mock<ILogger<CopyTrajectoryJob>> logger = new();
            _copyTrajectoryWorker = new CopyTrajectoryWorker(logger.Object, witsmlClientProvider.Object);
        }

        [Fact]
        public async Task CopyTrajectoryOK()
        {
            CopyTrajectoryJob copyTrajectoryJob = CreateJobTemplate();
            _witsmlClient.Setup(client =>
                    client.GetFromStoreAsync(It.Is<WitsmlTrajectories>(witsmlTrajectories => witsmlTrajectories.Trajectories.First().Uid == TrajectoryUid), new OptionsIn(ReturnElements.All, null)))
                .ReturnsAsync(GetSourceTrajectories());
            SetupGetWellbore();
            List<WitsmlTrajectories> copyTrajectoryQuery = SetupAddInStoreAsync();

            (WorkerResult, RefreshAction) result = await _copyTrajectoryWorker.Execute(copyTrajectoryJob);
            WitsmlTrajectory trajectory = copyTrajectoryQuery.First().Trajectories.First();
            Assert.True(result.Item1.IsSuccess);
            Assert.NotEmpty(trajectory.TrajectoryStations);
        }

        private void SetupGetWellbore()
        {
            _witsmlClient.Setup(client =>
                    client.GetFromStoreAsync(It.IsAny<WitsmlWellbores>(), new OptionsIn(ReturnElements.Requested, null)))
                .ReturnsAsync(new WitsmlWellbores
                {
                    Wellbores = new List<WitsmlWellbore>
                    {
                        new WitsmlWellbore
                        {
                            UidWell = "Well1",
                            Uid = "wellbore1",
                            Name = "Wellbore 1",
                            NameWell = "Well 1"
                        }
                    }
                });
        }

        private List<WitsmlTrajectories> SetupAddInStoreAsync()
        {
            List<WitsmlTrajectories> addedTrajectory = new();
            _witsmlClient.Setup(client => client.AddToStoreAsync(It.IsAny<WitsmlTrajectories>()))
                .Callback<WitsmlTrajectories>(witsmlTrajectories => addedTrajectory.Add(witsmlTrajectories))
                .ReturnsAsync(new QueryResult(true));
            return addedTrajectory;
        }

        private static CopyTrajectoryJob CreateJobTemplate(string targetWellboreUid = TargetWellboreUid)
        {
            return new CopyTrajectoryJob
            {
                Source = new TrajectoryReference
                {
                    WellUid = WellUid,
                    WellboreUid = SourceWellboreUid,
                    TrajectoryUid = TrajectoryUid
                },
                Target = new WellboreReference
                {
                    WellUid = WellUid,
                    WellboreUid = targetWellboreUid
                }
            };
        }

        private static WitsmlTrajectories GetSourceTrajectories()
        {
            WitsmlTrajectory witsmlTrajectory = new()
            {
                UidWell = WellUid,
                UidWellbore = SourceWellboreUid,
                Uid = TrajectoryUid,
                NameWell = "",
                NameWellbore = "",
                Name = "",
                ObjectGrowing = null,
                ParentTrajectory = null,
                DTimTrajStart = "",
                DTimTrajEnd = "",
                MdMin = new WitsmlMeasuredDepthCoord(),
                MdMax = new WitsmlMeasuredDepthCoord(),
                ServiceCompany = "",
                MagDeclUsed = new WitsmlPlaneAngleMeasure(),
                GridCorUsed = new WitsmlPlaneAngleMeasure(),
                GridConUsed = new WitsmlPlaneAngleMeasure(),
                AziVertSect = new WitsmlPlaneAngleMeasure(),
                DispNsVertSectOrig = new WitsmlLengthMeasure(),
                DispEwVertSectOrig = new WitsmlLengthMeasure(),
                Definitive = "",
                Memory = "",
                FinalTraj = "",
                AziRef = "",
                TrajectoryStations = new List<WitsmlTrajectoryStation>
                {
                    new WitsmlTrajectoryStation()
                },
                CommonData = new WitsmlCommonData(),
                CustomData = new WitsmlCustomData()
            };
            return new WitsmlTrajectories
            {
                Trajectories = new List<WitsmlTrajectory> { witsmlTrajectory }
            };
        }
    }
}
