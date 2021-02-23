using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Witsml;

namespace WitsmlExplorer.Api.Services
{
    public interface IWitsmlClientProvider
    {
        IWitsmlClient GetClient();
        IWitsmlClient GetSourceClient();
    }

    public class WitsmlClientProvider : IWitsmlClientProvider
    {
        public const string WitsmlServerUrlHeader = "Witsml-ServerUrl";
        private const string WitsmlSourceServerUrlHeader = "Witsml-Source-ServerUrl";

        private readonly WitsmlClient witsmlClient;
        private readonly WitsmlClient witsmlSourceClient;

        public WitsmlClientProvider(IConfiguration configuration, IHttpContextAccessor httpContextAccessor, ICredentialsService credentialsService)
        {
            if (httpContextAccessor.HttpContext == null || httpContextAccessor.HttpContext.Request.Headers["Authorization"].Count == 0) return;

            var headers = httpContextAccessor.HttpContext.Request.Headers;
            var serverUrl = headers[WitsmlServerUrlHeader];
            var witsmlServerAccessNeeded = !string.IsNullOrEmpty(serverUrl);
            if (!witsmlServerAccessNeeded) return;

            var credentials = ExtractCredentialsFromHeader(headers);

            //This provider will unintentionally be invoked also on initial authentication requests. Doing this to let the authentication route be triggered.
            var isEncrypted = credentialsService.VerifyIsEncrypted(credentials[0]);
            if (!isEncrypted) return;

            var logQueries = StringHelpers.ToBoolean(configuration["LogQueries"]);
            witsmlClient = new WitsmlClient(serverUrl, credentials[0].Username, credentialsService.Decrypt(credentials[0]), logQueries);

            var sourceServerUrl = headers[WitsmlSourceServerUrlHeader];

            if (string.IsNullOrEmpty(sourceServerUrl) && credentials.Count == 1) return;
            witsmlSourceClient = new WitsmlClient(sourceServerUrl, credentials[1].Username, credentialsService.Decrypt(credentials[1]), logQueries);
        }

        private static List<Credentials> ExtractCredentialsFromHeader(IHeaderDictionary headers)
        {
            var base64EncodedCredentials = headers["Authorization"].ToString().Substring("Basic ".Length).Trim();
            var credentialString = Encoding.UTF8.GetString(Convert.FromBase64String(base64EncodedCredentials));
            var usernamesAndPasswords = credentialString.Split(':');
            var credentials = new List<Credentials> {new Credentials(usernamesAndPasswords[0], usernamesAndPasswords[1])};
            if (usernamesAndPasswords.Length == 4)
            {
                credentials.Add(new Credentials(usernamesAndPasswords[2], usernamesAndPasswords[3]));
            }

            return credentials;
        }

        internal WitsmlClientProvider(IConfiguration configuration)
        {
            var (serverUrl, username, password) = GetCredentialsFromConfiguration(configuration);
            witsmlClient = new WitsmlClient(serverUrl, username, password, true);
        }

        private (string, string, string) GetCredentialsFromConfiguration(IConfiguration configuration)
        {
            var serverUrl = configuration["Witsml:Host"];
            var username = configuration["Witsml:Username"];
            var password = configuration["Witsml:Password"];

            return (serverUrl, username, password);
        }

        public IWitsmlClient GetClient() => witsmlClient;
        public IWitsmlClient GetSourceClient() => witsmlSourceClient;
    }
}
