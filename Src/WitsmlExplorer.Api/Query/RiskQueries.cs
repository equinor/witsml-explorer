using Witsml.Data;
using Witsml.Data.Measures;
using Witsml.Extensions;

namespace WitsmlExplorer.Api.Query
{
    public class RiskQueries
    {
        public static WitsmlRisks GetWitsmlRiskByWellbore(string wellUid, string wellboreUid)
        {
            return new WitsmlRisks
            {
                Risks = new WitsmlRisk
                {
                    Uid = "",
                    UidWell = wellUid,
                    UidWellbore = wellboreUid,
                    Name = "",
                    NameWell = "",
                    NameWellbore = "",
                    Type = "",
                    Category = "",
                    SubCategory = "",
                    ExtendCategory = "",
                    AffectedPersonnel = new string[] { "" },
                    DTimStart = "",
                    DTimEnd = "",
                    MdBitStart = WitsmlMeasureWithDatum.ToFetch(),
                    MdBitEnd = WitsmlMeasureWithDatum.ToFetch(),
                    SeverityLevel = "",
                    ProbabilityLevel = "",
                    Summary = "",
                    Details = "",
                    CommonData = new WitsmlCommonData()
                    {
                        ItemState = "",
                        SourceName = "",
                        DTimLastChange = "",
                        DTimCreation = "",
                    }
                }.AsItemInList()
            };
        }

        public static WitsmlRisks QueryById(string wellUid, string wellboreUid, string riskUid)
        {
            return new WitsmlRisks
            {
                Risks = new WitsmlRisk
                {
                    Uid = riskUid,
                    UidWell = wellUid,
                    UidWellbore = wellboreUid
                }.AsItemInList()
            };
        }
    }
}
