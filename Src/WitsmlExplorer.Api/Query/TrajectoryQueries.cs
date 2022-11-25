using System.Collections.Generic;
using System.Globalization;
using System.Linq;

using Witsml.Data;
using Witsml.Data.Measures;
using Witsml.Extensions;

using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Query
{
    public static class TrajectoryQueries
    {
        public static WitsmlTrajectories GetWitsmlTrajectoryByWellbore(string wellUid, string wellboreUid)
        {
            return new WitsmlTrajectories
            {
                Trajectories = new WitsmlTrajectory
                {
                    Uid = "",
                    UidWell = wellUid,
                    UidWellbore = wellboreUid,
                    Name = "",
                    NameWellbore = "",
                    NameWell = "",
                    MdMin = new WitsmlMeasuredDepthCoord(),
                    MdMax = new WitsmlMeasuredDepthCoord(),
                    AziRef = "",
                    DTimTrajStart = "",
                    DTimTrajEnd = "",
                    CommonData = new WitsmlCommonData()
                }.AsSingletonList()
            };
        }

        public static WitsmlTrajectories GetWitsmlTrajectoryById(string wellUid, string wellboreUid, string trajectoryUid)
        {
            return new WitsmlTrajectories
            {
                Trajectories = new WitsmlTrajectory
                {
                    Uid = trajectoryUid,
                    UidWell = wellUid,
                    UidWellbore = wellboreUid
                }.AsSingletonList()
            };
        }

        public static WitsmlTrajectories GetWitsmlTrajectoriesById(string wellUid, string wellboreUid, string[] trajectoryUids)
        {
            return new WitsmlTrajectories
            {
                Trajectories = trajectoryUids.Select((trajectoryUid) => new WitsmlTrajectory
                {
                    Uid = trajectoryUid,
                    UidWell = wellUid,
                    UidWellbore = wellboreUid
                }).ToList()
            };
        }

        public static IEnumerable<WitsmlTrajectory> DeleteTrajectories(string wellUid, string wellboreUid, string[] trajectoryUids)
        {
            return trajectoryUids.Select((trajectoryUid) =>
                new WitsmlTrajectory
                {
                    Uid = trajectoryUid,
                    UidWell = wellUid,
                    UidWellbore = wellboreUid
                }
            );
        }

        public static IEnumerable<WitsmlTrajectory> CopyWitsmlTrajectories(WitsmlTrajectories trajectories, WitsmlWellbore targetWellbore)
        {
            return trajectories.Trajectories.Select((trajectory) =>
            {
                trajectory.UidWell = targetWellbore.UidWell;
                trajectory.NameWell = targetWellbore.NameWell;
                trajectory.UidWellbore = targetWellbore.Uid;
                trajectory.NameWellbore = targetWellbore.Name;
                return trajectory;
            });
        }

        public static WitsmlTrajectories CopyTrajectoryStations(WitsmlTrajectory trajectory, IEnumerable<WitsmlTrajectoryStation> trajectoryStations)
        {
            trajectory.TrajectoryStations.AddRange(trajectoryStations);
            WitsmlTrajectories copyTrajectoryQuery = new() { Trajectories = new List<WitsmlTrajectory> { trajectory } };
            return copyTrajectoryQuery;
        }

        public static WitsmlTrajectories DeleteTrajectoryStations(string wellUid, string wellboreUid, string trajectoryUid, IEnumerable<string> trajectoryStationUids)
        {
            return new WitsmlTrajectories
            {
                Trajectories = new WitsmlTrajectory
                {
                    UidWell = wellUid,
                    UidWellbore = wellboreUid,
                    Uid = trajectoryUid,
                    TrajectoryStations = trajectoryStationUids.Select(uid => new WitsmlTrajectoryStation
                    {
                        Uid = uid
                    }).ToList()
                }.AsSingletonList()
            };
        }
        public static WitsmlTrajectories UpdateTrajectoryStation(TrajectoryStation trajectoryStation, ObjectReference trajectoryReference)
        {
            WitsmlTrajectoryStation ts = new()
            {
                Uid = trajectoryStation.Uid,
                Md = new WitsmlMeasuredDepthCoord { Uom = trajectoryStation.Md.Uom, Value = trajectoryStation.Md.Value.ToString(CultureInfo.InvariantCulture) },
                TypeTrajStation = trajectoryStation.TypeTrajStation
            };

            if (!trajectoryStation.Tvd.Equals(null))
            {
                ts.Tvd = new WitsmlWellVerticalDepthCoord { Uom = trajectoryStation.Tvd.Uom, Value = trajectoryStation.Tvd.Value.ToString(CultureInfo.InvariantCulture) };
            }

            if (!trajectoryStation.Incl.Equals(null))
            {
                ts.Incl = new WitsmlPlaneAngleMeasure { Uom = trajectoryStation.Incl.Uom, Value = trajectoryStation.Incl.Value.ToString(CultureInfo.InvariantCulture) };
            }

            if (!trajectoryStation.Azi.Equals(null))
            {
                ts.Azi = new WitsmlPlaneAngleMeasure { Uom = trajectoryStation.Azi.Uom, Value = trajectoryStation.Azi.Value.ToString(CultureInfo.InvariantCulture) };
            }

            if (trajectoryStation.DTimStn != null)
            {
                ts.DTimStn = StringHelpers.ToUniversalDateTimeString(trajectoryStation.DTimStn);
            }

            return new WitsmlTrajectories
            {
                Trajectories = new WitsmlTrajectory
                {
                    UidWell = trajectoryReference.WellUid,
                    UidWellbore = trajectoryReference.WellboreUid,
                    Uid = trajectoryReference.Uid,
                    TrajectoryStations = ts.AsSingletonList()
                }.AsSingletonList()
            };
        }
    }
}
