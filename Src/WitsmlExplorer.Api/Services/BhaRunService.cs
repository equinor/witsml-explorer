using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Witsml.Data;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Models.Measure;
using WitsmlExplorer.Api.Query;

namespace WitsmlExplorer.Api.Services
{
    public interface IBhaRunService
    {
        Task<BhaRun> GetBhaRun(string wellUid, string wellboreUid, string bhaRunUid);
        Task<ICollection<BhaRun>> GetBhaRuns(string wellUid, string wellboreUid);
    }

    public class BhaRunService : WitsmlService, IBhaRunService
    {
        public BhaRunService(IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider) { }

        public async Task<BhaRun> GetBhaRun(string wellUid, string wellboreUid, string bhaRunUid)
        {
            WitsmlBhaRuns query = BhaRunQueries.GetWitsmlBhaRun(wellUid, wellboreUid, bhaRunUid);
            WitsmlBhaRuns result = await _witsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.All));
            return BhaRun.FromWitsml(result.BhaRuns.FirstOrDefault());
        }
        public async Task<ICollection<BhaRun>> GetBhaRuns(string wellUid, string wellboreUid)
        {
            WitsmlBhaRuns witsmlBhaRun = BhaRunQueries.GetWitsmlBhaRun(wellUid, wellboreUid);
            WitsmlBhaRuns result = await _witsmlClient.GetFromStoreAsync(witsmlBhaRun, new OptionsIn(ReturnElements.Requested));
            return result.BhaRuns.Select(BhaRun.FromWitsml).OrderBy(bhaRun => bhaRun.Name).ToList();
        }
    }
}
