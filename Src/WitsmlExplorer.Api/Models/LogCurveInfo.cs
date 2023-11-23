using System.Collections.Generic;

using WitsmlExplorer.Api.Models.Measure;

namespace WitsmlExplorer.Api.Models
{
    public class LogCurveInfo
    {
        public string Uid { get; init; }
        public string Mnemonic { get; init; }
        public string MinDateTimeIndex { get; init; }
        public string MinDepthIndex { get; init; }
        public string MaxDateTimeIndex { get; init; }
        public string MaxDepthIndex { get; init; }
        public string ClassWitsml { get; init; }
        public string Unit { get; init; }
        public LengthMeasure SensorOffset { get; init; }
        public string MnemAlias { get; init; }
        public List<AxisDefinition> AxisDefinitions { get; init; }
        public string CurveDescription { get; init; }
        public string TypeLogData { get; init; }
    }
}
