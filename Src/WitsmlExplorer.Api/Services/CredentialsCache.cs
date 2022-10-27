using System;
using System.Runtime.Caching;

using Microsoft.Extensions.Logging;
namespace WitsmlExplorer.Api.Services
{

    public interface ICredentialsCache
    {
        void Set(string id, string credentials, CacheItemPolicy policy);
        public string Get(string id);
        public void RefreshSession(string id, string credentials);
    }

    // Good candidate for Redis cache (key,value,ttl)
    public class CredentialsCache : ICredentialsCache
    {
        private readonly ObjectCache _cache = MemoryCache.Default;
        private readonly ILogger<CredentialsCache> _logger;

        public CredentialsCache(ILogger<CredentialsCache> logger)
        {
            _logger = logger;
        }

        public void Set(string id, string credentials, CacheItemPolicy policy)
        {
            _cache.Set(id, credentials, policy);
            LogCache();
        }

        public string Get(string id)
        {
            return _cache.Get(id) as string;
        }
        public void RefreshSession(string id, string credentials)
        {
            Set(id, credentials, new CacheItemPolicy() { AbsoluteExpiration = DateTimeOffset.Now.AddHours(1.0) });
        }

        public void LogCache()
        {
            foreach (System.Collections.Generic.KeyValuePair<string, object> item in _cache)
            {
                _logger.LogDebug("Cache: {Key}: {Value}", item.Key, item.Value);
            }
        }

    }
}
