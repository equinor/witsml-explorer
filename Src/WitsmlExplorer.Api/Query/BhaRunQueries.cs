using Witsml.Data;
using Witsml.Data.Measures;
using Witsml.Extensions;

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
                }.AsItemInList()
            };
        }
    }
}
