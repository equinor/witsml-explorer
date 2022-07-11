using System;
using System.Collections.Generic;
using Witsml.Data;
using Witsml.Data.Measures;
using Witsml.Extensions;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Jobs.Common;
using System.Globalization;

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

        public static WitsmlTrajectories CopyWitsmlTrajectory(WitsmlTrajectory trajectory, WitsmlWellbore targetWellbore)
        {
            trajectory.UidWell = targetWellbore.UidWell;
            trajectory.NameWell = targetWellbore.NameWell;
            trajectory.UidWellbore = targetWellbore.Uid;
            trajectory.NameWellbore = targetWellbore.Name;
            trajectory.CustomData ??= new WitsmlCustomData();
            trajectory.CommonData.ItemState = string.IsNullOrEmpty(trajectory.CommonData.ItemState) ? null : trajectory.CommonData.ItemState;
            trajectory.CommonData.SourceName = string.IsNullOrEmpty(trajectory.CommonData.SourceName) ? null : trajectory.CommonData.SourceName;
            var copyTrajectoryQuery = new WitsmlTrajectories { Trajectories = new List<WitsmlTrajectory> { trajectory } };
            return copyTrajectoryQuery;
        }
        public static WitsmlTrajectories UpdateTrajectoryStation(TrajectoryStation trajectoryStation, TrajectoryReference trajectoryReference)
        {
            var ts = new WitsmlTrajectoryStation
            {
                Uid = trajectoryStation.Uid,
                /*
                Md = new WitsmlMeasuredDepthCoord { Uom = trajectoryStation.Md.Uom, Value = trajectoryStation.Md.Value.ToString(CultureInfo.InvariantCulture)},
                */
                TypeTrajStation = trajectoryStation.TypeTrajStation
            };
            /*
            if (trajectoryStation.Tvd.Equals(null))
                ts.Tvd = new WitsmlWellVerticalDepthCoord { Uom = trajectoryStation.Tvd.Uom, Value = trajectoryStation.Tvd.Value.ToString(CultureInfo.InvariantCulture) };
            
            if (trajectoryStation.Incl.Equals(null) )
                ts.Incl = new WitsmlPlaneAngleMeasure { Uom = trajectoryStation.Incl.Uom, Value = trajectoryStation.Incl.Value.ToString(CultureInfo.InvariantCulture) };

            if (trajectoryStation.Azi.Equals(null) )
                ts.Incl = new WitsmlPlaneAngleMeasure { Uom = trajectoryStation.Azi.Uom, Value = trajectoryStation.Azi.Value.ToString(CultureInfo.InvariantCulture) };
            */
            if (trajectoryStation.DTimStn != null)
                ts.DTimStn = ((DateTime) trajectoryStation.DTimStn).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ");
            return new WitsmlTrajectories
            {
                Trajectories = new WitsmlTrajectory
                {
                    UidWell = trajectoryReference.WellUid,
                    UidWellbore = trajectoryReference.WellboreUid,
                    Uid = trajectoryReference.TrajectoryUid,
                    TrajectoryStations = ts.AsSingletonList()
                }.AsSingletonList()
            };
        }
    }
}
