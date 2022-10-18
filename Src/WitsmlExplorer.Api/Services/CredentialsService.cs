using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Principal;
using System.Threading.Tasks;

using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Primitives;

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
        private readonly ILogger<CredentialsService> _logger;
        private readonly WitsmlClientCapabilities _clientCapabilities;
        private readonly IWitsmlSystemCredentials _witsmlServerCredentials;
        private readonly IDocumentRepository<Server, Guid> _witsmlServerRepository;
        private readonly Task<IEnumerable<Server>> _allServers;

        public CredentialsService(
            IDataProtectionProvider dataProtectionProvider,
            IOptions<WitsmlClientCapabilities> clientCapabilities,
            IWitsmlSystemCredentials witsmlServerCredentials,
            IDocumentRepository<Server, Guid> witsmlServerRepository,
            ILogger<CredentialsService> logger)
        {
            _dataProtector = dataProtectionProvider.CreateProtector("WitsmlServerPassword").ToTimeLimitedDataProtector();
            _logger = logger ?? throw new ArgumentException("Missing ILogger");
            _clientCapabilities = clientCapabilities.Value ?? throw new ArgumentException("Missing WitsmlClientCapabilities");
            _witsmlServerCredentials = witsmlServerCredentials ?? throw new ArgumentException("Missing WitsmlServerCredentials");
            _witsmlServerRepository = witsmlServerRepository ?? throw new ArgumentException("Missing WitsmlServerRepository");
            _allServers = _witsmlServerRepository.GetDocumentsAsync();
        }

        public async Task<string> ProtectBasicAuthorization(string headerValue)
        {
            ServerCredentials credentials = GetBasicCredentialsFromHeaderValue(headerValue);
            await VerifyCredentials(credentials);
            return Encrypt(credentials.Password);
        }

        public async Task<ServerCredentials> GetCredentialsFromHeaderValue(string headerValue, string token)
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
                return null;
            }
        }
        private async Task<ServerCredentials> GetSystemCredentialsWithToken(string token, Uri server)
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
        private static string GetTokenUserPrincipalName(string token)
        {
            if (!token.StartsWith("Bearer")) throw new ArgumentException("Bearer token missing");

            JwtSecurityTokenHandler handler = new();
            JwtSecurityToken jwt = handler.ReadJwtToken(token.Split()[1]);
            return jwt.Claims.Where(n => n.Type == "upn").Select(n => n.Value).FirstOrDefault();
        }

        private ServerCredentials GetBasicCredentialsFromHeaderValue(string headerValue)
        {
            return HttpRequestExtensions.ParseServerHttpHeader(headerValue, Decrypt);
        }

        public bool ValidEncryptedBasicCredentials(string headerValue)
        {
            return GetBasicCredentialsFromHeaderValue(headerValue) != null;
        }

        public (string userPrincipalName, string witsmlUserName) GetUsernamesFromHeaderValues(string authorization, string witsmlTargetServer)
        {
            ServerCredentials witsmlCredentials = GetBasicCredentialsFromHeaderValue(witsmlTargetServer);
            return (GetTokenUserPrincipalName(authorization), witsmlCredentials.UserId);
        }
    }
}
