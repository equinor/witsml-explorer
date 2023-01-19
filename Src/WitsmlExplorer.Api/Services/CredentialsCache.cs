using System;
using System.Collections.Generic;
using System.Runtime.Caching;

using Microsoft.Extensions.Logging;
namespace WitsmlExplorer.Api.Services
{

    public interface ICredentialsCache
    {
        void SetItem(string cacheId, string encryptedPassword, double ttl, string username);
        public Dictionary<string, string> GetItem(string cacheId);
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

        public void SetItem(string cacheId, string encryptedPassword, double ttl, string username)
        {
            CacheItemPolicy cacheItemPolicy = new() { SlidingExpiration = TimeSpan.FromHours(ttl) };
            Dictionary<string, string> item = GetItem(cacheId);
            if (item == null)
            {
                item = new Dictionary<string, string>
                {
                    { username, encryptedPassword }
                };
            }
            else
            {
                item.Remove(username);
                item.Add(username, encryptedPassword);
            }
            _cache.Set(cacheId, item, cacheItemPolicy);
        }

        public Dictionary<string, string> GetItem(string cacheId)
        {
            return _cache.Get(cacheId) as Dictionary<string, string>;
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
