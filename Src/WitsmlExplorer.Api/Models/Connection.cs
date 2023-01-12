using System.Text.Json;
using System.Text.Json.Serialization;

namespace WitsmlExplorer.Api.Models
{
    public class Connection : Server
    {
        public Connection(Server server)
        {
            Name = server.Name;
            Url = server.Url;
            Description = server.Description;
            SecurityScheme = server.SecurityScheme;
            Roles = server.Roles;
            Id = server.Id;
        }

        [JsonPropertyName("username")]
        public string Username { get; set; }

        public override string ToString()
        {
            return JsonSerializer.Serialize(this);
        }
    }
}
