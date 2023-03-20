using System.Xml.Serialization;

namespace Witsml.Data.Measures
{
    public class WitsmlMeasureWithDatum : Measure
    {
        [XmlAttribute("datum")] public string Datum { get; set; } = null;

        public static WitsmlMeasureWithDatum ToFetch()
        {
            return new()
            {
                Uom = "",
                Value = "",
                Datum = ""
            };
        }
    }
}
