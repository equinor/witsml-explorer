using System;

using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

using Witsml;
using Witsml.Data;

using WitsmlExplorer.Api.Configuration;
using WitsmlExplorer.Api.HttpHandlers;

namespace WitsmlExplorer.Api.Services
{
    public interface IWitsmlClientProvider
    {
        IWitsmlClient GetClient();
        IWitsmlClient GetSourceClient();
    }

    public class WitsmlClientProvider : IWitsmlClientProvider
    {

        private ServerCredentials _targetCreds;
        private ServerCredentials _sourceCreds;
        private WitsmlClient _witsmlClient;
        private WitsmlClient _witsmlSourceClient;
        private readonly WitsmlClientCapabilities _clientCapabilities;
        private readonly EssentialHeaders _httpHeaders;
        private readonly ICredentialsService _credentialsService;
        private readonly ILogger<WitsmlClientProvider> _logger;
        private readonly bool _logQueries;
        private readonly bool _useOAuth;

        public WitsmlClientProvider(ILogger<WitsmlClientProvider> logger, IConfiguration configuration, IHttpContextAccessor httpContextAccessor, ICredentialsService credentialsService, IOptions<WitsmlClientCapabilities> witsmlClientCapabilities)
        {
            if (httpContextAccessor.HttpContext?.Request.Headers[EssentialHeaders.WitsmlTargetServer].Count == 0)
            {
                return;
            }
            _clientCapabilities = witsmlClientCapabilities?.Value ?? throw new ArgumentException("WitsmlClientCapabilities missing");
            _httpHeaders = new EssentialHeaders(httpContextAccessor?.HttpContext?.Request);
            _credentialsService = credentialsService ?? throw new ArgumentException("CredentialsService missing");
            _logger = logger ?? throw new ArgumentException("Logger missing");
            _logQueries = StringHelpers.ToBoolean(configuration[ConfigConstants.LogQueries]);
            _logger.LogDebug("WitsmlClientProvider initialised");
            _useOAuth = StringHelpers.ToBoolean(configuration[ConfigConstants.OAuth2Enabled]);
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
            if (_witsmlClient == null)
            {
                _targetCreds = _credentialsService.GetCredentialsFromCache(_useOAuth, _httpHeaders, EssentialHeaders.WitsmlTargetServer);
                if (_targetCreds == null)
                {
                    _targetCreds = _credentialsService.GetSystemCredentialsWithToken(_httpHeaders.GetBearerToken(), new Uri(_httpHeaders.GetHeaderValue(EssentialHeaders.WitsmlTargetServer))).Result;
                }
                _witsmlClient = (_targetCreds != null && !_targetCreds.IsCredsNullOrEmpty())
                    ? new WitsmlClient(_targetCreds.Host.ToString(), _targetCreds.UserId, _targetCreds.Password, _clientCapabilities, null, _logQueries)
                    : null;
            }
            return _witsmlClient;
        }

        public IWitsmlClient GetSourceClient()
        {
            if (_witsmlSourceClient == null)
            {
                _sourceCreds = _credentialsService.GetCredentialsFromCache(_useOAuth, _httpHeaders, EssentialHeaders.WitsmlSourceServer);
                if (_sourceCreds == null)
                {
                    _sourceCreds = _credentialsService.GetSystemCredentialsWithToken(_httpHeaders.GetBearerToken(), new Uri(_httpHeaders.GetHeaderValue(EssentialHeaders.WitsmlSourceServer))).Result;
                }
                _witsmlSourceClient = _witsmlClient = (_sourceCreds != null && !_sourceCreds.IsCredsNullOrEmpty())
                    ? new WitsmlClient(_sourceCreds.Host.ToString(), _sourceCreds.UserId, _sourceCreds.Password, _clientCapabilities, null, _logQueries)
                    : null;
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
