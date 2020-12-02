using Witsml;

namespace WitsmlExplorer.Api.Services
{
    public class WitsmlService
    {
        protected readonly IWitsmlClient WitsmlClient;

        protected WitsmlService(IWitsmlClientProvider witsmlClientProvider)
        {
            WitsmlClient = witsmlClientProvider.GetClient();
        }
    }
}
