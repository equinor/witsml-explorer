using System.Collections.Generic;

using WitsmlExplorer.Api.Models.Measure;

namespace WitsmlExplorer.Api.Models
{
    public class LogCurveInfo
    {
        public string Uid { get; internal set; }
        public string Mnemonic { get; internal set; }
        public string MinDateTimeIndex { get; internal set; }
        public string MinDepthIndex { get; internal set; }
        public string MaxDateTimeIndex { get; internal set; }
        public string MaxDepthIndex { get; internal set; }
        public string ClassWitsml { get; internal set; }
        public string Unit { get; internal set; }
        public LengthMeasure SensorOffset { get; internal set; }
        public string MnemAlias { get; internal set; }
        public List<LogCurveInfoAxisDefinition> AxisDefinitions { get; internal set; }
    }
}
