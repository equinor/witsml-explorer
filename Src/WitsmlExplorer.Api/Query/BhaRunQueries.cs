using System.Globalization;

using Witsml.Data;
using Witsml.Data.Measures;
using Witsml.Extensions;

namespace WitsmlExplorer.Api.Query
{
    public static class BhaRunQueries
    {
        public static WitsmlBhaRuns GetWitsmlBhaRunByUid(string wellUid, string wellboreUid, string bhaRunUid)
        {
            return new WitsmlBhaRuns
            {
                BhaRuns = new WitsmlBhaRun
                {
                    Uid = bhaRunUid,
                    WellUid = wellUid,
                    WellboreUid = wellboreUid,
                    WellName = "",
                    WellboreName = "",
                    Name = "",
                    NumStringRun = "",
                    Tubular = new WitsmlObjectReference
                    {
                        UidRef = "",
                        Value = ""
                    },
                    DTimStart = "",
                    DTimStop = "",
                    DTimStartDrilling = "",
                    DTimStopDrilling = "",
                    PlanDogleg = new WitsmlAnglePerLengthMeasure(),
                    ActDogleg = new WitsmlAnglePerLengthMeasure(),
                    ActDoglegMx = new WitsmlAnglePerLengthMeasure(),
                    StatusBha = "",
                    NumBitRun = "",
                    ReasonTrip = "",
                    ObjectiveBha = "",
                    CommonData = new WitsmlCommonData()
                    {
                        ItemState = "",
                        SourceName = "",
                        DTimLastChange = "",
                        DTimCreation = "",
                        ServiceCategory = "",
                        Comments = "",
                        DefaultDatum = "",
                    }
                }.AsSingletonList()
            };
        }

        public static WitsmlBhaRuns GetWitsmlBhaRunByWellbore(string wellUid, string wellboreUid)
        {
            return new WitsmlBhaRuns
            {
                BhaRuns = new WitsmlBhaRun
                {
                    Uid = "",
                    WellUid = wellUid,
                    WellboreUid = wellboreUid,
                    WellName = "",
                    WellboreName = "",
                    Name = "",
                    NumStringRun = "",
                    Tubular = new WitsmlObjectReference
                    {
                        UidRef = "",
                        Value = ""
                    },
                    DTimStart = "",
                    DTimStop = "",
                    DTimStartDrilling = "",
                    DTimStopDrilling = "",
                    PlanDogleg = new WitsmlAnglePerLengthMeasure(),
                    ActDogleg = new WitsmlAnglePerLengthMeasure(),
                    ActDoglegMx = new WitsmlAnglePerLengthMeasure(),
                    StatusBha = "",
                    NumBitRun = "",
                    ReasonTrip = "",
                    ObjectiveBha = "",
                    CommonData = new WitsmlCommonData()
                    {
                        ItemState = "",
                        SourceName = "",
                        DTimLastChange = "",
                        DTimCreation = "",
                        ServiceCategory = "",
                        Comments = "",
                        DefaultDatum = "",
                    }
                }.AsSingletonList()
            };
        }
        public static WitsmlBhaRuns CreateBhaRun(BhaRun bhaRun)
        {
            return new WitsmlBhaRuns
            {
                BhaRuns = new WitsmlBhaRun
                {
                    WellUid = bhaRun.WellUid,
                    WellName = bhaRun.WellName,
                    WellboreUid = bhaRun.WellboreUid,
                    WellboreName = bhaRun.WellboreName,
                    Uid = bhaRun.Uid,
                    Name = bhaRun.Name,
                    NumStringRun = bhaRun.NumStringRun,
                    Tubular = new WitsmlObjectReference
                    {
                        UidRef = bhaRun.TubularUidRef,
                        Value = bhaRun.Tubular
                    },
                    StatusBha = (bhaRun.StatusBha == null) ? null : bhaRun.StatusBha,
                    NumBitRun = bhaRun.NumBitRun,
                    ReasonTrip = bhaRun.ReasonTrip,
                    ObjectiveBha = bhaRun.ObjectiveBha,
                    PlanDogleg = bhaRun.PlanDogleg != null ? new WitsmlAnglePerLengthMeasure { Uom = bhaRun.PlanDogleg.Uom, Value = bhaRun.PlanDogleg.Value.ToString(CultureInfo.InvariantCulture) } : null,
                    ActDogleg = bhaRun.ActDogleg != null ? new WitsmlAnglePerLengthMeasure { Uom = bhaRun.ActDogleg.Uom, Value = bhaRun.ActDogleg.Value.ToString(CultureInfo.InvariantCulture) } : null,
                    ActDoglegMx = bhaRun.ActDoglegMx != null ? new WitsmlAnglePerLengthMeasure { Uom = bhaRun.ActDoglegMx.Uom, Value = bhaRun.ActDoglegMx.Value.ToString(CultureInfo.InvariantCulture) } : null,
                    DTimStart = bhaRun.DTimStart?.ToUniversalTime
                    ().ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                    DTimStop = bhaRun.DTimStop?.ToUniversalTime
                    ().ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                    DTimStartDrilling = bhaRun.DTimStartDrilling?.ToUniversalTime
                    ().ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                    DTimStopDrilling = bhaRun.DTimStopDrilling?.ToUniversalTime
                    ().ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                    CommonData = new WitsmlCommonData()
                    {
                        ItemState = bhaRun.CommonData.ItemState,
                        SourceName = bhaRun.CommonData.SourceName,
                        DTimLastChange = null,
                        DTimCreation = null,
                        ServiceCategory = bhaRun.CommonData.ServiceCategory,
                        Comments = bhaRun.CommonData.Comments,
                        DefaultDatum = bhaRun.CommonData.DefaultDatum,
                    }
                }.AsSingletonList()
            };
        }
    }
}
