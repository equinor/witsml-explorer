using System.Threading.Tasks;

namespace WitsmlExplorer.Api.Services
{
    public interface IWitsmlServerService
    {
        Task<bool> GetConnectionStatus();
    }

    // ReSharper disable once UnusedMember.Global
    public class WitsmlServerService : WitsmlService, IWitsmlServerService
    {
        public WitsmlServerService(IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider){}

        public async Task<bool> GetConnectionStatus()
        {
            var result = await WitsmlClient.TestConnectionAsync();
            return result.IsSuccessful;
        }
    }
}
