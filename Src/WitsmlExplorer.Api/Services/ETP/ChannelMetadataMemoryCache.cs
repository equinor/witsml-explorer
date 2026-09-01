using System;
using System.Collections.Generic;
using System.Linq;

using Energistics.Datatypes.ChannelData;

namespace WitsmlExplorer.Api.Services.ETP
{
    public interface IChannelMetadataMemoryCache
    {
        void ResetIfContextChanged(string wellUid, string wellboreUid, string logUid);
        bool TryGet(string channelUri, out ChannelMetadataRecord channelMetadata);
        void Set(ChannelMetadataRecord channelMetadata);
    }

    public class ChannelMetadataMemoryCache : IChannelMetadataMemoryCache
    {
        private static readonly TimeSpan EntryTimeToLive = TimeSpan.FromMinutes(10);
        private const int MaxEntries = 2048;

        private readonly object _syncRoot = new();
        private readonly Dictionary<string, CacheEntry> _entries = new(StringComparer.OrdinalIgnoreCase);
        private string _contextKey;

        public void ResetIfContextChanged(string wellUid, string wellboreUid, string logUid)
        {
            string contextKey = BuildContextKey(wellUid, wellboreUid, logUid);

            lock (_syncRoot)
            {
                if (string.Equals(_contextKey, contextKey, StringComparison.Ordinal))
                {
                    return;
                }

                _entries.Clear();
                _contextKey = contextKey;
            }
        }

        public bool TryGet(string channelUri, out ChannelMetadataRecord channelMetadata)
        {
            channelMetadata = null;
            if (string.IsNullOrWhiteSpace(channelUri))
            {
                return false;
            }

            DateTimeOffset now = DateTimeOffset.UtcNow;

            lock (_syncRoot)
            {
                PurgeExpiredEntries(now);

                if (!_entries.TryGetValue(channelUri, out CacheEntry entry) || entry.ExpiresAt <= now)
                {
                    _entries.Remove(channelUri);
                    return false;
                }

                entry.LastAccessed = now;
                channelMetadata = entry.ChannelMetadata;
                return true;
            }
        }

        public void Set(ChannelMetadataRecord channelMetadata)
        {
            if (channelMetadata == null || string.IsNullOrWhiteSpace(channelMetadata.channelUri))
            {
                return;
            }

            DateTimeOffset now = DateTimeOffset.UtcNow;

            lock (_syncRoot)
            {
                PurgeExpiredEntries(now);

                _entries[channelMetadata.channelUri] = new CacheEntry
                {
                    ChannelMetadata = channelMetadata,
                    ExpiresAt = now + EntryTimeToLive,
                    LastAccessed = now
                };

                if (_entries.Count > MaxEntries)
                {
                    RemoveLeastRecentlyAccessed(_entries.Count - MaxEntries);
                }
            }
        }

        private static string BuildContextKey(string wellUid, string wellboreUid, string logUid)
        {
            return $"{wellUid ?? string.Empty}|{wellboreUid ?? string.Empty}|{logUid ?? string.Empty}";
        }

        private void PurgeExpiredEntries(DateTimeOffset now)
        {
            if (_entries.Count == 0)
            {
                return;
            }

            List<string> expiredKeys = null;
            foreach (KeyValuePair<string, CacheEntry> kvp in _entries)
            {
                if (kvp.Value.ExpiresAt <= now)
                {
                    expiredKeys ??= new List<string>();
                    expiredKeys.Add(kvp.Key);
                }
            }

            if (expiredKeys == null)
            {
                return;
            }

            foreach (string key in expiredKeys)
            {
                _entries.Remove(key);
            }
        }

        private void RemoveLeastRecentlyAccessed(int removeCount)
        {
            if (removeCount <= 0)
            {
                return;
            }

            foreach (string key in _entries
                         .OrderBy(kvp => kvp.Value.LastAccessed)
                         .Take(removeCount)
                         .Select(kvp => kvp.Key)
                         .ToList())
            {
                _entries.Remove(key);
            }
        }

        private sealed class CacheEntry
        {
            public ChannelMetadataRecord ChannelMetadata { get; set; }
            public DateTimeOffset ExpiresAt { get; set; }
            public DateTimeOffset LastAccessed { get; set; }
        }
    }
}
