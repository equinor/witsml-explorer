using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Witsml.Data;

namespace WitsmlExplorer.Api.Services
{
    public interface ICapService
    {
        Task<WitsmlServerCapabilities> GetCap();
        Task<IList<string>> GetCapObjects();
    }

    public class CapService : WitsmlService, ICapService
    {
        public CapService(IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider) { }

        public async Task<WitsmlServerCapabilities> GetCap()
        {
            return (await _witsmlClient.GetCap()).ServerCapabilities?.FirstOrDefault();
        }

        public async Task<IList<string>> GetCapObjects()
        {
            var cap = await GetCap();
            var objects = cap?.Functions?.FirstOrDefault(f => f.Name == "WMLS_GetFromStore")?.DataObjects;
            return objects?.Select(d => d.Name)?.ToList() ?? new List<string>();
        }
    }
}
