using Witsml.Data;
using Witsml.Data.Measures;
using Witsml.Extensions;

namespace Witsml.Query
{
    public static class TrajectoryQueries
    {
        public static WitsmlTrajectories QueryByWellbore(string wellUid, string wellboreUid)
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

        public static WitsmlTrajectories QueryById(string wellUid, string wellboreUid, string trajectoryUid)
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
    }
}
