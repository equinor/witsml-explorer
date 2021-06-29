using System.Collections.Generic;
using Witsml.Data;
using Witsml.Data.Measures;
using Witsml.Extensions;

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
    }
}
