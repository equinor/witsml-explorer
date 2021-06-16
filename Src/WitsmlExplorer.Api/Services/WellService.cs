using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Serilog;
using Witsml.Data;
using Witsml.ServiceReference;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;

namespace WitsmlExplorer.Api.Services
{
    public interface IWellService
    {
        Task<IEnumerable<Well>> GetWells();
        Task<Well> GetWell(string wellUid);
    }

    // ReSharper disable once UnusedMember.Global
    public class WellService : WitsmlService, IWellService
    {
        private readonly IWellboreService wellboreService;

        public WellService(IWitsmlClientProvider witsmlClientProvider, IWellboreService wellboreService) : base(witsmlClientProvider)
        {
            this.wellboreService = wellboreService;
        }

        public async Task<IEnumerable<Well>> GetWells()
        {
            var getWellbores = wellboreService.GetWellbores();
            var getWells = GetWellsInformation();
            await Task.WhenAll(getWellbores, getWells);

            var wells = getWells.Result.ToList();
            foreach (var well in wells)
                well.Wellbores = getWellbores.Result.Where(wb => wb.WellUid == well.Uid);
            return wells.OrderBy(well => well.Name);
        }

        private async Task<IEnumerable<Well>> GetWellsInformation(string wellUid = null)
        {
            var start = DateTime.Now;
            var witsmlWells = string.IsNullOrEmpty(wellUid) ? WellQueries.GetAllWitsmlWells() : WellQueries.GetWitsmlWellByUid(wellUid);
            var result = await WitsmlClient.GetFromStoreAsync(witsmlWells, OptionsIn.Requested);
            var wells = result.Wells
                .Select(well => new Well
                    {
                        Uid = well.Uid,
                        Name = well.Name,
                        Field = well.Field,
                        Operator = well.Operator,
                        TimeZone = well.TimeZone,
                        DateTimeCreation = StringHelpers.ToDateTime(well.CommonData.DTimCreation),
                        DateTimeLastChange = StringHelpers.ToDateTime(well.CommonData.DTimLastChange),
                        ItemState = well.CommonData.ItemState
                    }
                ).ToList();
            var elapsed = DateTime.Now.Subtract(start).Milliseconds / 1000.0;
            Log.Debug($"Fetched {wells.Count} wells in {elapsed} seconds");
            return wells;
        }

        public async Task<Well> GetWell(string wellUid)
        {
            var getWellbores = wellboreService.GetWellbores(wellUid);
            var getWell = GetWellsInformation(wellUid);
            await Task.WhenAll(getWellbores, getWell);

            if (!getWell.Result.Any()) return null;

            var well = getWell.Result.First();
            well.Wellbores = getWellbores.Result;
            return well;
        }
    }
}
