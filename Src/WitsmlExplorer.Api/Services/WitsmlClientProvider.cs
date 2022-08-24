using System;
using System.Collections.Generic;
using System.Text;

using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Primitives;

using Witsml;
using Witsml.Data;

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

        private readonly WitsmlClient _witsmlClient;
        private readonly WitsmlClient _witsmlSourceClient;
        private readonly WitsmlClientCapabilities _clientCapabilities;

        public WitsmlClientProvider(
            IConfiguration configuration,
            IHttpContextAccessor httpContextAccessor,
            ICredentialsService credentialsService,
            IOptions<WitsmlClientCapabilities> witsmlClientCapabilities)
        {
            if (httpContextAccessor.HttpContext == null || httpContextAccessor.HttpContext.Request.Headers["Authorization"].Count == 0)
            {
                return;
            }

            _clientCapabilities = witsmlClientCapabilities.Value;

            IHeaderDictionary headers = httpContextAccessor.HttpContext.Request.Headers;
            StringValues serverUrl = headers[WitsmlServerUrlHeader];
            bool witsmlServerAccessNeeded = !string.IsNullOrEmpty(serverUrl);
            if (!witsmlServerAccessNeeded)
            {
                return;
            }

            List<Credentials> credentials = ExtractCredentialsFromHeader(headers);

            //This provider will unintentionally be invoked also on initial authentication requests. Doing this to let the authentication route be triggered.
            bool isEncrypted = credentialsService.VerifyIsEncrypted(credentials[0]);
            if (!isEncrypted)
            {
                return;
            }

            bool logQueries = StringHelpers.ToBoolean(configuration["LogQueries"]);
            _witsmlClient = new WitsmlClient(serverUrl, credentials[0].Username, credentialsService.Decrypt(credentials[0]), _clientCapabilities, null, logQueries);

            StringValues sourceServerUrl = headers[WitsmlSourceServerUrlHeader];

            if (string.IsNullOrEmpty(sourceServerUrl) && credentials.Count == 1)
            {
                return;
            }

            _witsmlSourceClient = new WitsmlClient(sourceServerUrl, credentials[1].Username, credentialsService.Decrypt(credentials[1]), _clientCapabilities, null, logQueries);
        }

        private static List<Credentials> ExtractCredentialsFromHeader(IHeaderDictionary headers)
        {
            string base64EncodedCredentials = headers["Authorization"].ToString()["Basic ".Length..].Trim();
            string credentialString = Encoding.UTF8.GetString(Convert.FromBase64String(base64EncodedCredentials));
            string[] usernamesAndPasswords = credentialString.Split(':');
            List<Credentials> credentials = new() { new Credentials(usernamesAndPasswords[0], usernamesAndPasswords[1]) };
            if (usernamesAndPasswords.Length == 4)
            {
                credentials.Add(new Credentials(usernamesAndPasswords[2], usernamesAndPasswords[3]));
            }

            return credentials;
        }

        internal WitsmlClientProvider(IConfiguration configuration)
        {
            (string serverUrl, string username, string password) = GetCredentialsFromConfiguration(configuration);
            _witsmlClient = new WitsmlClient(serverUrl, username, password, new WitsmlClientCapabilities(), null, true);
        }

        private static (string, string, string) GetCredentialsFromConfiguration(IConfiguration configuration)
        {
            string serverUrl = configuration["Witsml:Host"];
            string username = configuration["Witsml:Username"];
            string password = configuration["Witsml:Password"];

            return (serverUrl, username, password);
        }

        public IWitsmlClient GetClient()
        {
            return _witsmlClient;
        }

        public IWitsmlClient GetSourceClient()
        {
            return _witsmlSourceClient;
        }
    }
}
