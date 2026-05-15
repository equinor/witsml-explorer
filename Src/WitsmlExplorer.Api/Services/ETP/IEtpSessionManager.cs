

using System.Threading;
using System.Threading.Tasks;

using Witsml.ETP;

namespace WitsmlExplorer.Api.Services.ETP;

public interface IEtpSessionManager
{
    Task<IEtpClient> GetOrCreateSessionAsync(SessionKey sessionKey, SessionOptions options, CancellationToken cancellationToken);
    bool TryGetSession(SessionKey sessionKey, out IEtpClient session);
    Task<bool> RemoveSessionAsync(SessionKey sessionKey, string reason);
    Task CleanupExpiredSessionsAsync();
    int SessionCount { get; }
}
