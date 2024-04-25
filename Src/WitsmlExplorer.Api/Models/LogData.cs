using System.Collections.Generic;
using System.Globalization;
using System.Text.Json.Serialization;

using WitsmlExplorer.Api.Converters;

namespace WitsmlExplorer.Api.Models
{
    public class LogData
    {
        public string StartIndex { get; init; }
        public string EndIndex { get; init; }
        public string Direction { get; set; }
        public string WellUid { get; set; }
        public string WellBoreUid { get; set; }

        public ICollection<CurveSpecification> CurveSpecifications { get; set; }
        public ICollection<Dictionary<string, LogDataValue>> Data { get; set; }

        internal LogData(string wellUid, string wellBoreUid)
        {
            this.WellUid = wellUid;
            this.WellBoreUid = wellBoreUid;
        }
    }

    public class CurveSpecification
    {
        public string Mnemonic { get; init; }
        public string Unit { get; init; }
        public string LogUid { get; set; }
    }

    [JsonConverter(typeof(LogDataValueConverter))]
    public class LogDataValue
    {
        public LogDataValue(string value)
        {
            Value = double.TryParse(value, NumberStyles.Any, CultureInfo.InvariantCulture, out double doubleValue) ? doubleValue : value;
        }
        public object Value { get; }
    }
}
