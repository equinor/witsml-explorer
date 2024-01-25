using System;
using System.Collections.Generic;
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

public class ObjectOnWellboreListConverter : JsonConverter<List<ObjectOnWellbore>>
{
    private readonly ObjectOnWellboreConverter _objectOnWellboreConverter = new ObjectOnWellboreConverter();

    public override List<ObjectOnWellbore> Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType != JsonTokenType.StartArray)
        {
            throw new JsonException("Expected StartArray");
        }

        var list = new List<ObjectOnWellbore>();

        while (reader.Read())
        {
            if (reader.TokenType == JsonTokenType.EndArray)
            {
                return list;
            }

            var objectOnWellbore = _objectOnWellboreConverter.Read(ref reader, typeof(ObjectOnWellbore), options);
            list.Add(objectOnWellbore);
        }

        throw new JsonException("Expected EndArray");
    }

    public override void Write(Utf8JsonWriter writer, List<ObjectOnWellbore> value, JsonSerializerOptions options)
    {
        throw new NotImplementedException();
    }
}
