using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Primitives;

using Witsml;
using Witsml.Data;

namespace WitsmlExplorer.Api.Services
{
    public interface ICredentialsService
    {
        Task<string> Authorize(Uri serverUrl);
        string Decrypt(Credentials credentials);
        bool VerifyIsEncrypted(Credentials credentials);
        Task<bool> AuthorizeWithToken(HttpRequest httpRequest);
    }

    // ReSharper disable once UnusedMember.Global
    public class CredentialsService : ICredentialsService
    {
        private readonly ITimeLimitedDataProtector _dataProtector;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<CredentialsService> _logger;
        private readonly WitsmlClientCapabilities _clientCapabilities;
        private const string AuthorizationHeader = "Authorization";

        public CredentialsService(
            IDataProtectionProvider dataProtectionProvider,
            IHttpContextAccessor httpContextAccessor,
            IOptions<WitsmlClientCapabilities> clientCapabilities,
            ILogger<CredentialsService> logger)
        {
            _dataProtector = dataProtectionProvider.CreateProtector("WitsmlServerPassword").ToTimeLimitedDataProtector();
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
            _clientCapabilities = clientCapabilities.Value;
        }

        public async Task<string> Authorize(Uri serverUrl)
        {
            if (_httpContextAccessor.HttpContext == null)
            {
                return "";
            }

            IHeaderDictionary headers = _httpContextAccessor.HttpContext.Request.Headers;
            string base64EncodedCredentials = headers[AuthorizationHeader].ToString()["Basic ".Length..].Trim();
            Credentials credentials = new(base64EncodedCredentials);

            await VerifyCredentials(serverUrl, credentials);

            string protectedPayload = _dataProtector.Protect(credentials.Password, TimeSpan.FromDays(1));

            return protectedPayload;
        }

        public string Decrypt(Credentials credentials)
        {
            return _dataProtector.Unprotect(credentials.Password);
        }

        public bool VerifyIsEncrypted(Credentials credentials)
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

        private async Task VerifyCredentials(Uri serverUrl, Credentials credentials)
        {
            WitsmlClient witsmlClient = new(serverUrl.ToString(), credentials.Username, credentials.Password, _clientCapabilities);
            await witsmlClient.TestConnectionAsync();
        }

        public async Task<bool> AuthorizeWithToken(HttpRequest httpRequest)
        {
            try
            {
                IHeaderDictionary headers = httpRequest.Headers;
                List<Credentials> credentialsList = ExtractCredentialsFromHeader(headers);
                StringValues server = headers["Witsml-ServerUrl"];
                Credentials credentials = new(credentialsList[0].Username, Decrypt(credentialsList[0]));
                await VerifyCredentials(new Uri(server), credentials);
            }
            catch (Exception ex)
            {
                _logger.LogError("Failed authorization with token: {message}", ex.Message);
                return false;
            }
            return true;
        }

        public static List<Credentials> ExtractCredentialsFromHeader(IHeaderDictionary headers)
        {
            string base64EncodedCredentials = headers["Authorization"].ToString()["Basic ".Length..].Trim();
            string credentialString = Encoding.UTF8.GetString(Convert.FromBase64String(base64EncodedCredentials));
            string[] usernamesAndPasswords = credentialString.Split(':');
            List<Credentials> credentials = new() { new Credentials(usernamesAndPasswords[0], usernamesAndPasswords[1]) };
            if (usernamesAndPasswords.Length == 4)
            {
                credentials.Add(new Credentials(usernamesAndPasswords[2], usernamesAndPasswords[3]));
            }

            return credentials;
        }
    }

    public class Credentials
    {
        internal string Username { get; }
        internal string Password { get; }

        public Credentials(string base64EncodedString)
        {
            string credentialString = Encoding.UTF8.GetString(Convert.FromBase64String(base64EncodedString));
            string[] credentials = credentialString.Split(new[] { ':' }, 2);
            Username = credentials[0];
            Password = credentials[1];
        }

        public Credentials(string username, string password)
        {
            Username = username;
            Password = password;
        }
    }
}
