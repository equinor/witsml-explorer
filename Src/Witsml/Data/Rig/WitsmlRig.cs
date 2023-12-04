using System.Collections.Generic;
using System.Xml;
using System.Xml.Serialization;

using Witsml.Data.Measures;
using Witsml.Extensions;

namespace Witsml.Data.Rig
{
    public class WitsmlRig : WitsmlObjectOnWellbore
    {
        public override WitsmlRigs AsItemInWitsmlList()
        {
            return new WitsmlRigs()
            {
                Rigs = this.AsItemInList()
            };
        }

        [XmlElement("owner")]
        public string Owner { get; set; }

        [XmlElement("typeRig")]
        public string TypeRig { get; set; }

        [XmlElement("manufacturer")]
        public string Manufacturer { get; set; }

        [XmlElement("yearEntService")]
        public string YearEntService { get; set; }

        [XmlElement("classRig")]
        public string ClassRig { get; set; }

        [XmlElement("approvals")]
        public string Approvals { get; set; }

        [XmlElement("registration")]
        public string Registration { get; set; }

        [XmlElement("telNumber")]
        public string TelNumber { get; set; }

        [XmlElement("faxNumber")]
        public string FaxNumber { get; set; }

        [XmlElement("emailAddress")]
        public string EmailAddress { get; set; }

        [XmlElement("nameContact")]
        public string NameContact { get; set; }

        [XmlElement("ratingDrillDepth")]
        public WitsmlLengthMeasure RatingDrillDepth { get; set; }

        [XmlElement("ratingWaterDepth")]
        public WitsmlLengthMeasure RatingWaterDepth { get; set; }

        [XmlElement("isOffshore")]
        public string IsOffshore { get; set; }

        [XmlElement("airGap")]
        public WitsmlLengthMeasure AirGap { get; set; }

        [XmlElement("dTimStartOp")]
        public string DTimStartOp { get; set; }

        [XmlElement("dTimEndOp")]
        public string DTimEndOp { get; set; }

        [XmlElement("bop")]
        public List<WitsmlBop> Bop { get; set; }

        [XmlElement("pit")]
        public List<WitsmlPit> Pit { get; set; }

        [XmlElement("pump")]
        public List<WitsmlPump> Pump { get; set; }

        [XmlElement("shaker")]
        public List<WitsmlShaker> Shaker { get; set; }

        [XmlElement("centrifuge")]
        public List<WitsmlCentrifuge> Centrifuge { get; set; }

        [XmlElement("hydrocyclone")]
        public List<WitsmlHydrocyclone> Hydrocyclone { get; set; }

        [XmlElement("degasser")]
        public List<WitsmlDegasser> Degasser { get; set; }

        [XmlElement("surfaceEquipment")]
        public WitsmlSurfaceEquipment SurfaceEquipment { get; set; }

        [XmlElement("numDerricks")]
        public string NumDerricks { get; set; }

        [XmlElement("typeDerrick")]
        public string TypeDerrick { get; set; }

        [XmlElement("ratingDerrick")]
        public WitsmlForceMeasure RatingDerrick { get; set; }

        [XmlElement("htDerrick")]
        public WitsmlLengthMeasure HtDerrick { get; set; }

        [XmlElement("ratingHkld")]
        public WitsmlForceMeasure RatingHkld { get; set; }

        [XmlElement("capWindDerrick")]
        public WitsmlVelocityMeasure CapWindDerrick { get; set; }

        [XmlElement("wtBlock")]
        public WitsmlForceMeasure WtBlock { get; set; }

        [XmlElement("ratingBlock")]
        public WitsmlForceMeasure RatingBlock { get; set; }

        [XmlElement("numBlockLines")]
        public string NumBlockLines { get; set; }

        [XmlElement("typeHook")]
        public string TypeHook { get; set; }

        [XmlElement("ratingHook")]
        public WitsmlForceMeasure RatingHook { get; set; }

        [XmlElement("sizeDrillLine")]
        public WitsmlLengthMeasure SizeDrillLine { get; set; }

        [XmlElement("typeDrawWorks")]
        public string TypeDrawWorks { get; set; }

