using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Witsml.Data;

namespace WitsmlExplorer.Api.Services
{
    public interface ICapService
    {
        Task<WitsmlServerCapabilities> GetCap();
    }

    public class CapService : WitsmlService, ICapService
    {
        public CapService(IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider) { }

        public async Task<WitsmlServerCapabilities> GetCap()
        {
            return (await _witsmlClient.GetCap()).ServerCapabilities?.FirstOrDefault();
        }
    }
}
