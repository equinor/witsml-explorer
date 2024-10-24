using System.Collections.Generic;
using System.Text.Json;
using System.Text.Json.Serialization;

using WitsmlExplorer.Api.Repositories;

namespace WitsmlExplorer.Api.Models
{
    public class UidMappingCollection : DbDocument<string>
    {
        public UidMappingCollection(string id) : base(id)
        {
            MappingCollection = new List<UidMapping>();
        }

        [JsonPropertyName("mappingCollection")]
        public List<UidMapping> MappingCollection { get; set; }

        public override string ToString()
        {
            return JsonSerializer.Serialize(this);
        }
    }
}
