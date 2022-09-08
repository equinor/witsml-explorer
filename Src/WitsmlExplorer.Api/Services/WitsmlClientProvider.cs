using System.Collections.Generic;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Primitives;

using Witsml;
using Witsml.Data;

using WitsmlExplorer.Api.Configuration;

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
            Task<List<ICredentials>> credTask = credentialsService.ExtractCredentialsFromHeader(headers);
            Task.WaitAny(credTask);
            List<ICredentials> credentials = credTask.Result;

            //This provider will unintentionally be invoked also on initial authentication requests. Doing this to let the authentication route be triggered.
            //bool isEncrypted = credentialsService.VerifyIsEncrypted(credentials[0]);
            //if (!isEncrypted)
            //{
            //    return;
            //}

            bool logQueries = StringHelpers.ToBoolean(configuration[ConfigConstants.LogQueries]);
            _witsmlClient = new WitsmlClient(serverUrl, credentials[0].Username, credentials[0].Password, _clientCapabilities, null, logQueries);

            StringValues sourceServerUrl = headers[WitsmlSourceServerUrlHeader];

            if (string.IsNullOrEmpty(sourceServerUrl) && credentials.Count == 1)
            {
                return;
            }

            _witsmlSourceClient = new WitsmlClient(sourceServerUrl, credentials[1].Username, credentials[1].Password, _clientCapabilities, null, logQueries);
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
