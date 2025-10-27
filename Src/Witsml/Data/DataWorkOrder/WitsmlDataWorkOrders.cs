using System.Collections.Generic;
using System.Linq;
using System.Xml.Serialization;

namespace Witsml.Data.DataWorkOrder
{
    [XmlRoot("dataWorkOrders", Namespace = "http://www.witsml.org/schemas/1series")]
    public class WitsmlDataWorkOrders : IWitsmlObjectList
    {
        [XmlAttribute("version")]
        public string Version = "1.4.1.1";

        [XmlElement("dataWorkOrder")]
        public List<WitsmlDataWorkOrder> DataWorkOrders { get; set; } = new List<WitsmlDataWorkOrder>();

        public string TypeName => "dataWorkOrder";

        [XmlIgnore]
        public IEnumerable<WitsmlObjectOnWellbore> Objects
        {
            get => DataWorkOrders;
            set => DataWorkOrders = value.Select(obj => (WitsmlDataWorkOrder)obj).ToList();
        }
    }
}
