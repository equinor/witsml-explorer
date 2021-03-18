using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Serilog;
using Witsml.Query;
using Witsml.ServiceReference;
using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Services
{
    public interface IWellboreService
    {
        Task<Wellbore> GetWellbore(string wellUid, string wellboreUid);
        Task<IEnumerable<Wellbore>> GetWellbores(string wellUid = null);
    }

    // ReSharper disable once UnusedMember.Global
    public class WellboreService : WitsmlService, IWellboreService
    {
        public WellboreService(IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider) { }

        public async Task<Wellbore> GetWellbore(string wellUid, string wellboreUid)
        {
            var query = WellboreQueries.QueryByUid(wellUid, wellboreUid);
            var result = await WitsmlClient.GetFromStoreAsync(query, OptionsIn.All);
            var witsmlWellbore = result.Wellbores.FirstOrDefault();
            if (witsmlWellbore == null) return null;

            return new Wellbore
            {
                Uid = witsmlWellbore.Uid,
                Name = witsmlWellbore.Name,
                WellUid = witsmlWellbore.UidWell,
                WellName = witsmlWellbore.NameWell,
                WellborePurpose = witsmlWellbore.PurposeWellbore,
                WellboreParentUid = witsmlWellbore.ParentWellbore?.UidRef,
                WellboreParentName = witsmlWellbore.ParentWellbore?.Value,
                DateTimeCreation = StringHelpers.ToDateTime(witsmlWellbore.CommonData.DTimCreation),
                DateTimeLastChange = StringHelpers.ToDateTime(witsmlWellbore.CommonData.DTimLastChange),
                ItemState = witsmlWellbore.CommonData.ItemState
            };
        }

        public async Task<IEnumerable<Wellbore>> GetWellbores(string wellUid = null)
        {
            var start = DateTime.Now;
            var query = string.IsNullOrEmpty(wellUid) ? WellboreQueries.QueryAll() : WellboreQueries.QueryByWell(wellUid);

            var result = await WitsmlClient.GetFromStoreAsync(query, OptionsIn.Requested);
            var wellbores = result.Wellbores
                .Select(witsmlWellbore =>
                    new Wellbore
                    {
                        Uid = witsmlWellbore.Uid,
                        Name = witsmlWellbore.Name,
                        WellUid = witsmlWellbore.UidWell,
                        WellName = witsmlWellbore.NameWell,
                        WellStatus = witsmlWellbore.StatusWellbore,
                        WellType = witsmlWellbore.TypeWellbore,
                        IsActive = StringHelpers.ToBooleanSafe(witsmlWellbore.IsActive),
                        DateTimeLastChange = StringHelpers.ToDateTime(witsmlWellbore.CommonData.DTimLastChange)
                    })
                .OrderBy(wellbore => wellbore.Name).ToList();
            var elapsed = DateTime.Now.Subtract(start).Milliseconds / 1000.0;
            Log.Debug($"Fetched {wellbores.Count} wellbores in {elapsed} seconds");
            return wellbores;
        }
    }
}
