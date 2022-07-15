using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Serilog;
using WitsmlExplorer.Api.Query;
using Witsml.ServiceReference;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Models.Measure;

namespace WitsmlExplorer.Api.Services
{
    public interface IBhaRunService
    {
        Task<BhaRun> GetBhaRun(string wellUid, string wellboreUid, string BhaRunUid);
    }

    public class BhaRunService : WitsmlService, IBhaRunService
    {
        public BhaRunService(IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider) { }

        public async Task<BhaRun> GetBhaRun(string wellUid, string wellboreUid, string BhaRunUid)
        {
            var query = BhaRunQueries.GetWitsmlBhaRunByUid(wellUid, wellboreUid, BhaRunUid);
            var result = await WitsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.All));
            var witsmlBhaRun = result.BhaRuns.FirstOrDefault();
            if (witsmlBhaRun == null) return null;

            return new BhaRun
            {
                Uid = witsmlBhaRun.Uid,
                Name = witsmlBhaRun.Name,
                WellUid = witsmlBhaRun.WellUid,
                WellName = witsmlBhaRun.WellName,
                WellboreName = witsmlBhaRun.WellboreName,
                WellboreUid = witsmlBhaRun.WellboreUid,
                NumStringRun = witsmlBhaRun.NumStringRun,
                StatusBha = witsmlBhaRun.NumStringRun,
                NumBitRun = witsmlBhaRun.NumBitRun,
                ReasonTrip = witsmlBhaRun.ReasonTrip,
                ObjectiveBha = witsmlBhaRun.ObjectiveBha,
                TubularUidRef = witsmlBhaRun.Tubular.UidRef,
                PlanDogLeg = (witsmlBhaRun.PlanDogLeg == null) ? null : new LengthMeasure { Uom = witsmlBhaRun.PlanDogLeg.Uom, Value = decimal.Parse(witsmlBhaRun.PlanDogLeg.Value) },
                ActDogleg = (witsmlBhaRun.ActDogLeg == null) ? null : new LengthMeasure { Uom = witsmlBhaRun.ActDogLeg.Uom, Value = decimal.Parse(witsmlBhaRun.ActDogLeg.Value) },
                ActDoglegMx = (witsmlBhaRun.ActDogLegMx == null) ? null : new LengthMeasure { Uom = witsmlBhaRun.ActDogLegMx.Uom, Value = decimal.Parse(witsmlBhaRun.ActDogLegMx.Value) },
                DTimStart = string.IsNullOrEmpty(witsmlBhaRun.DTimStart) ? null : StringHelpers.ToDateTime(witsmlBhaRun.DTimStart),
                DTimStop = string.IsNullOrEmpty(witsmlBhaRun.DTimStop) ? null : StringHelpers.ToDateTime(witsmlBhaRun.DTimStop),
                DTimStartDrilling = string.IsNullOrEmpty(witsmlBhaRun.DTimStartDrilling) ? null : StringHelpers.ToDateTime(witsmlBhaRun.DTimStartDrilling),
                DTimStopDrilling = string.IsNullOrEmpty(witsmlBhaRun.DTimStopDrilling) ? null : StringHelpers.ToDateTime(witsmlBhaRun.DTimStop),
                CommonData = new CommonData()
                {
                    ItemState = witsmlBhaRun.CommonData.ItemState,
                    SourceName = witsmlBhaRun.CommonData.SourceName,
                    DTimLastChange = StringHelpers.ToDateTime(witsmlBhaRun.CommonData.DTimLastChange),
                    DTimCreation = StringHelpers.ToDateTime(witsmlBhaRun.CommonData.DTimCreation),
                    ServiceCategory = witsmlBhaRun.CommonData.ServiceCategory,
                    Comments = witsmlBhaRun.CommonData.Comments,
                    DefaultDatum = witsmlBhaRun.CommonData.DefaultDatum,
                    AcquisitionTimeZone = StringHelpers.ToDateTime(witsmlBhaRun.CommonData.AcquisitionTimeZone)
                }
            };
        }
    }
}
