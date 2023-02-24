using System.Collections.Generic;
using System.Xml.Serialization;

namespace Witsml.Data
{
    public interface IWitsmlObjectList : IWitsmlQueryType
    {
        [XmlIgnore]
        IEnumerable<ObjectOnWellbore> Objects { get; set; }
    }
}
