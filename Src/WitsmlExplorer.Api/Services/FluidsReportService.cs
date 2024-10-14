using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Witsml.Data;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Models.Measure;
using WitsmlExplorer.Api.Query;

namespace WitsmlExplorer.Api.Services
{
    public interface IFluidsReportService
    {
        Task<ICollection<FluidsReport>> GetFluidsReports(string wellUid, string wellboreUid);
        Task<FluidsReport> GetFluidsReport(string wellUid, string wellboreUid, string fluidsReportUid);
    }

    public class FluidsReportService : WitsmlService, IFluidsReportService
    {
        public FluidsReportService(IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider) { }

        public async Task<ICollection<FluidsReport>> GetFluidsReports(string wellUid, string wellboreUid)
        {
            WitsmlFluidsReports query = FluidsReportQueries.QueryByWellbore(wellUid, wellboreUid);
            WitsmlFluidsReports result = await _witsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.Requested));
            return result.FluidsReports.Select(WitsmlToFluidsReport).ToList();
        }

        public async Task<FluidsReport> GetFluidsReport(string wellUid, string wellboreUid, string fluidsReportUid)
        {
            WitsmlFluidsReports query = (WitsmlFluidsReports)ObjectQueries.GetWitsmlObjectById(wellUid, wellboreUid, fluidsReportUid, EntityType.FluidsReport);
            WitsmlFluidsReports result = await _witsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.All));

            WitsmlFluidsReport witsmlFluidsReport = result.FluidsReports.FirstOrDefault();
            if (witsmlFluidsReport == null)
            {
                return null;
            }

            FluidsReport fluidsReport = WitsmlToFluidsReport(witsmlFluidsReport);
            return fluidsReport;
        }

        private static List<Fluid> GetFluids(List<WitsmlFluid> fluids)
        {
            return fluids.Select(fluid =>
                new Fluid
                {
                    Uid = fluid.Uid,
                    Type = fluid.Type,
                    LocationSample = fluid.LocationSample,
                    DTim = fluid.DTim,
                    Md = MeasureWithDatum.FromWitsml(fluid.Md),
                    Tvd = MeasureWithDatum.FromWitsml(fluid.Tvd),
                    PresBopRating = LengthMeasure.FromWitsml(fluid.PresBopRating),
                    MudClass = fluid.MudClass,
                    Density = LengthMeasure.FromWitsml(fluid.Density),
                    VisFunnel = LengthMeasure.FromWitsml(fluid.VisFunnel),
                    TempVis = LengthMeasure.FromWitsml(fluid.TempVis),
                    Pv = LengthMeasure.FromWitsml(fluid.Pv),
                    Yp = LengthMeasure.FromWitsml(fluid.Yp),
                    Gel10Sec = LengthMeasure.FromWitsml(fluid.Gel10Sec),
                    Gel10Min = LengthMeasure.FromWitsml(fluid.Gel10Min),
                    Gel30Min = LengthMeasure.FromWitsml(fluid.Gel30Min),
                    FilterCakeLtlp = LengthMeasure.FromWitsml(fluid.FilterCakeLtlp),
                    FiltrateLtlp = LengthMeasure.FromWitsml(fluid.FiltrateLtlp),
                    TempHthp = LengthMeasure.FromWitsml(fluid.TempHthp),
                    PresHthp = LengthMeasure.FromWitsml(fluid.PresHthp),
                    FiltrateHthp = LengthMeasure.FromWitsml(fluid.FiltrateHthp),
                    FilterCakeHthp = LengthMeasure.FromWitsml(fluid.FilterCakeHthp),
                    SolidsPc = LengthMeasure.FromWitsml(fluid.SolidsPc),
                    WaterPc = LengthMeasure.FromWitsml(fluid.WaterPc),
                    OilPc = LengthMeasure.FromWitsml(fluid.OilPc),
                    SandPc = LengthMeasure.FromWitsml(fluid.SandPc),
                    SolidsLowGravPc = LengthMeasure.FromWitsml(fluid.SolidsLowGravPc),
                    SolidsCalcPc = LengthMeasure.FromWitsml(fluid.SolidsCalcPc),
                    BaritePc = LengthMeasure.FromWitsml(fluid.BaritePc),
                    Lcm = LengthMeasure.FromWitsml(fluid.Lcm),
                    Mbt = LengthMeasure.FromWitsml(fluid.Mbt),
                    Ph = fluid.Ph,
                    TempPh = LengthMeasure.FromWitsml(fluid.TempPh),
                    Pm = LengthMeasure.FromWitsml(fluid.Pm),
                    PmFiltrate = LengthMeasure.FromWitsml(fluid.PmFiltrate),
                    Mf = LengthMeasure.FromWitsml(fluid.Mf),
                    AlkalinityP1 = LengthMeasure.FromWitsml(fluid.AlkalinityP1),
                    AlkalinityP2 = LengthMeasure.FromWitsml(fluid.AlkalinityP2),
                    Chloride = LengthMeasure.FromWitsml(fluid.Chloride),
                    Calcium = LengthMeasure.FromWitsml(fluid.Calcium),
                    Magnesium = LengthMeasure.FromWitsml(fluid.Magnesium),
                    Potassium = LengthMeasure.FromWitsml(fluid.Potassium),
                    Rheometers = fluid.Rheometers?.Select(r => new Rheometer()
                    {
                        Uid = r.Uid,
                        TempRheom = LengthMeasure.FromWitsml(r.TempRheom),
                        PresRheom = LengthMeasure.FromWitsml(r.PresRheom),
                        Vis3Rpm = r.Vis3Rpm,
                        Vis6Rpm = r.Vis6Rpm,
                        Vis100Rpm = r.Vis100Rpm,
                        Vis200Rpm = r.Vis200Rpm,
                        Vis300Rpm = r.Vis300Rpm,
                        Vis600Rpm = r.Vis600Rpm
                    }).ToList(),
                    BrinePc = LengthMeasure.FromWitsml(fluid.BrinePc),
                    Lime = LengthMeasure.FromWitsml(fluid.Lime),
                    ElectStab = LengthMeasure.FromWitsml(fluid.ElectStab),
                    CalciumChloride = LengthMeasure.FromWitsml(fluid.CalciumChloride),
                    Company = fluid.Company,
                    SolidsHiGravPc = LengthMeasure.FromWitsml(fluid.SolidsHiGravPc),
                    Polymer = LengthMeasure.FromWitsml(fluid.Polymer),
                    PolyType = fluid.PolyType,
                    SolCorPc = LengthMeasure.FromWitsml(fluid.SolCorPc),
                    OilCtg = LengthMeasure.FromWitsml(fluid.OilCtg),
                    HardnessCa = LengthMeasure.FromWitsml(fluid.HardnessCa),
                    Sulfide = LengthMeasure.FromWitsml(fluid.Sulfide),
                    Comments = fluid.Comments
                }
            ).ToList();
        }

        private static FluidsReport WitsmlToFluidsReport(WitsmlFluidsReport fluidsReport)
        {
            return new FluidsReport
            {
                Uid = fluidsReport.Uid,
                Name = fluidsReport.Name,
                WellboreUid = fluidsReport.UidWellbore,
                WellboreName = fluidsReport.NameWellbore,
                WellUid = fluidsReport.UidWell,
                WellName = fluidsReport.NameWell,
                DTim = fluidsReport.DTim,
                Md = MeasureWithDatum.FromWitsml(fluidsReport.Md),
                Tvd = MeasureWithDatum.FromWitsml(fluidsReport.Tvd),
                NumReport = fluidsReport.NumReport,
                Fluids = GetFluids(fluidsReport.Fluids),
                CommonData = new CommonData()
                {
                    DTimCreation = fluidsReport.CommonData.DTimCreation,
                    DTimLastChange = fluidsReport.CommonData.DTimLastChange,
                    ItemState = fluidsReport.CommonData.ItemState,
                    Comments = fluidsReport.CommonData.Comments,
                    DefaultDatum = fluidsReport.CommonData.DefaultDatum,
                    SourceName = fluidsReport.CommonData.SourceName,
                    ServiceCategory = fluidsReport.CommonData.ServiceCategory
                }
            };
        }
    }
}
