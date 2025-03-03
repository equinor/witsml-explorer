using System;
using System.Text.Json;
using System.Text.Json.Serialization;

using WitsmlExplorer.Api.Repositories;

namespace WitsmlExplorer.Api.Models
{
    public class AgentSettings
    {
        [JsonPropertyName("minimumDataQcTimeoutDefault")]
        public long MinimumDataQcTimeoutDefault { get; set; }

        [JsonPropertyName("minimumDataQcDepthGapDefault")]
        public double MinimumDataQcDepthGapDefault { get; set; }

        [JsonPropertyName("minimumDataQcDepthDensityDefault")]
        public double MinimumDataQcDepthDensityDefault { get; set; }

        [JsonPropertyName("minimumDataQcTimeGapDefault")]
        public long MinimumDataQcTimeGapDefault { get; set; }

        [JsonPropertyName("minimumDataQcTimeDensityDefault")]
        public double MinimumDataQcTimeDensityDefault { get; set; }

        [JsonPropertyName("username")]
        public string Username { get; set; }

        [JsonPropertyName("timestamp")]
        public DateTime? Timestamp { get; set; }

        public override string ToString()
        {
            return JsonSerializer.Serialize(this);
        }
    }

    public class AgentSettingsDocument : DbDocument<string>
    {
        public static string GLOBAL_ID = "global";

        public AgentSettingsDocument(string id) : base(id)
        {
        }

        [JsonPropertyName("agentSettings")]
        public AgentSettings AgentSettings { get; set; }

        public override string ToString()
        {
            return JsonSerializer.Serialize(this);
        }
    }
}
