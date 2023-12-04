using Witsml.Data;
using Witsml.Data.Measures;

using WitsmlExplorer.Api.Models.Measure;
using WitsmlExplorer.Api.Services;

// ReSharper disable UnusedAutoPropertyAccessor.Global

namespace WitsmlExplorer.Api.Models
{
    public class TrajectoryStation
    {
        public string Uid { get; init; }
        public string DTimStn { get; init; }
        public string TypeTrajStation { get; init; }
        public LengthMeasure Md { get; init; }
        public LengthMeasure Tvd { get; init; }
        public LengthMeasure Incl { get; init; }
        public LengthMeasure Azi { get; init; }
        public LengthMeasure Dls { get; init; }
        public LengthMeasure Mtf { get; init; }
        public LengthMeasure Gtf { get; init; }
        public LengthMeasure DispNs { get; init; }
        public LengthMeasure DispEw { get; init; }
        public LengthMeasure VertSect { get; init; }
        public LengthMeasure RateTurn { get; init; }
        public LengthMeasure RateBuild { get; init; }
        public LengthMeasure GravTotalUncert { get; init; }
        public LengthMeasure DipAngleUncert { get; init; }
        public LengthMeasure MagTotalUncert { get; init; }
        public bool? SagCorUsed { get; init; }
        public bool? MagDrlstrCorUsed { get; init; }
        public LengthMeasure GravTotalFieldReference { get; init; }
        public LengthMeasure MagTotalFieldReference { get; init; }
        public LengthMeasure MagDipAngleReference { get; init; }
        public string StatusTrajStation { get; init; }
        public LengthMeasure GravAxialRaw { get; init; }
        public LengthMeasure GravTran1Raw { get; init; }
        public LengthMeasure GravTran2Raw { get; init; }
        public LengthMeasure MagAxialRaw { get; init; }
        public TrajRawData RawData { get; init; }
        public StnTrajCorUsed CorUsed { get; init; }
        public StnTrajValid Valid { get; set; }
    }

    public static class TrajectoryStationExtensions
    {
        public static WitsmlTrajectoryStation ToWitsml(this TrajectoryStation trajectoryStation)
        {
            return new WitsmlTrajectoryStation
            {
                Uid = trajectoryStation.Uid,
                DTimStn = StringHelpers.ToUniversalDateTimeString(trajectoryStation.DTimStn),
                TypeTrajStation = trajectoryStation.TypeTrajStation,
                Md = trajectoryStation.Md?.ToWitsml<WitsmlMeasuredDepthCoord>(),
                Tvd = trajectoryStation.Tvd?.ToWitsml<WitsmlWellVerticalDepthCoord>(),
                Incl = trajectoryStation.Incl?.ToWitsml<WitsmlPlaneAngleMeasure>(),
                Azi = trajectoryStation.Azi?.ToWitsml<WitsmlPlaneAngleMeasure>(),
                Dls = trajectoryStation.Dls?.ToWitsml<WitsmlAnglePerLengthMeasure>(),
                Mtf = trajectoryStation.Mtf?.ToWitsml<WitsmlPlaneAngleMeasure>(),
                Gtf = trajectoryStation.Gtf?.ToWitsml<WitsmlPlaneAngleMeasure>(),
                DispNs = trajectoryStation.DispNs?.ToWitsml<WitsmlLengthMeasure>(),
                DispEw = trajectoryStation.DispEw?.ToWitsml<WitsmlLengthMeasure>(),
                VertSect = trajectoryStation.VertSect?.ToWitsml<WitsmlLengthMeasure>(),
                RateTurn = trajectoryStation.RateTurn?.ToWitsml<WitsmlAnglePerLengthMeasure>(),
                RateBuild = trajectoryStation.RateBuild?.ToWitsml<WitsmlAnglePerLengthMeasure>(),
                GravTotalUncert = trajectoryStation.GravTotalUncert?.ToWitsml<WitsmlLengthMeasure>(),
                DipAngleUncert = trajectoryStation.DipAngleUncert?.ToWitsml<WitsmlLengthMeasure>(),
                MagTotalUncert = trajectoryStation.MagTotalUncert?.ToWitsml<WitsmlLengthMeasure>(),
                SagCorUsed = trajectoryStation.SagCorUsed,
                MagDrlstrCorUsed = trajectoryStation.MagDrlstrCorUsed,
                GravTotalFieldReference = trajectoryStation.GravTotalFieldReference?.ToWitsml<WitsmlLengthMeasure>(),
                MagTotalFieldReference = trajectoryStation.MagTotalFieldReference?.ToWitsml<WitsmlLengthMeasure>(),
                MagDipAngleReference = trajectoryStation.MagDipAngleReference?.ToWitsml<WitsmlLengthMeasure>(),
                StatusTrajStation = trajectoryStation.StatusTrajStation,
                GravAxialRaw = trajectoryStation.GravAxialRaw?.ToWitsml<WitsmlLinearAccelerationMeasure>(),
                GravTran1Raw = trajectoryStation.GravTran1Raw?.ToWitsml<WitsmlLinearAccelerationMeasure>(),
                GravTran2Raw = trajectoryStation.GravTran2Raw?.ToWitsml<WitsmlLinearAccelerationMeasure>(),
                MagAxialRaw = trajectoryStation.MagAxialRaw?.ToWitsml<WitsmlMagneticFluxDensityMeasure>(),
                RawData = trajectoryStation.RawData?.ToWitsml(),
                CorUsed = trajectoryStation.CorUsed?.ToWitsml(),
                Valid = trajectoryStation.Valid?.ToWitsml()
            };
        }
    }
}
