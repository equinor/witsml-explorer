using System.Collections.Generic;
using System.Linq;

using Microsoft.Extensions.Configuration;

namespace WitsmlExplorer.Api.Configuration
{
    public interface IWitsmlServerCredentials
    {
        public ServerCredentials[] WitsmlCreds { get; set; }
    }

    /// <summary>
    /// Read Witsml ServerCredentials from Configuration and populate a list of <c>WitsmlCreds</c>
    /// Example appsettings.json ("ObjectX" key will be discarded):
    /// <c>
    ///    "WitsmlCreds": {
    ///       "ObjectA":  { "Host": "my_host_1", "UserId": "my_user_1", "Password": "my_user_1" },
    ///       "ObjectB":  { "Host": "my_host_2", "UserId": "my_user_2", "Password": "my_user_2" }
    ///    }    
    /// </c>
    /// Example keyvault entries ("homeserver" will be ignored):
    /// <c>
    ///    witsmlcreds--homeserver--host
    ///    witsmlcreds--homeserver--userid
    ///    witsmlcreds--homeserver--password
    /// </c>
    /// </summary>
    public class WitsmlServerCredentials : IWitsmlServerCredentials
    {
        public ServerCredentials[] WitsmlCreds { get; set; }

        public WitsmlServerCredentials(IConfiguration configuration)
        {
            Bind(configuration);
        }

        private void Bind(IConfiguration configuration)
        {
            configuration.Bind(this);

            List<ServerCredentials> credsList = new();
            List<IConfigurationSection> creds = configuration.GetSection(ConfigConstants.WitsmlServerCredsSection).GetChildren().ToList();
            foreach (IConfigurationSection rule in creds)
            {
                ServerCredentials cred = new();
                rule.Bind(cred);
                credsList.Add(cred);
            }

            WitsmlCreds = credsList.ToArray();
        }
    }
    public class ServerCredentials
    {
        internal ServerCredentials() { }

        public ServerCredentials(string host, string userid, string password)
        {
            Host = host;
            UserId = userid;
            Password = password;
        }
        public string Host { get; init; }
        public string UserId { get; init; }
        public string Password { get; init; }

    }

}
