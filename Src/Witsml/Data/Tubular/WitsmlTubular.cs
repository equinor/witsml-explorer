using System.Collections.Generic;
using System.Xml;
using System.Xml.Serialization;

using Witsml.Data.Measures;
using Witsml.Extensions;

namespace Witsml.Data.Tubular
{
    public class WitsmlTubular : WitsmlObjectOnWellbore
    {
        public override WitsmlTubulars AsItemInWitsmlList()
        {
            return new WitsmlTubulars()
            {
                Tubulars = this.AsItemInList()
            };
        }

        [XmlElement("typeTubularAssy")]
        public string TypeTubularAssy { get; set; }

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
