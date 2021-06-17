using Witsml.Data;
using Witsml.Extensions;

namespace Witsml.Query
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

        public static WitsmlRisks QueryById(string wellUid, string wellboreUid, string riskUid)
        {
            return new WitsmlRisks
            {
                Risks = new WitsmlRisk
                {
                    Uid = riskUid,
                    UidWell = wellUid,
                    UidWellbore = wellboreUid
                }.AsSingletonList()
            };
        }
        public static WitsmlRisks QueryByNameAndDepth(string wellUid, string wellboreUid, string name, string mdBitStart, string mdBitEnd)
        {
            return new WitsmlRisks
            {
                Risks = new WitsmlRisk
                {
                    UidWell = wellUid,
                    UidWellbore = wellboreUid,
                    Name = name,
                    MdBitStart = new WitsmlIndex { Uom = "m", Value = mdBitStart },
                    MdBitEnd = new WitsmlIndex { Uom = "m", Value = mdBitEnd }
                }.AsSingletonList()
            };
        }

        public static WitsmlRisks QueryBySource(string wellUid, string wellboreUid, string source, string extendCategory)
        {
            return new WitsmlRisks
            {
                Risks = new WitsmlRisk
                {
                    UidWell = wellUid,
                    UidWellbore = wellboreUid,
                    ExtendCategory = extendCategory,
                    CommonData = new WitsmlCommonData
                    {
                        SourceName = source,
                    },
                }.AsSingletonList()
            };
        }
    }
}
