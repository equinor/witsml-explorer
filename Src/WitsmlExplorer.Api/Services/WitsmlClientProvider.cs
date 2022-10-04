using System;
using System.Net;
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

        private readonly ServerCredentials _targetCreds;
        private readonly ServerCredentials _sourceCreds;
        private readonly WitsmlClient _witsmlClient;
        private readonly WitsmlClient _witsmlSourceClient;
        private readonly WitsmlClientCapabilities _clientCapabilities;

        public WitsmlClientProvider(IConfiguration configuration, IHttpContextAccessor httpContextAccessor, ICredentialsService credentialsService, IOptions<WitsmlClientCapabilities> witsmlClientCapabilities)
        {
            if (httpContextAccessor.HttpContext?.Request.Headers[WitsmlServerUrlHeader].Count == 0)
            {
                return;
            }
            _clientCapabilities = witsmlClientCapabilities.Value;
            bool logQueries = StringHelpers.ToBoolean(configuration[ConfigConstants.LogQueries]);

            StringValues? authorizationHeader = httpContextAccessor.HttpContext?.Request.Headers["Authorization"];
            StringValues? targetServerHeader = httpContextAccessor.HttpContext?.Request.Headers[WitsmlServerUrlHeader];

            if (authorizationHeader?.Count > 0 || targetServerHeader?.Count > 0)
            {
                string bearerToken = authorizationHeader?.Count > 0 ? authorizationHeader.ToString().Split()[1] : null;

                Task<ServerCredentials> targetCredsTask = credentialsService.GetCreds(WitsmlServerUrlHeader, bearerToken);
                Task<ServerCredentials> sourceCredsTask = credentialsService.GetCreds(WitsmlSourceServerUrlHeader, bearerToken);
                Task.WaitAll(targetCredsTask, sourceCredsTask);
                _targetCreds = targetCredsTask.Result;
                _sourceCreds = sourceCredsTask.Result;
            }
            else
            {
                throw new WitsmlClientProviderException($"Missing headers for 'Authorization' or '{WitsmlServerUrlHeader}'", (int)HttpStatusCode.BadRequest);
            }

            _witsmlClient = !_targetCreds.IsCredsNullOrEmpty() ? new WitsmlClient(_targetCreds.Host.ToString(), _targetCreds.UserId, _targetCreds.Password, _clientCapabilities, null, logQueries) : null;
            _witsmlSourceClient = !_sourceCreds.IsCredsNullOrEmpty() ? new WitsmlClient(_sourceCreds.Host.ToString(), _sourceCreds.UserId, _sourceCreds.Password, _clientCapabilities, null, logQueries) : null;
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
    public class WitsmlClientProviderException : Exception
    {
        public WitsmlClientProviderException(string message, int statusCode) : base(message)
        {
            StatusCode = statusCode;
        }

        public int StatusCode { get; private set; }
    }
}
