
using System;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

using Moq;

using Witsml.ETP;

using WitsmlExplorer.Api.Configuration;
using WitsmlExplorer.Api.Services.ETP;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Services;

public class EtpSessionManagerTests
{
    private readonly SessionManagerOptions _managerOptions = new() { IdleTimeout = TimeSpan.FromSeconds(1), AppName = "TestApp", AppVersion = "1.0.0" };
    private readonly Mock<IConfiguration> _configuration = new();
    private readonly Mock<ILogger<EtpSessionManager>> _logger = new();

    public EtpSessionManagerTests()
    {
        _configuration.SetupGet(c => c[ConfigConstants.LogQueries]).Returns("false");
    }

    private static SessionKey MakeKey(string userId = "user1", string username = "etpuser", string uri = "wss://etp-server.com") =>
        new(userId, username, new Uri(uri));

    private static SessionOptions MakeOptions(string username = "etpuser", string password = "pw", string uri = "wss://etp-server.com") =>
        new() { Username = username, Password = password, ServerUri = new Uri(uri) };

    private EtpSessionManager CreateManager(Func<EtpSessionOptions, CancellationToken, Task<IEtpClient>> clientFactory = null)
    {
        return new EtpSessionManager(_configuration.Object, Options.Create(_managerOptions), _logger.Object, clientFactory);
    }

    [Fact]
    public async Task GetOrCreateSessionAsync_CreatesNewSession()
    {
        var mockClient = new Mock<IEtpClient>();
        mockClient.SetupGet(c => c.IsSessionOpen).Returns(true);
        var key = MakeKey();
        var options = MakeOptions();
        var manager = CreateManager((sessionOptions, cancellationToken) =>
        {
            return Task.FromResult(mockClient.Object);
        });

        var client = await manager.GetOrCreateSessionAsync(key, options, CancellationToken.None);

        Assert.NotNull(client);
        Assert.Same(mockClient.Object, client);
    }

    [Fact]
    public async Task GetOrCreateSessionAsync_ReusesExistingSession()
    {
        var key = MakeKey();
        var options = MakeOptions();
        var mockClient = new Mock<IEtpClient>();
        mockClient.SetupGet(c => c.IsSessionOpen).Returns(true);
        var factoryCalls = 0;
        var manager = CreateManager((sessionOptions, cancellationToken) =>
        {
            factoryCalls++;
            return Task.FromResult(mockClient.Object);
        });

        var client1 = await manager.GetOrCreateSessionAsync(key, options, CancellationToken.None);
        var client2 = await manager.GetOrCreateSessionAsync(key, options, CancellationToken.None);

        Assert.Same(client1, client2);
        Assert.Equal(1, factoryCalls);
    }

    [Fact]
    public async Task GetOrCreateSessionAsync_CreatesNewSessionForDifferentKey()
    {
        var key1 = MakeKey(userId: "user1");
        var key2 = MakeKey(userId: "user2");
        var options1 = MakeOptions();
        var options2 = MakeOptions();
        var mockClient1 = new Mock<IEtpClient>();
        mockClient1.SetupGet(c => c.IsSessionOpen).Returns(true);
        var mockClient2 = new Mock<IEtpClient>();
        mockClient2.SetupGet(c => c.IsSessionOpen).Returns(true);
        var factoryCalls = 0;
        var manager = CreateManager((sessionOptions, cancellationToken) =>
        {
            factoryCalls++;
            return Task.FromResult(factoryCalls == 1 ? mockClient1.Object : mockClient2.Object);
        });

        var client1 = await manager.GetOrCreateSessionAsync(key1, options1, CancellationToken.None);
        var client2 = await manager.GetOrCreateSessionAsync(key2, options2, CancellationToken.None);

        Assert.NotSame(client1, client2);
        Assert.Equal(2, factoryCalls);
    }

    [Fact]
    public async Task RemoveSessionAsync_RemovesAndDisposes()
    {
        var key = MakeKey();
        var options = MakeOptions();
        var mockClient = new Mock<IEtpClient>();
        mockClient.SetupGet(c => c.IsSessionOpen).Returns(true);
        mockClient.Setup(c => c.DisposeAsync()).Returns(ValueTask.CompletedTask);
        var manager = CreateManager((sessionOptions, cancellationToken) => Task.FromResult(mockClient.Object));

        await manager.GetOrCreateSessionAsync(key, options, CancellationToken.None);
        var removed = await manager.RemoveSessionAsync(key, "test");

        Assert.True(removed);
        mockClient.Verify(c => c.DisposeAsync(), Times.Once);
    }

    [Fact]
    public async Task CleanupExpiredSessionsAsync_RemovesExpired()
    {
        var expiredKey = MakeKey(userId: "user1");
        var activeKey = MakeKey(userId: "user2");
        var expiredOptions = MakeOptions();
        var activeOptions = MakeOptions();

        var expiredClient = new Mock<IEtpClient>();
        expiredClient.SetupGet(c => c.IsSessionOpen).Returns(true);
        expiredClient.SetupGet(c => c.IdleTime).Returns(TimeSpan.FromSeconds(2)); // Exceeds the 1 second limit
        expiredClient.Setup(c => c.DisposeAsync()).Returns(ValueTask.CompletedTask);

        var activeClient = new Mock<IEtpClient>();
        activeClient.SetupGet(c => c.IsSessionOpen).Returns(true);
        activeClient.SetupGet(c => c.IdleTime).Returns(TimeSpan.FromMilliseconds(500)); // Within the 1 second limit
        activeClient.Setup(c => c.DisposeAsync()).Returns(ValueTask.CompletedTask);

        var factoryCalls = 0;
        var manager = CreateManager((sessionOptions, cancellationToken) =>
        {
            factoryCalls++;
            return Task.FromResult(factoryCalls == 1 ? expiredClient.Object : activeClient.Object);
        });

        await manager.GetOrCreateSessionAsync(expiredKey, expiredOptions, CancellationToken.None);
        await manager.GetOrCreateSessionAsync(activeKey, activeOptions, CancellationToken.None);
        await manager.CleanupExpiredSessionsAsync();

        expiredClient.Verify(c => c.DisposeAsync(), Times.Once);
        activeClient.Verify(c => c.DisposeAsync(), Times.Never);
        Assert.False(manager.TryGetSession(expiredKey, out _));
        Assert.True(manager.TryGetSession(activeKey, out _));
    }

    [Fact]
    public async Task GetOrCreateSessionAsync_ThrowsOnMismatchedKeyAndOptions()
    {
        var key = MakeKey(userId: "user1", username: "etpuser", uri: "wss://etp-server.com");
        var options = MakeOptions(username: "otheruser", uri: "wss://etp-server.com");
        var manager = CreateManager();

        await Assert.ThrowsAsync<ArgumentException>(() => manager.GetOrCreateSessionAsync(key, options, CancellationToken.None));
    }
}
