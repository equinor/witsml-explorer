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

        public WitsmlClientProvider(IConfiguration configuration, IHttpContextAccessor httpContextAccessor, ICredentialsService credentialsService, IOptions<WitsmlClientCapabilities> witsmlClientCapabilities)
        {
            if (httpContextAccessor.HttpContext?.Request.Headers["Authorization"].Count == 0 ||
                httpContextAccessor.HttpContext?.Request.Headers[WitsmlServerUrlHeader].Count == 0
            )
            {
                return;
            }

            _clientCapabilities = witsmlClientCapabilities.Value;

            IHeaderDictionary headers = httpContextAccessor.HttpContext.Request.Headers;
            StringValues serverUrl = headers[WitsmlServerUrlHeader];
            StringValues sourceServerUrl = headers[WitsmlSourceServerUrlHeader];
            bool logQueries = StringHelpers.ToBoolean(configuration[ConfigConstants.LogQueries]);

            Task<List<ICredentials>> credTask = credentialsService.ExtractCredentialsFromHeader(headers);
            Task.WaitAny(credTask);
            List<ICredentials> credentials = credTask.Result;

            bool isEncrypted = credentialsService.VerifyIsEncrypted(credentials[0]);
            _witsmlClient = !isEncrypted
                ? new WitsmlClient(serverUrl, credentials[0].UserId, credentials[0].Password, _clientCapabilities, null, logQueries)
                : new WitsmlClient(serverUrl, credentials[0].UserId, credentialsService.Decrypt(credentials[0]), _clientCapabilities, null, logQueries);


            bool useSourceWitsmlServer = !string.IsNullOrEmpty(sourceServerUrl) && credentials.Count == 2;
            if (useSourceWitsmlServer)
            {
                _witsmlSourceClient = new WitsmlClient(sourceServerUrl, credentials[1].UserId, credentialsService.Decrypt(credentials[1]), _clientCapabilities, null, logQueries);
            }
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
