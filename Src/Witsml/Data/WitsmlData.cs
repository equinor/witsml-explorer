using System.Xml.Serialization;

using Witsml.Data.Curves;

namespace Witsml.Data
{
    public class WitsmlData : IWitsmlQueryType
    {
        [XmlText]
        public string Data { get; set; } = "";

        public Point GetPoint()
        {
            return new(Data);
        }

        public Row GetRow()
        {
            return new(Data);
        }

        public string TypeName => "data";
    }
}
