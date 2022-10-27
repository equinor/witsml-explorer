using System.Threading.Tasks;

using WitsmlExplorer.Api.Configuration;
using WitsmlExplorer.Api.HttpHandlers;

namespace WitsmlExplorer.Api.Services
{
    public interface ICredentialsService
    {
        public Task<string> ProtectBasicAuthorization(string headerValue);
        public Task<ServerCredentials> GetCredentialsCookieFirst(IEssentialHeaders headers, string server);
        public Task<ServerCredentials> GetCredentialsFromHeaderValue(string headerValue, string token = null);
        public bool ValidEncryptedBasicCredentials(string headerValue);
        public (string userPrincipalName, string witsmlUserName) GetUsernamesFromHeaderValues(string authorization, string witsmltargetserver);
    }
}
