using System.Linq;

using Witsml.Data;
using Witsml.Data.Measures;

namespace WitsmlExplorer.Api.Query
{
    public static class FluidsReportQueries
    {
        public static WitsmlFluidsReports QueryByWellbore(string wellUid, string wellboreUid)
        {
            return new WitsmlFluidsReport()
            {
                Uid = "",
                Name = "",
                UidWellbore = wellboreUid,
                NameWellbore = "",
                UidWell = wellUid,
                NameWell = "",
                DTim = "",
                Md = Measure.ToFetch<WitsmlMeasuredDepthCoord>(),
                Tvd = Measure.ToFetch<WitsmlWellVerticalDepthCoord>(),
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
        }

        public static WitsmlFluidsReports QueryById(string wellUid, string wellboreUid, string[] fluidsReportUids)
        {
            return new WitsmlFluidsReports
            {
                FluidsReports = fluidsReportUids.Select(uid => new WitsmlFluidsReport
                {
                    Uid = uid,
                    UidWell = wellUid,
                    UidWellbore = wellboreUid
                }).ToList()
            };
        }
    }
}
