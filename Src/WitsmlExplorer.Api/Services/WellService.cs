using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Witsml.Data;
using Witsml.Extensions;
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

        public WellService(IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider)
        {
        }

        public async Task<IList<Well>> GetWells()
        {
            IList<Well> wells = await GetWellsInformation();
            wells = await SetWellIsActive(wells);
            return wells.OrderBy(well => well.Name).ToList();
        }

        private async Task<IList<Well>> SetWellIsActive(IList<Well> wells) // Sets the IsActive property of each well to true if any of its wellbores are active
        {
            bool canQueryByIsActive = await CanQueryByIsActive();

            var query = new WitsmlWellbores
            {
                Wellbores = new WitsmlWellbore
                {
                    UidWell = "",
                    IsActive = canQueryByIsActive ? "true" : ""
                }.AsItemInList()
            };
            try
            {
                WitsmlWellbores wellbores = await _witsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.Requested));
                foreach (WitsmlWellbore wellbore in wellbores.Wellbores)
                {
                    if (wellbore.IsActive == "true")
                    {
                        Well well = wells.FirstOrDefault(well => well.Uid == wellbore.UidWell);
                        if (well != null)
                        {
                            well.IsActive = true;
                        }
                    }
                };
                return wells;
            }
            catch (Exception)
            {
                // As some servers won't allow querying without specifying uidWell, we can't find out if it is active without querying each well separately.
                // For now, we don't want to do that. So we return the wells without setting IsActive.
                return wells;
            }
        }

        private async Task<bool> CanQueryByIsActive()
        {
            // send a request to see if the server is capable of querying by IsActive
            try
            {
                WitsmlWellbores capabilityQuery = new WitsmlWellbores
                {
                    Wellbores = new WitsmlWellbore().AsItemInList()
                };
                WitsmlWellbores capabilityResult = await _witsmlClient.GetFromStoreNullableAsync(capabilityQuery, new OptionsIn(RequestObjectSelectionCapability: true));
                WitsmlWellbore capabilities = capabilityResult?.Wellbores?.FirstOrDefault();
                return capabilities?.IsActive != null;
            }
            catch (Exception)
            {
                // The try/catch is used as a workaround for the servers that can't handle RequestObjectSelectionCapability.
                return false;
            }
        }

        private async Task<Well> SetWellIsActive(Well well) // Sets the IsActive property of the well to true if any of its wellbores are active
        {
            var query = new WitsmlWellbores
            {
                Wellbores = new WitsmlWellbore
                {
                    UidWell = well.Uid,
                    IsActive = ""
                }.AsItemInList()
            };

            WitsmlWellbores wellbores = await _witsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.Requested));
            if (wellbores.Wellbores.Any(wellbore => wellbore.IsActive == "true"))
            {
                well.IsActive = true;
            }
            return well;
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
                        DateTimeCreation = well.CommonData?.DTimCreation,
                        DateTimeLastChange = well.CommonData?.DTimLastChange,
                        ItemState = well.CommonData?.ItemState,
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
            IList<Well> wells = await GetWellsInformation(wellUid);

            Well well = wells.FirstOrDefault();

            if (well == null)
            {
                return null;
            }

            well = await SetWellIsActive(well);
            return well;
        }
    }
}
