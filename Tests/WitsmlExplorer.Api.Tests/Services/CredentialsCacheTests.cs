using System;
using System.Collections.Generic;

using Microsoft.Extensions.Logging;

using Moq;

using WitsmlExplorer.Api.Services;

using Xunit;
namespace WitsmlExplorer.Api.Tests.Services
{
    [Collection("UsingCache")]
    public class CredentialsCacheTests
    {
        private readonly CredentialsCache _credentialsCache;

        public CredentialsCacheTests()
        {
            Mock<ILogger<CredentialsCache>> logger = new();
            _credentialsCache = new CredentialsCache(logger.Object);
        }

        [Fact]
        public void RemoveAllClientCredentials_OneOfTwo_ReturnOne()
        {
            string cacheId = Guid.NewGuid().ToString();
            string url = "https://somehost";
            string witsmlUsername = "user";

            _credentialsCache.Clear();
            _credentialsCache.SetItem(cacheId, new Uri($"{url}1.com"), "password1", 1.0, witsmlUsername);
            _credentialsCache.SetItem(Guid.NewGuid().ToString(), new Uri($"{url}2.com"), "password2", 1.0, witsmlUsername);

            long before = _credentialsCache.Count();
            _credentialsCache.RemoveAllClientCredentials(cacheId);
            long after = _credentialsCache.Count();
            Assert.Equal(2, before);
            Assert.Equal(1, after);
            _credentialsCache.Clear();
        }

        [Fact]
        public void Clear_SetTwo_ReturnZero()
        {
            string cacheId = Guid.NewGuid().ToString();
            string url = "https://somehost";
            string witsmlUsername = "user";

            _credentialsCache.SetItem(cacheId, new Uri($"{url}1.com"), "password1", 1.0, witsmlUsername);
            _credentialsCache.SetItem(Guid.NewGuid().ToString(), new Uri($"{url}2.com"), "password2", 1.0, witsmlUsername);

            long before = _credentialsCache.Count();
            _credentialsCache.Clear();
            long after = _credentialsCache.Count();
            Assert.Equal(2, before);
            Assert.Equal(0, after);
        }

        [Fact]
        public void SetItem_TwoForSameServer_OneDictionaryTwoValues()
        {
            string cacheId = Guid.NewGuid().ToString();
            Uri url = new("https://somehost.com");

            _credentialsCache.SetItem(cacheId, url, "password1", 1.0, "user1");
            _credentialsCache.SetItem(cacheId, url, "password2", 1.0, "user2");

            Dictionary<string, Dictionary<string, string>> clientDictionary = _credentialsCache.GetItem(cacheId);
            Assert.Single(clientDictionary);
            Dictionary<string, string> serverDictionary = _credentialsCache.GetItem(cacheId, url);
            Assert.Equal(2, serverDictionary.Count);
            _credentialsCache.Clear();
        }

        [Fact]
        public void SetItem_TwoDifferentServers_TwoDictionaries()
        {
            string cacheId = Guid.NewGuid().ToString();
            Uri url = new("https://somehost.com");
            Uri url2 = new("https://somehost2.com");
            string witsmlUsername = "user";

            _credentialsCache.SetItem(cacheId, url, "password1", 1.0, witsmlUsername);
            _credentialsCache.SetItem(cacheId, url2, "password2", 1.0, witsmlUsername);

            Dictionary<string, Dictionary<string, string>> clientDictionary = _credentialsCache.GetItem(cacheId);
            Assert.Equal(2, clientDictionary.Count);
            Dictionary<string, string> server1Dictionary = _credentialsCache.GetItem(cacheId, url);
            Assert.Single(server1Dictionary);
            Dictionary<string, string> server2Dictionary = _credentialsCache.GetItem(cacheId, url2);
            Assert.Single(server2Dictionary);
            _credentialsCache.Clear();
        }

        [Fact]
        public void SetItem_ReplaceExisting_OneDictionaryOneValue()
        {
            string cacheId = Guid.NewGuid().ToString();
            Uri url = new("https://somehost.com");
            string witsmlUsername = "user";
            string replacement = "newpass";

            _credentialsCache.SetItem(cacheId, url, "oldpass", 1.0, witsmlUsername);
            _credentialsCache.SetItem(cacheId, url, replacement, 1.0, witsmlUsername);

            Dictionary<string, Dictionary<string, string>> clientDictionary = _credentialsCache.GetItem(cacheId);
            Assert.Single(clientDictionary);
            Dictionary<string, string> serverDictionary = _credentialsCache.GetItem(cacheId, url);
            Assert.Single(serverDictionary);
            Assert.Equal(replacement, serverDictionary[witsmlUsername]);
            _credentialsCache.Clear();
        }
    }
}
