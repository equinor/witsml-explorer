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

        public async Task<string> ProtectBasicAuthorization(string headerValue)
        {
            ServerCredentials credentials = GetBasicCredentialsFromHeaderValue(headerValue);
            await VerifyCredentials(credentials);
            return Encrypt($"{credentials.UserId}:{credentials.Password}");
        }

        public async Task<ServerCredentials> GetCredentialsCookieFirst(IEssentialHeaders headers, string server)
        {
            ServerCredentials result;
            if (!string.IsNullOrEmpty(headers.GetCookie()))
            {
                string host = new Uri(headers.GetHeaderValue(server)).Host;
                string cacheId = $"{headers.GetCookie()}@{host}";
                string[] cacheCreds = Decrypt(_credentialsCache.Get(cacheId)).Split('@');
                result = new ServerCredentials()
                {
                    Host = new Uri(headers.GetHeaderValue(server)),
                    UserId = cacheCreds[0],
                    Password = cacheCreds[1]
                };
            }
            else
            {
                result = await GetSystemCredentialsWithToken(headers.GetBearerToken(), new Uri(headers.GetHeaderValue(server)));
            }
            return result;
        }
        public Task<ServerCredentials> GetWitsmlCredentialsCookieCache(IEssentialHeaders headers, string server)
        {
            ServerCredentials result = new();
            if (!string.IsNullOrEmpty(headers.GetCookie()))
            {
                string host = new Uri(headers.GetHeaderValue(server)).Host;
                string cacheId = $"{headers.GetCookie()}@{host}";
                string[] cacheCreds = Decrypt(_credentialsCache.Get(cacheId)).Split('@');
                result = new ServerCredentials()
                {
                    Host = new Uri(headers.GetHeaderValue(server)),
                    UserId = cacheCreds[0],
                    Password = cacheCreds[1]
                };
            }
            return Task.FromResult(result);
        }
        public async Task<ServerCredentials> GetCredentialsFromHeaderValue(string headerValue, string token = null)
        {
            ServerCredentials result = GetBasicCredentialsFromHeaderValue(headerValue);
            if (result.IsCredsNullOrEmpty() && token != null && result.Host != null)
            {
                return await GetSystemCredentialsWithToken(token, result.Host);
            }
            return result;
        }

        private async Task VerifyCredentials(ServerCredentials serverCreds)
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
            return _dataProtector.Protect(inputString, TimeSpan.FromDays(1));
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
        public async Task<ServerCredentials> GetSystemCredentialsWithToken(string token, Uri server)
        {
            JwtSecurityTokenHandler handler = new();
            JwtSecurityToken jwt = handler.ReadJwtToken(token);
            string[] userRoles = jwt.Claims.Where(n => n.Type == "roles").Select(n => n.Value).ToArray();
            _logger.LogDebug("User roles in JWT: {roles}", string.Join(",", userRoles));
            if (await UserHasRoleForHost(userRoles, server))
            {
                return _witsmlServerCredentials.WitsmlCreds.Single(n => n.Host == server);
            }
            return new ServerCredentials();
        }
        public string GetUserNameFromToken(string token)
        {
            JwtSecurityTokenHandler handler = new();
            _ = handler.ReadJwtToken(token);

            string res = "";

            return res;
        }
        public ServerCredentials GetCredentialsFromCache(bool useOauth, IEssentialHeaders headers, string server)
        {
            string cacheClientId = useOauth ? GetClaimFromToken(headers, "sub") : headers.GetCookie();
            string cacheId = $"{cacheClientId}@{new Uri(headers.GetHeaderValue(server)).Host}";
            string cacheContents = Decrypt(_credentialsCache.Get(cacheId));

            return cacheContents?.Split(":").Length == 2 ?
                new ServerCredentials()
                {
                    Host = new Uri(headers.GetHeaderValue(server)),
                    UserId = cacheContents.Split(":")[0],
                    Password = cacheContents.Split(":")[1]
                } :
                null;
        }

        public string GetClaimFromToken(IEssentialHeaders headers, string claim)
        {
            JwtSecurityTokenHandler handler = new();
            JwtSecurityToken jwt = handler.ReadJwtToken(headers.GetBearerToken());
            return jwt.Claims.Where(n => n.Type == claim).Select(n => n.Value).FirstOrDefault();
        }

        private static string GetTokenUserPrincipalName(string token)
        {
            if (string.IsNullOrEmpty(token) || !token.StartsWith("Bearer"))
            {
                return null;
            }

            JwtSecurityTokenHandler handler = new();
            JwtSecurityToken jwt = handler.ReadJwtToken(token.Split()[1]);
            return jwt.Claims.Where(n => n.Type == "upn").Select(n => n.Value).FirstOrDefault();
        }

        private ServerCredentials GetBasicCredentialsFromHeaderValue(string headerValue)
        {
            return HttpRequestExtensions.ParseServerHttpHeader(headerValue, Decrypt);
        }

        public (string userPrincipalName, string witsmlUserName) GetUsernamesFromCacheAndToken(IEssentialHeaders headers, string server)
        {
            ServerCredentials witsmlCredentials = GetCredentialsCookieFirst(headers, server).Result;
            return (GetTokenUserPrincipalName(headers.Authorization), witsmlCredentials.UserId);
        }
        public (ServerCredentials targetServer, ServerCredentials sourceServer) GetWitsmlUsernamesFromCache(IEssentialHeaders headers)
        {
            ServerCredentials witsmlTargetCredentials = GetWitsmlCredentialsCookieCache(headers, EssentialHeaders.WitsmlTargetServer).Result;
            ServerCredentials witsmlSourceCredentials = GetWitsmlCredentialsCookieCache(headers, EssentialHeaders.WitsmlSourceServer).Result;
            return (witsmlTargetCredentials, witsmlSourceCredentials);
        }
    }
}
