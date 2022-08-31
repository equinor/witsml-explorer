using System.Collections.Generic;
using System.Globalization;
using System.Linq;

using Witsml.Data;
using Witsml.Data.Measures;
using Witsml.Extensions;

using WitsmlExplorer.Api.Models;

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

        public static WitsmlRisks QueryByIds(string wellUid, string wellboreUid, string[] riskUids)
        {
            return new WitsmlRisks
            {
                Risks = riskUids.Select((riskUid) => new WitsmlRisk
                {
                    Uid = riskUid,
                    UidWell = wellUid,
                    UidWellbore = wellboreUid
                }).ToList()
            };
        }

        public static WitsmlRisks QueryByNameAndDepth(string wellUid, string wellboreUid, string name, Measure mdBitStart, Measure mdBitEnd)
        {
            return new WitsmlRisks
            {
                Risks = new WitsmlRisk
                {
                    UidWell = wellUid,
                    UidWellbore = wellboreUid,
                    Name = name,
                    MdBitStart = mdBitStart != null ? new WitsmlMeasuredDepthCoord { Uom = mdBitStart.Uom, Value = mdBitStart.Value.ToString(CultureInfo.InvariantCulture) } : null,
                    MdBitEnd = mdBitEnd != null ? new WitsmlMeasuredDepthCoord { Uom = mdBitEnd.Uom, Value = mdBitEnd.Value.ToString(CultureInfo.InvariantCulture) } : null
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

        public static IEnumerable<WitsmlRisk> DeleteRiskQuery(string wellUid, string wellboreUid, string[] riskUids)
        {
            return riskUids.Select((riskUid) =>
                new WitsmlRisk
                {
                    Uid = riskUid,
                    UidWell = wellUid,
                    UidWellbore = wellboreUid
                }
            );
        }

        public static IEnumerable<WitsmlRisk> CopyWitsmlRisks(WitsmlRisks risks, WitsmlWellbore targetWellbore)
        {
            return risks.Risks.Select((risk) =>
            {
                risk.UidWell = targetWellbore.UidWell;
                risk.NameWell = targetWellbore.NameWell;
                risk.UidWellbore = targetWellbore.Uid;
                risk.NameWellbore = targetWellbore.Name;
                return risk;
            });
        }

        public static WitsmlRisks CreateRisk(Risk risk)
        {
            return new WitsmlRisks
            {
                Risks = new WitsmlRisk
                {
                    UidWell = risk.WellUid,
                    NameWell = risk.WellName,
                    UidWellbore = risk.WellboreUid,
                    NameWellbore = risk.WellboreName,
                    Uid = risk.Uid,
                    Name = risk.Name,
                    Type = risk.Type,
                    Category = risk.Category,
                    SubCategory = risk.SubCategory,
                    ExtendCategory = risk.ExtendCategory,
                    AffectedPersonnel = risk.AffectedPersonnel?.Length == 0 ? null : risk.AffectedPersonnel?.Split(", "),
                    DTimStart = risk.DTimStart?.ToUniversalTime
                    ().ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                    DTimEnd = risk.DTimEnd?.ToUniversalTime
                    ().ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                    MdHoleStart = risk.MdHoleStart?.ToWitsml(),
                    MdHoleEnd = risk.MdHoleEnd?.ToWitsml(),
                    MdBitStart = risk.MdBitStart?.ToWitsml(),
                    MdBitEnd = risk.MdBitEnd?.ToWitsml(),
                    TvdHoleStart = risk.TvdHoleStart?.ToWitsml(),
                    TvdHoleEnd = risk.TvdHoleEnd?.ToWitsml(),
                    DiaHole = risk.DiaHole?.ToWitsml(),
                    SeverityLevel = risk.SeverityLevel,
                    ProbabilityLevel = risk.ProbabilityLevel,
                    Summary = risk.Summary,
                    Details = risk.Details,
                    Identification = risk.Identification,
                    Contingency = risk.Contigency,
                    Mitigation = risk.Mitigation,
                    CommonData = new WitsmlCommonData()
                    {
                        ItemState = risk.CommonData.ItemState,
                        SourceName = risk.CommonData.SourceName,
                        DTimCreation = null,
                        DTimLastChange = null
                    }
                }.AsSingletonList()
            };
        }
    }
}
