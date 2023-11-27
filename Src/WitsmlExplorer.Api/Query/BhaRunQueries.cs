using System.Globalization;
using System.Linq;

using Witsml.Data;
using Witsml.Data.Measures;
using Witsml.Extensions;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Query
{
    public static class BhaRunQueries
    {
        public static WitsmlBhaRuns GetWitsmlBhaRun(string wellUid, string wellboreUid, string bhaRunUid = "")
        {
            return new WitsmlBhaRuns
            {
                BhaRuns = new WitsmlBhaRun
                {
                    Uid = bhaRunUid,
                    UidWell = wellUid,
                    UidWellbore = wellboreUid,
                    NameWell = "",
                    NameWellbore = "",
                    Name = "",
                    NumStringRun = "",
                    Tubular = new WitsmlRefNameString
                    {
                        UidRef = "",
                        Value = ""
                    },
                    DTimStart = "",
                    DTimStop = "",
                    DTimStartDrilling = "",
                    DTimStopDrilling = "",
                    PlanDogleg = new WitsmlAnglePerLengthMeasure() { Uom = "" },
                    ActDogleg = new WitsmlAnglePerLengthMeasure() { Uom = "" },
                    ActDoglegMx = new WitsmlAnglePerLengthMeasure() { Uom = "" },
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

        public static WitsmlBhaRuns GetWitsmlBhaRunsById(string wellUid, string wellboreUid, string[] bhaRunUids)
        {
            return new WitsmlBhaRuns
            {
                BhaRuns = bhaRunUids.Select((bhaRunUid) => new WitsmlBhaRun
                {
                    Uid = bhaRunUid,
                    UidWell = wellUid,
                    UidWellbore = wellboreUid
                }).ToList()
            };
        }

        public static WitsmlBhaRuns CreateBhaRun(BhaRun bhaRun)
        {
            return new WitsmlBhaRuns
            {
                BhaRuns = new WitsmlBhaRun
                {
                    UidWell = bhaRun.WellUid,
                    NameWell = bhaRun.WellName,
                    UidWellbore = bhaRun.WellboreUid,
                    NameWellbore = bhaRun.WellboreName,
                    Uid = bhaRun.Uid,
                    Name = bhaRun.Name,
                    NumStringRun = bhaRun.NumStringRun,
                    Tubular = new WitsmlRefNameString
                    {
                        UidRef = bhaRun.Tubular.UidRef,
                        Value = bhaRun.Tubular.Value
                    },
                    StatusBha = bhaRun.StatusBha ?? null,
                    NumBitRun = bhaRun.NumBitRun,
                    ReasonTrip = bhaRun.ReasonTrip,
                    ObjectiveBha = bhaRun.ObjectiveBha,
                    PlanDogleg = bhaRun.PlanDogleg != null ? new WitsmlAnglePerLengthMeasure { Uom = bhaRun.PlanDogleg.Uom, Value = bhaRun.PlanDogleg.Value.ToString(CultureInfo.InvariantCulture) } : null,
                    ActDogleg = bhaRun.ActDogleg != null ? new WitsmlAnglePerLengthMeasure { Uom = bhaRun.ActDogleg.Uom, Value = bhaRun.ActDogleg.Value.ToString(CultureInfo.InvariantCulture) } : null,
                    ActDoglegMx = bhaRun.ActDoglegMx != null ? new WitsmlAnglePerLengthMeasure { Uom = bhaRun.ActDoglegMx.Uom, Value = bhaRun.ActDoglegMx.Value.ToString(CultureInfo.InvariantCulture) } : null,
                    DTimStart = StringHelpers.ToUniversalDateTimeString(bhaRun.DTimStart),
                    DTimStop = StringHelpers.ToUniversalDateTimeString(bhaRun.DTimStop),
                    DTimStartDrilling = StringHelpers.ToUniversalDateTimeString(bhaRun.DTimStartDrilling),
                    DTimStopDrilling = StringHelpers.ToUniversalDateTimeString(bhaRun.DTimStopDrilling),
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
