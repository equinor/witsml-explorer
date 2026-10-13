using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Energistics.Protocol.ChannelStreaming;

namespace Witsml.ETP
{
    internal class StreamingDataCache
    {
        internal static ConcurrentDictionary<string, Queue<ChannelData>> SessionData { get; set; } = [];
    }
}
