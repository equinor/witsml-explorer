using System.Collections.Generic;
using System.Linq;

using Witsml.Data;
using Witsml.Data.Measures;

using WitsmlExplorer.Api.Models.Measure;
using WitsmlExplorer.Api.Services;

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

    public static class FluidExtensions
    {
        public static WitsmlFluid ToWitsml(this Fluid fluid)
        {
            return new WitsmlFluid
            {
                Uid = fluid.Uid,
                Type = fluid.Type,
                LocationSample = fluid.LocationSample,
                DTim = StringHelpers.ToUniversalDateTimeString(fluid.DTim),
                Md = fluid.Md?.ToWitsml<WitsmlMeasuredDepthCoord>(),
                Tvd = fluid.Tvd?.ToWitsml<WitsmlWellVerticalDepthCoord>(),
                PresBopRating = fluid.PresBopRating?.ToWitsml<WitsmlPressureMeasure>(),
                MudClass = fluid.MudClass,
                Density = fluid.Density?.ToWitsml<Witsml.Data.Measures.Measure>(),
                VisFunnel = fluid.VisFunnel?.ToWitsml<Witsml.Data.Measures.Measure>(),
                TempVis = fluid.TempVis?.ToWitsml<Witsml.Data.Measures.Measure>(),
                Pv = fluid.Pv?.ToWitsml<Witsml.Data.Measures.Measure>(),
                Yp = fluid.Yp?.ToWitsml<Witsml.Data.Measures.Measure>(),
                Gel10Sec = fluid.Gel10Sec?.ToWitsml<Witsml.Data.Measures.Measure>(),
                Gel10Min = fluid.Gel10Min?.ToWitsml<Witsml.Data.Measures.Measure>(),
                Gel30Min = fluid.Gel30Min?.ToWitsml<Witsml.Data.Measures.Measure>(),
                FilterCakeLtlp = fluid.FilterCakeLtlp?.ToWitsml<Witsml.Data.Measures.Measure>(),
                FiltrateLtlp = fluid.FiltrateLtlp?.ToWitsml<Witsml.Data.Measures.Measure>(),
                TempHthp = fluid.TempHthp?.ToWitsml<Witsml.Data.Measures.Measure>(),
                PresHthp = fluid.PresHthp?.ToWitsml<Witsml.Data.Measures.Measure>(),
                FiltrateHthp = fluid.FiltrateHthp?.ToWitsml<Witsml.Data.Measures.Measure>(),
                FilterCakeHthp = fluid.FilterCakeHthp?.ToWitsml<Witsml.Data.Measures.Measure>(),
                SolidsPc = fluid.SolidsPc?.ToWitsml<Witsml.Data.Measures.Measure>(),
                WaterPc = fluid.WaterPc?.ToWitsml<Witsml.Data.Measures.Measure>(),
                OilPc = fluid.OilPc?.ToWitsml<Witsml.Data.Measures.Measure>(),
                SandPc = fluid.SandPc?.ToWitsml<Witsml.Data.Measures.Measure>(),
                SolidsLowGravPc = fluid.SolidsLowGravPc?.ToWitsml<Witsml.Data.Measures.Measure>(),
                SolidsCalcPc = fluid.SolidsCalcPc?.ToWitsml<Witsml.Data.Measures.Measure>(),
                BaritePc = fluid.BaritePc?.ToWitsml<Witsml.Data.Measures.Measure>(),
                Lcm = fluid.Lcm?.ToWitsml<Witsml.Data.Measures.Measure>(),
                Mbt = fluid.Mbt?.ToWitsml<Witsml.Data.Measures.Measure>(),
                Ph = fluid.Ph,
                TempPh = fluid.TempPh?.ToWitsml<Witsml.Data.Measures.Measure>(),
                Pm = fluid.Pm?.ToWitsml<Witsml.Data.Measures.Measure>(),
                PmFiltrate = fluid.PmFiltrate?.ToWitsml<Witsml.Data.Measures.Measure>(),
                Mf = fluid.Mf?.ToWitsml<Witsml.Data.Measures.Measure>(),
                AlkalinityP1 = fluid.AlkalinityP1?.ToWitsml<Witsml.Data.Measures.Measure>(),
                AlkalinityP2 = fluid.AlkalinityP2?.ToWitsml<Witsml.Data.Measures.Measure>(),
                Chloride = fluid.Chloride?.ToWitsml<Witsml.Data.Measures.Measure>(),
                Calcium = fluid.Calcium?.ToWitsml<Witsml.Data.Measures.Measure>(),
                Magnesium = fluid.Magnesium?.ToWitsml<Witsml.Data.Measures.Measure>(),
                Potassium = fluid.Potassium?.ToWitsml<Witsml.Data.Measures.Measure>(),
                Rheometers = fluid.Rheometers?.Select(rheometer => rheometer?.ToWitsml()).ToList(),
                BrinePc = fluid.BrinePc?.ToWitsml<Witsml.Data.Measures.Measure>(),
                Lime = fluid.Lime?.ToWitsml<Witsml.Data.Measures.Measure>(),
                ElectStab = fluid.ElectStab?.ToWitsml<Witsml.Data.Measures.Measure>(),
                CalciumChloride = fluid.CalciumChloride?.ToWitsml<Witsml.Data.Measures.Measure>(),
                Company = fluid.Company,
                SolidsHiGravPc = fluid.SolidsHiGravPc?.ToWitsml<Witsml.Data.Measures.Measure>(),
                Polymer = fluid.Polymer?.ToWitsml<Witsml.Data.Measures.Measure>(),
                PolyType = fluid.PolyType,
                SolCorPc = fluid.SolCorPc?.ToWitsml<Witsml.Data.Measures.Measure>(),
                OilCtg = fluid.OilCtg?.ToWitsml<Witsml.Data.Measures.Measure>(),
                HardnessCa = fluid.HardnessCa?.ToWitsml<Witsml.Data.Measures.Measure>(),
                Sulfide = fluid.Sulfide?.ToWitsml<Witsml.Data.Measures.Measure>(),
                Comments = fluid.Comments,
            };
        }
    }
}
