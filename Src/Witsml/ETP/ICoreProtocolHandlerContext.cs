using System.Threading;
using System.Threading.Tasks;

namespace Witsml.ETP;

internal interface ICoreProtocolHandlerContext : IProtocolHandlerContext
{
    bool IsTransportOpen { get; }

    Task OpenTransportAsync(EtpSessionOptions options, CancellationToken cancellationToken);
    Task CloseTransportAsync(string reason, CancellationToken cancellationToken);
}
