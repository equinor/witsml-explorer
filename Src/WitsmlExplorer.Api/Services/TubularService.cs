using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WitsmlExplorer.Api.Query;
using Witsml.ServiceReference;
using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Services
{
    public interface ITubularService
    {
        Task<IEnumerable<Tubular>> GetTubulars(string wellUid, string wellboreUid);
    }

    // ReSharper disable once UnusedMember.Global
    public class TubularService : WitsmlService, ITubularService
    {
        public TubularService(IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider)
        {
        }

        public async Task<IEnumerable<Tubular>> GetTubulars(string wellUid, string wellboreUid)
        {
            var witsmlTubular = TubularQueries.GetWitsmlTubularByWellbore(wellUid, wellboreUid);
            var result = await WitsmlClient.GetFromStoreAsync(witsmlTubular, new OptionsIn(ReturnElements.Requested));

            return result.Tubulars.Select(tubular =>
                new Tubular
                {
                    Uid = tubular.Uid,
                    WellUid = tubular.UidWell,
                    WellboreUid = tubular.UidWellbore,
                    Name = tubular.Name,
                    TypeTubularAssy = tubular.TypeTubularAssy
                }).OrderBy(tubular => tubular.Name);
        }

    }
}
