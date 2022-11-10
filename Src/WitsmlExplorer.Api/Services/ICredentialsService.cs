using System;
using System.Threading.Tasks;

using WitsmlExplorer.Api.Configuration;
using WitsmlExplorer.Api.HttpHandlers;

namespace WitsmlExplorer.Api.Services
{
    public interface ICredentialsService
    {
        public Task<string> ProtectBasicAuthorization(string headerValue);
        public string GetClaimFromToken(IEssentialHeaders headers, string claim);
        public ServerCredentials GetCredentialsFromCache(bool useOauth, IEssentialHeaders headers, string server);

        public Task<ServerCredentials> GetCredentialsCookieFirst(IEssentialHeaders headers, string server);
        public Task<ServerCredentials> GetSystemCredentialsWithToken(string token, Uri server);
        public Task<ServerCredentials> GetCredentialsFromHeaderValue(string headerValue, string token = null);
        public (string userPrincipalName, string witsmlUserName) GetUsernamesFromCacheAndToken(IEssentialHeaders headers, string server);
        public (ServerCredentials targetServer, ServerCredentials sourceServer) GetWitsmlUsernamesFromCache(IEssentialHeaders headers);
    }
}
