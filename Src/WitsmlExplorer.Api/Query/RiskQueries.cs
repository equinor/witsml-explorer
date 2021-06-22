using Witsml.Data;
using Witsml.Extensions;

namespace WitsmlExplorer.Api.Query
{
    public class RiskQueries
    {
        public static WitsmlRisks QueryByWellbore(string wellUid, string wellboreUid)
        {
            return new WitsmlRisks
            {
                Risks = new WitsmlRisk
                {
                    Uid = "",
                    UidWell = wellUid,
                    UidWellbore = wellboreUid,
                    Name = "",
                    CommonData = new WitsmlCommonData()
                }.AsSingletonList()
            };
        }
    }
}
