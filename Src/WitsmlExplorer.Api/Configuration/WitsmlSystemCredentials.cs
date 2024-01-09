using System;
using System.Collections.Generic;
using System.Linq;

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace WitsmlExplorer.Api.Configuration
{
    public interface IWitsmlSystemCredentials
    {
        public IReadOnlyCollection<ServerCredentials> WitsmlCreds { get; set; }
    }

    /// <summary>
    /// Read Witsml ServerCredentials from Configuration and populate a list of <c>WitsmlCreds</c>.
    /// The ServerCredentials will be refreshed if Configuration changes on reload.
    /// Example appsettings.json ("ObjectX" key will be discarded):
    /// <c>
    ///    "WitsmlCreds": {
    ///       "ObjectA":  { "Host": "my_host_1", "UserId": "my_user_1", "Password": "my_user_1" },
    ///       "ObjectB":  { "Host": "my_host_2", "UserId": "my_user_2", "Password": "my_user_2" }
    ///    }
    /// </c>
    /// Example keyvault entries ("homeserver" will be used as CredentialId):
    /// <c>
    ///    witsmlcreds--homeserver--host
    ///    witsmlcreds--homeserver--userid
    ///    witsmlcreds--homeserver--password
    /// </c>
    /// </summary>
    public class WitsmlSystemCredentials : IWitsmlSystemCredentials, IDisposable
    {
        public IReadOnlyCollection<ServerCredentials> WitsmlCreds { get; set; }
        private IDisposable _unregister;
        private readonly ILogger<WitsmlSystemCredentials> _logger;

        public WitsmlSystemCredentials(IConfiguration configuration, ILogger<WitsmlSystemCredentials> logger)
        {
            _logger = logger;
            Bind(configuration);
        }

        private void Bind(IConfiguration configuration)
        {
            configuration.Bind(this);

            List<ServerCredentials> credsList = new();
            List<IConfigurationSection> creds = configuration.GetSection(ConfigConstants.WitsmlServerCredsSection).GetChildren().ToList();
            foreach (IConfigurationSection rule in creds)
            {
                ServerCredentials cred = new() { CredentialId = rule.Key };
                rule.Bind(cred);
                _logger.LogDebug("Binding credential with server {server} and credentialId {credentialId}", cred.Host, cred.CredentialId);
                if (!cred.IsNullOrEmpty() && cred.Host != null)
                {
                    credsList.Add(cred);
                }
            }

            WitsmlCreds = credsList;
            _unregister?.Dispose();
            _unregister = configuration.GetReloadToken().RegisterChangeCallback((_) => Bind(configuration), null);
        }

        public void Dispose()
        {
            _unregister?.Dispose();
            GC.SuppressFinalize(this);
        }
    }

}
