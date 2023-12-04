using Witsml.Data;
using Witsml.Data.Measures;

using WitsmlExplorer.Api.Models.Measure;

namespace WitsmlExplorer.Api.Models
{
    public class FormationMarker : ObjectOnWellbore
    {
        public MeasureWithDatum MdPrognosed { get; init; }
        public MeasureWithDatum TvdPrognosed { get; init; }
        public MeasureWithDatum MdTopSample { get; init; }
        public MeasureWithDatum TvdTopSample { get; init; }
        public LengthMeasure ThicknessBed { get; init; }
        public LengthMeasure ThicknessApparent { get; init; }
        public LengthMeasure ThicknessPerpen { get; init; }
        public MeasureWithDatum MdLogSample { get; init; }
        public MeasureWithDatum TvdLogSample { get; init; }
        public LengthMeasure Dip { get; init; }
        public LengthMeasure DipDirection { get; init; }
        public StratigraphicStruct Lithostratigraphic { get; init; }
        public StratigraphicStruct Chronostratigraphic { get; init; }
        public string Description { get; init; }
        public CommonData CommonData { get; init; }

        public override WitsmlFormationMarkers ToWitsml()
        {
            return new WitsmlFormationMarker
            {
                UidWell = WellUid,
                NameWell = WellName,
                UidWellbore = WellboreUid,
                NameWellbore = WellboreName,
                Uid = Uid,
                Name = Name,
                MdPrognosed = MdPrognosed?.ToWitsml<WitsmlMeasuredDepthCoord>(),
                TvdPrognosed = TvdPrognosed?.ToWitsml<WitsmlWellVerticalDepthCoord>(),
                MdTopSample = MdTopSample?.ToWitsml<WitsmlMeasuredDepthCoord>(),
                TvdTopSample = TvdTopSample?.ToWitsml<WitsmlWellVerticalDepthCoord>(),
                ThicknessBed = ThicknessBed?.ToWitsml<WitsmlLengthMeasure>(),
                ThicknessApparent = ThicknessApparent?.ToWitsml<WitsmlLengthMeasure>(),
                ThicknessPerpen = ThicknessPerpen?.ToWitsml<WitsmlLengthMeasure>(),
                MdLogSample = MdLogSample?.ToWitsml<WitsmlMeasuredDepthCoord>(),
                TvdLogSample = TvdLogSample?.ToWitsml<WitsmlWellVerticalDepthCoord>(),
                Dip = Dip?.ToWitsml<WitsmlPlaneAngleMeasure>(),
                DipDirection = DipDirection?.ToWitsml<WitsmlPlaneAngleMeasure>(),
                Lithostratigraphic = Lithostratigraphic?.ToWitsmlLithostratigraphyStruct(),
                Chronostratigraphic = Chronostratigraphic?.ToWitsmlChronostratigraphyStruct(),
                Description = Description,
                CommonData = CommonData?.ToWitsml()
            }.AsItemInWitsmlList();
        }
    }
}
