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
using Witsml.ETP;
using Witsml.Extensions;

using WitsmlExplorer.Api.Configuration;
using WitsmlExplorer.Api.Extensions;
using WitsmlExplorer.Api.HttpHandlers;
using WitsmlExplorer.Api.Middleware;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Repositories;

namespace WitsmlExplorer.Api.Services
{
    /// <summary>
    /// Manages credential verification and caching for WITSML server connections supporting both SOAP and ETP protocols.
    /// 
    /// Credentials are cached primarily by SOAP server URL. When ETP protocol is required, the service looks up
    /// the SOAP URL in the server database to retrieve the corresponding ETP endpoint URL, then converts the
    /// cached SOAP credentials for use with ETP authentication.
    /// </summary>
    // ReSharper disable once UnusedMember.Global
    public class CredentialsService : ICredentialsService
    {
        private readonly ITimeLimitedDataProtector _dataProtector;
        private readonly ILogger<CredentialsService> _logger;
        private readonly WitsmlClientCapabilities _clientCapabilities;
        private readonly IWitsmlSystemCredentials _witsmlServerCredentials;
        private readonly IDocumentRepository<Server, Guid> _witsmlServerRepository;
        private readonly ICredentialsCache _credentialsCache;
        private static readonly string SUBJECT = "sub";
        private readonly bool _useOAuth2;
        private readonly bool _isDesktopApp;
        private readonly bool _enableHttp;

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
            _clientCapabilities = clientCapabilities?.Value ?? throw new ArgumentException("Missing WitsmlClientCapabilities");
            _witsmlServerCredentials = witsmlServerCredentials ?? throw new ArgumentException("Missing WitsmlServerCredentials");
            _witsmlServerRepository = witsmlServerRepository ?? throw new ArgumentException("Missing WitsmlServerRepository");
            _credentialsCache = credentialsCache ?? throw new ArgumentException("CredentialsService missing");
            _useOAuth2 = StringHelpers.ToBoolean(configuration[ConfigConstants.OAuth2Enabled]);
            _isDesktopApp = StringHelpers.ToBoolean(configuration[ConfigConstants.IsDesktopApp]);
            _enableHttp = StringHelpers.ToBoolean(configuration[ConfigConstants.EnableHttp]);
        }

        public async Task VerifySoapCredentials(ServerCredentials soapCredentials)
        {
            var witsmlClient = new WitsmlClient(options =>
            {
                options.Hostname = soapCredentials.Host.ToString();
                options.Credentials = new WitsmlCredentials(soapCredentials.UserId, soapCredentials.Password);
                options.ClientCapabilities = _clientCapabilities;
                options.EnableHttp = _enableHttp;
            });
            await witsmlClient.TestConnectionAsync();
        }

        public async Task VerifyEtpCredentials(ServerCredentials etpCredentials)
        {
            if (etpCredentials?.Host == null)
            {
                throw new ArgumentException("ETP host URL is required for ETP credential verification");
            }

            var sessionOptions = new EtpSessionOptions(
                Endpoint: etpCredentials.Host,
                AppName: "Witsml Explorer",
                AppVersion: "1.0",
                BasicAuth: new EtpBasicAuthCredentials(etpCredentials.UserId, etpCredentials.Password),
                RequestedProtocols: null
            );

            await using var etpClient = await EtpClient.ConnectAsync(sessionOptions);
            await etpClient.CloseSessionAsync();
        }

        public async Task<bool> VerifyAndCacheCredentials(IEssentialHeaders eh, bool keep, HttpContext httpContext)
        {
            ServerCredentials soapCredentials = HttpRequestExtensions.ParseServerHttpHeader(eh.WitsmlAuth, Decrypt);
            if (soapCredentials.IsNullOrEmpty())
            {
                return false;
            }

            string cacheId = GetCacheId(eh);
            if (!_useOAuth2 && (string.IsNullOrEmpty(cacheId) || _credentialsCache.GetItem(cacheId) == null))
            {
                cacheId = httpContext.CreateWitsmlExplorerCookie(_isDesktopApp);
            }

            if (eh.WitsmlProtocol == WitsmlProtocol.Etp)
            {
                ServerCredentials etpCredentials = await GetEtpCredentialsFromSoapCredentials(soapCredentials);
                await VerifyEtpCredentials(etpCredentials);
            }
            else
            {
                await VerifySoapCredentials(soapCredentials);
            }

            double ttl = keep ? 24.0 : 1.0; // hours
            CacheCredentials(cacheId, soapCredentials, ttl);
            return true;
        }

