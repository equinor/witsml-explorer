using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Witsml.Data;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Models.Measure;
using WitsmlExplorer.Api.Query;

namespace WitsmlExplorer.Api.Services
{
    public interface IBhaRunService
    {
        Task<BhaRun> GetBhaRun(string wellUid, string wellboreUid, string bhaRunUid);
        Task<ICollection<BhaRun>> GetBhaRuns(string wellUid, string wellboreUid);
    }

    public class BhaRunService : WitsmlService, IBhaRunService
    {
        public BhaRunService(IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider) { }

        public async Task<BhaRun> GetBhaRun(string wellUid, string wellboreUid, string bhaRunUid)
        {
            WitsmlBhaRuns query = BhaRunQueries.GetWitsmlBhaRun(wellUid, wellboreUid, bhaRunUid);
            WitsmlBhaRuns result = await _witsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.All));
            return WitsmlToBhaRun(result.BhaRuns.FirstOrDefault());
        }
        public async Task<ICollection<BhaRun>> GetBhaRuns(string wellUid, string wellboreUid)
        {
            WitsmlBhaRuns witsmlBhaRun = BhaRunQueries.GetWitsmlBhaRun(wellUid, wellboreUid);
            WitsmlBhaRuns result = await _witsmlClient.GetFromStoreAsync(witsmlBhaRun, new OptionsIn(ReturnElements.Requested));
            return result.BhaRuns.Select(WitsmlToBhaRun).OrderBy(bhaRun => bhaRun.Name).ToList();
        }

        private static BhaRun WitsmlToBhaRun(WitsmlBhaRun bhaRun)
        {
            return bhaRun == null ? null : new BhaRun
            {
                Uid = bhaRun.Uid,
                Name = bhaRun.Name,
                WellUid = bhaRun.UidWell,
                WellName = bhaRun.NameWell,
                WellboreName = bhaRun.NameWellbore,
                WellboreUid = bhaRun.UidWellbore,
                NumStringRun = bhaRun.NumStringRun,
                Tubular = (bhaRun.Tubular == null) ? null : new RefNameString
                {
                    UidRef = bhaRun.Tubular.UidRef,
                    Value = bhaRun.Tubular.Value
                },
                StatusBha = bhaRun.StatusBha ?? null,
                NumBitRun = bhaRun.NumBitRun,
                ReasonTrip = bhaRun.ReasonTrip,
                ObjectiveBha = bhaRun.ObjectiveBha,
                PlanDogleg = (bhaRun.PlanDogleg == null) ? null : new LengthMeasure { Uom = bhaRun.PlanDogleg.Uom, Value = StringHelpers.ToDecimal(bhaRun.PlanDogleg.Value) },
                ActDogleg = (bhaRun.ActDogleg == null) ? null : new LengthMeasure { Uom = bhaRun.ActDogleg.Uom, Value = StringHelpers.ToDecimal(bhaRun.ActDogleg.Value) },
                ActDoglegMx = (bhaRun.ActDoglegMx == null) ? null : new LengthMeasure { Uom = bhaRun.ActDoglegMx.Uom, Value = StringHelpers.ToDecimal(bhaRun.ActDoglegMx.Value) },
                DTimStart = bhaRun.DTimStart,
                DTimStop = bhaRun.DTimStop,
                DTimStartDrilling = bhaRun.DTimStartDrilling,
                DTimStopDrilling = bhaRun.DTimStopDrilling,
                CommonData = new CommonData()
                {
                    ItemState = bhaRun.CommonData.ItemState,
                    SourceName = bhaRun.CommonData.SourceName,
                    DTimLastChange = bhaRun.CommonData.DTimLastChange,
                    DTimCreation = bhaRun.CommonData.DTimCreation,
                    ServiceCategory = bhaRun.CommonData.ServiceCategory,
                    Comments = bhaRun.CommonData.Comments,
                    DefaultDatum = bhaRun.CommonData.DefaultDatum,
                }
            };
        }
    }
}
