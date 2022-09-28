using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Primitives;

using Witsml;
using Witsml.Data;

using WitsmlExplorer.Api.Configuration;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Repositories;

namespace WitsmlExplorer.Api.Services
{

    // ReSharper disable once UnusedMember.Global
    public class CredentialsService : ICredentialsService
    {
        private readonly ITimeLimitedDataProtector _dataProtector;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<CredentialsService> _logger;
        private readonly WitsmlClientCapabilities _clientCapabilities;
        private readonly IWitsmlSystemCredentials _witsmlServerCredentials;
        private readonly IDocumentRepository<Server, Guid> _witsmlServerRepository;
        private readonly Task<IEnumerable<Server>> _allServers;
        private const string AuthorizationHeader = "Authorization";

        public CredentialsService(
            IDataProtectionProvider dataProtectionProvider,
            IHttpContextAccessor httpContextAccessor,
            IOptions<WitsmlClientCapabilities> clientCapabilities,
            IWitsmlSystemCredentials witsmlServerCredentials,
            IDocumentRepository<Server, Guid> witsmlServerRepository,
            ILogger<CredentialsService> logger)
        {
            _dataProtector = dataProtectionProvider.CreateProtector("WitsmlServerPassword").ToTimeLimitedDataProtector();
            _httpContextAccessor = httpContextAccessor ?? throw new ArgumentException("Missing IHttpContextAccessor");
            _logger = logger ?? throw new ArgumentException("Missing ILogger");
            _clientCapabilities = clientCapabilities.Value ?? throw new ArgumentException("Missing WitsmlClientCapabilities");
            _witsmlServerCredentials = witsmlServerCredentials ?? throw new ArgumentException("Missing WitsmlServerCredentials");
            _witsmlServerRepository = witsmlServerRepository ?? throw new ArgumentException("Missing WitsmlServerRepository");
            _allServers = _witsmlServerRepository.GetDocumentsAsync();
        }

        public async Task<string> BasicAuthorization(Uri serverUrl)
        {
            if (_httpContextAccessor.HttpContext == null) { return ""; }

            IHeaderDictionary headers = _httpContextAccessor.HttpContext.Request.Headers;
            string base64EncodedCredentials = headers[AuthorizationHeader].ToString()["Basic ".Length..].Trim();
            ServerCredentials credentials = new(serverUrl.AbsoluteUri, new BasicCredentials(base64EncodedCredentials));

            await VerifyCredentials(credentials);

            string protectedPayload = _dataProtector.Protect(credentials.Password, TimeSpan.FromDays(1));

            return protectedPayload;
        }

        public string Decrypt(ServerCredentials credentials)
        {
            return _dataProtector.Unprotect(credentials.Password);
        }


        public string Decrypt(string inputString)
        {

            try
            {
                return _dataProtector.Unprotect(inputString);
            }
            catch
            {
                return null;
            }
        }

        public async Task<bool> AuthorizeWithEncryptedPassword(HttpRequest httpRequest)
        {
            try
            {
                IHeaderDictionary headers = httpRequest.Headers;
                List<ServerCredentials> credentialsList = await GetCredentialsFromHeaders(headers);
                StringValues server = headers["Witsml-ServerUrl"];
                ServerCredentials serverCreds = new(server, credentialsList[0].UserId, Decrypt(credentialsList[0]));
                await VerifyCredentials(serverCreds);
            }
            catch (Exception ex)
            {
                _logger.LogError("Failed authorization with token: {message}", ex.Message);
                return false;
            }
            return true;
        }

        public Task<List<ServerCredentials>> GetCredentialsFromHeaders(IHeaderDictionary headers)
        {
            Task<List<ServerCredentials>> credentials = Task.FromResult(new List<ServerCredentials>());
            string scheme = headers["Authorization"].ToString().Split()[0];
            if (string.IsNullOrEmpty(scheme)) { return credentials; }

            string base64Data = headers["Authorization"].ToString().Split()[1];
            string server = headers["Witsml-ServerUrl"].ToString();
            string sourceServer = headers["Witsml-Source-ServerUrl"].ToString();

            if (scheme == "Basic") { credentials = Task.FromResult(ParseBasicAuthorization(base64Data, sourceServer, server)); }
            else if (scheme == "Bearer") { credentials = ParseBearerAuthorization(base64Data, sourceServer, server); }

            return credentials;
        }

        private async Task VerifyCredentials(ServerCredentials serverCreds)
        {
            WitsmlClient witsmlClient = new(serverCreds.Host, serverCreds.UserId, serverCreds.Password, _clientCapabilities);
            await witsmlClient.TestConnectionAsync();
        }

