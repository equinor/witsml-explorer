using System.Xml.Serialization;

using Witsml.Data.Measures;

namespace Witsml.Data
{
    public class WitsmlBhaRun
    {
        [XmlAttribute("uidWell")]
        public string WellUid { get; set; }

        [XmlAttribute("uidWellbore")]
        public string WellboreUid { get; set; }

        [XmlAttribute("uid")]
        public string Uid { get; set; }

        [XmlElement("nameWell")]
        public string WellName { get; set; }

        [XmlElement("nameWellbore")]
        public string WellboreName { get; set; }

        [XmlElement("name")]
        public string Name { get; set; }

        [XmlElement("tubular")]
        public WitsmlObjectReference Tubular { get; set; }

        [XmlElement("dTimStart")]
        public string DTimStart { get; set; }

        [XmlElement("dTimStop")]
        public string DTimStop { get; set; }

        [XmlElement("dTimStartDrilling")]
        public string DTimStartDrilling { get; set; }

        [XmlElement("dTimStopDrilling")]
        public string DTimStopDrilling { get; set; }

        [XmlElement("planDogLeg")]
        public WitsmlAnglePerLengthMeasure PlanDogLeg { get; set; }

        [XmlElement("actDogLeg")]
        public WitsmlAnglePerLengthMeasure ActDogLeg { get; set; }

        [XmlElement("actDogLegMx")]
        public WitsmlAnglePerLengthMeasure ActDogLegMx { get; set; }

        [XmlElement("statusBha")]
        public string StatusBha { get; set; }

        [XmlElement("numBitRun")]
        public string NumBitRun { get; set; }

        [XmlElement("numStringRun")]
        public string NumStringRun { get; set; }

        [XmlElement("reasonTrip")]
        public string ReasonTrip { get; set; }

        [XmlElement("objectiveBha")]
        public string ObjectiveBha { get; set; }

        [XmlElement("commonData")]
        public WitsmlCommonData CommonData { get; set; }
    }
}
