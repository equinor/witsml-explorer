using System.Collections.Generic;
using System.Linq;
using System.Xml.Serialization;

namespace Witsml.Data
{
    [XmlRoot("attachments", Namespace = "http://www.witsml.org/schemas/1series")]
    public class WitsmlAttachments : IWitsmlObjectList
    {
        [XmlAttribute("version")]
        public string Version = "1.4.1.1";

        [XmlElement("attachment")]
        public List<WitsmlAttachment> Attachments { get; set; } = new();

        public string TypeName => "attachment";

        [XmlIgnore]
        public IEnumerable<WitsmlObjectOnWellbore> Objects
        {
            get => Attachments;
            set => Attachments = value.Select(obj => (WitsmlAttachment)obj).ToList();
        }
    }
}
