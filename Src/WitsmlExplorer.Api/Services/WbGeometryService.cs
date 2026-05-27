using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Witsml.Data;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;

namespace WitsmlExplorer.Api.Services
{
    public interface IWbGeometryService
    {
        Task<ICollection<WbGeometry>> GetWbGeometrys(string wellUid, string wellboreUid);
        Task<WbGeometry> GetWbGeometry(string wellUid, string wellboreUid, string wbGeometryUid);
        Task<List<WbGeometrySection>> GetWbGeometrySections(string wellUid, string wellboreUid, string wbGeometryUid);
    }

    // ReSharper disable once UnusedMember.Global
    public class WbGeometryService : WitsmlService, IWbGeometryService
    {
        public WbGeometryService(IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider) { }

        public async Task<WbGeometry> GetWbGeometry(string wellUid, string wellboreUid, string wbGeometryUid)
        {
            WitsmlWbGeometrys query = WbGeometryQueries.GetWitsmlWbGeometryById(wellUid, wellboreUid, wbGeometryUid);
            WitsmlWbGeometrys result = await _witsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.Requested));

            return WbGeometry.FromWitsml(result.WbGeometrys.FirstOrDefault());
        }

        public async Task<ICollection<WbGeometry>> GetWbGeometrys(string wellUid, string wellboreUid)
        {
            WitsmlWbGeometrys query = WbGeometryQueries.GetWitsmlWbGeometryByWellbore(wellUid, wellboreUid);
            WitsmlWbGeometrys result = await _witsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.Requested));

            return result.WbGeometrys.Select(WbGeometry.FromWitsml).OrderBy(wbGeometry => wbGeometry.DTimReport).ToList();
        }

        public async Task<List<WbGeometrySection>> GetWbGeometrySections(string wellUid, string wellboreUid, string wbGeometryUid)
        {
            WitsmlWbGeometrys query = WbGeometryQueries.GetSectionsByWbGeometryId(wellUid, wellboreUid, wbGeometryUid);
            WitsmlWbGeometrys result = await _witsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.Requested));
            WitsmlWbGeometry witsmlWbGeometry = result.WbGeometrys.FirstOrDefault();
            return WbGeometry.GetWbGeometrySections(witsmlWbGeometry?.WbGeometrySections);
        }
    }
}
