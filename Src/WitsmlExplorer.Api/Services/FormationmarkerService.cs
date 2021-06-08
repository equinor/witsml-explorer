using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Witsml.Query;
using Witsml.ServiceReference;
using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Services
{
    public interface IFormationmarkerService
    {
        Task<IEnumerable<FormationMarker>> GetFormationmarkers(string wellUid, string wellboreUid);
        
    }

    // ReSharper disable once UnusedMember.Global
    public class FormationmarkerService : WitsmlService, IFormationmarkerService
    {
        public FormationmarkerService(IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider) { }

        public async Task<IEnumerable<FormationMarker>> GetFormationmarkers(string wellUid, string wellboreUid)
        {
            var query = FormationMarkerQueries.QueryByWellbore(wellUid, wellboreUid);
            var result = await WitsmlClient.GetFromStoreAsync(query, OptionsIn.All);

            return result.FormationMarkers.Select(formationmarker =>
                new FormationMarker
                {
                    NameFormation = formationmarker.Name,
                    NameWellbore = formationmarker.NameWellbore,
                    UidWellbore = formationmarker.UidWellbore,
                    NameWell = formationmarker.NameWell,
                    UidWell = formationmarker.UidWell,
                    Uid = formationmarker.Uid,
                    Description = formationmarker.Description,
                    TvdTopSample = formationmarker.TvdTopSample?.Value.ToString(),
                    MdTopSample = formationmarker.MdTopSample?.Value.ToString(),
                }).OrderBy(formationmarker => formationmarker.NameFormation);
        }
    }
}
