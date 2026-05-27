using System.Collections.Generic;
using System.Linq;

using Witsml.Data;
using Witsml.Data.Measures;

using WitsmlExplorer.Api.Models.Measure;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Models
{
    public class WbGeometry : ObjectOnWellbore
    {
        public string DTimReport { get; init; }
        public MeasureWithDatum MdBottom { get; init; }
        public LengthMeasure GapAir { get; init; }
        public LengthMeasure DepthWaterMean { get; init; }
        public CommonData CommonData { get; init; }

        public override WitsmlWbGeometrys ToWitsml()
        {
            return new WitsmlWbGeometry
            {
                UidWell = WellUid,
                NameWell = WellName,
                UidWellbore = WellboreUid,
                NameWellbore = WellboreName,
                Uid = Uid,
                Name = Name,
                DTimReport = StringHelpers.ToUniversalDateTimeString(DTimReport),
                MdBottom = MdBottom?.ToWitsml<WitsmlMeasuredDepthCoord>(),
                GapAir = GapAir?.ToWitsml<WitsmlLengthMeasure>(),
                DepthWaterMean = DepthWaterMean?.ToWitsml<WitsmlLengthMeasure>(),
                CommonData = CommonData?.ToWitsml(),
            }.AsItemInWitsmlList();
        }

        public static WbGeometry FromWitsml(WitsmlWbGeometry wbGeometry)
        {
            return wbGeometry == null ? null : new WbGeometry
            {
                WellUid = wbGeometry.UidWell,
                Uid = wbGeometry.Uid,
                WellboreUid = wbGeometry.UidWellbore,
                Name = wbGeometry.Name,
                WellName = wbGeometry.NameWell,
                WellboreName = wbGeometry.NameWellbore,
                DTimReport = wbGeometry.DTimReport,
                MdBottom = MeasureWithDatum.FromWitsml(wbGeometry.MdBottom),
                GapAir = LengthMeasure.FromWitsml(wbGeometry.GapAir),
                DepthWaterMean = LengthMeasure.FromWitsml(wbGeometry.DepthWaterMean),
                CommonData = wbGeometry.CommonData == null ? null : new CommonData
                {
                    SourceName = wbGeometry.CommonData.SourceName,
                    ItemState = wbGeometry.CommonData.ItemState,
                    Comments = wbGeometry.CommonData.Comments,
                    DTimCreation = wbGeometry.CommonData.DTimCreation,
                    DTimLastChange = wbGeometry.CommonData.DTimLastChange,
                }
            };
        }

        public static List<WbGeometrySection> GetWbGeometrySections(List<WitsmlWbGeometrySection> sections)
        {
            return sections?.Select(section => new WbGeometrySection
            {
                Uid = section.Uid,
                TypeHoleCasing = section.TypeHoleCasing,
                MdTop = MeasureWithDatum.FromWitsml(section.MdTop),
                MdBottom = MeasureWithDatum.FromWitsml(section.MdBottom),
                TvdTop = MeasureWithDatum.FromWitsml(section.TvdTop),
                TvdBottom = MeasureWithDatum.FromWitsml(section.TvdBottom),
                IdSection = LengthMeasure.FromWitsml(section.IdSection),
                OdSection = LengthMeasure.FromWitsml(section.OdSection),
                WtPerLen = LengthMeasure.FromWitsml(section.WtPerLen),
                Grade = section.Grade,
                CurveConductor = StringHelpers.ToBoolean(section.CurveConductor),
                DiaDrift = LengthMeasure.FromWitsml(section.DiaDrift),
                FactFric = string.IsNullOrEmpty(section.FactFric) ? null : StringHelpers.ToDouble(section.FactFric)
            }).ToList();
        }
    }
}