        [XmlElement("powerDrawWorks")]
        public WitsmlPowerMeasure PowerDrawWorks { get; set; }

        [XmlElement("ratingDrawWorks")]
        public WitsmlForceMeasure RatingDrawWorks { get; set; }

        [XmlElement("motorDrawWorks")]
        public string MotorDrawWorks { get; set; }

        [XmlElement("descBrake")]
        public string DescBrake { get; set; }

        [XmlElement("typeSwivel")]
        public string TypeSwivel { get; set; }

        [XmlElement("ratingSwivel")]
        public WitsmlForceMeasure RatingSwivel { get; set; }

        [XmlElement("rotSystem")]
        public string RotSystem { get; set; }

        [XmlElement("descRotSystem")]
        public string DescRotSystem { get; set; }

        [XmlElement("ratingTqRotSys")]
        public WitsmlMomentOfForceMeasure RatingTqRotSys { get; set; }

        [XmlElement("rotSizeOpening")]
        public WitsmlLengthMeasure RotSizeOpening { get; set; }

        [XmlElement("ratingRotSystem")]
        public WitsmlForceMeasure RatingRotSystem { get; set; }

        [XmlElement("scrSystem")]
        public string ScrSystem { get; set; }

        [XmlElement("pipeHandlingSystem")]
        public string PipeHandlingSystem { get; set; }

        [XmlElement("capBulkMud")]
        public WitsmlVolumeMeasure CapBulkMud { get; set; }

        [XmlElement("capLiquidMud")]
        public WitsmlVolumeMeasure CapLiquidMud { get; set; }

        [XmlElement("capDrillWater")]
        public WitsmlVolumeMeasure CapDrillWater { get; set; }

        [XmlElement("capPotableWater")]
        public WitsmlVolumeMeasure CapPotableWater { get; set; }

        [XmlElement("capFuel")]
        public WitsmlVolumeMeasure CapFuel { get; set; }

        [XmlElement("capBulkCement")]
        public WitsmlVolumeMeasure CapBulkCement { get; set; }

        [XmlElement("mainEngine")]
        public string MainEngine { get; set; }

        [XmlElement("generator")]
        public string Generator { get; set; }

        [XmlElement("cementUnit")]
        public string CementUnit { get; set; }

        [XmlElement("numBunks")]
        public string NumBunks { get; set; }

        [XmlElement("bunksPerRoom")]
        public string BunksPerRoom { get; set; }

        [XmlElement("numCranes")]
        public string NumCranes { get; set; }

        [XmlElement("numAnch")]
        public string NumAnch { get; set; }

        [XmlElement("moorType")]
        public string MoorType { get; set; }

        [XmlElement("numGuideTens")]
        public string NumGuideTens { get; set; }

        [XmlElement("numRiserTens")]
        public string NumRiserTens { get; set; }

        [XmlElement("varDeckLdMx")]
        public WitsmlForceMeasure VarDeckLdMx { get; set; }

        [XmlElement("vdlStorm")]
        public WitsmlForceMeasure VdlStorm { get; set; }

        [XmlElement("numThrusters")]
        public string NumThrusters { get; set; }

        [XmlElement("azimuthing")]
        public string Azimuthing { get; set; }

        [XmlElement("motionCompensationMn")]
        public WitsmlForceMeasure MotionCompensationMn { get; set; }

        [XmlElement("motionCompensationMx")]
        public WitsmlForceMeasure MotionCompensationMx { get; set; }

        [XmlElement("strokeMotionCompensation")]
        public WitsmlLengthMeasure StrokeMotionCompensation { get; set; }

        [XmlElement("riserAngleLimit")]
        public WitsmlPlaneAngleMeasure RiserAngleLimit { get; set; }

        [XmlElement("heaveMx")]
        public WitsmlLengthMeasure HeaveMx { get; set; }

        [XmlElement("gantry")]
        public string Gantry { get; set; }

        [XmlElement("flares")]
        public string Flares { get; set; }

        [XmlElement("commonData")]
        public WitsmlCommonData CommonData { get; set; }
    }
}
