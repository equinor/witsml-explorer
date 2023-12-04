using System.Collections.Generic;
using System.Xml.Serialization;

using Witsml.Extensions;

namespace Witsml.Data
{
    public class WitsmlChangeLog
    {
        public WitsmlChangeLogs AsSingletonWitsmlList()
        {
            return new WitsmlChangeLogs()
            {
                ChangeLogs = this.AsItemInList()
            };
        }

        [XmlAttribute("uidWell")]
        public string UidWell { get; set; }

        [XmlAttribute("uidWellbore")]
        public string UidWellbore { get; set; }

        [XmlAttribute("uidObject")]
        public string UidObject { get; set; }

        [XmlElement("nameWell")]
        public string NameWell { get; set; }

        [XmlElement("nameWellbore")]
        public string NameWellbore { get; set; }

        [XmlElement("nameObject")]
        public string NameObject { get; set; }

        [XmlElement("objectType")]
        public string ObjectType { get; set; }

        [XmlElement("sourceName")]
        public string SourceName { get; set; }

        [XmlElement("lastChangeType")]
        public string LastChangeType { get; set; }

        [XmlElement("lastChangeInfo")]
        public string LastChangeInfo { get; set; }

        [XmlElement("changeHistory")]
        public List<WitsmlChangeHistory> ChangeHistory { get; set; }

        [XmlElement("commonData")]
        public WitsmlCommonData CommonData { get; set; }

        [XmlElement("customData")]
        public WitsmlCustomData CustomData { get; set; }
    }
}
