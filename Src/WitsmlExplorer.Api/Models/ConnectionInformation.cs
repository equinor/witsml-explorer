using System;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace WitsmlExplorer.Api.Models
{
    public class ConnectionInformation
    {
        [JsonPropertyName("serverUrl")]
        public Uri ServerUrl { get; init; }
        [JsonPropertyName("userName")]
        public string UserName { get; init; }

        public override string ToString()
        {
            return JsonSerializer.Serialize(this);
        }
    }
}
