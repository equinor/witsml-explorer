using System.Collections.Generic;
using System.Globalization;
using System.Xml;
using System.Xml.Serialization;

using Witsml.Data.Measures;

namespace Witsml.Data
{
    public class WitsmlTrajectoryStation
    {
        [XmlElement("target")] public WitsmlRefNameString Target { get; set; }
        [XmlAttribute("uid")] public string Uid { get; set; }
        [XmlElement("dTimStn")] public string DTimStn { get; set; }
        [XmlElement("typeTrajStation")] public string TypeTrajStation { get; set; }
        [XmlElement("typeSurveyTool")] public string TypeSurveyTool { get; set; }
        [XmlElement("calcAlgorithm")] public string CalcAlgorithm { get; set; }
        [XmlElement("md")] public WitsmlMeasuredDepthCoord Md { get; set; }
        [XmlElement("tvd")] public WitsmlWellVerticalDepthCoord Tvd { get; set; }
        [XmlElement("incl")] public WitsmlPlaneAngleMeasure Incl { get; set; }
        [XmlElement("azi")] public WitsmlPlaneAngleMeasure Azi { get; set; }
        [XmlElement("mtf")] public WitsmlPlaneAngleMeasure Mtf { get; set; }
        [XmlElement("gtf")] public WitsmlPlaneAngleMeasure Gtf { get; set; }
        [XmlElement("dispNs")] public WitsmlLengthMeasure DispNs { get; set; }
        [XmlElement("dispEw")] public WitsmlLengthMeasure DispEw { get; set; }
        [XmlElement("vertSect")] public WitsmlLengthMeasure VertSect { get; set; }
        [XmlElement("dls")] public WitsmlAnglePerLengthMeasure Dls { get; set; }
        [XmlElement("rateTurn")] public WitsmlAnglePerLengthMeasure RateTurn { get; set; }
        [XmlElement("rateBuild")] public WitsmlAnglePerLengthMeasure RateBuild { get; set; }
        [XmlElement("mdDelta")] public WitsmlLengthMeasure MdDelta { get; set; }
        [XmlElement("tvdDelta")] public WitsmlLengthMeasure TvdDelta { get; set; }
        [XmlElement("modelToolError")] public string ModelToolError { get; set; }
        [XmlElement("iscwsaToolErrorModel")] public WitsmlRefNameString IscwsaToolErrorModel { get; set; }
        [XmlElement("gravTotalUncert")] public Measure GravTotalUncert { get; set; }
        [XmlElement("dipAngleUncert")] public Measure DipAngleUncert { get; set; }
        [XmlElement("magTotalUncert")] public Measure MagTotalUncert { get; set; }
        [XmlElement("gravAccelCorUsed")] public string GravAccelCorUsed { get; set; }

        [XmlIgnore]
        public bool? MagXAxialCorUsed { get; set; }
        [XmlElement("magXAxialCorUsed")]
        public string MagXAxialCorUsedText
        {
            get => MagXAxialCorUsed.HasValue ? XmlConvert.ToString(MagXAxialCorUsed.Value) : null;
            set => MagXAxialCorUsed = !string.IsNullOrEmpty(value) ? bool.Parse(value) : default(bool?);
        }

        [XmlIgnore]
        public bool? SagCorUsed { get; set; }
        [XmlElement("sagCorUsed")]
        public string SagCorUsedText
        {
            get => SagCorUsed.HasValue ? XmlConvert.ToString(SagCorUsed.Value) : null;
            set => SagCorUsed = !string.IsNullOrEmpty(value) ? bool.Parse(value) : default(bool?);
        }

        [XmlIgnore]
        public bool? MagDrlstrCorUsed { get; set; }
        [XmlElement("magDrlstrCorUsed")]
        public string MagDrlstrCorUsedText
        {
            get => MagDrlstrCorUsed.HasValue ? XmlConvert.ToString(MagDrlstrCorUsed.Value) : null;
            set => MagDrlstrCorUsed = !string.IsNullOrEmpty(value) ? bool.Parse(value) : default(bool?);
        }

        [XmlIgnore]
        public bool? InfieldRefCorUsed { get; set; }
        [XmlElement("infieldRefCorUsed")]
        public string InfieldRefCorUsedText
        {
            get => InfieldRefCorUsed.HasValue ? XmlConvert.ToString(InfieldRefCorUsed.Value) : null;
            set => InfieldRefCorUsed = !string.IsNullOrEmpty(value) ? bool.Parse(value) : default(bool?);
        }

