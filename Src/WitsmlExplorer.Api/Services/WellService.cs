using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Serilog;

using Witsml.Data;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;

using WellDatum = WitsmlExplorer.Api.Models.WellDatum;

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
        private readonly IWellboreService _wellboreService;

        public WellService(IWitsmlClientProvider witsmlClientProvider, IWellboreService wellboreService) : base(witsmlClientProvider)
        {
            _wellboreService = wellboreService;
        }

        public async Task<IEnumerable<Well>> GetWells()
        {
            Task<IEnumerable<Wellbore>> getWellbores = _wellboreService.GetWellbores();
            Task<IEnumerable<Well>> getWells = GetWellsInformation();
            await Task.WhenAll(getWellbores, getWells);

            List<Well> wells = getWells.Result.ToList();
            foreach (Well well in wells)
            {
                well.Wellbores = getWellbores.Result.Where(wb => wb.WellUid == well.Uid);
            }

            return wells.OrderBy(well => well.Name);
        }

        private async Task<IEnumerable<Well>> GetWellsInformation(string wellUid = null)
        {
            DateTime start = DateTime.Now;
            WitsmlWells witsmlWells = string.IsNullOrEmpty(wellUid) ? WellQueries.GetAllWitsmlWells() : WellQueries.GetWitsmlWellByUid(wellUid);
            WitsmlWells result = await _witsmlClient.GetFromStoreAsync(witsmlWells, new OptionsIn(ReturnElements.Requested));
            List<Well> wells = result.Wells
                .Select(well => new Well
                {
                    Uid = well.Uid,
                    Name = well.Name,
                    Field = well.Field,
                    Operator = well.Operator,
                    TimeZone = well.TimeZone,
                    DateTimeCreation = well.CommonData.DTimCreation,
                    DateTimeLastChange = well.CommonData.DTimLastChange,
                    ItemState = well.CommonData.ItemState,
                    StatusWell = well.StatusWell,
                    PurposeWell = well.PurposeWell,
                    WellDatum = WellDatum.FromWitsmlWellDatum(well.WellDatum),
                    WaterDepth = well.WaterDepth,
                    WellLocation = WellLocation.FromWitsmlLocation(well.WellLocation),
                    Country = well.Country
                }
                ).ToList();
            double elapsed = DateTime.Now.Subtract(start).Milliseconds / 1000.0;
            Log.Debug("Fetched {Count} wells in {Elapsed} seconds", wells.Count, elapsed);
            return wells;
        }

        public async Task<Well> GetWell(string wellUid)
        {
            Task<IEnumerable<Wellbore>> getWellbores = _wellboreService.GetWellbores(wellUid);
            Task<IEnumerable<Well>> getWell = GetWellsInformation(wellUid);
            await Task.WhenAll(getWellbores, getWell);

            if (!getWell.Result.Any())
            {
                return null;
            }

            Well well = getWell.Result.First();
            well.Wellbores = getWellbores.Result;
            return well;
        }
    }
}
