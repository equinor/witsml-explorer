using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Serilog;

using Witsml.Data;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Models.Measure;
using WitsmlExplorer.Api.Query;

namespace WitsmlExplorer.Api.Services
{
    public interface IBhaRunService
    {
        Task<BhaRun> GetBhaRun(string wellUid, string wellboreUid, string BhaRunUid);
        Task<IEnumerable<BhaRun>> GetBhaRuns(string wellUid, string wellboreUid);

    }

    public class BhaRunService : WitsmlService, IBhaRunService
    {
        public BhaRunService(IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider) { }

        public async Task<BhaRun> GetBhaRun(string wellUid, string wellboreUid, string BhaRunUid)
        {
            var query = BhaRunQueries.GetWitsmlBhaRunByUid(wellUid, wellboreUid, BhaRunUid);
            var result = await WitsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.All));
            if (result.BhaRuns.Any())
            {
                return WitsmlToBhaRun(result.BhaRuns.First());
            }

            return null;
        }
        public async Task<IEnumerable<BhaRun>> GetBhaRuns(string wellUid, string wellboreUid)
        {
            var witsmlBhaRun = BhaRunQueries.GetWitsmlBhaRunByWellbore(wellUid, wellboreUid);
            var result = await WitsmlClient.GetFromStoreAsync(witsmlBhaRun, new OptionsIn(ReturnElements.Requested));
            return result.BhaRuns.Select(bhaRun =>
                new BhaRun
                {
                    Uid = bhaRun.Uid,
                    Name = bhaRun.Name,
                    WellUid = bhaRun.WellUid,
                    WellName = bhaRun.WellName,
                    WellboreName = bhaRun.WellboreName,
                    WellboreUid = bhaRun.WellboreUid,
                    NumStringRun = bhaRun.NumStringRun,
                    TubularUidRef = bhaRun.Tubular?.UidRef,
                    StatusBha = (bhaRun.StatusBha == null) ? null : bhaRun.StatusBha,
                    NumBitRun = bhaRun.NumBitRun,
                    ReasonTrip = bhaRun.ReasonTrip,
                    ObjectiveBha = bhaRun.ObjectiveBha,
                    PlanDogLeg = (bhaRun.PlanDogLeg == null) ? null : new LengthMeasure { Uom = bhaRun.PlanDogLeg.Uom, Value = decimal.Parse(bhaRun.PlanDogLeg.Value) },
                    ActDogleg = (bhaRun.ActDogLeg == null) ? null : new LengthMeasure { Uom = bhaRun.ActDogLeg.Uom, Value = decimal.Parse(bhaRun.ActDogLeg.Value) },
                    ActDoglegMx = (bhaRun.ActDogLegMx == null) ? null : new LengthMeasure { Uom = bhaRun.ActDogLegMx.Uom, Value = decimal.Parse(bhaRun.ActDogLegMx.Value) },
                    DTimStart = string.IsNullOrEmpty(bhaRun.DTimStart) ? null : StringHelpers.ToDateTime(bhaRun.DTimStart),
                    DTimStop = string.IsNullOrEmpty(bhaRun.DTimStop) ? null : StringHelpers.ToDateTime(bhaRun.DTimStop),
                    DTimStartDrilling = string.IsNullOrEmpty(bhaRun.DTimStartDrilling) ? null : StringHelpers.ToDateTime(bhaRun.DTimStartDrilling),
                    DTimStopDrilling = string.IsNullOrEmpty(bhaRun.DTimStopDrilling) ? null : StringHelpers.ToDateTime(bhaRun.DTimStopDrilling),
                    CommonData = new CommonData()
                    {
                        ItemState = bhaRun.CommonData.ItemState,
                        SourceName = bhaRun.CommonData.SourceName,
                        DTimLastChange = StringHelpers.ToDateTime(bhaRun.CommonData.DTimLastChange),
                        DTimCreation = StringHelpers.ToDateTime(bhaRun.CommonData.DTimCreation),
                        ServiceCategory = bhaRun.CommonData.ServiceCategory,
                        Comments = bhaRun.CommonData.Comments,
                        DefaultDatum = bhaRun.CommonData.DefaultDatum,
                        AcquisitionTimeZone = StringHelpers.ToDateTime(bhaRun.CommonData.AcquisitionTimeZone)
                    }
                }).OrderBy(bhaRun => bhaRun.Name);
        }

        private static BhaRun WitsmlToBhaRun(WitsmlBhaRun bhaRun)
        {
            return new BhaRun
            {
                Uid = bhaRun.Uid,
                Name = bhaRun.Name,
                WellUid = bhaRun.WellUid,
                WellName = bhaRun.WellName,
                WellboreName = bhaRun.WellboreName,
                WellboreUid = bhaRun.WellboreUid,
                NumStringRun = bhaRun.NumStringRun,
                StatusBha = bhaRun.StatusBha,
                NumBitRun = bhaRun.NumBitRun,
                ReasonTrip = bhaRun.ReasonTrip,
                ObjectiveBha = bhaRun.ObjectiveBha,
                TubularUidRef = bhaRun.Tubular.UidRef,
                PlanDogLeg = (bhaRun.PlanDogLeg == null) ? null : new LengthMeasure { Uom = bhaRun.PlanDogLeg.Uom, Value = decimal.Parse(bhaRun.PlanDogLeg.Value) },
                ActDogleg = (bhaRun.ActDogLeg == null) ? null : new LengthMeasure { Uom = bhaRun.ActDogLeg.Uom, Value = decimal.Parse(bhaRun.ActDogLeg.Value) },
                ActDoglegMx = (bhaRun.ActDogLegMx == null) ? null : new LengthMeasure { Uom = bhaRun.ActDogLegMx.Uom, Value = decimal.Parse(bhaRun.ActDogLegMx.Value) },
                DTimStart = string.IsNullOrEmpty(bhaRun.DTimStart) ? null : StringHelpers.ToDateTime(bhaRun.DTimStart),
                DTimStop = string.IsNullOrEmpty(bhaRun.DTimStop) ? null : StringHelpers.ToDateTime(bhaRun.DTimStop),
                DTimStartDrilling = string.IsNullOrEmpty(bhaRun.DTimStartDrilling) ? null : StringHelpers.ToDateTime(bhaRun.DTimStartDrilling),
                DTimStopDrilling = string.IsNullOrEmpty(bhaRun.DTimStopDrilling) ? null : StringHelpers.ToDateTime(bhaRun.DTimStopDrilling),
                CommonData = new CommonData()
                {
                    ItemState = bhaRun.CommonData.ItemState,
                    SourceName = bhaRun.CommonData.SourceName,
                    DTimLastChange = StringHelpers.ToDateTime(bhaRun.CommonData.DTimLastChange),
                    DTimCreation = StringHelpers.ToDateTime(bhaRun.CommonData.DTimCreation),
                    ServiceCategory = bhaRun.CommonData.ServiceCategory,
                    Comments = bhaRun.CommonData.Comments,
                    DefaultDatum = bhaRun.CommonData.DefaultDatum,
                    AcquisitionTimeZone = StringHelpers.ToDateTime(bhaRun.CommonData.AcquisitionTimeZone)
                }
            };
        }
    }
}
