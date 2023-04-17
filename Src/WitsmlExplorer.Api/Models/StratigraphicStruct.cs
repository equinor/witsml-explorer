using Witsml.Data;

namespace WitsmlExplorer.Api.Models
{
    public class StratigraphicStruct
    {
        public string Kind { get; init; }
        public string Value { get; init; }

        public static StratigraphicStruct FromWitsml(WitsmlLithostratigraphyStruct witsmlStruct)
        {
            if (witsmlStruct == null || string.IsNullOrEmpty(witsmlStruct.Value))
            {
                return null;
            }
            return new()
            {
                Kind = witsmlStruct.Kind,
                Value = witsmlStruct.Value
            };
        }

        public static StratigraphicStruct FromWitsml(WitsmlChronostratigraphyStruct witsmlStruct)
        {
            if (witsmlStruct == null || string.IsNullOrEmpty(witsmlStruct.Value))
            {
                return null;
            }
            return new()
            {
                Kind = witsmlStruct.Kind,
                Value = witsmlStruct.Value
            };
        }

        public WitsmlLithostratigraphyStruct ToWitsmlLithostratigraphyStruct()
        {
            return new()
            {
                Kind = Kind,
                Value = Value
            };
        }

        public WitsmlChronostratigraphyStruct ToWitsmlChronostratigraphyStruct()
        {
            return new()
            {
                Kind = Kind,
                Value = Value
            };
        }
    }
}
