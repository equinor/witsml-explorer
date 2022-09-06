using System.Xml.Serialization;

using Witsml.Data.Measures;

namespace Witsml.Data
{
    public class WitsmlStnTrajMatrixCov
    {
        [XmlElement("varianceNN")] public Measure VarianceNn { get; set; }
        [XmlElement("varianceNE")] public Measure VarianceNe { get; set; }
        [XmlElement("varianceNVert")] public Measure VarianceNVert { get; set; }
        [XmlElement("varianceEE")] public Measure VarianceEe { get; set; }
        [XmlElement("varianceEVert")] public Measure VarianceEvert { get; set; }
        [XmlElement("varianceVertVert")] public Measure VarianceVertVert { get; set; }
        [XmlElement("biasN")] public Measure BiasN { get; set; }
        [XmlElement("biasE")] public Measure BiasE { get; set; }
        [XmlElement("biasVert")] public Measure BiasVert { get; set; }
    }
}
