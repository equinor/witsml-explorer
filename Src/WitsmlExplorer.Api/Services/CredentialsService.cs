using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

using Witsml;
using Witsml.Data;

using WitsmlExplorer.Api.Configuration;
using WitsmlExplorer.Api.Extensions;
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

        public async Task<string> ProtectBasicAuthorization()
        {
            if (_httpContextAccessor.HttpContext == null) { return ""; }

            ServerCredentials credentials = GetBasicCredsFromHeader(WitsmlClientProvider.WitsmlServerUrlHeader);
            await VerifyCredentials(credentials);
            return Encrypt(credentials.Password);
        }

        /// <summary>
        /// 1. Server input has been parsed from HTTP Headers "Witsml-ServerUrl" or "Witsml-Source-ServerUrl" and might contain b64 encoded Basic auth
        /// 2. Token will always be JWT token and should have <code>roles</code>
        /// 3. Prefer attached basic credentials over system credentials fetched from keyvault.
        /// </summary>
        public async Task<ServerCredentials> GetCreds(string headerName, string token)
        {
            ServerCredentials result = GetBasicCredsFromHeader(headerName);
            if (result.IsCredsNullOrEmpty() && token != null && result.Host != null)
            {
                return await GetCredsWithToken(token, result.Host);
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
            bool validRole = hostServer.Any(n => roles.Contains(n.Role));
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
                return null;
            }
        }
        private async Task<ServerCredentials> GetCredsWithToken(string token, Uri server)
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

        private ServerCredentials GetBasicCredsFromHeader(string headerName)
        {
            return _httpContextAccessor.HttpContext.Request.GetWitsmlServerHttpHeader(headerName, Decrypt);
        }
    }

}
