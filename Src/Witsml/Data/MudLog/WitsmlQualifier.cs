using System.Xml.Serialization;

using Witsml.Data.Measures;

namespace Witsml.Data.MudLog
{
    public class WitsmlQualifier
    {
        [XmlAttribute("uid")]
        public string Uid { get; set; }

        [XmlElement("type")]
        public string Type { get; set; }

        [XmlElement("mdTop")]
        public WitsmlMeasureWithDatum MdTop { get; set; }

        [XmlElement("mdBottom")]
        public WitsmlMeasureWithDatum MdBottom { get; set; }

        [XmlElement("abundance")]
        public Measure Abundance { get; set; }

        /// <summary>
        /// Deprecated as of WITSML version 1.4.1"
        /// </summary>
        [XmlElement("abundanceCode")]
        public string AbundanceCode { get; set; }

        [XmlElement("description")]
        public string Description { get; set; }

    }
}
