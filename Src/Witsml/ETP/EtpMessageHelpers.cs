using System;

using Avro.IO;
using Avro.Specific;

using Energistics.Protocol.Core;

namespace Witsml.ETP;

internal static class EtpMessageHelpers
{
    internal const int MultiPartMessageFlag = 0x01;
    internal const int FinalPartMessageFlag = 0x02;
    internal const int NoDataMessageFlag = 0x04;

    internal const int ProtocolExceptionMessageType = 1000;
    internal const int AcknowledgeMessageType = 1001;

    internal static bool HasMessageFlag(int messageFlags, int flag) => (messageFlags & flag) == flag;

    internal static bool TryReadProtocolException(int messageType, BinaryDecoder decoder, string operationName, out Exception exception)
    {
        exception = null;

        if (messageType != ProtocolExceptionMessageType)
        {
            return false;
        }

        var protocolExceptionReader = new SpecificReader<ProtocolException>(ProtocolException._SCHEMA, ProtocolException._SCHEMA);
        var protocolException = protocolExceptionReader.Read(new ProtocolException(), decoder);
        var errorCode = protocolException?.errorCode;
        var errorMessage = string.IsNullOrWhiteSpace(protocolException?.errorMessage)
            ? "Unknown protocol error."
            : protocolException.errorMessage;

        exception = new InvalidOperationException($"ETP protocol exception ({errorCode}) while handling {operationName}: {errorMessage}");
        return true;
    }
}
