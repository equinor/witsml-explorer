using System.ServiceModel;

namespace Witsml;

/// <summary>
/// This class represents a custom exception for cases where a WITSML remote server request crash.
/// </summary>
public class WitsmlRemoteServerRequestCrashedException : CommunicationException
{
    public WitsmlRemoteServerRequestCrashedException(string message) : base(message) { }
}
