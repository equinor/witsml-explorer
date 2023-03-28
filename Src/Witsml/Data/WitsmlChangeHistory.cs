using System.Xml.Serialization;

using Witsml.Data.Measures;

namespace Witsml.Data
{
    public class WitsmlChangeHistory
    {
        [XmlElement("uid")]
        public string Uid { get; set; }

        [XmlElement("dTimChange")]
        public string DTimChange { get; set; }

        [XmlElement("changeType")]
        public string ChangeType { get; set; }

        [XmlElement("objectGrowingState")]
        public string ObjectGrowingState { get; set; }

        [XmlElement("updatedHeader")]
        public string UpdatedHeader { get; set; }

        [XmlElement("changeInfo")]
        public string ChangeInfo { get; set; }

        [XmlElement("startIndex")]
        public Measure StartIndex { get; set; }

        [XmlElement("endIndex")]
        public Measure EndIndex { get; set; }

        [XmlElement("startDateTimeIndex")]
        public string StartDateTimeIndex { get; set; }

        [XmlElement("endDateTimeIndex")]
        public string EndDateTimeIndex { get; set; }

        [XmlElement("mnemonics")]
        public string Mnemonics { get; set; }
    }
}
