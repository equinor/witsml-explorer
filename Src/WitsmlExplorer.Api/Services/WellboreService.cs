using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Witsml.Data;
using Witsml.Helpers;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Models.Measure;
using WitsmlExplorer.Api.Query;

namespace WitsmlExplorer.Api.Services
{
    public interface IWellboreService
    {
        Task<Wellbore> GetWellbore(string wellUid, string wellboreUid);
        Task<IList<Wellbore>> GetWellbores(string wellUid = "");
    }

    // ReSharper disable once UnusedMember.Global
    public class WellboreService : WitsmlService, IWellboreService
    {
        public WellboreService(IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider) { }

        public async Task<Wellbore> GetWellbore(string wellUid, string wellboreUid)
        {
            WitsmlWellbores query = WellboreQueries.GetWitsmlWellboreByUid(wellUid, wellboreUid);
            WitsmlWellbores result = await _witsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.All));
            WitsmlWellbore witsmlWellbore = result.Wellbores.FirstOrDefault();
            return witsmlWellbore == null
                ? null
                : FromWitsml(witsmlWellbore);
        }

        public async Task<IList<Wellbore>> GetWellbores(string wellUid = "")
        {
            return await MeasurementHelper.MeasureExecutionTimeAsync(async (timeMeasurer) =>
            {
                WitsmlWellbores query = WellboreQueries.GetWitsmlWellboreByWell(wellUid);
                WitsmlWellbores result = await _witsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.All));
                List<Wellbore> wellbores = result.Wellbores
                    .Select(FromWitsml)
                    .OrderBy(wellbore => wellbore.Name).ToList();
                timeMeasurer.LogMessage = executionTime => $"Fetched {wellbores.Count} wellbores in {executionTime} ms.";
                return wellbores;
            });
        }

        private Wellbore FromWitsml(WitsmlWellbore witsmlWellbore)
        {
            return new Wellbore
            {
                Uid = witsmlWellbore.Uid,
                Name = witsmlWellbore.Name,
                WellUid = witsmlWellbore.UidWell,
                WellName = witsmlWellbore.NameWell,
                Number = witsmlWellbore.Number,
                SuffixAPI = witsmlWellbore.SuffixAPI,
                NumGovt = witsmlWellbore.NumGovt,
                WellboreStatus = witsmlWellbore.StatusWellbore,
                IsActive = StringHelpers.ToBoolean(witsmlWellbore.IsActive),
                WellborePurpose = witsmlWellbore.PurposeWellbore,
                WellboreParentUid = witsmlWellbore.ParentWellbore?.UidRef,
                WellboreParentName = witsmlWellbore.ParentWellbore?.Value,
                WellboreType = witsmlWellbore.TypeWellbore,
                Shape = witsmlWellbore.Shape,
                DTimeKickoff = witsmlWellbore.DTimKickoff,
                Md = (witsmlWellbore.Md == null) ? null : new LengthMeasure { Uom = witsmlWellbore.Md.Uom, Value = StringHelpers.ToDecimal(witsmlWellbore.Md.Value) },
                Tvd = (witsmlWellbore.Tvd == null) ? null : new LengthMeasure { Uom = witsmlWellbore.Tvd.Uom, Value = StringHelpers.ToDecimal(witsmlWellbore.Tvd.Value) },
                MdKickoff = (witsmlWellbore.MdKickoff == null) ? null : new LengthMeasure { Uom = witsmlWellbore.MdKickoff.Uom, Value = StringHelpers.ToDecimal(witsmlWellbore.MdKickoff.Value) },
                TvdKickoff = (witsmlWellbore.TvdKickoff == null) ? null : new LengthMeasure { Uom = witsmlWellbore.TvdKickoff.Uom, Value = StringHelpers.ToDecimal(witsmlWellbore.TvdKickoff.Value) },
                MdPlanned = (witsmlWellbore.MdPlanned == null) ? null : new LengthMeasure { Uom = witsmlWellbore.MdPlanned.Uom, Value = StringHelpers.ToDecimal(witsmlWellbore.MdPlanned.Value) },
                TvdPlanned = (witsmlWellbore.TvdPlanned == null) ? null : new LengthMeasure { Uom = witsmlWellbore.TvdPlanned.Uom, Value = StringHelpers.ToDecimal(witsmlWellbore.TvdPlanned.Value) },
                MdSubSeaPlanned = (witsmlWellbore.MdSubSeaPlanned == null) ? null : new LengthMeasure { Uom = witsmlWellbore.MdSubSeaPlanned.Uom, Value = StringHelpers.ToDecimal(witsmlWellbore.MdSubSeaPlanned.Value) },
                TvdSubSeaPlanned = (witsmlWellbore.TvdSubSeaPlanned == null) ? null : new LengthMeasure { Uom = witsmlWellbore.TvdSubSeaPlanned.Uom, Value = StringHelpers.ToDecimal(witsmlWellbore.TvdSubSeaPlanned.Value) },
                DayTarget = (witsmlWellbore.DayTarget == null) ? null : new DayMeasure { Uom = witsmlWellbore.DayTarget.Uom, Value = int.Parse(witsmlWellbore.DayTarget.Value) },
                DateTimeCreation = witsmlWellbore.CommonData.DTimCreation,
                DateTimeLastChange = witsmlWellbore.CommonData.DTimLastChange,
                ItemState = witsmlWellbore.CommonData.ItemState,
                Comments = witsmlWellbore.CommonData.Comments
            };
        }
    }
}
