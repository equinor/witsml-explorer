using System.Collections.Generic;
using System.Globalization;
using System.Linq;

using Witsml.Data;
using Witsml.Data.Measures;
using Witsml.Extensions;

using WitsmlExplorer.Api.Models;

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
                    EmailAddress = "",
                    FaxNumber = "",
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
                    EmailAddress = "",
                    FaxNumber = "",
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
        public static IEnumerable<WitsmlRigs> DeleteRigQuery(string wellUid, string wellboreUid, string[] rigUids)
        {
            return rigUids.Select((rigUid) =>
                new WitsmlRigs
                {
                    Rigs = new WitsmlRig
                    {
                        Uid = rigUid,
                        UidWell = wellUid,
                        UidWellbore = wellboreUid
                    }.AsSingletonList()
                }
            );
        }
        public static WitsmlRigs CreateRig(Rig rig)
        {
            return new WitsmlRigs
            {
                Rigs = new WitsmlRig
                {
                    UidWell = rig.UidWell,
                    NameWell = rig.NameWell,
                    NameWellbore = rig.NameWellbore,
                    Uid = rig.Uid,
                    AirGap = rig.AirGap != null ? new WitsmlLengthMeasure { Uom = rig.AirGap.Uom, Value = rig.AirGap.Value.ToString(CultureInfo.InvariantCulture) } : null,
                    Name = rig.Name,
                    TypeRig = rig.TypeRig,
                    Owner = rig.Owner,
                    UidWellbore = rig.UidWellbore,
                    Approvals = rig.Approvals,
                    ClassRig = rig.ClassRig,
                    DTimStartOp = rig.DTimStartOp?.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                    DTimEndOp = rig.DTimEndOp?.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                    EmailAddress = rig.EmailAddress,
                    FaxNumber = rig.FaxNumber,
                    IsOffshore = rig.IsOffshore,
                    Manufacturer = rig.Manufacturer,
                    NameContact = rig.NameContact,
                    RatingDrillDepth = rig.RatingDrillDepth != null ? new WitsmlLengthMeasure { Uom = rig.RatingDrillDepth.Uom, Value = rig.RatingDrillDepth.Value.ToString(CultureInfo.InvariantCulture) } : null,
                    RatingWaterDepth = rig.RatingWaterDepth != null ? new WitsmlLengthMeasure { Uom = rig.RatingWaterDepth.Uom, Value = rig.RatingWaterDepth.Value.ToString(CultureInfo.InvariantCulture) } : null,
                    Registration = rig.Registration,
                    TelNumber = rig.TelNumber,
                    YearEntService = rig.YearEntService,
                    CommonData = new WitsmlCommonData()
                    {

                        ItemState = rig.CommonData.ItemState,
                    }

                }.AsSingletonList()
            };
        }

    }
}
