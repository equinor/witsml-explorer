using Witsml.Data;
using Witsml.Extensions;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;


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

        public static WitsmlRisks DeleteRiskQuery(string wellUid, string wellboreUid, string uid)
        {
            return new WitsmlRisks
            {
                Risks = new WitsmlRisk
                {
                    UidWell = wellUid,
                    UidWellbore = wellboreUid,
                    Uid = uid
                }.AsSingletonList()
            };
        }

        public static WitsmlRisks CreateRisk(Risk risk)
        {
            return new WitsmlRisks
            {
                Risks = new WitsmlRisk
                {
                    UidWell = risk.UidWell,
                    NameWell = risk.NameWell,
                    UidWellbore = risk.UidWellbore,
                    NameWellbore = risk.NameWellbore,
                    Uid = risk.Uid,
                    Name = risk.Name,
                    Type = risk.Type,
                    Category = risk.Category,
                    SubCategory = risk.SubCategory,
                    ExtendCategory = risk.ExtendCategory,
                    AffectedPersonnel = risk.AffectedPersonnel?.Split(", "),
                    DTimStart = risk.DTimStart?.ToString("yyyy-MM-ddTHH:mm:ssK.fffZ"),
                    DTimEnd = risk.DTimEnd?.ToString("yyyy-MM-ddTHH:mm:ssK.fffZ"),
                    MdHoleStart = new WitsmlIndex { Uom = "m", Value = risk.MdHoleStart },
                    MdHoleEnd = new WitsmlIndex { Uom = "m", Value = risk.MdHoleEnd },
                    MdBitStart = new WitsmlIndex { Uom = "m", Value = risk.MdBitStart },
                    MdBitEnd = new WitsmlIndex { Uom = "m", Value = risk.MdBitEnd },
                    TvdHoleStart = risk.TvdHoleStart,
                    TvdHoleEnd = risk.TvdHoleEnd,
                    DiaHole = risk.DiaHole,
                    SeverityLevel = risk.SeverityLevel,
                    ProbabilityLevel = risk.ProbabilityLevel,
                    Summary = risk.Summary,
                    Details = risk.Details,
                    Identification = risk.Identification,
                    Contingency = risk.Contigency,
                    Mitigation = risk.Mitigation
                }.AsSingletonList()
            };
        }
    }
}
