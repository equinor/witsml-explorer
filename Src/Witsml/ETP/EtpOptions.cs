using System;
using System.Collections.Generic;

namespace Witsml.ETP;

public sealed record EtpSessionOptions
(
    Uri Endpoint,
    string AppName,
    string AppVersion,
    string ClientInstanceId,
    EtpBasicAuthCredentials BasicAuth,
    IReadOnlyList<RequestedProtocol> RequestedProtocols,
    IReadOnlyDictionary<string, string> HttpHeaders = null
);

public sealed record EtpBasicAuthCredentials
(
    string Username,
    string Password
);

public sealed record RequestedProtocol
(
    int ProtocolId,
    string Role
)
{
    public static RequestedProtocol ChannelStreaming => new(ProtocolId: 1, Role: "producer");
    public static RequestedProtocol ChannelDataFrame => new(ProtocolId: 2, Role: "producer");
    public static RequestedProtocol Discovery => new(ProtocolId: 3, Role: "store");
    public static RequestedProtocol Store => new(ProtocolId: 4, Role: "store");
};

public sealed record EtpServerCapabilities
(
    Guid? SessionId,
    IReadOnlyList<SupportedProtocolInfo> SupportedProtocols
);

public sealed record SupportedProtocolInfo
(
    int ProtocolId,
    string Role,
    string Version,
    IReadOnlyDictionary<string, string> Capabilities
);
