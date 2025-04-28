using System;
using System.Text.Json;
using System.Text.Json.Serialization;

using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Converters
{
    public class LogDataValueConverter : JsonConverter<LogDataValue>
    {
        public override LogDataValue Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            var stringValue = reader.GetString();
            return new LogDataValue(stringValue);
        }

        public override void Write(Utf8JsonWriter writer, LogDataValue value, JsonSerializerOptions options)
        {
            if (value.Value is double doubleValue)
            {
                if (Double.IsPositiveInfinity(doubleValue))
                {
                    doubleValue = Double.MaxValue;
                }
                writer.WriteNumberValue(doubleValue);
            }
            else
            {
                writer.WriteStringValue((string)value.Value);
            }
        }
    }
}
