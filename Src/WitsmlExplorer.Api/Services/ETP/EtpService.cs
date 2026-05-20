using System.Net;
using System.Threading;
using System.Threading.Tasks;

using Witsml.ETP;

using WitsmlExplorer.Api.Middleware;

namespace WitsmlExplorer.Api.Services.ETP
{
    public class EtpService
    {
        private readonly IEtpClientProvider _etpClientProvider;

        protected EtpService(IEtpClientProvider etpClientProvider)
        {
            _etpClientProvider = etpClientProvider;
        }

        protected async Task<IEtpClient> GetEtpClient(CancellationToken? cancellationToken = null)
        {
            return await _etpClientProvider.GetClient(cancellationToken ?? CancellationToken.None) ?? throw new WitsmlClientProviderException($"No ETP access", (int)HttpStatusCode.Unauthorized, ServerType.Target);
        }
    }
}
