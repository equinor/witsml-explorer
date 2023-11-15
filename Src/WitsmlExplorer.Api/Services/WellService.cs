using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Witsml.Data;
using Witsml.Helpers;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;

namespace WitsmlExplorer.Api.Services
{
    public interface IWellService
    {
        Task<IList<Well>> GetWells();
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

        public async Task<IList<Well>> GetWells()
        {
            Task<IList<Wellbore>> getWellbores = _wellboreService.GetWellbores();
            Task<IList<Well>> getWells = GetWellsInformation();
            await Task.WhenAll(getWellbores, getWells);

            List<Well> wells = getWells.Result.OrderBy(well => well.Name).ToList();
            foreach (Well well in wells)
            {
                well.Wellbores = getWellbores.Result.Where(wb => wb.WellUid == well.Uid).ToList();
            }

            return wells;
        }

        private async Task<IList<Well>> GetWellsInformation(string wellUid = null)
        {
            return await MeasurementHelper.MeasureExecutionTimeAsync(async (timeMeasurer) =>
            {
                WitsmlWells witsmlWells = string.IsNullOrEmpty(wellUid) ? WellQueries.GetAllWitsmlWells() : WellQueries.GetWitsmlWellByUid(wellUid);
                WitsmlWells result = await _witsmlClient.GetFromStoreAsync(witsmlWells, new OptionsIn(ReturnElements.Requested));
                List<Well> wells = result.Wells
                    .Select(well => new Well
                    {
                        Uid = well.Uid,
                        Name = well.Name,
                        Field = well.Field,
                        Operator = well.Operator,
                        NumLicense = well.NumLicense,
                        TimeZone = well.TimeZone,
                        DateTimeCreation = well.CommonData.DTimCreation,
                        DateTimeLastChange = well.CommonData.DTimLastChange,
                        ItemState = well.CommonData.ItemState,
                        StatusWell = well.StatusWell,
                        PurposeWell = well.PurposeWell,
                        Country = well.Country
                    }
                    ).ToList();
                timeMeasurer.LogMessage = executionTime => $"Fetched {wells.Count} wells in {executionTime} ms.";
                return wells;
            });
        }

        public async Task<Well> GetWell(string wellUid)
        {
            Task<IList<Wellbore>> getWellbores = _wellboreService.GetWellbores(wellUid);
            Task<IList<Well>> getWell = GetWellsInformation(wellUid);
            await Task.WhenAll(getWellbores, getWell);

            Well well = getWell.Result.FirstOrDefault();

            if (well == null)
            {
                return null;
            }

            well.Wellbores = getWellbores.Result;
            return well;
        }
    }
}
