using System;

namespace WitsmlExplorer.Api.Models
{
    public class LogCurveInfo
    {
        public string Uid { get; internal set; }
        public string Mnemonic { get; internal set; }
        public DateTime? MinDateTimeIndex { get; internal set; }
        public string MinDepthIndex { get; internal set; }
        public DateTime? MaxDateTimeIndex { get; internal set; }
        public string MaxDepthIndex { get; internal set; }
        public string ClassWitsml { get; internal set; }
        public string Unit { get; internal set; }
        public string MnemAlias { get; internal set; }
    }
}
