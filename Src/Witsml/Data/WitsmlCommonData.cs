using System.Xml.Serialization;

namespace Witsml.Data
{
    [XmlRoot]
    public class WitsmlCommonData
    {
        [XmlElement("sourceName")]
        public string SourceName { get; set; }

        [XmlElement("dTimCreation")]
        public string DTimCreation { get; set; }

        [XmlElement("dTimLastChange")]
        public string DTimLastChange { get; set; }

        [XmlElement("itemState")]
        public string ItemState { get; set; }

        [XmlElement("serviceCategory")]
        public string ServiceCategory { get; set; }

        [XmlElement("comments")]
        public string Comments { get; set; }

        [XmlElement("acquisitionTimeZone")]
        public string AcquisitionTimeZone { get; set; }

        [XmlElement("defaultDatum")]
        public string DefaultDatum { get; set; }

        [XmlElement("privateGroupOnly")]
        public string PrivateGroupOnly { get; set; }

    }
}
