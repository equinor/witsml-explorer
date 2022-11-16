using System;

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

            _credentialsCache.SetItem($"{clientId}@{url}{_random.Next(1000)}.com", $"DUMMY_VALUE{_random.Next(1000)}", 1.0);
            _credentialsCache.SetItem($"{clientId}@{url}{_random.Next(1000)}.com", $"DUMMY_VALUE{_random.Next(1000)}", 1.0);
            _credentialsCache.SetItem($"{Guid.NewGuid()}@{url}{_random.Next(1000)}.com", $"DUMMY_VALUE{_random.Next(1000)}", 1.0);

            long before = _credentialsCache.Count();
            _credentialsCache.RemoveAllClientCredentials(clientId);
            long after = _credentialsCache.Count();
            Assert.Equal(3, before);
            Assert.Equal(1, after);
        }
    }
}
