using System.Collections.Generic;
using System.Xml;
using System.Xml.Serialization;

using Witsml.Data.Measures;
using Witsml.Extensions;

namespace Witsml.Data.Tubular
{
    public class WitsmlTubular : WitsmlObjectOnWellbore
    {
        public override WitsmlTubulars AsSingletonWitsmlList()
        {
            return new WitsmlTubulars()
            {
                Tubulars = this.AsSingletonList()
            };
        }

        [XmlElement("typeTubularAssy")]
        public string TypeTubularAssy { get; set; }

        [XmlElement("typeTubularAssy2")]
        public string TypeTubularAssy2 { get; set; }

        [XmlIgnore]
        public bool? ValveFloat { get; set; }
        [XmlElement("valveFloat")]
        public string ValveFloatText
        {
            get => ValveFloat.HasValue ? XmlConvert.ToString(ValveFloat.Value) : null;
            set => ValveFloat = string.IsNullOrEmpty(value) ? default(bool?) : bool.Parse(value);
        }

        [XmlIgnore]
        public bool? SourceNuclear { get; set; }
        [XmlElement("sourceNuclear")]
        public string SourceNuclearText
        {
            get => SourceNuclear.HasValue ? XmlConvert.ToString(SourceNuclear.Value) : null;
            set => SourceNuclear = string.IsNullOrEmpty(value) ? default(bool?) : bool.Parse(value);
        }

        [XmlElement("diaHoleAssy")]
        public Measure DiaHoleAssy { get; set; }

        [XmlElement("tubularComponent")]
        public List<WitsmlTubularComponent> TubularComponents { get; set; }

        [XmlElement("commonData")]
        public WitsmlCommonData CommonData { get; set; }

        [XmlElement("customData")]
        public WitsmlCustomData CustomData { get; set; }

    }
}
