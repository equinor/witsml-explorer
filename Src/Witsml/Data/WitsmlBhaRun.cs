using System.Collections.Generic;
using System.Xml.Serialization;

using Witsml.Data.Measures;
using Witsml.Extensions;

namespace Witsml.Data
{
    public class WitsmlBhaRun : ObjectOnWellbore<WitsmlBhaRuns>
    {
        public override WitsmlBhaRuns AsSingletonWitsmlList()
        {
            return new WitsmlBhaRuns()
            {
                BhaRuns = this.AsSingletonList()
            };
        }

        [XmlElement("tubular")]
        public WitsmlRefNameString Tubular { get; set; }

        [XmlElement("dTimStart")]
        public string DTimStart { get; set; }

        [XmlElement("dTimStop")]
        public string DTimStop { get; set; }

        [XmlElement("dTimStartDrilling")]
        public string DTimStartDrilling { get; set; }

        [XmlElement("dTimStopDrilling")]
        public string DTimStopDrilling { get; set; }

        [XmlElement("planDogleg")]
        public WitsmlAnglePerLengthMeasure PlanDogleg { get; set; }

        [XmlElement("actDogleg")]
        public WitsmlAnglePerLengthMeasure ActDogleg { get; set; }

        [XmlElement("actDoglegMx")]
        public WitsmlAnglePerLengthMeasure ActDoglegMx { get; set; }

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

        [XmlElement("drillingParams")]
        public List<WitsmlDrillingParams> DrillingParams { get; set; }

        [XmlElement("commonData")]
        public WitsmlCommonData CommonData { get; set; }

        [XmlElement("customData")]
        public WitsmlCustomData CustomData { get; set; }
    }
}
