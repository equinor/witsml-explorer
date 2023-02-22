using System.Xml.Serialization;

using Witsml.Data.Measures;

namespace Witsml.Data.MudLog
{
    public class WitsmlMudGas
    {
        [XmlElement("gasAv")]
        public Measure GasAv { get; set; }

        [XmlElement("gasPeak")]
        public Measure GasPeak { get; set; }

        [XmlElement("gasPeakType")]
        public string GasPeakType { get; set; }

        [XmlElement("gasBackgnd")]
        public Measure GasBackgnd { get; set; }

        [XmlElement("gasConAv")]
        public Measure GasConAv { get; set; }

        [XmlElement("gasConMx")]
        public Measure GasConMx { get; set; }

        [XmlElement("gasTrip")]
        public Measure GasTrip { get; set; }

    }
}


