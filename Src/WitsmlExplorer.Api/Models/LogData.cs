using System.Collections.Generic;
using System.Text.Json.Serialization;

using WitsmlExplorer.Api.Converters;

namespace WitsmlExplorer.Api.Models
{
    public class LogData
    {
        public string StartIndex { get; init; }
        public string EndIndex { get; init; }
        public string Direction { get; set; }
        public IEnumerable<CurveSpecification> CurveSpecifications { get; init; }
        public IEnumerable<Dictionary<string, LogDataValue>> Data { get; init; }
    }

    public class CurveSpecification
    {
        public string Mnemonic { get; init; }
        public string Unit { get; init; }
    }

    [JsonConverter(typeof(LogDataValueConverter))]
    public class LogDataValue
    {
        public LogDataValue(string value)
        {
            Value = double.TryParse(value, out double doubleValue) ? doubleValue : value;
        }
        public object Value { get; }
    }
}
