using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.AspNetCore.DataProtection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

using Witsml;
using Witsml.Data;

using WitsmlExplorer.Api.Configuration;
using WitsmlExplorer.Api.Extensions;
using WitsmlExplorer.Api.HttpHandlers;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Repositories;

namespace WitsmlExplorer.Api.Services
{

    // ReSharper disable once UnusedMember.Global
    public class CredentialsService : ICredentialsService
    {
        private readonly ITimeLimitedDataProtector _dataProtector;
        private readonly ILogger<CredentialsService> _logger;
        private readonly WitsmlClientCapabilities _clientCapabilities;
        private readonly IWitsmlSystemCredentials _witsmlServerCredentials;
        private readonly IDocumentRepository<Server, Guid> _witsmlServerRepository;
        private readonly ICredentialsCache _credentialsCache;
        private readonly Task<IEnumerable<Server>> _allServers;
        private static readonly string SUBJECT = "sub";

        public CredentialsService(
            IDataProtectionProvider dataProtectionProvider,
            IOptions<WitsmlClientCapabilities> clientCapabilities,
            IWitsmlSystemCredentials witsmlServerCredentials,
            IDocumentRepository<Server, Guid> witsmlServerRepository,
            ICredentialsCache credentialsCache,
            ILogger<CredentialsService> logger)
        {
            _dataProtector = dataProtectionProvider.CreateProtector("WitsmlServerPassword").ToTimeLimitedDataProtector();
            _logger = logger ?? throw new ArgumentException("Missing ILogger");
            _clientCapabilities = clientCapabilities.Value ?? throw new ArgumentException("Missing WitsmlClientCapabilities");
            _witsmlServerCredentials = witsmlServerCredentials ?? throw new ArgumentException("Missing WitsmlServerCredentials");
            _witsmlServerRepository = witsmlServerRepository ?? throw new ArgumentException("Missing WitsmlServerRepository");
            _credentialsCache = credentialsCache ?? throw new ArgumentException("CredentialsService missing");
            _allServers = _witsmlServerRepository.GetDocumentsAsync();
        }

        public async Task<ServerCredentials> GetCredentialsFromHeaderValue(string headerValue, string token = null)
        {
            ServerCredentials result = GetBasicCredentialsFromHeaderValue(headerValue);
            if (result.IsCredsNullOrEmpty() && token != null && result.Host != null)
            {
                return await GetSystemCredentialsByToken(token, result.Host);
            }
            return result;
        }

        public async Task VerifyCredentials(ServerCredentials serverCreds)
        {
            WitsmlClient witsmlClient = new(serverCreds.Host.ToString(), serverCreds.UserId, serverCreds.Password, _clientCapabilities);
            await witsmlClient.TestConnectionAsync();
        }

        private async Task<bool> UserHasRoleForHost(string[] roles, Uri host)
        {
            bool result = true;
            IEnumerable<Server> allServers = await _allServers;

            bool systemCredsExists = _witsmlServerCredentials.WitsmlCreds.Any(n => n.Host == host);
            IEnumerable<Server> hostServer = allServers.Where(n => n.Url.ToString() == host.ToString());
            bool validRole = hostServer.Any(n => n.Roles.Intersect(roles).Any());
            result &= systemCredsExists & validRole;

            return result;
        }
        private string Encrypt(string inputString)
        {
            return _dataProtector.Protect(inputString);
        }

        private string Decrypt(string inputString)
        {
            try
            {
                return _dataProtector.Unprotect(inputString);
            }
            catch
            {
                return inputString?.Length > 0 ? inputString : null;
            }
        }

        public void RemoveCachedCredentials(string clientId)
        {
            _credentialsCache.RemoveAllClientCredentials(clientId);
        }

        public void CacheCredentials(string clientId, ServerCredentials credentials, double ttl, Func<string, string> delEncrypt = null)
        {
            delEncrypt ??= Encrypt;

            string cacheId = $"{clientId}@{credentials.Host.Host}";
            string encryptedCredentials = delEncrypt($"{credentials.UserId}:{credentials.Password}");
            _credentialsCache.SetItem(cacheId, encryptedCredentials, ttl);
        }

        public async Task<ServerCredentials> GetSystemCredentialsByToken(string token, Uri server)
        {
            ServerCredentials result = new();
            JwtSecurityTokenHandler handler = new();
            JwtSecurityToken jwt = handler.ReadJwtToken(token);
            string[] userRoles = jwt.Claims.Where(n => n.Type == "roles").Select(n => n.Value).ToArray();
            _logger.LogDebug("User roles in JWT: {roles}", string.Join(",", userRoles));
            if (await UserHasRoleForHost(userRoles, server))
            {
                result = _witsmlServerCredentials.WitsmlCreds.Single(n => n.Host == server);
                if (!result.IsCredsNullOrEmpty())
                {
                    CacheCredentials(GetClaimFromTokenValue(token, SUBJECT), result, 1.0);
                }
            }
            return result;
        }

        private static string GetClaimFromTokenValue(string token, string claim)
        {
            JwtSecurityTokenHandler handler = new();
            JwtSecurityToken jwt = handler.ReadJwtToken(token);
            return jwt.Claims.Where(n => n.Type == claim).Select(n => n.Value).FirstOrDefault();
        }

        public string GetClaimFromToken(IEssentialHeaders headers, string claim)
        {
            return GetClaimFromTokenValue(headers.GetBearerToken(), claim);
        }

        private ServerCredentials GetBasicCredentialsFromHeaderValue(string headerValue)
        {
            return HttpRequestExtensions.ParseServerHttpHeader(headerValue, Decrypt);
        }

        public (ServerCredentials targetServer, ServerCredentials sourceServer) GetWitsmlUsernamesFromCache(IEssentialHeaders headers)
        {
            (ServerCredentials witsmlTargetCredentials, ServerCredentials witsmlSourceCredentials) result;
            if (headers.GetCookieValue() != null)
            {
                ServerCredentials target = string.IsNullOrEmpty(headers.TargetServer) ? new ServerCredentials() : GetCredentialsFromCache(false, headers, headers.TargetServer);
                ServerCredentials source = string.IsNullOrEmpty(headers.SourceServer) ? new ServerCredentials() : GetCredentialsFromCache(false, headers, headers.SourceServer);
                result = (target, source);
            }
            else
            {
                ServerCredentials target = string.IsNullOrEmpty(headers.TargetServer) ? new ServerCredentials() : GetCredentialsFromCache(true, headers, headers.TargetServer);
                ServerCredentials source = string.IsNullOrEmpty(headers.SourceServer) ? new ServerCredentials() : GetCredentialsFromCache(true, headers, headers.SourceServer);
                result = (target, source);
            }
            return result;
        }

        public ServerCredentials GetCredentialsFromCache(bool useOauth, IEssentialHeaders headers, string serverUrl, Func<string, string> delDecrypt = null)
        {
            delDecrypt ??= Decrypt;
            string cacheClientId = useOauth ? GetClaimFromToken(headers, SUBJECT) : headers.GetCookieValue();
            string cacheId = $"{cacheClientId}@{new Uri(serverUrl).Host}";
            string cacheContents = delDecrypt(_credentialsCache.GetItem(cacheId));

            return cacheContents?.Split(":").Length == 2 ?
                new ServerCredentials()
                {
                    Host = new Uri(serverUrl),
                    UserId = cacheContents.Split(":")[0],
                    Password = cacheContents.Split(":")[1]
                } :
                null;
        }

    }
}
