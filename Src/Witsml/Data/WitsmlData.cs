using System.Xml.Serialization;
using Witsml.Data.Curves;

namespace Witsml.Data
{
    public class WitsmlData : IWitsmlQueryType
    {
        [XmlText]
        public string Data { get; set; } = "";

        public Point GetPoint() => new Point(Data);

        public Row GetRow() => new Row(Data);

        public string TypeName => "data";
    }
}
