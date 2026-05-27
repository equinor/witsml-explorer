using Witsml.Data;
using Witsml.Data.Measures;

using WitsmlExplorer.Api.Models.Measure;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Models
{
    public class Risk : ObjectOnWellbore
    {
        public string Type { get; init; }
        public string Category { get; init; }
        public string SubCategory { get; init; }
        public string ExtendCategory { get; init; }
        public string AffectedPersonnel { get; init; }
        public string DTimStart { get; init; }
        public string DTimEnd { get; init; }
        public MeasureWithDatum MdHoleStart { get; init; }
        public MeasureWithDatum MdHoleEnd { get; init; }
        public MeasureWithDatum TvdHoleStart { get; init; }
        public MeasureWithDatum TvdHoleEnd { get; init; }
        public MeasureWithDatum MdBitStart { get; init; }
        public MeasureWithDatum MdBitEnd { get; init; }
        public LengthMeasure DiaHole { get; init; }
        public string SeverityLevel { get; init; }
        public string ProbabilityLevel { get; init; }
        public string Summary { get; init; }
        public string Details { get; init; }
        public string Identification { get; init; }
        public string Contingency { get; init; }
        public string Mitigation { get; init; }
        public CommonData CommonData { get; init; }

        public override WitsmlRisks ToWitsml()
        {
            return new WitsmlRisk
            {
                UidWell = WellUid,
                NameWell = WellName,
                UidWellbore = WellboreUid,
                NameWellbore = WellboreName,
                Uid = Uid,
                Name = Name,
                Type = Type,
                Category = Category,
                SubCategory = SubCategory,
                ExtendCategory = ExtendCategory,
                AffectedPersonnel = !string.IsNullOrEmpty(AffectedPersonnel) ? AffectedPersonnel.Split(", ") : null,
                DTimStart = StringHelpers.ToUniversalDateTimeString(DTimStart),
                DTimEnd = StringHelpers.ToUniversalDateTimeString(DTimStart),
                MdHoleStart = MdHoleStart?.ToWitsml<WitsmlMeasureWithDatum>(),
                MdHoleEnd = MdHoleEnd?.ToWitsml<WitsmlMeasureWithDatum>(),
                TvdHoleStart = TvdHoleStart?.ToWitsml<WitsmlMeasureWithDatum>(),
                TvdHoleEnd = TvdHoleEnd?.ToWitsml<WitsmlMeasureWithDatum>(),
                MdBitStart = MdBitStart?.ToWitsml<WitsmlMeasureWithDatum>(),
                MdBitEnd = MdBitEnd?.ToWitsml<WitsmlMeasureWithDatum>(),
                DiaHole = DiaHole?.ToWitsml<WitsmlLengthMeasure>(),
                SeverityLevel = SeverityLevel,
                ProbabilityLevel = ProbabilityLevel,
                Summary = Summary,
                Details = Details,
                Identification = Identification,
                Contingency = Contingency,
                Mitigation = Mitigation,
                CommonData = CommonData?.ToWitsml()
            }.AsItemInWitsmlList();
        }

        public static Risk FromWitsml(WitsmlRisk risk)
        {
            return risk == null ? null : new Risk
            {
                Name = risk.Name,
                WellboreName = risk.NameWellbore,
                WellboreUid = risk.UidWellbore,
                WellName = risk.NameWell,
                WellUid = risk.UidWell,
                Uid = risk.Uid,
                Type = risk.Type,
                Category = risk.Category,
                SubCategory = risk.SubCategory,
                ExtendCategory = risk.ExtendCategory,
                AffectedPersonnel = risk.AffectedPersonnel != null ? string.Join(", ", risk.AffectedPersonnel) : "",
                DTimStart = risk.DTimStart,
                DTimEnd = risk.DTimEnd,
                MdBitStart = risk.MdBitStart == null ? null : new MeasureWithDatum { Uom = risk.MdBitStart.Uom, Value = StringHelpers.ToDouble(risk.MdBitStart.Value) },
                MdBitEnd = risk.MdBitEnd == null ? null : new MeasureWithDatum { Uom = risk.MdBitEnd.Uom, Value = StringHelpers.ToDouble(risk.MdBitEnd.Value) },
                SeverityLevel = risk.SeverityLevel,
                ProbabilityLevel = risk.ProbabilityLevel,
                Summary = risk.Summary,
                Details = risk.Details,
                CommonData = risk.CommonData == null ? null : new CommonData
                {
                    ItemState = risk.CommonData.ItemState,
                    SourceName = risk.CommonData.SourceName,
                    DTimLastChange = risk.CommonData.DTimLastChange,
                    DTimCreation = risk.CommonData.DTimCreation,
                }
            };
        }
    }
}
