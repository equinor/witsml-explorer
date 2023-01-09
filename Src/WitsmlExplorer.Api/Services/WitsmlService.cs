using System.Net;

using Witsml;

using WitsmlExplorer.Api.Middleware;

namespace WitsmlExplorer.Api.Services
{
    public class WitsmlService
    {
        protected readonly IWitsmlClient _witsmlClient;

        protected WitsmlService(IWitsmlClientProvider witsmlClientProvider)
        {
            _witsmlClient = witsmlClientProvider.GetClient() ?? throw new WitsmlClientProviderException($"No WITSML access", (int)HttpStatusCode.Unauthorized, ServerType.Target);
        }
    }
}
