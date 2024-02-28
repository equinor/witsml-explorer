using System.Collections.Generic;
using System.Text.Json;
using System.Text.Json.Serialization;

using WitsmlExplorer.Api.Repositories;

namespace WitsmlExplorer.Api.Models
{
    public class LogCurvePriority : DbDocument<string>
    {
        public LogCurvePriority(string id) : base(id)
        {
        }

        [JsonPropertyName("prioritizedcurves")]
        public IList<string> PrioritizedCurves { get; set; }

        public override string ToString()
        {
            return JsonSerializer.Serialize(this);
        }
    }
}
