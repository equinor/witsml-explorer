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
                    DefaultDatum = "",
                    SourceName = "",
                    ServiceCategory = ""
                }
            }.AsItemInWitsmlList();
        }
    }
}
