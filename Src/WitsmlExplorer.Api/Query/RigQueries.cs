using System.Collections.Generic;
using System.Globalization;
using System.Linq;

using Witsml.Data;
using Witsml.Data.Measures;
using Witsml.Data.Rig;
using Witsml.Extensions;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;

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
                    Uid = "",
                    UidWell = wellUid,
                    UidWellbore = wellboreUid,
                    YearEntService = "",
                    CommonData = new WitsmlCommonData()
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
                    CommonData = new WitsmlCommonData()
                }.AsSingletonList()
            };
        }

        public static WitsmlRigs QueryByIds(string wellUid, string wellboreUid, string[] rigUids)
        {
            return new WitsmlRigs
            {
                Rigs = rigUids.Select((rigUid) => new WitsmlRig
                {
                    Uid = rigUid,
                    UidWell = wellUid,
                    UidWellbore = wellboreUid
                }).ToList()
            };
        }

        public static IEnumerable<WitsmlRig> DeleteRigQuery(string wellUid, string wellboreUid, string[] rigUids)
        {
            return rigUids.Select((rigUid) =>
                new WitsmlRig
                {
                    Uid = rigUid,
                    UidWell = wellUid,
                    UidWellbore = wellboreUid
                }
            );
        }

        public static IEnumerable<WitsmlRig> CopyWitsmlRigs(WitsmlRigs rigs, WitsmlWellbore targetWellbore)
        {
            return rigs.Rigs.Select((rig) =>
            {
                rig.UidWell = targetWellbore.UidWell;
                rig.NameWell = targetWellbore.NameWell;
                rig.UidWellbore = targetWellbore.Uid;
                rig.NameWellbore = targetWellbore.Name;
                return rig;
            });
        }

        public static WitsmlRigs CreateRig(Rig rig)
        {
            return new WitsmlRigs
            {
                Rigs = new WitsmlRig
                {
                    UidWell = rig.WellUid,
                    NameWell = rig.WellName,
                    NameWellbore = rig.WellboreName,
                    Uid = rig.Uid,
                    AirGap = rig.AirGap != null ? new WitsmlLengthMeasure { Uom = rig.AirGap.Uom, Value = rig.AirGap.Value.ToString(CultureInfo.InvariantCulture) } : null,
                    Name = rig.Name,
                    TypeRig = rig.TypeRig,
                    Owner = rig.Owner,
                    UidWellbore = rig.WellboreUid,
                    Approvals = rig.Approvals,
                    ClassRig = rig.ClassRig,
                    DTimStartOp = rig.DTimStartOp?.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                    DTimEndOp = rig.DTimEndOp?.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                    EmailAddress = rig.EmailAddress,
                    FaxNumber = rig.FaxNumber,
                    IsOffshore = StringHelpers.OptionalBooleanToString(rig.IsOffshore),
                    Manufacturer = rig.Manufacturer,
                    NameContact = rig.NameContact,
                    RatingDrillDepth = rig.RatingDrillDepth != null ? new WitsmlLengthMeasure { Uom = rig.RatingDrillDepth.Uom, Value = rig.RatingDrillDepth.Value.ToString(CultureInfo.InvariantCulture) } : null,
                    RatingWaterDepth = rig.RatingWaterDepth != null ? new WitsmlLengthMeasure { Uom = rig.RatingWaterDepth.Uom, Value = rig.RatingWaterDepth.Value.ToString(CultureInfo.InvariantCulture) } : null,
                    Registration = rig.Registration,
                    TelNumber = rig.TelNumber,
                    YearEntService = rig.YearEntService,
                    CommonData = new WitsmlCommonData()
                    {
                        SourceName = rig.CommonData.SourceName,
                        DTimCreation = null,
                        DTimLastChange = null,
                        ItemState = rig.CommonData.ItemState,
                    }
                }.AsSingletonList()
            };
        }
    }
}
