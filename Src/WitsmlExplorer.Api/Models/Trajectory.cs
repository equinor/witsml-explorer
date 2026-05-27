using System.Collections.Generic;
using System.Linq;

using Witsml.Data;
using Witsml.Data.Measures;

using WitsmlExplorer.Api.Models.Measure;
using WitsmlExplorer.Api.Services;

// ReSharper disable UnusedAutoPropertyAccessor.Global

namespace WitsmlExplorer.Api.Models
{
    public class Trajectory : ObjectOnWellbore
    {
        public MeasureWithDatum MdMin { get; init; }
        public MeasureWithDatum MdMax { get; init; }
        public string AziRef { get; init; }
        public string DTimTrajStart { get; init; }
        public string DTimTrajEnd { get; init; }
        public List<TrajectoryStation> TrajectoryStations { get; init; }
        public string ServiceCompany { get; init; }
        public CommonData CommonData { get; init; }

        public override WitsmlTrajectories ToWitsml()
        {
            return new WitsmlTrajectory
            {
                UidWell = WellUid,
                NameWell = WellName,
                UidWellbore = WellboreUid,
                NameWellbore = WellboreName,
                Uid = Uid,
                Name = Name,
                MdMin = MdMin?.ToWitsml<WitsmlMeasuredDepthCoord>(),
                MdMax = MdMax?.ToWitsml<WitsmlMeasuredDepthCoord>(),
                AziRef = AziRef,
                DTimTrajStart = StringHelpers.ToUniversalDateTimeString(DTimTrajStart),
                DTimTrajEnd = StringHelpers.ToUniversalDateTimeString(DTimTrajEnd),
                TrajectoryStations = TrajectoryStations?.Select((trajectoryStation) => trajectoryStation?.ToWitsml()).ToList(),
                ServiceCompany = ServiceCompany,
                CommonData = CommonData?.ToWitsml(),
            }.AsItemInWitsmlList();
        }

        public static Trajectory FromWitsml(WitsmlTrajectory trajectory)
        {
            return trajectory == null ? null : new Trajectory
            {
                Uid = trajectory.Uid,
                WellUid = trajectory.UidWell,
                WellboreUid = trajectory.UidWellbore,
                Name = trajectory.Name,
                WellName = trajectory.NameWell,
                WellboreName = trajectory.NameWellbore,
                MdMin = MeasureWithDatum.FromWitsml(trajectory.MdMin),
                MdMax = MeasureWithDatum.FromWitsml(trajectory.MdMax),
                AziRef = trajectory.AziRef,
                DTimTrajStart = trajectory.DTimTrajStart,
                DTimTrajEnd = trajectory.DTimTrajEnd,
                ServiceCompany = trajectory.ServiceCompany,
                TrajectoryStations = GetTrajectoryStations(trajectory.TrajectoryStations),
                CommonData = trajectory.CommonData == null ? null : new CommonData
                {
                    ItemState = trajectory.CommonData.ItemState,
                    SourceName = trajectory.CommonData.SourceName,
                    DTimLastChange = trajectory.CommonData.DTimLastChange,
                    DTimCreation = trajectory.CommonData.DTimCreation,
                }
            };
        }

