using System.Collections.Generic;
using System.Xml.Serialization;

using Witsml.Data.Measures;

namespace Witsml.Data.MudLog
{
    public class WitsmlMudLogGeologyInterval : IWitsmlQueryType
    {
        [XmlAttribute("uid")]
        public string Uid { get; set; }

        [XmlElement("typeLithology")]
        public string TypeLithology { get; set; }

        [XmlElement("mdTop")]
        public WitsmlMeasureWithDatum MdTop { get; set; }

        [XmlElement("mdBottom")]
        public WitsmlMeasureWithDatum MdBottom { get; set; }

        [XmlElement("dTim")]
        public string DTim { get; set; }

        [XmlElement("tvdTop")]
        public WitsmlMeasureWithDatum TvdTop { get; set; }

        [XmlElement("tvdBase")]
        public WitsmlMeasureWithDatum TvdBase { get; set; }

        [XmlElement("ropAv")]
        public Measure RopAv { get; set; }

        [XmlElement("ropMn")]
        public Measure RopMn { get; set; }

        [XmlElement("ropMx")]
        public Measure RopMx { get; set; }

        [XmlElement("wobAv")]
        public Measure WobAv { get; set; }

        [XmlElement("tqAv")]
        public Measure TqAv { get; set; }

        [XmlElement("currentAv")]
        public Measure CurrentAv { get; set; }

        [XmlElement("rpmAv")]
        public Measure RpmAv { get; set; }

        [XmlElement("wtMudAv")]
        public Measure WtMudAv { get; set; }

        [XmlElement("ecdTdAv")]
        public Measure EcdTdAv { get; set; }

        [XmlElement("dxcAv")]
        public string DxcAv { get; set; }

        [XmlElement("lithology")]
        public List<WitsmlMudLogLithology> Lithologies { get; set; }

        [XmlElement("show")]
        public WitsmlShow Show { get; set; }

        [XmlElement("chromatograph")]
        public WitsmlChromatograph Chromatograph { get; set; }

        [XmlElement("mudGas")]
        public WitsmlMudGas MudGas { get; set; }

        [XmlElement("densBulk")]
        public Measure DensBulk { get; set; }

        [XmlElement("densShale")]
        public Measure DensShale { get; set; }

        [XmlElement("calcite")]
        public Measure Calcite { get; set; }

        [XmlElement("dolomite")]
        public Measure Dolomite { get; set; }

        [XmlElement("cec")]
        public Measure Cec { get; set; }

        [XmlElement("qft")]
        public Measure Qft { get; set; }

        [XmlElement("calcStab")]
        public Measure CalcStab { get; set; }

        /// <summary>
        /// Deprecated as of WITSML version 1.4.1"
        /// </summary>
        [XmlElement("nameFormation")]
        public List<string> NameFormation { get; set; }

        [XmlElement("lithostratigraphic")]
        public List<WitsmlLithostratigraphyStruct> Lithostratigraphic { get; set; }

        [XmlElement("chronostratigraphic")]
        public List<WitsmlChronostratigraphyStruct> Chronostratigraphic { get; set; }

        [XmlElement("sizeMn")]
        public Measure SizeMn { get; set; }

        [XmlElement("sizeMx")]
        public Measure SizeMx { get; set; }

        [XmlElement("lenPlug")]
        public Measure LenPlug { get; set; }

        [XmlElement("description")]
        public string Description { get; set; }

        [XmlElement("cuttingFluid")]
        public string CuttingFluid { get; set; }

        [XmlElement("cleaningMethod")]
        public string CleaningMethod { get; set; }

        [XmlElement("dryingMethod")]
        public string DryingMethod { get; set; }

        [XmlElement("comments")]
        public string Comments { get; set; }

        [XmlElement("commonTime")]
        public WitsmlCommonTime CommonTime { get; set; }

        public string TypeName => "geologyInterval";
    }
}
