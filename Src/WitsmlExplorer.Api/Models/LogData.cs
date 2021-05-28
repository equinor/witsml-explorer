using System.Collections.Generic;
using System.Text.Json.Serialization;
using WitsmlExplorer.Api.Converters;

namespace WitsmlExplorer.Api.Models
{
    public class LogData
    {
        public string StartIndex { get; set; }
        public string EndIndex { get; set; }
        public IEnumerable<CurveSpecification> CurveSpecifications { get; set; }
        public IEnumerable<Dictionary<string, LogDataValue>> Data { get; set; }
        public string MnemonicList { get; set; }
        public string UnitList { get; set; }
        public List<string> DataCsv { get; set; }
    }

    public class CurveSpecification
    {
        public string Mnemonic { get; set; }
        public string Unit { get; set; }
    }

    [JsonConverter(typeof(LogDataValueConverter))]
    public class LogDataValue
    {
        public LogDataValue(string value)
        {
            if (double.TryParse(value, out var doubleValue))
                Value = doubleValue;
            else
                Value = value;
        }
        public object Value { get; }
    }
}
