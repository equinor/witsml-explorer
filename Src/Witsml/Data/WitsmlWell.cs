using System;
using System.Collections.Generic;
using System.Xml.Serialization;

using Witsml.Data.Measures;

namespace Witsml.Data
{
    public class WitsmlDatumName
    {
        [XmlAttribute("namingSystem")]
        public string NamingSystem { get; set; }

        [XmlAttribute("code")]
        public string Code { get; set; }

        [XmlText]
        public string Value { get; set; }
    }

    public class WitsmlWellDatumWellbore
    {
        [XmlElement("wellboreReference")]
        public WitsmlRefNameString WellboreReference { get; set; }

        [XmlElement("wellParent")]
        public WitsmlRefNameString WellParent { get; set; }
    }

    public class WitsmlWellDatumRig
    {
        [XmlElement("rigReference")]
        public WitsmlRefNameString RigReference { get; set; }

        [XmlElement("wellboreParent")]
        public WitsmlRefNameString WellboreParent { get; set; }

        [XmlElement("wellParent")]
        public WitsmlRefNameString WellParent { get; set; }
    }

    public class WitsmlWellDatum
    {
        [XmlAttribute("uid")]
        public string Uid { get; set; }

        [XmlElement("name")]
        public string Name { get; set; }

        [XmlElement("code")]
        public string Code { get; set; }

        [XmlElement("datumName")]
        public WitsmlDatumName DatumName { get; set; }

        [XmlElement("datumCRS")]
        public WitsmlRefNameString DatumCRS { get; set; }

        [XmlElement("kind")]
        public string Kind { get; set; }

        [XmlElement("wellbore")]
        public WitsmlWellDatumWellbore Wellbore { get; set; }

        [XmlElement("rig")]
        public WitsmlWellDatumRig Rig { get; set; }

        [XmlElement("elevation")]
        public WitsmlMeasureWithDatum Elevation { get; set; }

        [XmlElement("measuredDepth")]
        public WitsmlMeasureWithDatum MeasuredDepth { get; set; }

        [XmlElement("horizontalLocation")]
        public WitsmlLocation HorizontalLocation { get; set; }

        [XmlElement("comment")]
        public string Comment { get; set; }

        [XmlElement("extensionNameValue")]
        public List<WitsmlExtensionNameValue> ExtensionNameValues { get; set; }

        public static WitsmlWellDatum ToFetch()
        {
            return new()
            {
                Uid = string.Empty,
                Name = string.Empty,
                Code = string.Empty,
                Elevation = WitsmlMeasureWithDatum.ToFetch()
            };
        }
    }

    public class WitsmlWell
    {
        [XmlAttribute("uid")]
        public string Uid { get; set; }

        [XmlElement("name")]
        public string Name { get; set; }

        [XmlElement("nameLegal")]
        public string NameLegal { get; set; }

        [XmlElement("numLicense")]
        public string NumLicense { get; set; }

        [XmlElement("numGovt")]
        public string NumGovt { get; set; }

        [XmlElement("dTimLicense")]
        public string DTimLicense { get; set; }

        [XmlElement("field")]
        public string Field { get; set; }

        [XmlElement("country")]
        public string Country { get; set; }

        [XmlElement("state")]
        public string State { get; set; }

        [XmlElement("county")]
        public string County { get; set; }

        [XmlElement("region")]
        public string Region { get; set; }

        [XmlElement("district")]
        public string District { get; set; }

        [XmlElement("block")]
        public string Block { get; set; }

        [XmlElement("timeZone")]
        public string TimeZone { get; set; }

        [XmlElement("operator")]
        public string Operator { get; set; }

        [XmlElement("operatorDiv")]
        public string OperatorDiv { get; set; }

        [XmlElement("pcInterest")]
        public Measure PcInterest { get; set; }

        [XmlElement("numAPI")]
        public string NumAPI { get; set; }

        [XmlElement("statusWell")]
        public string StatusWell { get; set; }

        [XmlElement("purposeWell")]
        public string PurposeWell { get; set; }

        [XmlElement("fluidWell")]
        public string FluidWell { get; set; }

        [XmlElement("directionWell")]
        public string DirectionWell { get; set; }

        [XmlElement("dTimSpud")]
        public string DTimSpud { get; set; }

        [XmlElement("dTimPa")]
        public string DTimPa { get; set; }

        [XmlElement("wellheadElevation")]
        public WitsmlMeasureWithDatum WellheadElevation { get; set; }

        [XmlElement("wellDatum")]
        public List<WitsmlWellDatum> WellDatum { get; set; }

        [XmlElement("groundElevation")]
        public WitsmlMeasureWithDatum GroundElevation { get; set; }

        [XmlElement("waterDepth")]
        public WitsmlLengthMeasure WaterDepth { get; set; }

        [XmlElement("wellLocation")]
        public List<WitsmlLocation> WellLocation { get; set; }

        [XmlElement("wellPublicLandSurveySystemLocation")]
        public WitsmlPublicLandSurveySystemLocation WellPublicLandSurveySystemLocation { get; set; }

        [XmlElement("referencePoint")]
        public List<WitsmlReferencePoint> ReferencePoint { get; set; }

        [XmlElement("wellCRS")]
        public List<WitsmlWellCRS> WellCRS { get; set; }

        [XmlElement("commonData")]
        public WitsmlCommonData CommonData { get; set; }

        [XmlElement("customData")]
        public WitsmlCustomData CustomData { get; set; }
    }
}