        private async Task<bool> UserHasRoleForHost(string[] roles, Uri soapServerUrl)
        {
            ICollection<Server> allServers = await _witsmlServerRepository.GetDocumentsAsync();
            bool validRole = allServers.Where(n => n.Url.EqualsIgnoreCase(soapServerUrl)).Any(n => n.Roles != null && n.Roles.Intersect(roles).Any());
            return validRole;
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

        public void CacheCredentials(string cacheId, ServerCredentials soapCredentials, double ttl, Func<string, string> delEncrypt = null)
        {
            delEncrypt ??= Encrypt;
            string encryptedPassword = delEncrypt(soapCredentials.Password);
            _credentialsCache.SetItem(cacheId, soapCredentials.Host, encryptedPassword, ttl, soapCredentials.UserId);
        }

        private async Task<List<ServerCredentials>> GetSystemCredentialsByToken(string token, Uri soapServerUrl)
        {
            List<ServerCredentials> results = new List<ServerCredentials>();
            JwtSecurityTokenHandler handler = new();
            JwtSecurityToken jwt = handler.ReadJwtToken(token);
            string[] userRoles = jwt.Claims.Where(n => n.Type == "roles").Select(n => n.Value).ToArray();
            _logger.LogDebug("User roles in JWT: {roles}", string.Join(",", userRoles));
            if (await UserHasRoleForHost(userRoles, soapServerUrl))
            {
                ICollection<Server> allServers = await _witsmlServerRepository.GetDocumentsAsync();
                List<string> credentialIds = allServers
                    .Where(n => n.Url.EqualsIgnoreCase(soapServerUrl) && !n.CredentialIds.IsNullOrEmpty())
                    ?.SelectMany(n => n.CredentialIds)
                    ?.ToList()
                    ?? new List<string>();
                _logger.LogDebug("Matching on {credentialIdOrHost} for server {server}", credentialIds.Count == 0 ? "host" : $"credentialIds {string.Join(", ", credentialIds)}", SanitizeForLog(soapServerUrl));
                var matchingCredentials = credentialIds.IsNullOrEmpty()
                    ? _witsmlServerCredentials.WitsmlCreds.Where(n => n.Host.EqualsIgnoreCase(soapServerUrl))
                    : _witsmlServerCredentials.WitsmlCreds.Where(n => credentialIds.Contains(n.CredentialId, StringComparer.InvariantCultureIgnoreCase));

                foreach (var credential in matchingCredentials)
                {
                    if (!credential.IsNullOrEmpty())
                    {
                        CacheCredentials(GetClaimFromToken(token, SUBJECT), credential, 1.0);
                        results.Add(credential);
                    }
                }
            }
            return results;
        }

        public string GetClaimFromToken(string token, string claim)
        {
            JwtSecurityTokenHandler handler = new();
            JwtSecurityToken jwt = handler.ReadJwtToken(token);
            return jwt.Claims.Where(n => n.Type == claim).Select(n => n.Value).FirstOrDefault();
        }

        public void VerifyUserIsLoggedIn(IEssentialHeaders eh, ServerType serverType)
        {
            string soapServer = serverType == ServerType.Target ? eh.TargetServer : eh.SourceServer;
            string username = serverType == ServerType.Target ? eh.TargetUsername : eh.SourceUsername;
            ServerCredentials creds = GetSoapCredentials(eh, soapServer, username);
            if (creds == null || creds.IsNullOrEmpty())
            {
                string serverTypeName = serverType == ServerType.Target ? "target" : "source";
                throw new WitsmlClientProviderException($"Missing {serverTypeName} server credentials", (int)HttpStatusCode.Unauthorized, serverType);
            }
        }

        public async Task<string[]> GetLoggedInUsernames(IEssentialHeaders eh, Uri soapServerUrl)
        {
            Dictionary<string, string> credentials = _credentialsCache.GetItem(GetCacheId(eh), soapServerUrl);
            List<string> usernames = credentials == null ? new() : credentials.Keys.ToList();
            if (_useOAuth2)
            {
                List<ServerCredentials> systemCredentials = await GetSystemCredentialsByToken(eh.GetBearerToken(), soapServerUrl);
                foreach (var systemCredential in systemCredentials)
                {
                    if (!systemCredential.IsNullOrEmpty() && !usernames.Contains(systemCredential.UserId))
                    {
                        usernames.Add(systemCredential.UserId);
                    }
                }
            }
            _logger.LogDebug("Logged in usernames for server {server}: {usernames}", soapServerUrl, string.Join(",", usernames));
            return usernames.ToArray();
        }

        private ServerCredentials GetCredentialsFromCache(IEssentialHeaders eh, string soapServerUrl, string username, Func<string, string> delDecrypt = null)
        {
            delDecrypt ??= Decrypt;
            Dictionary<string, string> credentials = _credentialsCache.GetItem(GetCacheId(eh), new Uri(soapServerUrl));
            if (credentials == null || !credentials.ContainsKey(username))
            {
                return null;
            }
            string password = delDecrypt(credentials[username]);

            return new ServerCredentials()
            {
                Host = new Uri(soapServerUrl),
                UserId = username,
                Password = password
            };
        }

        public ServerCredentials GetSoapCredentials(IEssentialHeaders eh, string soapServer, string username)
        {
            ServerCredentials creds = GetCredentialsFromCache(eh, soapServer, username);
            if (creds == null && _useOAuth2)
            {
                List<ServerCredentials> credsList = GetSystemCredentialsByToken(eh.GetBearerToken(), new Uri(soapServer)).Result;
                creds = credsList.FirstOrDefault(c => string.Equals(c.UserId, username, StringComparison.Ordinal));
                if (creds == null || creds.IsNullOrEmpty())
                {
                    return null;
                }
            }
            return creds;
        }

        public async Task<ServerCredentials> GetEtpCredentials(IEssentialHeaders eh, string soapServer, string username)
        {
            ServerCredentials soapCredentials = GetSoapCredentials(eh, soapServer, username);
            ServerCredentials etpCredentials = await GetEtpCredentialsFromSoapCredentials(soapCredentials);
            return etpCredentials;
        }

        public string GetCacheId(IEssentialHeaders eh)
        {
            return _useOAuth2 ? GetClaimFromToken(eh.GetBearerToken(), SUBJECT) : eh.GetCookieValue();
        }

        private async Task<ServerCredentials> GetEtpCredentialsFromSoapCredentials(ServerCredentials soapCredentials)
        {
            if (soapCredentials == null || soapCredentials.Host == null)
            {
                return null;
            }

            ICollection<Server> allServers = await _witsmlServerRepository.GetDocumentsAsync();
            Server matchingServer = allServers.FirstOrDefault(s => s.Url.EqualsIgnoreCase(soapCredentials.Host));

            if (matchingServer?.EtpUrl == null)
            {
                return null;
            }

            return new ServerCredentials
            {
                Host = matchingServer.EtpUrl,
                UserId = soapCredentials.UserId,
                Password = soapCredentials.Password,
                CredentialId = soapCredentials.CredentialId
            };
        }

        /// <summary>
        /// Sanitizes user provided Uri for logging to avoid log-forging attacks.
        /// Removes carriage returns and newlines.
        /// </summary>
        private static string SanitizeForLog(Uri uri)
        {
            if (uri == null) return string.Empty;
            // Remove \r and \n to prevent log forging
            return uri.ToString().Replace("\r", "").Replace("\n", "");
        }
    }
}
