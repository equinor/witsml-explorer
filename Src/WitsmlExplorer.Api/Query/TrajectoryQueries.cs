using System.Collections.Generic;
using System.Globalization;
using System.Linq;

using Witsml.Data;
using Witsml.Data.Measures;
using Witsml.Extensions;

using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Models.Measure;
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
                    MdMin = MeasureWithDatum.ToEmptyWitsml<WitsmlMeasuredDepthCoord>(),
                    MdMax = MeasureWithDatum.ToEmptyWitsml<WitsmlMeasuredDepthCoord>(),
                    AziRef = "",
                    ServiceCompany = "",
                    DTimTrajStart = "",
                    DTimTrajEnd = "",
                    CommonData = new WitsmlCommonData() { DTimCreation = "", DTimLastChange = "", SourceName = "" }
                }.AsItemInList()
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
                }.AsItemInList()
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
                }.AsItemInList()
            };
        }

        /// <summary>
        /// Create trajectories witsml model.
        /// </summary>
        /// <param name="trajectory">API model of trajectory data.</param>
        /// <returns>New instance of WitsmlTrajectories model with added trajectory data.</returns>
        public static WitsmlTrajectories CreateTrajectory(Trajectory trajectory)
        {
            return new()
            {
                Trajectories = new WitsmlTrajectory
                {
                    UidWell = trajectory.WellUid,
                    NameWell = trajectory.WellName,
                    NameWellbore = trajectory.WellboreName,
                    Uid = trajectory.Uid,
                    Name = trajectory.Name,
                    UidWellbore = trajectory.WellboreUid,
                    AziRef = trajectory.AziRef.NullIfEmpty(),
                    ServiceCompany = trajectory.ServiceCompany.NullIfEmpty(),
                    DTimTrajStart = StringHelpers.ToUniversalDateTimeString(trajectory.DTimTrajStart),
                    DTimTrajEnd = StringHelpers.ToUniversalDateTimeString(trajectory.DTimTrajEnd),
                    CommonData = string.IsNullOrEmpty(trajectory.CommonData?.SourceName) ? null : new WitsmlCommonData() { SourceName = trajectory.CommonData.SourceName }
                }.AsItemInList()
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

            if (trajectoryStation.Tvd != null)
            {
                ts.Tvd = new WitsmlWellVerticalDepthCoord { Uom = trajectoryStation.Tvd.Uom, Value = trajectoryStation.Tvd.Value.ToString(CultureInfo.InvariantCulture) };
            }

            if (trajectoryStation.Incl != null)
            {
                ts.Incl = new WitsmlPlaneAngleMeasure { Uom = trajectoryStation.Incl.Uom, Value = trajectoryStation.Incl.Value.ToString(CultureInfo.InvariantCulture) };
            }

            if (trajectoryStation.Azi != null)
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
                    TrajectoryStations = ts.AsItemInList()
                }.AsItemInList()
            };
        }
    }
}
