using System.Collections.Generic;
using System.Xml.Serialization;

namespace Witsml.Data
{
    public class WitsmlLogData : IWitsmlQueryType
    {
        [XmlElement("mnemonicList")]
        public string MnemonicList { get; set; }

        [XmlElement("unitList")]
        public string UnitList { get; set; }

        [XmlElement("data")]
        public List<WitsmlData> Data { get; set; }

        public string TypeName => "data";
    }
}
