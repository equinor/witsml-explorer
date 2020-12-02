using System;
using System.Text.Json;
using System.Text.Json.Serialization;
using WitsmlExplorer.Api.Repositories;

namespace WitsmlExplorer.Api.Models
{
    public class Server: DbDocument<Guid>
    {
        public Server() : base(Guid.NewGuid())
        {
        }

        [JsonPropertyName("name")]
        public string Name { get; set; }
        [JsonPropertyName("url")]
        public Uri Url { get; set; }
        [JsonPropertyName("description")]
        public string Description { get; set; }
        public override string ToString()
        {
            return JsonSerializer.Serialize(this);
        }
    }
}
