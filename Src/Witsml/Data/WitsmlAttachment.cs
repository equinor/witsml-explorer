using System.Collections.Generic;
using System.Xml.Serialization;

using Witsml.Data.Measures;
using Witsml.Extensions;

namespace Witsml.Data
{
    public class WitsmlAttachment : WitsmlObjectOnWellbore
    {
        public override WitsmlAttachments AsItemInWitsmlList()
        {
            return new WitsmlAttachments()
            {
                Attachments = this.AsItemInList()
            };
        }

        [XmlElement("objectReference")]
        public WitsmlObjectReference ObjectReference { get; set; }

        [XmlElement("fileName")]
        public string FileName { get; set; }

        [XmlElement("description")]
        public string Description { get; set; }

        [XmlElement("fileType")]
        public string FileType { get; set; }

        [XmlElement("content")]
        public string Content { get; set; }

        [XmlElement("commonData")]
        public WitsmlCommonData CommonData { get; set; }

    }
}
