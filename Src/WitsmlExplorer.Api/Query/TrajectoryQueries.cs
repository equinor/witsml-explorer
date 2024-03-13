using System.Globalization;

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
                    CommonData = new WitsmlCommonData() { DTimCreation = "", DTimLastChange = "", SourceName = "", ItemState = "" }
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
