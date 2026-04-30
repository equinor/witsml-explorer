using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

using Energistics.Datatypes.Object;

namespace Witsml.ETP;

public interface IEtpClient : IAsyncDisposable
{
    bool IsSessionOpen { get; }
    Guid? SessionId { get; }

    // Protocol 0 (Core)
    Task CloseSessionAsync(string reason, CancellationToken cancellationToken);
    EtpServerCapabilities GetServerCapabilities();

    // Protocol 3 (Discovery)
    Task<IList<Resource>> GetResourcesAsync(string uri, CancellationToken cancellationToken);
};
