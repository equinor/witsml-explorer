using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

using Witsml;
using Witsml.Data;
using Witsml.Extensions;

using WitsmlExplorer.Api.Configuration;
using WitsmlExplorer.Api.Extensions;
using WitsmlExplorer.Api.HttpHandlers;
using WitsmlExplorer.Api.Middleware;
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
        private readonly Task<ICollection<Server>> _allServers;
        private static readonly string SUBJECT = "sub";
        private readonly bool _useOAuth2;

        public CredentialsService(
            IDataProtectionProvider dataProtectionProvider,
            IOptions<WitsmlClientCapabilities> clientCapabilities,
            IWitsmlSystemCredentials witsmlServerCredentials,
            IDocumentRepository<Server, Guid> witsmlServerRepository,
            ICredentialsCache credentialsCache,
            ILogger<CredentialsService> logger,
            IConfiguration configuration)
        {
            _dataProtector = dataProtectionProvider.CreateProtector("WitsmlServerPassword").ToTimeLimitedDataProtector();
            _logger = logger ?? throw new ArgumentException("Missing ILogger");
            _clientCapabilities = clientCapabilities.Value ?? throw new ArgumentException("Missing WitsmlClientCapabilities");
            _witsmlServerCredentials = witsmlServerCredentials ?? throw new ArgumentException("Missing WitsmlServerCredentials");
            _witsmlServerRepository = witsmlServerRepository ?? throw new ArgumentException("Missing WitsmlServerRepository");
            _credentialsCache = credentialsCache ?? throw new ArgumentException("CredentialsService missing");
            _allServers = _witsmlServerRepository.GetDocumentsAsync();
            _useOAuth2 = StringHelpers.ToBoolean(configuration[ConfigConstants.OAuth2Enabled]);
        }

        public async Task<bool> VerifyAndCacheCredentials(IEssentialHeaders eh, bool keep, HttpContext httpContext)
        {
            ServerCredentials creds = HttpRequestExtensions.ParseServerHttpHeader(eh.WitsmlAuth, Decrypt);
            if (creds.IsNullOrEmpty())
            {
                return false;
            }
            string cacheId = GetCacheId(eh);
            if (!_useOAuth2 && (string.IsNullOrEmpty(cacheId) || _credentialsCache.GetItem(cacheId) == null))
            {
                cacheId = httpContext.CreateWitsmlExplorerCookie();
            }

            var witsmlClient = new WitsmlClient(options =>
            {
                options.Hostname = creds.Host.ToString();
                options.Credentials = new WitsmlCredentials(creds.UserId, creds.Password);
                options.ClientCapabilities = _clientCapabilities;
            });
            await witsmlClient.TestConnectionAsync();

            double ttl = keep ? 24.0 : 1.0; // hours
            CacheCredentials(cacheId, creds, ttl);
            return true;
        }

        private async Task<bool> UserHasRoleForHost(string[] roles, Uri host)
        {
            bool result = true;
            ICollection<Server> allServers = await _allServers;

            bool systemCredsExists = _witsmlServerCredentials.WitsmlCreds.Any(n => n.Host.EqualsIgnoreCase(host));
            bool validRole = allServers.Where(n => n.Url.EqualsIgnoreCase(host)).Any(n =>
             n.Roles != null && n.Roles.Intersect(roles).Any()
             );
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

        public void RemoveCachedCredentials(string cacheId)
        {
            _credentialsCache.RemoveAllClientCredentials(cacheId);
        }

        public void RemoveAllCachedCredentials()
        {
            _credentialsCache.Clear();
        }

        public void CacheCredentials(string cacheId, ServerCredentials credentials, double ttl, Func<string, string> delEncrypt = null)
        {
            delEncrypt ??= Encrypt;
            string encryptedPassword = delEncrypt(credentials.Password);
            _credentialsCache.SetItem(cacheId, credentials.Host, encryptedPassword, ttl, credentials.UserId);
        }

        private async Task<ServerCredentials> GetSystemCredentialsByToken(string token, Uri server)
        {
            ServerCredentials result = new();
            JwtSecurityTokenHandler handler = new();
            JwtSecurityToken jwt = handler.ReadJwtToken(token);
            string[] userRoles = jwt.Claims.Where(n => n.Type == "roles").Select(n => n.Value).ToArray();
            _logger.LogDebug("User roles in JWT: {roles}", string.Join(",", userRoles));
            if (await UserHasRoleForHost(userRoles, server))
            {
                result = _witsmlServerCredentials.WitsmlCreds.Single(n => n.Host.EqualsIgnoreCase(server));
                if (!result.IsNullOrEmpty())
                {
                    CacheCredentials(GetClaimFromToken(token, SUBJECT), result, 1.0);
                }
            }
            return result;
        }

        public string GetClaimFromToken(string token, string claim)
        {
            JwtSecurityTokenHandler handler = new();
            JwtSecurityToken jwt = handler.ReadJwtToken(token);
            return jwt.Claims.Where(n => n.Type == claim).Select(n => n.Value).FirstOrDefault();
        }

        public void VerifyUserIsLoggedIn(IEssentialHeaders eh, ServerType serverType)
        {
            string server = serverType == ServerType.Target ? eh.TargetServer : eh.SourceServer;
            string username = serverType == ServerType.Target ? eh.TargetUsername : eh.SourceUsername;
            ServerCredentials creds = GetCredentials(eh, server, username);
            if (creds == null || creds.IsNullOrEmpty())
            {
                string serverTypeName = serverType == ServerType.Target ? "target" : "source";
                throw new WitsmlClientProviderException($"Missing {serverTypeName} server credentials", (int)HttpStatusCode.Unauthorized, serverType);
            }
        }

        public async Task<string[]> GetLoggedInUsernames(IEssentialHeaders eh, Uri serverUrl)
        {
            Dictionary<string, string> credentials = _credentialsCache.GetItem(GetCacheId(eh), serverUrl);
            List<string> usernames = credentials == null ? new() : credentials.Keys.ToList();
            if (_useOAuth2)
            {
                ServerCredentials systemCredentials = await GetSystemCredentialsByToken(eh.GetBearerToken(), serverUrl);
                if (!systemCredentials.IsNullOrEmpty() && !usernames.Contains(systemCredentials.UserId))
                {
                    usernames.Add(systemCredentials.UserId);
                }
            }
            return usernames.ToArray();
        }

        private ServerCredentials GetCredentialsFromCache(IEssentialHeaders eh, string serverUrl, string username, Func<string, string> delDecrypt = null)
        {
            delDecrypt ??= Decrypt;
            Dictionary<string, string> credentials = _credentialsCache.GetItem(GetCacheId(eh), new Uri(serverUrl));
            if (credentials == null || !credentials.ContainsKey(username))
            {
                return null;
            }
            string password = delDecrypt(credentials[username]);

            return new ServerCredentials()
            {
                Host = new Uri(serverUrl),
                UserId = username,
                Password = password
            };
        }

        public ServerCredentials GetCredentials(IEssentialHeaders eh, string server, string username)
        {
            ServerCredentials creds = GetCredentialsFromCache(eh, server, username);
            if (creds == null && _useOAuth2)
            {
                creds = GetSystemCredentialsByToken(eh.GetBearerToken(), new Uri(server)).Result;
                if (creds.IsNullOrEmpty() || !string.Equals(creds.UserId, username, StringComparison.Ordinal))
                {
                    return null;
                }
            }
            return creds;
        }

        public string GetCacheId(IEssentialHeaders eh)
        {
            return _useOAuth2 ? GetClaimFromToken(eh.GetBearerToken(), SUBJECT) : eh.GetCookieValue();
        }
    }
}
