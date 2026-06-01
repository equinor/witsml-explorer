using System.Threading;
using System.Threading.Tasks;

using Avro.Specific;

using Energistics.Datatypes;

namespace Witsml.ETP;

/// <summary>
/// Provides protocol handlers with access to the common EtpClient functionality they need.
/// </summary>
internal interface IProtocolHandlerContext
{
    Task SendEtpMessageAsync<TBody>(int protocol, int messageType, TBody body, CancellationToken cancellationToken, long? messageId = null) where TBody : ISpecificRecord;
    long ReserveMessageId();
    void LogReceivedMessage(MessageHeader header, object body);
}
