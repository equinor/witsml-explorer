
using System.Net;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml.ETP;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Middleware;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Services.ETP;

namespace WitsmlExplorer.Api.Workers
{
    public abstract class EtpWorkerBase<T> : BaseWorker<T> where T : Job
    {
        private IEtpClientProvider EtpClientProvider { get; }
        private IEtpClient _sourceEtpClient;
        private IEtpClient _targetEtpClient;

        public EtpWorkerBase(IWitsmlClientProvider witsmlClientProvider, IEtpClientProvider etpClientProvider, ILogger<T> logger = null) : base(witsmlClientProvider, logger)
        {
            EtpClientProvider = etpClientProvider;
        }

        protected async Task<IEtpClient> GetTargetEtpClientOrThrow(CancellationToken cancellationToken)
        {
            if (_targetEtpClient != null && _targetEtpClient.IsSessionOpen) return _targetEtpClient;
            _targetEtpClient = await EtpClientProvider.GetClient(cancellationToken) ?? throw new WitsmlClientProviderException($"Missing Target EtpClient for {typeof(T)}", (int)HttpStatusCode.Unauthorized, ServerType.Target);
            return _targetEtpClient;
        }

        protected async Task<IEtpClient> GetSourceEtpClientOrThrow(CancellationToken cancellationToken)
        {
            if (_sourceEtpClient != null && _sourceEtpClient.IsSessionOpen) return _sourceEtpClient;
            _sourceEtpClient = await EtpClientProvider.GetSourceClient(cancellationToken) ?? throw new WitsmlClientProviderException($"Missing Source EtpClient for {typeof(T)}", (int)HttpStatusCode.Unauthorized, ServerType.Source);
            return _sourceEtpClient;
        }
    }
}
