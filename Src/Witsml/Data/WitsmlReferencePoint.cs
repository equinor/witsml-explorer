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
        [XmlElement("name")]
        public string Name { get; set; }
        [XmlElement("location")]
        public List<WitsmlLocation> Location { get; set; }

        public static WitsmlReferencePoint ToFetch()
        {
            return new()
            {
                Name = string.Empty,
                Location = new List<WitsmlLocation>()
                {
                    WitsmlLocation.ToFetch()
                }
            };
        }
    }
}
