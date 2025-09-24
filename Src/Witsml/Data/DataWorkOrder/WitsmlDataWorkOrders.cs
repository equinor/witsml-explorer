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
        public List<WitsmlDataWorker> DataWorkOrders { get; set; } = new List<WitsmlDataWorker>();

        public string TypeName => "dataWorkOrders";

        [XmlIgnore]
        public IEnumerable<WitsmlObjectOnWellbore> Objects
        {
            get => DataWorkOrders;
            set => DataWorkOrders = value.Select(obj => (WitsmlDataWorker)obj).ToList();
        }
    }
}
