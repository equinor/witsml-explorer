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
            Roles = server.Roles;
            CredentialIds = server.CredentialIds;
            Id = server.Id;
            DepthLogDecimals = server.DepthLogDecimals;
            IsPriority = server.IsPriority;
        }

        [JsonPropertyName("usernames")]
        public string[] Usernames { get; set; }

        public override string ToString()
        {
            return JsonSerializer.Serialize(this);
        }
    }
}
