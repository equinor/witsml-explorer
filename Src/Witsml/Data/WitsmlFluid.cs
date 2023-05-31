using System.Collections.Generic;
using System.Xml.Serialization;

using Witsml.Data.Measures;

namespace Witsml.Data
{
    public class WitsmlFluid
    {
        [XmlAttribute("uid")]
        public string Uid { get; set; }

        [XmlElement("type")]
        public string Type { get; set; }

        [XmlElement("locationSample")]
        public string LocationSample { get; set; }

        [XmlElement("dTim")]
        public string DTim { get; set; }

        [XmlElement("md")]
        public WitsmlMeasuredDepthCoord Md { get; set; }

        [XmlElement("tvd")]
        public WitsmlWellVerticalDepthCoord Tvd { get; set; }

        [XmlElement("presBopRating")]
        public WitsmlPressureMeasure PresBopRating { get; set; }

        [XmlElement("mudClass")]
        public string MudClass { get; set; }

        [XmlElement("density")]
        public Measure Density { get; set; }

        [XmlElement("visFunnel")]
        public Measure VisFunnel { get; set; }

        [XmlElement("tempVis")]
        public Measure TempVis { get; set; }

        [XmlElement("pv")]
        public Measure Pv { get; set; }

        [XmlElement("yp")]
        public Measure Yp { get; set; }

        [XmlElement("gel10Sec")]
        public Measure Gel10Sec { get; set; }

        [XmlElement("gel10Min")]
        public Measure Gel10Min { get; set; }

        [XmlElement("gel30Min")]
        public Measure Gel30Min { get; set; }

        [XmlElement("filterCakeLtlp")]
        public Measure FilterCakeLtlp { get; set; }

        [XmlElement("filtrateLtlp")]
        public Measure FiltrateLtlp { get; set; }

        [XmlElement("tempHthp")]
        public Measure TempHthp { get; set; }

        [XmlElement("presHthp")]
        public Measure PresHthp { get; set; }

        [XmlElement("filtrateHthp")]
        public Measure FiltrateHthp { get; set; }

        [XmlElement("filterCakeHthp")]
        public Measure FilterCakeHthp { get; set; }

        [XmlElement("solidsPc")]
        public Measure SolidsPc { get; set; }

        [XmlElement("waterPc")]
        public Measure WaterPc { get; set; }

        [XmlElement("oilPc")]
        public Measure OilPc { get; set; }

        [XmlElement("sandPc")]
        public Measure SandPc { get; set; }

        [XmlElement("solidsLowGravPc")]
        public Measure SolidsLowGravPc { get; set; }

        [XmlElement("solidsCalcPc")]
        public Measure SolidsCalcPc { get; set; }

        [XmlElement("baritePc")]
        public Measure BaritePc { get; set; }

        [XmlElement("lcm")]
        public Measure Lcm { get; set; }

        [XmlElement("mbt")]
        public Measure Mbt { get; set; }

        [XmlElement("ph")]
        public string Ph { get; set; }

        [XmlElement("tempPh")]
        public Measure TempPh { get; set; }

        [XmlElement("pm")]
        public Measure Pm { get; set; }

        [XmlElement("pmFiltrate")]
        public Measure PmFiltrate { get; set; }

        [XmlElement("mf")]
        public Measure Mf { get; set; }

        [XmlElement("alkalinityP1")]
        public Measure AlkalinityP1 { get; set; }

        [XmlElement("alkalinityP2")]
        public Measure AlkalinityP2 { get; set; }

        [XmlElement("chloride")]
        public Measure Chloride { get; set; }

        [XmlElement("calcium")]
        public Measure Calcium { get; set; }

        [XmlElement("magnesium")]
        public Measure Magnesium { get; set; }

        [XmlElement("potassium")]
        public Measure Potassium { get; set; }

        [XmlElement("rheometer")]
        public List<WitsmlRheometer> Rheometers { get; set; }

        [XmlElement("brinePc")]
        public Measure BrinePc { get; set; }

        [XmlElement("lime")]
        public Measure Lime { get; set; }

        [XmlElement("electStab")]
        public Measure ElectStab { get; set; }

        [XmlElement("calciumChloride")]
        public Measure CalciumChloride { get; set; }

        [XmlElement("company")]
        public string Company { get; set; }

        [XmlElement("engineer")]
        public string Engineer { get; set; }

        [XmlElement("asg")]
        public string Asg { get; set; }

        [XmlElement("solidsHiGravPc")]
        public Measure SolidsHiGravPc { get; set; }

        [XmlElement("polymer")]
        public Measure Polymer { get; set; }

        [XmlElement("polyType")]
        public string PolyType { get; set; }

        [XmlElement("solCorPc")]
        public Measure SolCorPc { get; set; }

        [XmlElement("oilCtg")]
        public Measure OilCtg { get; set; }

        [XmlElement("hardnessCa")]
        public Measure HardnessCa { get; set; }

        [XmlElement("sulfide")]
        public Measure Sulfide { get; set; }

        [XmlElement("comments")]
        public string Comments { get; set; }
    }
}
