using System;
using System.Threading;
using System.Threading.Tasks;

namespace Witsml.ETP;

public interface IEtpClient : IAsyncDisposable
{
    bool IsSessionOpen { get; }
    Guid? SessionId { get; }

    // Protocol 0 (Core)
    Task CloseSessionAsync(string reason, CancellationToken cancellationToken);
    EtpServerCapabilities GetServerCapabilities();
};
