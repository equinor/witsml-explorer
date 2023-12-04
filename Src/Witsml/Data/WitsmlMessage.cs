using System.Collections.Generic;
using System.Xml.Serialization;

using Witsml.Data.Measures;
using Witsml.Extensions;

namespace Witsml.Data
{
    [XmlRoot]
    public class WitsmlMessage : WitsmlObjectOnWellbore
    {
        public override WitsmlMessages AsItemInWitsmlList()
        {
            return new WitsmlMessages()
            {
                Messages = this.AsItemInList()
            };
        }

        [XmlElement("objectReference")]
        public WitsmlObjectReference ObjectReference { get; set; }

        [XmlElement("subObjectReference")]
        public WitsmlObjectReference SubObjectReference { get; set; }

        [XmlElement("dTim")]
        public string DTim { get; set; }

        [XmlElement("activityCode")]
        public string ActivityCode { get; set; }

        [XmlElement("detailActivity")]
        public string DetailActivity { get; set; }

        [XmlElement("md")]
        public WitsmlMeasuredDepthCoord Md { get; set; }

        [XmlElement("mdBit")]
        public WitsmlMeasuredDepthCoord MdBit { get; set; }

        [XmlElement("typeMessage")]
        public string TypeMessage { get; set; }

        [XmlElement("messageText")]
        public string MessageText { get; set; }

        [XmlElement("param")]
        public List<WitsmlIndexedObject> Param { get; set; }

        [XmlElement("severity")]
        public string Severity { get; set; }

        [XmlElement("warnProbability")]
        public string WarnProbability { get; set; }

        [XmlElement("commonData")]
        public WitsmlCommonData CommonData { get; set; }

        [XmlElement("customData")]
        public WitsmlCustomData CustomData { get; set; }
    }
}
