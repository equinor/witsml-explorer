using System.Globalization;
using System.Linq;

using Witsml.Data;
using Witsml.Data.Measures;
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
                }.AsItemInList()
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
                }.AsItemInList()
            };
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
                    DTimStart = StringHelpers.ToUniversalDateTimeString(risk.DTimStart),
                    DTimEnd = StringHelpers.ToUniversalDateTimeString(risk.DTimEnd),
                    MdHoleStart = risk.MdHoleStart?.ToWitsml<WitsmlMeasureWithDatum>(),
                    MdHoleEnd = risk.MdHoleEnd?.ToWitsml<WitsmlMeasureWithDatum>(),
                    MdBitStart = risk.MdBitStart?.ToWitsml<WitsmlMeasureWithDatum>(),
                    MdBitEnd = risk.MdBitEnd?.ToWitsml<WitsmlMeasureWithDatum>(),
                    TvdHoleStart = risk.TvdHoleStart?.ToWitsml<WitsmlMeasureWithDatum>(),
                    TvdHoleEnd = risk.TvdHoleEnd?.ToWitsml<WitsmlMeasureWithDatum>(),
                    DiaHole = risk.DiaHole?.ToWitsml<WitsmlLengthMeasure>(),
                    SeverityLevel = risk.SeverityLevel,
                    ProbabilityLevel = risk.ProbabilityLevel,
                    Summary = risk.Summary,
                    Details = risk.Details,
                    Identification = risk.Identification,
                    Contingency = risk.Contingency,
                    Mitigation = risk.Mitigation,
                    CommonData = new WitsmlCommonData()
                    {
                        ItemState = risk.CommonData.ItemState,
                        SourceName = risk.CommonData.SourceName,
                        DTimCreation = null,
                        DTimLastChange = null
                    }
                }.AsItemInList()
            };
        }
    }
}
