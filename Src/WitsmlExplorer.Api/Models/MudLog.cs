using System.Collections.Generic;
using System.Linq;

using Witsml.Data.Measures;
using Witsml.Data.MudLog;

using WitsmlExplorer.Api.Models.Measure;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Models
{
    public class MudLog : ObjectOnWellbore
    {
        public bool ObjectGrowing { get; init; }
        public string MudLogCompany { get; init; }
        public string MudLogEngineers { get; init; }
        public MeasureWithDatum StartMd { get; init; }
        public MeasureWithDatum EndMd { get; init; }
        public List<MudLogGeologyInterval> GeologyInterval { get; set; }
        public CommonData CommonData { get; init; }

        public override WitsmlMudLogs ToWitsml()
        {
            return new WitsmlMudLog
            {
                UidWell = WellUid,
                NameWell = WellName,
                UidWellbore = WellboreUid,
                NameWellbore = WellboreName,
                Uid = Uid,
                Name = Name,
                ObjectGrowing = StringHelpers.NullableBooleanToString(ObjectGrowing),
                MudLogCompany = MudLogCompany,
                MudLogEngineers = MudLogEngineers,
                StartMd = StartMd?.ToWitsml<WitsmlMeasureWithDatum>(),
                EndMd = EndMd?.ToWitsml<WitsmlMeasureWithDatum>(),
                GeologyInterval = GeologyInterval?.Select(geologyInterval => geologyInterval?.ToWitsml())?.ToList(),
                CommonData = CommonData?.ToWitsml()
            }.AsItemInWitsmlList();
        }

        public static MudLog FromWitsml(WitsmlMudLog witsmlMudLog)
        {
            return witsmlMudLog == null ? null : new MudLog
            {
                Uid = witsmlMudLog.Uid,
                Name = witsmlMudLog.Name,
                WellUid = witsmlMudLog.UidWell,
                WellName = witsmlMudLog.NameWell,
                WellboreUid = witsmlMudLog.UidWellbore,
                WellboreName = witsmlMudLog.NameWellbore,
                MudLogCompany = witsmlMudLog.MudLogCompany,
                MudLogEngineers = witsmlMudLog.MudLogEngineers,
                StartMd = MeasureWithDatum.FromWitsml(witsmlMudLog.StartMd),
                EndMd = MeasureWithDatum.FromWitsml(witsmlMudLog.EndMd),
                GeologyInterval = GetGeologyIntervals(witsmlMudLog.GeologyInterval),
                CommonData = new CommonData
                {
                    DTimCreation = witsmlMudLog.CommonData?.DTimCreation,
                    DTimLastChange = witsmlMudLog.CommonData?.DTimLastChange,
                    ItemState = witsmlMudLog.CommonData?.ItemState,
                }
            };
        }

        private static List<MudLogGeologyInterval> GetGeologyIntervals(List<WitsmlMudLogGeologyInterval> geologyIntervals)
        {
            return geologyIntervals?.Select(geologyInterval =>
                new MudLogGeologyInterval
                {
                    Uid = geologyInterval.Uid,
                    TypeLithology = geologyInterval.TypeLithology,
                    MdTop = MeasureWithDatum.FromWitsml(geologyInterval.MdTop),
                    MdBottom = MeasureWithDatum.FromWitsml(geologyInterval.MdBottom),
                    TvdTop = MeasureWithDatum.FromWitsml(geologyInterval.TvdTop),
                    TvdBase = MeasureWithDatum.FromWitsml(geologyInterval.TvdBase),
                    RopAv = LengthMeasure.FromWitsml(geologyInterval.RopAv),
                    WobAv = LengthMeasure.FromWitsml(geologyInterval.WobAv),
                    TqAv = LengthMeasure.FromWitsml(geologyInterval.TqAv),
                    CurrentAv = LengthMeasure.FromWitsml(geologyInterval.CurrentAv),
                    RpmAv = LengthMeasure.FromWitsml(geologyInterval.RpmAv),
                    WtMudAv = LengthMeasure.FromWitsml(geologyInterval.WtMudAv),
                    EcdTdAv = LengthMeasure.FromWitsml(geologyInterval.EcdTdAv),
                    DxcAv = geologyInterval.DxcAv,
                    Lithologies = geologyInterval.Lithologies?.Select(l => new MudLogLithology
                    {
                        Uid = l.Uid,
                        CodeLith = l.CodeLith,
                        LithPc = l.LithPc?.Value,
                        Type = l.Type
                    }).ToList(),
                    Description = geologyInterval.Description,
                    CommonTime = new CommonTime
                    {
                        DTimCreation = geologyInterval.CommonTime?.DTimCreation,
                        DTimLastChange = geologyInterval.CommonTime?.DTimLastChange
                    }
                }).ToList();
        }
    }
}

