using System;
using System.Collections.Generic;
using System.Runtime.Caching;

using Microsoft.Extensions.Logging;
namespace WitsmlExplorer.Api.Services
{

    public interface ICredentialsCache
    {
        void Set(string cacheId, string encryptedCredentials, CacheItemPolicy policy);
        public string Get(string cacheId);
        public long Count();
        public void RefreshSession(string cacheId, string encryptedCredentials);
        public void RemoveAllClientCredentials(string clientId);
    }

    public class CredentialsCache : ICredentialsCache
    {
        private readonly ObjectCache _cache = MemoryCache.Default;
        private readonly ILogger<CredentialsCache> _logger;

        public CredentialsCache(ILogger<CredentialsCache> logger)
        {
            _logger = logger;
        }

        public void Set(string cacheId, string encryptedCredentials, CacheItemPolicy policy)
        {
            _cache.Set(cacheId, encryptedCredentials, policy);
        }

        public string Get(string cacheId)
        {
            return _cache.Get(cacheId) as string;
        }
        public long Count()
        {
            return _cache.GetCount();
        }

        public void RefreshSession(string cacheId, string encryptedCredentials)
        {
            Set(cacheId, encryptedCredentials, new CacheItemPolicy() { AbsoluteExpiration = DateTimeOffset.Now.AddHours(1.0) });
        }

        public void RemoveAllClientCredentials(string clientId)
        {
            _logger.LogInformation("{count} items in cache before removing client: {client}", _cache.GetCount(), clientId);
            foreach (KeyValuePair<string, object> item in _cache)
            {
                if (item.Key.StartsWith(clientId))
                {
                    _cache.Remove(item.Key);
                }
            }
            _logger.LogInformation("{count} items in cache after", _cache.GetCount());
        }

        public void LogCache()
        {
            foreach (KeyValuePair<string, object> item in _cache)
            {
                _logger.LogInformation("\nCACHE: {Key}: {Value}", item.Key, item.Value);
            }
        }
    }
}
