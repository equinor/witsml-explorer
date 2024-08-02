using Witsml.Data;
using Witsml.Data.Measures;
using Witsml.Data.Rig;
using Witsml.Extensions;

namespace WitsmlExplorer.Api.Query
{
    public static class RigQueries
    {
        public static WitsmlRigs GetWitsmlRig(string wellUid, string wellboreUid, string rigUid = "")
        {
            return new WitsmlRigs
            {
                Rigs = new WitsmlRig
                {
                    AirGap = Measure.ToFetch<WitsmlLengthMeasure>(),
                    Approvals = "",
                    ClassRig = "",
                    DTimStartOp = "",
                    DTimEndOp = "",
                    EmailAddress = "",
                    FaxNumber = "",
                    IsOffshore = "",
                    Manufacturer = "",
                    Name = "",
                    NameWell = "",
                    NameWellbore = "",
                    NameContact = "",
                    Owner = "",
                    Registration = "",
                    RatingDrillDepth = Measure.ToFetch<WitsmlLengthMeasure>(),
                    RatingWaterDepth = Measure.ToFetch<WitsmlLengthMeasure>(),
                    TelNumber = "",
                    TypeRig = "",
                    Uid = rigUid,
                    UidWell = wellUid,
                    UidWellbore = wellboreUid,
                    YearEntService = "",
                    CommonData = new WitsmlCommonData()
                    {
                        DTimCreation = "",
                        DTimLastChange = "",
                        ItemState = ""
                    }
                }.AsItemInList()
            };
        }
    }
}
