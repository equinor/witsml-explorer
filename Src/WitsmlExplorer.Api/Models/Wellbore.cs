using Witsml.Data;

using WitsmlExplorer.Api.Models.Measure;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Models
{
    public class Wellbore
    {
        public string Uid { get; set; }
        public string Name { get; set; }
        public string WellUid { get; set; }
        public string WellName { get; set; }
        public string WellborePurpose { get; set; }
        public string WellboreParentUid { get; set; }
        public string WellboreParentName { get; set; }
        public string WellboreStatus { get; set; }
        public string WellboreType { get; set; }
        public bool? IsActive { get; set; }
        public string DateTimeCreation { get; set; }
        public string DateTimeLastChange { get; set; }
        public string ItemState { get; set; }
        public string Comments { get; set; }
        public string Number { get; set; }
        public string SuffixAPI { get; set; }
        public string NumGovt { get; set; }
        public string Shape { get; set; }
        public string DTimeKickoff { get; set; }
        public LengthMeasure Md { get; set; }
        public LengthMeasure Tvd { get; set; }
        public LengthMeasure MdKickoff { get; set; }
        public LengthMeasure TvdKickoff { get; set; }
        public LengthMeasure MdPlanned { get; set; }
        public LengthMeasure TvdPlanned { get; set; }
        public LengthMeasure MdSubSeaPlanned { get; set; }
        public LengthMeasure TvdSubSeaPlanned { get; set; }
        public DayMeasure DayTarget { get; set; }

        public static Wellbore FromWitsml(WitsmlWellbore witsmlWellbore)
        {
            if (witsmlWellbore == null) return null;
            return new Wellbore
            {
                Uid = witsmlWellbore.Uid,
                Name = witsmlWellbore.Name,
                WellUid = witsmlWellbore.UidWell,
                WellName = witsmlWellbore.NameWell,
                Number = witsmlWellbore.Number,
                SuffixAPI = witsmlWellbore.SuffixAPI,
                NumGovt = witsmlWellbore.NumGovt,
                WellboreStatus = witsmlWellbore.StatusWellbore,
                IsActive = StringHelpers.ToBoolean(witsmlWellbore.IsActive),
                WellborePurpose = witsmlWellbore.PurposeWellbore,
                WellboreParentUid = witsmlWellbore.ParentWellbore?.UidRef,
                WellboreParentName = witsmlWellbore.ParentWellbore?.Value,
                WellboreType = witsmlWellbore.TypeWellbore,
                Shape = witsmlWellbore.Shape,
                DTimeKickoff = witsmlWellbore.DTimKickoff,
                Md = (witsmlWellbore.Md == null) ? null : new LengthMeasure { Uom = witsmlWellbore.Md.Uom, Value = StringHelpers.ToDecimal(witsmlWellbore.Md.Value) },
                Tvd = (witsmlWellbore.Tvd == null) ? null : new LengthMeasure { Uom = witsmlWellbore.Tvd.Uom, Value = StringHelpers.ToDecimal(witsmlWellbore.Tvd.Value) },
                MdKickoff = (witsmlWellbore.MdKickoff == null) ? null : new LengthMeasure { Uom = witsmlWellbore.MdKickoff.Uom, Value = StringHelpers.ToDecimal(witsmlWellbore.MdKickoff.Value) },
                TvdKickoff = (witsmlWellbore.TvdKickoff == null) ? null : new LengthMeasure { Uom = witsmlWellbore.TvdKickoff.Uom, Value = StringHelpers.ToDecimal(witsmlWellbore.TvdKickoff.Value) },
                MdPlanned = (witsmlWellbore.MdPlanned == null) ? null : new LengthMeasure { Uom = witsmlWellbore.MdPlanned.Uom, Value = StringHelpers.ToDecimal(witsmlWellbore.MdPlanned.Value) },
                TvdPlanned = (witsmlWellbore.TvdPlanned == null) ? null : new LengthMeasure { Uom = witsmlWellbore.TvdPlanned.Uom, Value = StringHelpers.ToDecimal(witsmlWellbore.TvdPlanned.Value) },
                MdSubSeaPlanned = (witsmlWellbore.MdSubSeaPlanned == null) ? null : new LengthMeasure { Uom = witsmlWellbore.MdSubSeaPlanned.Uom, Value = StringHelpers.ToDecimal(witsmlWellbore.MdSubSeaPlanned.Value) },
                TvdSubSeaPlanned = (witsmlWellbore.TvdSubSeaPlanned == null) ? null : new LengthMeasure { Uom = witsmlWellbore.TvdSubSeaPlanned.Uom, Value = StringHelpers.ToDecimal(witsmlWellbore.TvdSubSeaPlanned.Value) },
                DayTarget = (witsmlWellbore.DayTarget == null) ? null : new DayMeasure { Uom = witsmlWellbore.DayTarget.Uom, Value = int.Parse(witsmlWellbore.DayTarget.Value) },
                DateTimeCreation = witsmlWellbore.CommonData.DTimCreation,
                DateTimeLastChange = witsmlWellbore.CommonData.DTimLastChange,
                ItemState = witsmlWellbore.CommonData.ItemState,
                Comments = witsmlWellbore.CommonData.Comments
            };
        }
    }
}
