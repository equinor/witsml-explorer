using System.Collections.Generic;
using System.Xml.Serialization;
using Witsml.Data.Measures;

namespace Witsml.Data
{
    public class WitsmlMudLog
    {
        [XmlAttribute("uidWell")]
        public string UidWell { get; set; }

        [XmlAttribute("uidWellbore")]
        public string UidWellbore { get; set; }

        [XmlAttribute("uid")]
        public string Uid { get; set; }

        [XmlElement("nameWell")]
        public string NameWell { get; set; }

        [XmlElement("nameWellbore")]
        public string NameWellbore { get; set; }

        [XmlElement("name")]
        public string Name { get; set; }

        [XmlElement("objectGrowing")]
        public string ObjectGrowing { get; set; }

        [XmlElement("mudLogCompany")]
        public string MudLogCompany { get; set; }

        [XmlElement("mudLogEngineers")]
        public string MudLogEngineers { get; set; }

        [XmlElement("startMd")]
        public WitsmlIndex StartMd { get; set; }

        [XmlElement("endMd")]
        public WitsmlIndex EndMd { get; set; }

        [XmlElement("geologyInterval")]
        public List<WitsmlMudLogGeologyInterval> GeologyInterval { get; set; }

        [XmlElement("commonData")]
        public WitsmlCommonData CommonData { get; set; }
    }
}
