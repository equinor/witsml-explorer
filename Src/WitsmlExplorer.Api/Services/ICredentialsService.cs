using System.Threading.Tasks;

using WitsmlExplorer.Api.Configuration;

namespace WitsmlExplorer.Api.Services
{
    public interface ICredentialsService
    {
        public Task<string> ProtectBasicAuthorization();
        public Task<ServerCredentials> GetCredentials(string headerName, string token = null);
        public Task<ServerCredentials> GetCredentialsFromHeaderValue(string headerValue, string token = null);

        public bool ValidEncryptedBasicCredentials(string headerName);
        public Task<(string username, string witsmlUsername)> GetUsernames();
    }
}
