using System;
using System.Runtime.Caching;

using Microsoft.Extensions.Logging;

using Moq;

using WitsmlExplorer.Api.Services;

using Xunit;
namespace WitsmlExplorer.Api.Tests.Services
{
    public class CredentialsCacheTests
    {
        private readonly CredentialsCache _credentialsCache;
        private readonly Random _random = new();

        public CredentialsCacheTests()
        {
            Mock<ILogger<CredentialsCache>> logger = new();
            _credentialsCache = new CredentialsCache(logger.Object);
        }


        [Fact]
        public void RemoveAllClientCredentials_TwoOfThree_ReturnOne()
        {
            string clientId = Guid.NewGuid().ToString();
            string url = "https://somehost";

            CacheItemPolicy cacheItemPolicy = new() { AbsoluteExpiration = DateTimeOffset.Now.AddHours(1) };

            _credentialsCache.Set($"{clientId}@{url}{_random.Next(1000)}.com", $"DUMMY_VALUE{_random.Next(1000)}", cacheItemPolicy);
            _credentialsCache.Set($"{clientId}@{url}{_random.Next(1000)}.com", $"DUMMY_VALUE{_random.Next(1000)}", cacheItemPolicy);
            _credentialsCache.Set($"{Guid.NewGuid()}@{url}{_random.Next(1000)}.com", $"DUMMY_VALUE{_random.Next(1000)}", cacheItemPolicy);
            _credentialsCache.PrintCache($"Before client {clientId} logout ");
            _credentialsCache.RemoveAllClientCredentials(clientId);
            _credentialsCache.PrintCache("After ");
            Assert.Equal(1, _credentialsCache.Count());
        }


    }
}