        private async Task<bool> HasUserRoleForHosts(string[] roles, string[] hosts)
        {
            bool result = true;
            IEnumerable<Server> allServers = await _witsmlServerRepository.GetDocumentsAsync();
            foreach (string host in hosts.Where(h => !string.IsNullOrEmpty(h)))
            {
                bool systemCredsExists = _witsmlServerCredentials.WitsmlCreds.Any(n => n.Host == host);
                IEnumerable<Server> hostServer = allServers.Where(n => n.Url.ToString() == host);
                bool validRole = hostServer.Any(n => roles.Contains(n.Role));
                result &= systemCredsExists & validRole;
            }
            return result;
        }
        private async Task<bool> UserHasRoleForHost(string[] roles, string host)
        {
            bool result = true;
            IEnumerable<Server> allServers = await _allServers;

            bool systemCredsExists = _witsmlServerCredentials.WitsmlCreds.Any(n => n.Host == host);
            IEnumerable<Server> hostServer = allServers.Where(n => n.Url.ToString() == host);
            bool validRole = hostServer.Any(n => roles.Contains(n.Role));
            result &= systemCredsExists & validRole;

            return result;
        }
        private static List<ServerCredentials> ParseBasicAuthorization(string base64Data, string sourceServer, string server)
        {
            List<ServerCredentials> credentials = new();
            string credentialString = Encoding.UTF8.GetString(Convert.FromBase64String(base64Data));
            string[] usernamesAndPasswords = credentialString.Split(':');
            credentials.Add(new ServerCredentials(server, usernamesAndPasswords[0], usernamesAndPasswords[1]));
            if (usernamesAndPasswords.Length == 4 && !string.IsNullOrEmpty(sourceServer))
            {
                credentials.Add(new ServerCredentials(sourceServer, usernamesAndPasswords[2], usernamesAndPasswords[3]));
            }
            return credentials;
        }

        public async Task<List<ServerCredentials>> ParseBearerAuthorization(string token, string sourceServer, string targetServer)
        {
            List<ServerCredentials> credentials = new();
            JwtSecurityTokenHandler handler = new();
            JwtSecurityToken jwt = handler.ReadJwtToken(token);
            string[] roles = jwt.Claims.Where(n => n.Type == "roles").Select(n => n.Value).ToArray();
            _logger.LogDebug("{roles}", string.Join(",", roles));
            if (await HasUserRoleForHosts(roles, new string[] { targetServer, sourceServer }))
            {
                ServerCredentials creds = _witsmlServerCredentials.WitsmlCreds.Single(n => n.Host == targetServer);
                credentials.Add(new ServerCredentials(targetServer, creds.UserId, creds.Password));
            }

            return credentials;
        }

        /// <summary>
        /// 1. Server input has been parsed from HTTP Headers "Witsml-ServerUrl" or "Witsml-Source-ServerUrl" and might contain b64 encoded Basic auth
        /// 2. Token will always be JWT token and should have <code>roles</code>
        /// 3. Prefer attached basic credentials over system credentials fetched from keyvault.
        /// </summary>
        public async Task<ServerCredentials> GetCredsWithToken(string token, string serverHeader)
        {
            ServerCredentials result = GetBasicCreds(serverHeader);
            if (result == null)
            {
                JwtSecurityTokenHandler handler = new();
                JwtSecurityToken jwt = handler.ReadJwtToken(token);
                string[] userRoles = jwt.Claims.Where(n => n.Type == "roles").Select(n => n.Value).ToArray();
                _logger.LogDebug("User roles in JWT: {roles}", string.Join(",", userRoles));
                if (await UserHasRoleForHost(userRoles, serverHeader))
                {
                    return _witsmlServerCredentials.WitsmlCreds.Single(n => n.Host == serverHeader);
                }

            }
            return result;
        }

        public ServerCredentials GetBasicCreds(string serverHeader)
        {
            BasicCredentials basic = new(serverHeader.Split("@")[1]);
            if (serverHeader.Split().Length > 1 && Decrypt(basic?.Password) != null)
            {
                return new ServerCredentials()
                {
                    Host = serverHeader.Split("@")[1],
                    UserId = basic.UserId,
                    Password = Decrypt(basic.Password)
                };
            }
            return null;
        }

        public bool VerifyIsEncrypted(ServerCredentials credentials)
        {
            throw new NotImplementedException();
        }
    }

}
