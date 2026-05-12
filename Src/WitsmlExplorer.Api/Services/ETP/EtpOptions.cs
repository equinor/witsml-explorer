
using System;

namespace WitsmlExplorer.Api.Services.ETP;

/// <summary>
/// Identifies a cached ETP session.
/// <para><see cref="UserId"/>: Uniquely identifies the session owner (the application user or principal). This must be unique per user or actor in the application, regardless of server login.</para>
/// <para><see cref="Username"/>: The username used to authenticate to the ETP server. Multiple users may use the same server username, but <see cref="UserId"/> must still distinguish their sessions.</para>
/// <para><see cref="ServerUri"/>: The endpoint URI of the ETP server for this session.</para>
/// If <see cref="UserId"/> is reused across different session owners, they may be attached to the same cached session.
/// </summary>
public readonly record struct SessionKey(string UserId, string Username, Uri ServerUri);

public sealed record SessionManagerOptions
{
    public TimeSpan IdleTimeout { get; init; } = TimeSpan.FromMinutes(10);
    public string AppName { get; init; } = "Witsml Explorer";
    public string AppVersion { get; init; } = "1.0.0";
}

public sealed record SessionOptions
{
    public string Username { get; init; }
    public string Password { get; init; }
    public Uri ServerUri { get; init; }
}
