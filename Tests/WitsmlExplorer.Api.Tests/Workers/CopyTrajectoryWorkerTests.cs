using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Threading.Tasks;
using Moq;
using Witsml;
using Witsml.Data;
using Witsml.Data.Measures;
using Witsml.ServiceReference;
using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;
using Xunit;

namespace WitsmlExplorer.Api.Tests.Workers
{
    [SuppressMessage("ReSharper", "InconsistentNaming")]
    public class CopyTrajectoryWorkerTests
    {
        private readonly CopyTrajectoryWorker copyTrajectoryWorker;
        private readonly Mock<IWitsmlClient> witsmlClient;
        private const string WellUid = "wellUid";
        private const string SourceWellboreUid = "sourceWellboreUid";
        private const string TargetWellboreUid = "targetWellboreUid";
        private const string TrajectoryUid = "trajectoryUid";

        public CopyTrajectoryWorkerTests()
        {
            var witsmlClientProvider = new Mock<IWitsmlClientProvider>();
            witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(witsmlClient.Object);
            copyTrajectoryWorker = new CopyTrajectoryWorker(witsmlClientProvider.Object);
        }

        [Fact]
        public async Task CopyTrajectory_OK()
        {
            var copyTrajectoryJob = CreateJobTemplate();
            witsmlClient.Setup(client =>
                    client.GetFromStoreAsync(It.Is<WitsmlTrajectories>(WitsmlTrajectories => WitsmlTrajectories.Trajectories.First().Uid == TrajectoryUid), OptionsIn.All))
                .ReturnsAsync(GetSourceTrajectories());
            SetupGetWellbore();
            var copyTrajectoryQuery = SetupAddInStoreAsync();

            var result = await copyTrajectoryWorker.Execute(copyTrajectoryJob);
            var trajectory = copyTrajectoryQuery.First().Trajectories.First();
            Assert.True(result.Item1.IsSuccess);
            Assert.NotEmpty(trajectory.TrajectoryStations);
        }

        private void SetupGetWellbore()
        {
            witsmlClient.Setup(client =>
                    client.GetFromStoreAsync(It.IsAny<WitsmlWellbores>(), OptionsIn.Requested))
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
            var addedTrajectory = new List<WitsmlTrajectories>();
            witsmlClient.Setup(client => client.AddToStoreAsync(It.IsAny<WitsmlTrajectories>(), It.IsAny<OptionsIn>()))
                .Callback<WitsmlTrajectories, OptionsIn>((WitsmlTrajectories, _) => addedTrajectory.Add(WitsmlTrajectories))
                .ReturnsAsync(new QueryResult(true));
            return addedTrajectory;
        }

        private CopyTrajectoryJob CreateJobTemplate(string targetWellboreUid = TargetWellboreUid)
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

        private WitsmlTrajectories GetSourceTrajectories()
        {
            var witsmlTrajectory = new WitsmlTrajectory
            {
                UidWell = WellUid,
                UidWellbore = SourceWellboreUid,
                Uid = TrajectoryUid,
                NameWell = "",
                NameWellbore = "",
                Name = "",
                ObjectGrowing = null,
                ParentTrajectory = new WitsmlWellboreTrajectory
                {
                    TrajectoryReference = "",
                    WellboreParent = ""
                },
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
                Trajectories = new List<WitsmlTrajectory> {witsmlTrajectory}
            };
        }
    }
}
