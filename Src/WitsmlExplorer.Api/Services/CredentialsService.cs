using System;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Witsml;

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
        private readonly ITimeLimitedDataProtector dataProtector;
        private readonly IHttpContextAccessor httpContextAccessor;
        private readonly IConfiguration configuration;
        private const string AuthorizationHeader = "Authorization";

        public CredentialsService(IDataProtectionProvider dataProtectionProvider, IHttpContextAccessor httpContextAccessor, IConfiguration configuration)
        {
            dataProtector = dataProtectionProvider.CreateProtector("WitsmlServerPassword").ToTimeLimitedDataProtector();
            this.httpContextAccessor = httpContextAccessor;
            this.configuration = configuration;
        }

        public async Task<string> Authorize(Uri serverUrl)
        {
            var headers = httpContextAccessor.HttpContext.Request.Headers;
            var base64EncodedCredentials = headers[AuthorizationHeader].ToString().Substring("Basic ".Length).Trim();
            var credentials = new Credentials(base64EncodedCredentials);

            await VerifyCredentials(serverUrl, credentials);

            var protectedPayload = dataProtector.Protect(credentials.Password, TimeSpan.FromDays(1));

            return protectedPayload;
        }

        public string Decrypt(Credentials credentials)
        {
            return dataProtector.Unprotect(credentials.Password);
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
            var witsmlClient = new WitsmlClient(serverUrl.ToString(), credentials.Username, credentials.Password,
                StringHelpers.ToBoolean(configuration["LogQueries"]),StringHelpers.ToBoolean(configuration["sslCertAuthN"]));
            await witsmlClient.TestConnectionAsync();
        }
    }

    public class Credentials
    {
        internal string Username { get; }
        internal string Password { get; }

        public Credentials(string base64EncodedString)
        {
            var credentialString = Encoding.UTF8.GetString(Convert.FromBase64String(base64EncodedString));
            var credentials = credentialString.Split(new[] {':'}, 2);
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
