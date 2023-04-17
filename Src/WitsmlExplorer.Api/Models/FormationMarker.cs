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
    }
}
