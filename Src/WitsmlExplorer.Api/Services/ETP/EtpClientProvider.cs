using System;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;

using Witsml.ETP;

using WitsmlExplorer.Api.HttpHandlers;
using WitsmlExplorer.Api.Middleware;

namespace WitsmlExplorer.Api.Services.ETP
{
    public class EtpClientProvider : IEtpClientProvider
    {
        private readonly EssentialHeaders _httpHeaders;
        private readonly ICredentialsService _credentialsService;
        private readonly IEtpSessionManager _sessionManager;

        public EtpClientProvider(IHttpContextAccessor httpContextAccessor, ICredentialsService credentialsService, IEtpSessionManager etpSessionManager)
        {
            if (httpContextAccessor.HttpContext?.Request.Headers[EssentialHeaders.WitsmlTargetServer].Count == 0)
            {
                return;
            }
            _httpHeaders = new EssentialHeaders(httpContextAccessor?.HttpContext?.Request);
            _credentialsService = credentialsService ?? throw new ArgumentException("CredentialsService missing");
            _sessionManager = etpSessionManager ?? throw new ArgumentException("EtpSessionManager missing");
        }
        public async Task<IEtpClient> GetClient(CancellationToken cancellationToken)
        {
            await ThrowIfNoEtpEndpointIsConfigured(_httpHeaders.TargetServer);

            var targetCreds = await _credentialsService.GetEtpCredentials(_httpHeaders, _httpHeaders.TargetServer, _httpHeaders.TargetUsername);
            if (targetCreds == null) return null;

            var sessionKey = new SessionKey
            {
                UserId = _credentialsService.GetCacheId(_httpHeaders),
                Username = _httpHeaders.TargetUsername,
                ServerUri = targetCreds.Host,
            };
            var sessionOptions = new SessionOptions
            {
                Username = targetCreds.UserId,
                Password = targetCreds.Password,
                ServerUri = targetCreds.Host
            };
            return await _sessionManager.GetOrCreateSessionAsync(sessionKey, sessionOptions, cancellationToken);
        }

        public async Task<IEtpClient> GetSourceClient(CancellationToken cancellationToken)
        {
            await ThrowIfNoEtpEndpointIsConfigured(_httpHeaders.SourceServer);

            var sourceCreds = await _credentialsService.GetEtpCredentials(_httpHeaders, _httpHeaders.SourceServer, _httpHeaders.SourceUsername);
            if (sourceCreds == null) return null;

            var sessionKey = new SessionKey
            {
                UserId = _credentialsService.GetCacheId(_httpHeaders),
                Username = _httpHeaders.SourceUsername,
                ServerUri = sourceCreds.Host,
            };
            var sessionOptions = new SessionOptions
            {
                Username = sourceCreds.UserId,
                Password = sourceCreds.Password,
                ServerUri = sourceCreds.Host
            };
            return await _sessionManager.GetOrCreateSessionAsync(sessionKey, sessionOptions, cancellationToken);
        }

        private async Task ThrowIfNoEtpEndpointIsConfigured(string soapServer)
        {
            var isEtpEndpointConfigured = await _credentialsService.IsEtpEndpointConfigured(new Uri(soapServer));
            if (!isEtpEndpointConfigured)
                throw new EtpEndpointNotConfiguredException($"No ETP endpoint is configured for server '{soapServer}'.");
        }
    }
}
