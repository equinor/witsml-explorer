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
        private readonly IWitsmlServerCredentials _witsmlServerCredentials;
        private readonly IDocumentRepository<Server, Guid> _witsmlServerRepository;
        private const string AuthorizationHeader = "Authorization";

        public CredentialsService(
            IDataProtectionProvider dataProtectionProvider,
            IHttpContextAccessor httpContextAccessor,
            IOptions<WitsmlClientCapabilities> clientCapabilities,
            IWitsmlServerCredentials witsmlServerCredentials,
            IDocumentRepository<Server, Guid> witsmlServerRepository,
            ILogger<CredentialsService> logger)
        {
            _dataProtector = dataProtectionProvider.CreateProtector("WitsmlServerPassword").ToTimeLimitedDataProtector();
            _httpContextAccessor = httpContextAccessor ?? throw new ArgumentException("Missing IHttpContextAccessor");
            _logger = logger ?? throw new ArgumentException("Missing ILogger");
            _clientCapabilities = clientCapabilities.Value;
            _witsmlServerCredentials = witsmlServerCredentials;
            _witsmlServerRepository = witsmlServerRepository ?? throw new ArgumentException("Missing WitsmlServerRepository");
        }

        public async Task<string> Authorize(Uri serverUrl)
        {
            if (_httpContextAccessor.HttpContext == null)
            {
                return "";
            }

            IHeaderDictionary headers = _httpContextAccessor.HttpContext.Request.Headers;
            string base64EncodedCredentials = headers[AuthorizationHeader].ToString()["Basic ".Length..].Trim();
            ICredentials credentials = new BasicCredentials(base64EncodedCredentials);

            await VerifyCredentials(serverUrl, credentials);

            string protectedPayload = _dataProtector.Protect(credentials.Password, TimeSpan.FromDays(1));

            return protectedPayload;
        }

        public string Decrypt(ICredentials credentials)
        {
            return _dataProtector.Unprotect(credentials.Password);
        }

        public bool VerifyIsEncrypted(ICredentials credentials)
        {
            try
            {
                Decrypt(credentials);
                return true;
            }
            catch
            {
                return false;
            }
        }

        private async Task VerifyCredentials(Uri serverUrl, ICredentials credentials)
        {
            WitsmlClient witsmlClient = new(serverUrl.ToString(), credentials.Username, credentials.Password, _clientCapabilities);
            await witsmlClient.TestConnectionAsync();
        }

        public async Task<bool> AuthorizeWithToken(HttpRequest httpRequest)
        {
            try
            {
                IHeaderDictionary headers = httpRequest.Headers;
                List<ICredentials> credentialsList = await ExtractCredentialsFromHeader(headers);
                StringValues server = headers["Witsml-ServerUrl"];
                BasicCredentials credentials = new(credentialsList[0].Username, Decrypt(credentialsList[0]));
                await VerifyCredentials(new Uri(server), credentials);
            }
            catch (Exception ex)
            {
                _logger.LogError("Failed authorization with token: {message}", ex.Message);
                return false;
            }
            return true;
        }

        private async Task<bool> HasRoleAccessToHost(string[] roles, string host)
        {
            bool systemCredsExists = _witsmlServerCredentials.WitsmlCreds.Any(n => n.Host == host);
            IEnumerable<Server> allServers = await _witsmlServerRepository.GetDocumentsAsync();
            IEnumerable<Server> hostServer = allServers.Where(n => n.Url.ToString() == host);
            bool validRole = hostServer.Any(n => roles.Contains(n.Role));
            return validRole;
        }

        public async Task<List<ICredentials>> ExtractCredentialsFromHeader(IHeaderDictionary headers)
        {
            List<ICredentials> credentials = new();
            string scheme = headers["Authorization"].ToString().Split()[0];
            string base64Data = headers["Authorization"].ToString().Split()[1];
            if (scheme == "Basic")
            {
                string credentialString = Encoding.UTF8.GetString(Convert.FromBase64String(base64Data));
                string[] usernamesAndPasswords = credentialString.Split(':');
                credentials.Add(new BasicCredentials(usernamesAndPasswords[0], usernamesAndPasswords[1]));
                if (usernamesAndPasswords.Length == 4)
                {
                    credentials.Add(new BasicCredentials(usernamesAndPasswords[2], usernamesAndPasswords[3]));
                }
            }
            else if (scheme == "Bearer")
            {
                string server = headers["Witsml-ServerUrl"].ToString();
                JwtSecurityTokenHandler handler = new();
                JwtSecurityToken jwt = handler.ReadJwtToken(base64Data);
                string[] roles = jwt.Claims.Where(n => n.Type == "roles").Select(n => n.Value).ToArray();
                _logger.LogInformation("{roles}", string.Join(",", roles));
                if (await HasRoleAccessToHost(roles, server))
                {
                    ServerCredentials creds = _witsmlServerCredentials.WitsmlCreds.Single(n => n.Host == server);
                    credentials.Add(new BasicCredentials(creds.UserId, creds.Password));
                }
            }
            return credentials;
        }

        public string Decrypt(BasicCredentials credentials)
        {
            throw new NotImplementedException();
        }

        public bool VerifyIsEncrypted(BasicCredentials credentials)
        {
            throw new NotImplementedException();
        }


    }

    public class BasicCredentials : ICredentials
    {
        public string Username { get; }
        public string Password { get; }

        public BasicCredentials(string base64EncodedString)
        {
            string credentialString = Encoding.UTF8.GetString(Convert.FromBase64String(base64EncodedString));
            string[] credentials = credentialString.Split(new[] { ':' }, 2);
            Username = credentials[0];
            Password = credentials[1];
        }

        public BasicCredentials(string username, string password)
        {
            Username = username;
            Password = password;
        }
    }
}
