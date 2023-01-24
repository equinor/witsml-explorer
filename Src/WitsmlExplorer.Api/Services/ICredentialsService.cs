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
        public Task<string[]> GetLoggedInUsernames(bool useOauth, IEssentialHeaders eh, Uri serverUrl);
        public string GetClaimFromToken(string token, string claim);
        public Task<bool> VerifyAndCacheCredentials(IEssentialHeaders eh, bool useOauth, bool keep);
        public ServerCredentials GetCredentials(bool useOauth, IEssentialHeaders eh, string server, string username);
    }
}
