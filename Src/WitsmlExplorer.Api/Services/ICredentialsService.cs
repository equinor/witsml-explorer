using System;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;

using WitsmlExplorer.Api.Configuration;
using WitsmlExplorer.Api.HttpHandlers;
using WitsmlExplorer.Api.Middleware;

namespace WitsmlExplorer.Api.Services
{
    public interface ICredentialsService
    {
        public void RemoveCachedCredentials(string cacheId);
        public void VerifyUserIsLoggedIn(IEssentialHeaders eh, ServerType serverType);
        public Task<string[]> GetLoggedInUsernames(IEssentialHeaders eh, Uri soapServerUrl);
        public string GetClaimFromToken(string token, string claim);
        public Task VerifySoapCredentials(ServerCredentials soapCredentials);
        public Task VerifyEtpCredentials(ServerCredentials etpCredentials);
        public Task<bool> VerifyAndCacheCredentials(IEssentialHeaders eh, bool keep, HttpContext httpContext);
        public ServerCredentials GetSoapCredentials(IEssentialHeaders eh, string soapServer, string username);
        public Task<ServerCredentials> GetEtpCredentials(IEssentialHeaders eh, string etpServer, string username);
        public string GetCacheId(IEssentialHeaders eh);
    }
}
