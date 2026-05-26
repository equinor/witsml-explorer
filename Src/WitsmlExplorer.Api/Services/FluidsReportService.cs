using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Witsml.Data;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;

namespace WitsmlExplorer.Api.Services
{
    public interface IFluidsReportService
    {
        Task<ICollection<FluidsReport>> GetFluidsReports(string wellUid, string wellboreUid);
        Task<FluidsReport> GetFluidsReport(string wellUid, string wellboreUid, string fluidsReportUid);
        Task<List<Fluid>> GetFluids(string wellUid, string wellboreUid, string fluidsReportUid);
    }

    public class FluidsReportService : WitsmlService, IFluidsReportService
    {
        public FluidsReportService(IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider) { }

        public async Task<ICollection<FluidsReport>> GetFluidsReports(string wellUid, string wellboreUid)
        {
            WitsmlFluidsReports query = FluidsReportQueries.QueryByWellbore(wellUid, wellboreUid);
            WitsmlFluidsReports result = await _witsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.Requested));
            return result.FluidsReports.Select(FluidsReport.FromWitsml).ToList();
        }

        public async Task<FluidsReport> GetFluidsReport(string wellUid, string wellboreUid, string fluidsReportUid)
        {
            WitsmlFluidsReports query = (WitsmlFluidsReports)ObjectQueries.GetWitsmlObjectById(wellUid, wellboreUid, fluidsReportUid, EntityType.FluidsReport);
            WitsmlFluidsReports result = await _witsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.All));

            WitsmlFluidsReport witsmlFluidsReport = result.FluidsReports.FirstOrDefault();
            if (witsmlFluidsReport == null)
            {
                return null;
            }

            return FluidsReport.FromWitsml(witsmlFluidsReport);
        }

        public async Task<List<Fluid>> GetFluids(string wellUid, string wellboreUid, string fluidsReportUid)
        {
            return (await GetFluidsReport(wellUid, wellboreUid, fluidsReportUid))?.Fluids;
        }
    }
}
