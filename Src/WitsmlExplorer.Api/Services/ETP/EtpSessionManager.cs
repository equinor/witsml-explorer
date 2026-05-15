using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

using Witsml.ETP;

namespace WitsmlExplorer.Api.Services.ETP;

public class EtpSessionManager : IEtpSessionManager, IAsyncDisposable
{
    private readonly ConcurrentDictionary<SessionKey, IEtpClient> _sessions = new();
    private readonly SessionManagerOptions _options;
    private readonly ILogger<EtpSessionManager> _logger;
    private readonly Func<EtpSessionOptions, CancellationToken, Task<IEtpClient>> _clientFactory;
    public int SessionCount => _sessions.Count;

    public EtpSessionManager(
        IOptions<SessionManagerOptions> options,
        ILogger<EtpSessionManager> logger,
        Func<EtpSessionOptions, CancellationToken, Task<IEtpClient>> clientFactory = null)
    {
        _options = options.Value;
        _logger = logger;
        _clientFactory = clientFactory ?? DefaultClientFactoryAsync;
    }

    private static async Task<IEtpClient> DefaultClientFactoryAsync(EtpSessionOptions sessionOptions, CancellationToken cancellationToken)
    {
        return await EtpClient.ConnectAsync(sessionOptions, cancellationToken: cancellationToken);
    }

    public async Task<IEtpClient> GetOrCreateSessionAsync(SessionKey sessionKey, SessionOptions options, CancellationToken cancellationToken)
    {
        ValidateSessionOptions(sessionKey, options);

        if (_sessions.TryGetValue(sessionKey, out var existingClient))
        {
            _logger.LogInformation("Reusing existing ETP session for server {ServerUri}", sessionKey.ServerUri);
            return existingClient;
        }

        var etpSessionOptions = new EtpSessionOptions(
            options.ServerUri,
            _options.AppName,
            _options.AppVersion,
            new EtpBasicAuthCredentials(options.Username, options.Password),
            new List<RequestedProtocol> { RequestedProtocol.Discovery, RequestedProtocol.Store }
        );

        IEtpClient client;

        try
        {
            _logger.LogInformation("Creating new ETP session for server {ServerUri}", sessionKey.ServerUri);
            client = await _clientFactory(etpSessionOptions, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create ETP session for server {ServerUri}", sessionKey.ServerUri);
            throw;
        }

        if (!_sessions.TryAdd(sessionKey, client))
        {
            await client.DisposeAsync(); // Dispose the newly created client if we failed to add it to the dictionary
            if (_sessions.TryGetValue(sessionKey, out var concurrentClient)) // Try to get the existing client again in case it was just added by another thread
            {
                return concurrentClient;
            }
            throw new InvalidOperationException($"Failed to add ETP session for server {sessionKey.ServerUri}");
        }

        return client;
    }

    private static void ValidateSessionOptions(SessionKey sessionKey, SessionOptions options)
    {
        if (string.IsNullOrWhiteSpace(sessionKey.Username) || string.IsNullOrWhiteSpace(options?.Username))
        {
            throw new ArgumentException("ETP session username must be provided.");
        }

        if (string.IsNullOrWhiteSpace(options?.Password))
        {
            throw new ArgumentException("ETP session password must be provided.");
        }

        if (sessionKey.ServerUri == null || options?.ServerUri == null)
        {
            throw new ArgumentException("ETP session server URI must be provided.");
        }

        if (string.IsNullOrWhiteSpace(sessionKey.UserId))
        {
            throw new ArgumentException("ETP session user ID must be provided.");
        }

        if (sessionKey.ServerUri != options?.ServerUri)
        {
            throw new ArgumentException("ETP session key and options must target the same server URI.");
        }

        if (!string.Equals(sessionKey.Username, options?.Username, StringComparison.Ordinal))
        {
            throw new ArgumentException("ETP session key and options must use the same username.");
        }
    }

    public bool TryGetSession(SessionKey sessionKey, out IEtpClient session)
    {
        session = null;
        if (_sessions.TryGetValue(sessionKey, out var client))
        {
            session = client;
            return true;
        }

        return false;
    }

    public async Task<bool> RemoveSessionAsync(SessionKey sessionKey, string reason)
    {
        if (_sessions.TryRemove(sessionKey, out var client))
        {
            try
            {
                await client.DisposeAsync();
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error disposing ETP session for server {ServerUri}", sessionKey.ServerUri);
            }

            _logger.LogInformation("Removed ETP session for server {ServerUri} (reason: {Reason})", sessionKey.ServerUri, reason);
            return true;
        }

        return false;
    }

    public async Task CleanupExpiredSessionsAsync()
    {
        foreach (var kvp in _sessions)
        {
            if (!kvp.Value.IsSessionOpen || kvp.Value.IdleTime > _options.IdleTimeout)
            {
                await RemoveSessionAsync(kvp.Key, "Idle timeout");
            }
        }
    }

    public async ValueTask DisposeAsync()
    {
        var keys = _sessions.Keys.ToList();
        foreach (var key in keys)
        {
            await RemoveSessionAsync(key, "Application shutdown");
        }
    }
}

