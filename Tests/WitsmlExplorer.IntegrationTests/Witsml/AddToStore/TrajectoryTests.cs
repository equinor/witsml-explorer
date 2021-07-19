using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Threading.Tasks;
using Witsml;
using Witsml.Data;
using Witsml.Data.Measures;
using Witsml.Extensions;
using Witsml.ServiceReference;
using WitsmlExplorer.Api.Query;
using Xunit;
using Xunit.Abstractions;

namespace WitsmlExplorer.IntegrationTests.Witsml.AddToStore
{
    [SuppressMessage("ReSharper", "xUnit1004")]
    public class TrajectoryTests
    {
        private readonly ITestOutputHelper output;
        private readonly WitsmlClient client;

        public TrajectoryTests(ITestOutputHelper output)
        {
            this.output = output;
            var config = ConfigurationReader.GetWitsmlConfiguration();
            client = new WitsmlClient(config.Hostname, config.Username, config.Password);
        }

        [Fact(Skip="Should only be run manually")]
        public async Task CreateTrajectory_BasedOnExisting()
        {
            const string wellUid = "";
            const string wellboreUid = "";
            const string trajectoryUid = "";
            var queryExisting = TrajectoryQueries.GetWitsmlTrajectoryById(wellUid, wellboreUid, trajectoryUid);
            var existingTrajectories = await client.GetFromStoreAsync(queryExisting, new OptionsIn(ReturnElements.All));
            var existing = existingTrajectories.Trajectories.First();

            var createTrajectoryQuery = CreateTrajectoryQuery(
                existing.UidWell,
                existing.NameWell,
                existing.UidWellbore,
                existing.NameWellbore,
                existing.Name + " (copy)",
                existing.TrajectoryStations,
                existing.CommonData,
                existing.AziRef,
                existing.MdMin,
                existing.MdMax,
                existing.DTimTrajStart,
                existing.DTimTrajEnd
            );

            var result = await client.AddToStoreAsync(createTrajectoryQuery);

            Assert.True(result.IsSuccessful);
            output.WriteLine("Created trajectory with uid: " + createTrajectoryQuery.Trajectories.First().Uid);
        }

        private static WitsmlTrajectories CreateTrajectoryQuery(string wellUid, string wellName, string wellboreUid, string wellboreName, string name,
            IEnumerable<WitsmlTrajectoryStation> trajectoryStations, WitsmlCommonData commonData, string aziRef, WitsmlMeasuredDepthCoord mdMin, WitsmlMeasuredDepthCoord mdMax,
            string dTimTrajectoryStart, string dTimTrajectoryEnd)
        {
            var tStations = trajectoryStations.Select(trajectoryStation => new WitsmlTrajectoryStation()
            {
                Uid = Guid.NewGuid().ToString(),
                DTimStn = trajectoryStation.DTimStn,
                TypeTrajStation = trajectoryStation.TypeTrajStation,
                Md = trajectoryStation.Md,
                Tvd = trajectoryStation.Tvd,
                Incl = trajectoryStation.Incl,
                Azi = trajectoryStation.Azi,
                DispNs = trajectoryStation.DispNs,
                DispEw = trajectoryStation.DispEw,
                VertSect = trajectoryStation.VertSect,
                Dls = trajectoryStation.Dls,
                CommonData = trajectoryStation.CommonData
            }).ToList();

            var trajectories = new WitsmlTrajectories()
            {
                Trajectories = new WitsmlTrajectory()
                {
                    UidWell = wellUid,
                    NameWell = wellName,
                    UidWellbore = wellboreUid,
                    NameWellbore = wellboreName,
                    Name = name,
                    Uid = Guid.NewGuid().ToString(),
                    DTimTrajStart = dTimTrajectoryStart,
                    DTimTrajEnd = dTimTrajectoryEnd,
                    MdMin = mdMin,
                    MdMax = mdMax,
                    AziRef = aziRef,
                    TrajectoryStations = tStations,
                    CommonData = commonData
                }.AsSingletonList()
            };

            return trajectories;
        }
    }
}
