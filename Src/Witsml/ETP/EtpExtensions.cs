using System;
using System.Collections.Generic;
using System.Linq;

using Energistics.Datatypes;
using Energistics.Protocol.Core;

namespace Witsml.ETP;

internal static class EtpExtensions
{
    internal static string ToVersionString(this Energistics.Datatypes.Version version)
    {
        if (version == null)
        {
            return string.Empty;
        }

        return string.Join(".", version.major, version.minor, version.revision, version.patch);
    }

    internal static IReadOnlyDictionary<string, string> ToCapabilitiesDictionary(this IDictionary<string, DataValue> capabilities)
    {
        if (capabilities == null)
        {
            return new Dictionary<string, string>();
        }

        return capabilities
            .Where(x => !string.IsNullOrWhiteSpace(x.Key))
            .ToDictionary(
                x => x.Key,
                x => x.Value?.item?.ToString() ?? string.Empty,
                StringComparer.OrdinalIgnoreCase);
    }

    internal static EtpServerCapabilities ToServerCapabilities(this OpenSession openSession, Guid? sessionId)
    {
        var supportedProtocols = openSession.supportedProtocols
            ?.Where(p => p != null)
            .Select(p => new SupportedProtocolInfo(
                ProtocolId: p.protocol,
                Role: p.role ?? string.Empty,
                Version: p.protocolVersion.ToVersionString(),
                Capabilities: p.protocolCapabilities.ToCapabilitiesDictionary()))
            .ToList()
            ?? new List<SupportedProtocolInfo>();

        return new EtpServerCapabilities(sessionId, supportedProtocols);
    }
}