        private static List<TrajectoryStation> GetTrajectoryStations(List<WitsmlTrajectoryStation> trajectoryStations)
        {
            return trajectoryStations?.Select(tStation => new TrajectoryStation
            {
                Uid = tStation.Uid,
                DTimStn = tStation.DTimStn,
                TypeTrajStation = tStation.TypeTrajStation,
                Md = LengthMeasure.FromWitsml(tStation.Md),
                Tvd = LengthMeasure.FromWitsml(tStation.Tvd),
                Incl = LengthMeasure.FromWitsml(tStation.Incl),
                Azi = LengthMeasure.FromWitsml(tStation.Azi),
                Dls = LengthMeasure.FromWitsml(tStation.Dls),
                Mtf = LengthMeasure.FromWitsml(tStation.Mtf),
                Gtf = LengthMeasure.FromWitsml(tStation.Gtf),
                DispNs = LengthMeasure.FromWitsml(tStation.DispNs),
                DispEw = LengthMeasure.FromWitsml(tStation.DispEw),
                VertSect = LengthMeasure.FromWitsml(tStation.VertSect),
                RateTurn = LengthMeasure.FromWitsml(tStation.RateTurn),
                RateBuild = LengthMeasure.FromWitsml(tStation.RateBuild),
                GravTotalUncert = LengthMeasure.FromWitsml(tStation.GravTotalUncert),
                DipAngleUncert = LengthMeasure.FromWitsml(tStation.DipAngleUncert),
                MagTotalUncert = LengthMeasure.FromWitsml(tStation.MagTotalUncert),
                SagCorUsed = tStation.SagCorUsed,
                MagDrlstrCorUsed = tStation.MagDrlstrCorUsed,
                GravTotalFieldReference = LengthMeasure.FromWitsml(tStation.GravTotalFieldReference),
                MagTotalFieldReference = LengthMeasure.FromWitsml(tStation.MagTotalFieldReference),
                MagDipAngleReference = LengthMeasure.FromWitsml(tStation.MagDipAngleReference),
                StatusTrajStation = tStation.StatusTrajStation,
                GravAxialRaw = LengthMeasure.FromWitsml(tStation.GravAxialRaw),
                GravTran1Raw = LengthMeasure.FromWitsml(tStation.GravTran1Raw),
                GravTran2Raw = LengthMeasure.FromWitsml(tStation.GravTran2Raw),
                MagAxialRaw = LengthMeasure.FromWitsml(tStation.MagAxialRaw),
                RawData = new TrajRawData
                {
                    MagTran1Raw = LengthMeasure.FromWitsml(tStation.RawData?.MagTran1Raw),
                    MagTran2Raw = LengthMeasure.FromWitsml(tStation.RawData?.MagTran2Raw)
                },
                CorUsed = new StnTrajCorUsed
                {
                    GravAxialAccelCor = LengthMeasure.FromWitsml(tStation.CorUsed?.GravAxialAccelCor),
                    GravTran1AccelCor = LengthMeasure.FromWitsml(tStation.CorUsed?.GravTran1AccelCor),
                    GravTran2AccelCor = LengthMeasure.FromWitsml(tStation.CorUsed?.GravTran2AccelCor),
                    MagAxialDrlstrCor = LengthMeasure.FromWitsml(tStation.CorUsed?.MagAxialDrlstrCor),
                    MagTran1DrlstrCor = LengthMeasure.FromWitsml(tStation.CorUsed?.MagTran1DrlstrCor),
                    MagTran2DrlstrCor = LengthMeasure.FromWitsml(tStation.CorUsed?.MagTran2DrlstrCor),
                    SagIncCor = LengthMeasure.FromWitsml(tStation.CorUsed?.SagIncCor),
                    StnMagDeclUsed = LengthMeasure.FromWitsml(tStation.CorUsed?.StnMagDeclUsed),
                    StnGridCorUsed = LengthMeasure.FromWitsml(tStation.CorUsed?.StnGridCorUsed),
                    DirSensorOffset = LengthMeasure.FromWitsml(tStation.CorUsed?.DirSensorOffset)
                },
                Valid = new StnTrajValid
                {
                    MagTotalFieldCalc = LengthMeasure.FromWitsml(tStation.Valid?.MagTotalFieldCalc),
                    MagDipAngleCalc = LengthMeasure.FromWitsml(tStation.Valid?.MagDipAngleCalc),
                    GravTotalFieldCalc = LengthMeasure.FromWitsml(tStation.Valid?.GravTotalFieldCalc)
                },
            }).ToList();
        }
    }
}
