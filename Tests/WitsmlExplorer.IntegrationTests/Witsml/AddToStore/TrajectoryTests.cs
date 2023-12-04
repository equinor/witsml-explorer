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
        private readonly ITestOutputHelper _output;
        private readonly WitsmlClient _client;

        public TrajectoryTests(ITestOutputHelper output)
        {
            _output = output;
            WitsmlConfiguration config = ConfigurationReader.GetWitsmlConfiguration();
            _client = new WitsmlClient(options =>
            {
                options.Hostname = config.Hostname;
                options.Credentials = new WitsmlCredentials(config.Username, config.Password);
            });
        }

        [Fact(Skip = "Should only be run manually")]
        public async Task CreateTrajectoryBasedOnExisting()
        {
            const string wellUid = "";
            const string wellboreUid = "";
            const string trajectoryUid = "";
            WitsmlTrajectories queryExisting = TrajectoryQueries.GetWitsmlTrajectoryById(wellUid, wellboreUid, trajectoryUid);
            WitsmlTrajectories existingTrajectories = await _client.GetFromStoreAsync(queryExisting, new OptionsIn(ReturnElements.All));
            WitsmlTrajectory existing = existingTrajectories.Trajectories.First();

            WitsmlTrajectories createTrajectoryQuery = CreateTrajectoryQuery(
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

            QueryResult result = await _client.AddToStoreAsync(createTrajectoryQuery);

            Assert.True(result.IsSuccessful);
            _output.WriteLine("Created trajectory with uid: " + createTrajectoryQuery.Trajectories.First().Uid);
        }

        private static WitsmlTrajectories CreateTrajectoryQuery(string wellUid, string wellName, string wellboreUid, string wellboreName, string name,
            IEnumerable<WitsmlTrajectoryStation> trajectoryStations, WitsmlCommonData commonData, string aziRef, WitsmlMeasuredDepthCoord mdMin, WitsmlMeasuredDepthCoord mdMax,
            string dTimTrajectoryStart, string dTimTrajectoryEnd)
        {
            List<WitsmlTrajectoryStation> tStations = trajectoryStations.Select(trajectoryStation => new WitsmlTrajectoryStation()
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

            WitsmlTrajectories trajectories = new()
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
                }.AsItemInList()
            };

            return trajectories;
        }

    }
}
