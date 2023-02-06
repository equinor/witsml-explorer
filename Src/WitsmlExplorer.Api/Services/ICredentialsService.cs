using System;
using System.Threading.Tasks;

using WitsmlExplorer.Api.Configuration;
using WitsmlExplorer.Api.HttpHandlers;
using WitsmlExplorer.Api.Middleware;

namespace WitsmlExplorer.Api.Services
{
    public interface ICredentialsService
    {
        public void RemoveCachedCredentials(string clientId);
        public void VerifyUserIsLoggedIn(IEssentialHeaders eh, ServerType serverType);
        public Task<string[]> GetLoggedInUsernames(IEssentialHeaders eh, Uri serverUrl);
        public string GetClaimFromToken(string token, string claim);
        public Task<bool> VerifyAndCacheCredentials(IEssentialHeaders eh, bool keep, string clientId);
        public ServerCredentials GetCredentials(IEssentialHeaders eh, string server, string username);
        public string GetClientId(IEssentialHeaders eh);
    }
}
