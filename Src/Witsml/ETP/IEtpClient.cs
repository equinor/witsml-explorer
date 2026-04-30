using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

using Energistics.Datatypes.Object;

using Witsml.Data;

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

    // Protocol 4 (Store)
    Task<DataObject> GetObjectAsync(string uri, CancellationToken cancellationToken);
    Task<T> GetObjectAsWitsmlAsync<T>(string uri, CancellationToken cancellationToken) where T : IWitsmlObjectList, new();
    Task PutObjectAsync(DataObject dataObject, CancellationToken cancellationToken);
    Task PutObjectAsWitsmlAsync<T>(string uri, string contentType, T witsmlObject, CancellationToken cancellationToken) where T : IWitsmlObjectList;
    Task DeleteObjectAsync(string uri, CancellationToken cancellationToken);
};
