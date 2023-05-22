using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Witsml.Data;
using Witsml.Data.Measures;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Models.Measure;

namespace WitsmlExplorer.Api.Services
{
    public interface IFluidsReportService
    {
        Task<IEnumerable<FluidsReport>> GetFluidsReports(string wellUid, string wellboreUid);
    }

    public class FluidsReportService : WitsmlService, IFluidsReportService
    {
        public FluidsReportService(IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider) { }

        public async Task<IEnumerable<FluidsReport>> GetFluidsReports(string wellUid, string wellboreUid)
        {
            WitsmlFluidsReports query = new WitsmlFluidsReport()
            {
                Uid = "",
                Name = "",
                UidWellbore = wellboreUid,
                NameWellbore = "",
                UidWell = wellUid,
                NameWell = "",
                DTim = "",
                Md = Witsml.Data.Measures.Measure.ToFetch<WitsmlMeasuredDepthCoord>(),
                Tvd = Witsml.Data.Measures.Measure.ToFetch<WitsmlWellVerticalDepthCoord>(),
                NumReport = "",
                CommonData = new WitsmlCommonData()
                {
                    DTimCreation = "",
                    DTimLastChange = "",
                    ItemState = "",
                    Comments = "",
                    DefaultDatum = ""
                }

            }.AsSingletonWitsmlList();
            WitsmlFluidsReports result = await _witsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.Requested));
            return result.FluidsReports.Select(WitsmlToFluidsReport);
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
