using System.Threading.Tasks;

using WitsmlExplorer.Api.Configuration;

namespace WitsmlExplorer.Api.Services
{
    public interface ICredentialsService
    {
        public Task<string> ProtectBasicAuthorization();
        public Task<ServerCredentials> GetCreds(string serverHeader, string token = null);
        public ServerCredentials GetBasicCredsFromHeader(string serverHeader);
    }
}
