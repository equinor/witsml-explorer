using System.Xml.Serialization;

using Witsml.Extensions;

namespace Witsml.Data
{
    [XmlRoot]
    public class WitsmlMessage : WitsmlObjectOnWellbore
    {
        public override WitsmlMessages AsSingletonWitsmlList()
        {
            return new WitsmlMessages()
            {
                Messages = this.AsSingletonList()
            };
        }

        [XmlElement("dTim")]
        public string DTim { get; set; }

        [XmlElement("messageText")]
        public string MessageText { get; set; }

        [XmlElement("typeMessage")]
        public string TypeMessage { get; set; }

        [XmlElement("objectReference")]
        public WitsmlObjectReference ObjectReference { get; set; }

        [XmlElement("commonData")]
        public WitsmlCommonData CommonData { get; set; }
    }
}
