using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Witsml.Data.Rig;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;

namespace WitsmlExplorer.Api.Services
{
    public interface IRigService
    {
        Task<ICollection<Rig>> GetRigs(string wellUid, string wellboreUid);
        Task<Rig> GetRig(string wellUid, string wellboreUid, string rigUid);
    }

    public class RigService : WitsmlService, IRigService
    {
        public RigService(IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider) { }

        public async Task<ICollection<Rig>> GetRigs(string wellUid, string wellboreUid)
        {
            WitsmlRigs witsmlRigs = RigQueries.GetWitsmlRig(wellUid, wellboreUid);
            WitsmlRigs result = await _witsmlClient.GetFromStoreAsync(witsmlRigs, new OptionsIn(ReturnElements.Requested));
            return result.Rigs.Select(Rig.FromWitsml).OrderBy(rig => rig.Name).ToList();
        }

        public async Task<Rig> GetRig(string wellUid, string wellboreUid, string rigUid)
        {
            WitsmlRigs query = RigQueries.GetWitsmlRig(wellUid, wellboreUid, rigUid);
            WitsmlRigs result = await _witsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.Requested));
            WitsmlRig witsmlRig = result.Rigs.FirstOrDefault();
            return Rig.FromWitsml(witsmlRig);
        }
    }
}