        [XmlIgnore]
        public bool? InterpolatedInfieldRefCorUsed { get; set; }
        [XmlElement("interpolatedInfieldRefCorUsed")]
        public string InterpolatedInfieldRefCorUsedText
        {
            get => InterpolatedInfieldRefCorUsed.HasValue ? XmlConvert.ToString(InterpolatedInfieldRefCorUsed.Value) : null;
            set => InterpolatedInfieldRefCorUsed = !string.IsNullOrEmpty(value) ? bool.Parse(value) : default(bool?);
        }

        [XmlIgnore]
        public bool? InHoleRefCorUsed { get; set; }
        [XmlElement("inHoleRefCorUsed")]
        public string InHoleRefCorUsedText
        {
            get => InHoleRefCorUsed.HasValue ? XmlConvert.ToString(InHoleRefCorUsed.Value) : null;
            set => InHoleRefCorUsed = !string.IsNullOrEmpty(value) ? bool.Parse(value) : default(bool?);
        }

        [XmlIgnore]
        public bool? AxialMagInterferenceCorUsed { get; set; }

        [XmlElement("axialMagInterferenceCorUsed")]
        public string AxialMagInterferenceCorUsedText
        {
            get => AxialMagInterferenceCorUsed.HasValue ? XmlConvert.ToString(AxialMagInterferenceCorUsed.Value) : null;
            set => AxialMagInterferenceCorUsed = !string.IsNullOrEmpty(value) ? bool.Parse(value) : default(bool?);
        }

        [XmlIgnore]
        public bool? CosagCorUsed { get; set; }
        [XmlElement("cosagCorUsed")]
        public string CosagCorUsedText
        {
            get => CosagCorUsed.HasValue ? XmlConvert.ToString(CosagCorUsed.Value) : null;
            set => CosagCorUsed = !string.IsNullOrEmpty(value) ? bool.Parse(value) : default(bool?);
        }

        [XmlIgnore]
        public bool? MsaCorUsed { get; set; }
        [XmlElement("MSACorUsed")]
        public string MsaCorUsedText
        {
            get => MsaCorUsed.HasValue ? XmlConvert.ToString(MsaCorUsed.Value) : null;
            set => MsaCorUsed = !string.IsNullOrEmpty(value) ? bool.Parse(value) : default(bool?);
        }

        [XmlElement("gravTotalFieldReference")] public Measure GravTotalFieldReference { get; set; }
        [XmlElement("magTotalFieldReference")] public Measure MagTotalFieldReference { get; set; }
        [XmlElement("magDipAngleReference")] public Measure MagDipAngleReference { get; set; }
        [XmlElement("magModelUsed")] public string MagModelUsed { get; set; }
        [XmlElement("magModelValid")] public string MagModelValid { get; set; }
        [XmlElement("geoModelUsed")] public string GeoModelUsed { get; set; }
        [XmlElement("statusTrajStation")] public string StatusTrajStation { get; set; }
        [XmlElement("gravAxialRaw")] public WitsmlLinearAccelerationMeasure GravAxialRaw { get; set; }
        [XmlElement("gravTran1Raw")] public WitsmlLinearAccelerationMeasure GravTran1Raw { get; set; }
        [XmlElement("gravTran2Raw")] public WitsmlLinearAccelerationMeasure GravTran2Raw { get; set; }
        [XmlElement("magAxialRaw")] public WitsmlMagneticFluxDensityMeasure MagAxialRaw { get; set; }
        [XmlElement("rawData")] public WitsmlTrajRawData RawData { get; set; }
        [XmlElement("corUsed")] public WitsmlStnTrajCorUsed CorUsed { get; set; }
        [XmlElement("valid")] public WitsmlStnTrajValid Valid { get; set; }
        [XmlElement("matrixCov")] public WitsmlStnTrajMatrixCov MatrixCov { get; set; }
        [XmlElement("location")] public List<WitsmlLocation> Location { get; set; }
        [XmlElement("sourceStation")] public WitsmlRefWellboreTrajectoryStation SourceStation { get; set; }
        [XmlElement("commonData")] public WitsmlCommonData CommonData { get; set; }

    }
}
