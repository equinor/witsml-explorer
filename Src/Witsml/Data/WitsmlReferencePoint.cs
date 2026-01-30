using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Serialization;

namespace Witsml.Data
{
    public class WitsmlReferencePoint
    {
        [XmlAttribute("uid")]
        public string Uid { get; set; }
        [XmlElement("name")]
        public string Name { get; set; }
        [XmlElement("location")]
        public List<WitsmlLocation> Location { get; set; }

        public static WitsmlReferencePoint ToFetch()
        {
            return new()
            {
                Uid = string.Empty,
                Name = string.Empty,
                Location = new List<WitsmlLocation>()
                {
                    WitsmlLocation.ToFetch()
                }
            };
        }
    }
}
