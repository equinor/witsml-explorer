using System;
using System.Collections.Generic;
using System.Runtime.Caching;

using Microsoft.Extensions.Logging;
namespace WitsmlExplorer.Api.Services
{

    public interface ICredentialsCache
    {
        void SetItem(string cacheId, string encryptedCredentials, double ttl);
        public string GetItem(string cacheId);
        public long Count();
        public void Clear();
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

        public void SetItem(string cacheId, string encryptedCredentials, double ttl)
        {
            CacheItemPolicy cacheItemPolicy = new() { SlidingExpiration = TimeSpan.FromHours(ttl) };
            _cache.Set(cacheId, encryptedCredentials, cacheItemPolicy);
        }

        public string GetItem(string cacheId)
        {
            return _cache.Get(cacheId) as string;
        }
        public long Count()
        {
            return _cache.GetCount();
        }
        public void Clear()
        {
            ((MemoryCache)_cache).Trim(100);

        }

        public void RemoveAllClientCredentials(string clientId)
        {
            foreach (KeyValuePair<string, object> item in _cache)
            {
                if (item.Key.StartsWith(clientId))
                {
                    _cache.Remove(item.Key);
                }
            }
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
