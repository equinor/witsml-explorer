using System.Threading;
using System.Threading.Tasks;

using Avro.Specific;

namespace Witsml.ETP;

/// <summary>
/// Provides protocol handlers with access to the common EtpClient functionality they need.
/// </summary>
internal interface IProtocolHandlerContext
{
    Task SendEtpMessageAsync<TBody>(int protocol, int messageType, TBody body, CancellationToken cancellationToken) where TBody : ISpecificRecord;
}
