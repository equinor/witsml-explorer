using System;
using System.Threading.Tasks;

using WitsmlExplorer.Api.Configuration;
using WitsmlExplorer.Api.HttpHandlers;

namespace WitsmlExplorer.Api.Services
{
    public interface ICredentialsService
    {
        public Task VerifyCredentials(ServerCredentials serverCreds);
        public string GetClaimFromToken(IEssentialHeaders headers, string claim);
        public ServerCredentials GetCredentialsFromCache(bool useOauth, IEssentialHeaders headers, string server);
        public void CacheCredentials(string clientId, ServerCredentials credentials, double ttl);
        public void RemoveCachedCredentials(string clientId);
        public Task<ServerCredentials> GetSystemCredentialsByToken(string token, Uri server);
        public Task<ServerCredentials> GetCredentialsFromHeaderValue(string headerValue, string token = null);
        public (ServerCredentials targetServer, ServerCredentials sourceServer) GetWitsmlUsernamesFromCache(IEssentialHeaders headers);
    }
}
