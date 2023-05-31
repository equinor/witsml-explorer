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
        Task<IEnumerable<FluidsReport>> GetFluidsReports(string wellUid, string wellboreUid);
        Task<FluidsReport> GetFluidsReport(string wellUid, string wellboreUid, string fluidsReportUid);
    }

    public class FluidsReportService : WitsmlService, IFluidsReportService
    {
        public FluidsReportService(IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider) { }

        public async Task<IEnumerable<FluidsReport>> GetFluidsReports(string wellUid, string wellboreUid)
        {
            WitsmlFluidsReports query = FluidsReportQueries.QueryByWellbore(wellUid, wellboreUid);
            WitsmlFluidsReports result = await _witsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.Requested));
            return result.FluidsReports.Select(WitsmlToFluidsReport);
        }

        public async Task<FluidsReport> GetFluidsReport(string wellUid, string wellboreUid, string fluidsReportUid)
        {
            WitsmlFluidsReports query = FluidsReportQueries.QueryById(wellUid, wellboreUid, new string[] { fluidsReportUid });
            WitsmlFluidsReports result = await _witsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.All));

            WitsmlFluidsReport witsmlFluidsReport = result.FluidsReports.FirstOrDefault();
            if (witsmlFluidsReport == null)
            {
                return null;
            }

            FluidsReport fluidsReport = WitsmlToFluidsReport(witsmlFluidsReport);
            fluidsReport.Fluids = GetFluids(witsmlFluidsReport.Fluids);
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
                    }).ToList()
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
                }
            };
        }
    }
}
