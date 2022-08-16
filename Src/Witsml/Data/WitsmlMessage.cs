using System.Xml.Serialization;

using Witsml.Extensions;

namespace Witsml.Data
{
    [XmlRoot]
    public class WitsmlMessage : ObjectOnWellbore<WitsmlMessages>
    {
        public override WitsmlMessages AsSingletonWitsmlList()
        {
            return new WitsmlMessages()
            {
                Messages = this.AsSingletonList()
            };
        }

        [XmlElement("messageText")]
        public string MessageText { get; set; }

        [XmlElement("objectReference")]
        public WitsmlObjectReference ObjectReference { get; set; }
        [XmlElement("commonData")]
        public WitsmlCommonData CommonData { get; set; }
    }
}
