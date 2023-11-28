using System;
using System.Text.Json;
using System.Text.Json.Serialization;

using WitsmlExplorer.Api.Models;

public class ObjectOnWellboreConverter : JsonConverter<ObjectOnWellbore>
{
    public override ObjectOnWellbore Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        using (JsonDocument doc = JsonDocument.ParseValue(ref reader))
        {
            // Assuming a property named "objectType" is in the JSON indicating the actual type
            JsonElement root = doc.RootElement;
            JsonElement typeProperty = root.GetProperty("objectType");
            EntityType entityType = Enum.Parse<EntityType>(typeProperty.GetString());
            Type objectType = EntityTypeHelper.GetApiTypeFromEntityType(entityType);

            return JsonSerializer.Deserialize(root.GetRawText(), objectType, options) as ObjectOnWellbore;
        }
    }

    public override void Write(Utf8JsonWriter writer, ObjectOnWellbore value, JsonSerializerOptions options)
    {
        throw new NotImplementedException();
    }
}
