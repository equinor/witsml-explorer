using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Text.Json.Serialization;

using WitsmlExplorer.Api.Repositories;

namespace WitsmlExplorer.Api.Models
{
    public class Server : DbDocument<Guid>
    {
        public Server() : base(Guid.NewGuid())
        {
        }

        [JsonPropertyName("name")]
        public string Name { get; init; }
        [JsonPropertyName("url")]
        public Uri Url { get; init; }
        [JsonPropertyName("description")]
        public string Description { get; init; }
        [JsonPropertyName("roles")]
        public IList<string> Roles { get; init; }
        [JsonPropertyName("credentialIds")]
        public IList<string> CredentialIds { get; init; }
        [JsonPropertyName("depthLogDecimals")]
        public int DepthLogDecimals { get; init; }
        [JsonPropertyName("isPriority")]
        public bool IsPriority { get; init; }

        public override string ToString()
        {
            return JsonSerializer.Serialize(this);
        }
    }
}
