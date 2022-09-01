using System.Collections.Generic;
using System.Xml.Serialization;

using Witsml.Data.Measures;

namespace Witsml.Data.Rig
{
    public class WitsmlShaker
    {
        [XmlAttribute("uid")]
        public string Uid { get; set; }

        [XmlElement("name")]
        public string Name { get; set; }

        [XmlElement("manufacturer")]
        public string Manufacturer { get; set; }

        [XmlElement("model")]
        public string Model { get; set; }

        [XmlElement("dTimInstall")]
        public string DTimInstall { get; set; }

        [XmlElement("dTimRemove")]
        public string DTimRemove { get; set; }

        [XmlElement("type")]
        public string Type { get; set; }

        [XmlElement("locationShaker")]
        public string LocationShaker { get; set; }

        [XmlElement("numDecks")]
        public string NumDecks { get; set; }

        [XmlElement("numCascLevel")]
        public string NumCascLevel { get; set; }

        [XmlElement("mudCleaner")]
        public string MudCleaner { get; set; }
        [XmlElement("capFlow")]
        public WitsmlFlowRateMeasure CapFlow { get; set; }

        [XmlElement("owner")]
        public string Owner { get; set; }

        [XmlElement("sizeMeshMn")]
        public WitsmlLengthMeasure SizeMeshMn { get; set; }

        [XmlElement("nameTag")]
        public List<WitsmlNameTag> NameTag { get; set; }
    }
}
