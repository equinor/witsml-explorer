using System;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace WitsmlExplorer.Api.Models
{
    public class UidMapping
    {
        [JsonPropertyName("sourceServerId")]
        public Guid SourceServerId { get; set; }

        [JsonPropertyName("sourceWellId")]
        public string SourceWellId { get; set; }

        [JsonPropertyName("sourceWellboreId")]
        public string SourceWellboreId { get; set; }

        [JsonPropertyName("targetServerId")]
        public Guid TargetServerId { get; set; }

        [JsonPropertyName("targetWellId")]
        public string TargetWellId { get; set; }

        [JsonPropertyName("targetWellboreId")]
        public string TargetWellboreId { get; set; }

        [JsonPropertyName("username")]
        public string Username { get; set; }

        [JsonPropertyName("timestamp")]
        public DateTime? Timestamp { get; set; }

        public override string ToString()
        {
            return JsonSerializer.Serialize(this);
        }
    }

    public class UidMappingDbQuery
    {
        [JsonPropertyName("sourceServerId")]
        public Guid SourceServerId { get; set; }

        [JsonPropertyName("sourceWellId")]
        public string SourceWellId { get; set; }

        [JsonPropertyName("sourceWellboreId")]
        public string SourceWellboreId { get; set; }

        [JsonPropertyName("targetServerId")]
        public Guid TargetServerId { get; set; }

        [JsonPropertyName("targetWellId")]
        public string TargetWellId { get; set; }

        [JsonPropertyName("targetWellboreId")]
        public string TargetWellboreId { get; set; }

        public override string ToString()
        {
            return JsonSerializer.Serialize(this);
        }
    }
    public class UidMappingBasicInfo
    {
        [JsonPropertyName("sourceWellId")]
        public string SourceWellId { get; set; }

        [JsonPropertyName("sourceWellboreId")]
        public string SourceWellboreId { get; set; }

        [JsonPropertyName("targetServerId")]
        public Guid TargetServerId { get; set; }

        [JsonPropertyName("targetServerName")]
        public string TargetServerName { get; set; }

        public override string ToString()
        {
            return JsonSerializer.Serialize(this);
        }
    }

    public class UidMappingKey
    {
        public UidMappingKey() { }
        public UidMappingKey(Guid sourceServerId, Guid targetServerId)
        {
            SourceServerId = sourceServerId;
            TargetServerId = targetServerId;
        }

        [JsonPropertyName("sourceServerId")]
        public Guid SourceServerId { get; set; }

        [JsonPropertyName("targetServerId")]
        public Guid TargetServerId { get; set; }

        public override string ToString()
        {
            return JsonSerializer.Serialize(this);
        }
    }
}
