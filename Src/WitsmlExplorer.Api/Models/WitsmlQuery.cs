using System.Text.Json.Serialization;

using Witsml.ServiceReference;

namespace WitsmlExplorer.Api.Models
{
    public class WitsmlQuery
    {
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public ReturnElements? ReturnElements { get; init; }
        public string OptionsInString { get; init; }
        public string Body { get; init; }
    }
}
