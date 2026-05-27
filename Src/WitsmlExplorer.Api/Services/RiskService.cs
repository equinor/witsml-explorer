using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Witsml.Data;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;

namespace WitsmlExplorer.Api.Services
{
    public interface IRiskService
    {
        Task<ICollection<Risk>> GetRisks(string wellUid, string wellboreUid);
        Task<Risk> GetRisk(string wellUid, string wellboreUid, string riskUid);
    }

    public class RiskService : WitsmlService, IRiskService
    {
        public RiskService(IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider) { }

        public async Task<ICollection<Risk>> GetRisks(string wellUid, string wellboreUid)
        {
            WitsmlRisks query = RiskQueries.GetWitsmlRiskByWellbore(wellUid, wellboreUid);
            WitsmlRisks result = await _witsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.Requested));

            return result.Risks.Select(Risk.FromWitsml).OrderBy(risk => risk.Name).ToList();
        }

        public async Task<Risk> GetRisk(string wellUid, string wellboreUid, string riskUid)
        {
            WitsmlRisks query = RiskQueries.QueryById(wellUid, wellboreUid, riskUid);
            WitsmlRisks result = await _witsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.All));
            return Risk.FromWitsml(result.Risks.FirstOrDefault());
        }
    }
}
