using System;
using System.Collections.Generic;
using System.Runtime.Caching;

using Microsoft.Extensions.Logging;
namespace WitsmlExplorer.Api.Services
{

    public interface ICredentialsCache
    {
        void SetItem(string cacheId, Uri serverUrl, string encryptedPassword, double ttl, string username);
        public Dictionary<string, Dictionary<string, string>> GetItem(string cacheId);
        public Dictionary<string, string> GetItem(string cacheId, Uri serverUrl);
        public long Count();
        public void Clear();
        public void RemoveAllClientCredentials(string cacheId);
    }

    public class CredentialsCache : ICredentialsCache
    {
        private readonly ObjectCache _cache = MemoryCache.Default;
        private readonly ILogger<CredentialsCache> _logger;

        public CredentialsCache(ILogger<CredentialsCache> logger)
        {
            _logger = logger;
        }

        public void SetItem(string cacheId, Uri serverUrl, string encryptedPassword, double ttl, string username)
        {
            CacheItemPolicy cacheItemPolicy = new() { SlidingExpiration = TimeSpan.FromHours(ttl) };
            Dictionary<string, Dictionary<string, string>> item = GetItem(cacheId);
            item ??= new Dictionary<string, Dictionary<string, string>>();
            if (!item.ContainsKey(serverUrl.Host))
            {
                item[serverUrl.Host] = new Dictionary<string, string>();
            }
            item[serverUrl.Host].Remove(username);
            item[serverUrl.Host].Add(username, encryptedPassword);
            _cache.Set(cacheId, item, cacheItemPolicy);
        }

        public Dictionary<string, Dictionary<string, string>> GetItem(string cacheId)
        {
            if (cacheId == null)
            {
                return null;
            }
            return _cache.Get(cacheId) as Dictionary<string, Dictionary<string, string>>;
        }

        public Dictionary<string, string> GetItem(string cacheId, Uri serverUrl)
        {
            if (cacheId == null || serverUrl == null)
            {
                return null;
            }
            if (_cache.Get(cacheId) is not Dictionary<string, Dictionary<string, string>> item)
            {
                return null;
            }
            return item.TryGetValue(serverUrl.Host, out Dictionary<string, string> value) ? value : null;
        }

        public long Count()
        {
            return _cache.GetCount();
        }

        public void Clear()
        {
            ((MemoryCache)_cache).Trim(100);
        }

        public void RemoveAllClientCredentials(string cacheId)
        {
            _cache.Remove(cacheId);
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
