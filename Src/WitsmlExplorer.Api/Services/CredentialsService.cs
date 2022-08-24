using System;
using System.Text;
using System.Threading.Tasks;

using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;

using Witsml;
using Witsml.Data;

namespace WitsmlExplorer.Api.Services
{
    public interface ICredentialsService
    {
        Task<string> Authorize(Uri serverUrl);
        string Decrypt(Credentials credentials);
        bool VerifyIsEncrypted(Credentials credentials);
    }

    // ReSharper disable once UnusedMember.Global
    public class CredentialsService : ICredentialsService
    {
        private readonly ITimeLimitedDataProtector _dataProtector;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly WitsmlClientCapabilities _clientCapabilities;
        private const string AuthorizationHeader = "Authorization";

        public CredentialsService(
            IDataProtectionProvider dataProtectionProvider,
            IHttpContextAccessor httpContextAccessor,
            IOptions<WitsmlClientCapabilities> clientCapabilities)
        {
            _dataProtector = dataProtectionProvider.CreateProtector("WitsmlServerPassword").ToTimeLimitedDataProtector();
            _httpContextAccessor = httpContextAccessor;
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
