using System.Collections.Generic;

using WitsmlExplorer.Api.Models.Measure;

namespace WitsmlExplorer.Api.Models
{
    public class Fluid
    {
        public string Uid { get; init; }
        public string Type { get; init; }
        public string LocationSample { get; init; }
        public string DTim { get; init; }
        public MeasureWithDatum Md { get; init; }
        public MeasureWithDatum Tvd { get; init; }
        public LengthMeasure PresBopRating { get; init; }
        public string MudClass { get; init; }
        public LengthMeasure Density { get; init; }
        public LengthMeasure VisFunnel { get; init; }
        public LengthMeasure TempVis { get; init; }
        public LengthMeasure Pv { get; init; }
        public LengthMeasure Yp { get; init; }
        public LengthMeasure Gel10Sec { get; init; }
        public LengthMeasure Gel10Min { get; init; }
        public LengthMeasure Gel30Min { get; init; }
        public LengthMeasure FilterCakeLtlp { get; init; }
        public LengthMeasure FiltrateLtlp { get; init; }
        public LengthMeasure TempHthp { get; init; }
        public LengthMeasure PresHthp { get; init; }
        public LengthMeasure FiltrateHthp { get; init; }
        public LengthMeasure FilterCakeHthp { get; init; }
        public LengthMeasure SolidsPc { get; init; }
        public LengthMeasure WaterPc { get; init; }
        public LengthMeasure OilPc { get; init; }
        public LengthMeasure SandPc { get; init; }
        public LengthMeasure SolidsLowGravPc { get; init; }
        public LengthMeasure SolidsCalcPc { get; init; }
        public LengthMeasure BaritePc { get; init; }
        public LengthMeasure Lcm { get; init; }
        public LengthMeasure Mbt { get; init; }
        public string Ph { get; init; }
        public LengthMeasure TempPh { get; init; }
        public LengthMeasure Pm { get; init; }
        public LengthMeasure PmFiltrate { get; init; }
        public LengthMeasure Mf { get; init; }
        public LengthMeasure AlkalinityP1 { get; init; }
        public LengthMeasure AlkalinityP2 { get; init; }
        public LengthMeasure Chloride { get; init; }
        public LengthMeasure Calcium { get; init; }
        public LengthMeasure Magnesium { get; init; }
        public LengthMeasure Potassium { get; init; }
        public List<Rheometer> Rheometers { get; init; }
        public LengthMeasure BrinePc { get; init; }
        public LengthMeasure Lime { get; init; }
        public LengthMeasure ElectStab { get; init; }
        public LengthMeasure CalciumChloride { get; init; }
        public string Company { get; init; }
        public LengthMeasure SolidsHiGravPc { get; init; }
        public LengthMeasure Polymer { get; init; }
        public string PolyType { get; init; }
        public LengthMeasure SolCorPc { get; init; }
        public LengthMeasure OilCtg { get; init; }
        public LengthMeasure HardnessCa { get; init; }
        public LengthMeasure Sulfide { get; init; }
        public string Comments { get; init; }
    }
}
