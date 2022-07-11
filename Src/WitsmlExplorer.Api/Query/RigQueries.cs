using Witsml.Data;
using Witsml.Extensions;

namespace WitsmlExplorer.Api.Query
{
    public static class RigQueries
    {
        public static WitsmlRigs GetWitsmlRigByWellbore(string wellUid, string wellboreUid)
        {
            return new WitsmlRigs
            {
                Rigs = new WitsmlRig
                {
                    AirGap = null,
                    Approvals = "",
                    ClassRig = "",
                    DTimStartOp = null,
                    DTimEndOp = null,
                    DTimCreation = null,
                    DTimLastChange = null,
                    EmailAddress = "",
                    FaxNumber = "",
                    IsOffshoreText = "",
                    IsOffshore = null,
                    Manufacturer = "",
                    Name = "",
                    NameContact = "",
                    Owner = "",
                    Registration = "",
                    RatingDrillDepth = null,
                    RatingWaterDepth = null,
                    TelNumber = "",
                    TypeRig = "",
                    UidWell = wellUid,
                    UidWellbore = wellboreUid,
                    YearEntService = "",
                }.AsSingletonList()
            };
        }

        public static WitsmlRigs GetWitsmlRigById(string wellUid, string wellboreUid, string rigUid)
        {
            return new WitsmlRigs
            {
                Rigs = new WitsmlRig
                {
                    Owner = "",
                    Uid = rigUid,
                    UidWell = wellUid,
                    UidWellbore = wellboreUid,
                    AirGap = null,
                    Approvals = "",
                    ClassRig = "",
                    DTimStartOp = null,
                    DTimEndOp = null,
                    DTimCreation = null,
                    DTimLastChange = null,
                    EmailAddress = "",
                    FaxNumber = "",
                    IsOffshoreText = "",
                    IsOffshore = null,
                    Manufacturer = "",
                    Name = "",
                    NameContact = "",
                    Registration = "",
                    RatingDrillDepth = null,
                    RatingWaterDepth = null,
                    TelNumber = "",
                    TypeRig = "",
                    YearEntService = "",

                }.AsSingletonList()
            };
        }
    }
}
