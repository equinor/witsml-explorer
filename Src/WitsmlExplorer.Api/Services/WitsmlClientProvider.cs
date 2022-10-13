using System;
using System.Net;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Primitives;

using Witsml;
using Witsml.Data;

using WitsmlExplorer.Api.Configuration;

namespace WitsmlExplorer.Api.Services
{
    public interface IWitsmlClientProvider
    {
        Task<IWitsmlClient> GetClient();
        Task<IWitsmlClient> GetSourceClient();
    }

    public class WitsmlClientProvider : IWitsmlClientProvider
    {
        public const string WitsmlTargetServerHeader = "WitsmlTargetServer";
        public const string WitsmlSourceServerHeader = "WitsmlSourceServer";

        private ServerCredentials _targetCreds;
        private ServerCredentials _sourceCreds;
        private WitsmlClient _witsmlClient;
        private WitsmlClient _witsmlSourceClient;
        private readonly WitsmlClientCapabilities _clientCapabilities;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ICredentialsService _credentialsService;
        private readonly ILogger<WitsmlClientProvider> _logger;
        private readonly bool _logQueries;

        public WitsmlClientProvider(ILogger<WitsmlClientProvider> logger, IConfiguration configuration, IHttpContextAccessor httpContextAccessor, ICredentialsService credentialsService, IOptions<WitsmlClientCapabilities> witsmlClientCapabilities)
        {
            if (httpContextAccessor.HttpContext?.Request.Headers[WitsmlTargetServerHeader].Count == 0)
            {
                return;
            }
            _clientCapabilities = witsmlClientCapabilities?.Value ?? throw new ArgumentException("WitsmlClientCapabilities missing");
            _httpContextAccessor = httpContextAccessor ?? throw new ArgumentException("HttpContextAccessor missing");
            _credentialsService = credentialsService ?? throw new ArgumentException("CredentialsService missing");
            _logger = logger ?? throw new ArgumentException("Logger missing");
            _logQueries = StringHelpers.ToBoolean(configuration[ConfigConstants.LogQueries]);
            _logger.LogDebug("WitsmlClientProvider initialized");
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

        public async Task<IWitsmlClient> GetClient()
        {
            if (_witsmlClient == null)
            {
                StringValues? authorizationHeader = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"];
                StringValues? targetServerHeader = _httpContextAccessor.HttpContext?.Request.Headers[WitsmlTargetServerHeader];

                if (authorizationHeader?.Count > 0 || targetServerHeader?.Count > 0)
                {
                    string bearerToken = authorizationHeader?.Count > 0 ? authorizationHeader.ToString().Split()[1] : null;
                    ServerCredentials targetCredsTask = await _credentialsService.GetCredentials(WitsmlTargetServerHeader, bearerToken);
                    _targetCreds = targetCredsTask;
                }
                else
                {
                    throw new WitsmlClientProviderException($"Missing headers for 'Authorization' or '{WitsmlTargetServerHeader}'", (int)HttpStatusCode.BadRequest);
                }
                _witsmlClient = !_targetCreds.IsCredsNullOrEmpty() ? new WitsmlClient(_targetCreds.Host.ToString(), _targetCreds.UserId, _targetCreds.Password, _clientCapabilities, null, _logQueries) : null;
            }
            return _witsmlClient;
        }

        public async Task<IWitsmlClient> GetSourceClient()
        {
            if (_witsmlSourceClient == null)
            {
                StringValues? authorizationHeader = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"];
                StringValues? sourceServerHeader = _httpContextAccessor.HttpContext?.Request.Headers[WitsmlSourceServerHeader];

                if (authorizationHeader?.Count > 0 || sourceServerHeader?.Count > 0)
                {
                    string bearerToken = authorizationHeader?.Count > 0 ? authorizationHeader.ToString().Split()[1] : null;
                    ServerCredentials sourceCredsTask = await _credentialsService.GetCredentials(WitsmlSourceServerHeader, bearerToken);
                    _sourceCreds = sourceCredsTask;
                }
                else
                {
                    throw new WitsmlClientProviderException($"Missing headers for 'Authorization' or '{WitsmlSourceServerHeader}'", (int)HttpStatusCode.BadRequest);
                }
                _witsmlSourceClient = !_sourceCreds.IsCredsNullOrEmpty() ? new WitsmlClient(_sourceCreds.Host.ToString(), _sourceCreds.UserId, _sourceCreds.Password, _clientCapabilities, null, _logQueries) : null;
            }
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
