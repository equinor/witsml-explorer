
using System.Threading;
using System.Threading.Tasks;

using Witsml.ETP;

namespace WitsmlExplorer.Api.Services.ETP
{
    public interface IEtpClientProvider
    {
        Task<IEtpClient> GetClient(CancellationToken cancellationToken);
        Task<IEtpClient> GetSourceClient(CancellationToken cancellationToken);
    }
}
