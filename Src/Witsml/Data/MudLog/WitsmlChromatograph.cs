using System.Xml.Serialization;

using Witsml.Data.Measures;

namespace Witsml.Data.MudLog
{
    public class WitsmlChromatograph
    {
        [XmlElement("dTim")]
        public string DTim { get; set; }

        [XmlElement("mdTop")]
        public WitsmlMeasureWithDatum MdTop { get; set; }

        [XmlElement("mdBottom")]
        public WitsmlMeasureWithDatum MdBottom { get; set; }

        [XmlElement("wtMudIn")]
        public Measure WtMudIn { get; set; }

        [XmlElement("wtMudOut")]
        public Measure WtMudOut { get; set; }

        [XmlElement("chromType")]
        public string ChromType { get; set; }

        [XmlElement("eTimChromCycle")]
        public Measure ETimChromCycle { get; set; }

        [XmlElement("chromIntRpt")]
        public string ChromIntRpt { get; set; }

        [XmlElement("methAv")]
        public Measure MethAv { get; set; }

        [XmlElement("methMn")]
        public Measure MethMn { get; set; }

        [XmlElement("methMx")]
        public Measure MethMx { get; set; }

        [XmlElement("ethAv")]
        public Measure EthAv { get; set; }

        [XmlElement("ethMn")]
        public Measure EthMn { get; set; }

        [XmlElement("ethMx")]
        public Measure EthMx { get; set; }

        [XmlElement("propAv")]
        public Measure PropAv { get; set; }

        [XmlElement("propMn")]
        public Measure PropMn { get; set; }

        [XmlElement("propMx")]
        public Measure PropMx { get; set; }

        [XmlElement("ibutAv")]
        public Measure IbutAv { get; set; }

        [XmlElement("ibutMn")]
        public Measure IbutMn { get; set; }

        [XmlElement("ibutMx")]
        public Measure IbutMx { get; set; }

        [XmlElement("nbutAv")]
        public Measure NbutAv { get; set; }

        [XmlElement("nbutMn")]
        public Measure NbutMn { get; set; }

        [XmlElement("nbutMx")]
        public Measure NbutMx { get; set; }

        [XmlElement("ipentAv")]
        public Measure IpentAv { get; set; }

        [XmlElement("ipentMn")]
        public Measure IpentMn { get; set; }

        [XmlElement("ipentMx")]
        public Measure IpentMx { get; set; }

        [XmlElement("npentAv")]
        public Measure NpentAv { get; set; }

        [XmlElement("npentMn")]
        public Measure NpentMn { get; set; }

        [XmlElement("npentMx")]
        public Measure NpentMx { get; set; }

        [XmlElement("epentAv")]
        public Measure EpentAv { get; set; }

        [XmlElement("epentMn")]
        public Measure EpentMn { get; set; }

        [XmlElement("epentMx")]
        public Measure EpentMx { get; set; }

        [XmlElement("ihexAv")]
        public Measure IhexAv { get; set; }

        [XmlElement("ihexMn")]
        public Measure IhexMn { get; set; }

        [XmlElement("ihexMx")]
        public Measure IhexMx { get; set; }

        [XmlElement("nhexAv")]
        public Measure NhexAv { get; set; }

        [XmlElement("nhexMn")]
        public Measure NhexMn { get; set; }

        [XmlElement("nhexMx")]
        public Measure NhexMx { get; set; }

        [XmlElement("co2Av")]
        public Measure Co2Av { get; set; }

        [XmlElement("co2Mn")]
        public Measure Co2Mn { get; set; }

        [XmlElement("co2Mx")]
        public Measure Co2Mx { get; set; }

        [XmlElement("h2sAv")]
        public Measure H2sAv { get; set; }

        [XmlElement("h2sMn")]
        public Measure H2sMn { get; set; }

        [XmlElement("h2sMx")]
        public Measure H2sMx { get; set; }

        [XmlElement("acetylene")]
        public Measure Acetylene { get; set; }
    }
}


