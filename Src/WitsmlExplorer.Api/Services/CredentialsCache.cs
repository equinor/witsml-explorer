using Microsoft.Extensions.Logging;

using WitsmlExplorer.Api.Configuration;

namespace WitsmlExplorer.Api.Services
{
    public interface ICredentialsCache
    {
        void CacheCredentials(ServerCredentials credentials);
    }

    public class CredentialsCache : ICredentialsCache
    {
        private readonly ILogger<JobCache> _logger;

        public CredentialsCache(ILogger<JobCache> logger)
        {

            _logger = logger;
        }

        public void CacheCredentials(ServerCredentials credentials)
        {
        }

    }
}
