using System;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;

using Witsml.ETP;

using WitsmlExplorer.Api.HttpHandlers;

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
            var targetCreds = await _credentialsService.GetEtpCredentials(_httpHeaders, _httpHeaders.TargetServer, _httpHeaders.TargetUsername);
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
            var sourceCreds = await _credentialsService.GetEtpCredentials(_httpHeaders, _httpHeaders.SourceServer, _httpHeaders.SourceUsername);
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
    }
}
