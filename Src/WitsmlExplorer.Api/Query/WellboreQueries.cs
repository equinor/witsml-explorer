using System.Globalization;

using Witsml.Data;
using Witsml.Data.Measures;
using Witsml.Extensions;

using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Query
{
    public static class WellboreQueries
    {
        public static WitsmlWellbores GetWitsmlWellboreByWell(string wellUid = "")
        {
            return new WitsmlWellbores
            {
                Wellbores = new WitsmlWellbore
                {
                    Uid = "",
                    UidWell = wellUid,
                    Name = "",
                    NameWell = "",
                    TypeWellbore = "",
                    StatusWellbore = "",
                    IsActive = "",
                    CommonData = new WitsmlCommonData()
                    {
                        DTimCreation = "",
                        DTimLastChange = ""
                    }
                }.AsItemInList()
            };
        }

        public static WitsmlWellbores GetWitsmlWellboreByUid(string wellUid, string wellboreUid)
        {
            return new WitsmlWellbores
            {
                Wellbores = new WitsmlWellbore
                {
                    Uid = wellboreUid,
                    UidWell = wellUid,
                    Name = "",
                    NameWell = ""
                }.AsItemInList()
            };
        }

        public static WitsmlWellbores UpdateWitsmlWellbore(Wellbore wellbore)
        {
            WitsmlWellbore witsmlWellbore = new()
            {
                Uid = wellbore.Uid,
                UidWell = wellbore.WellUid,
            };

            if (!string.IsNullOrEmpty(wellbore.Name))
            {
                witsmlWellbore.Name = wellbore.Name;
            }

            if (!string.IsNullOrEmpty(wellbore.Number))
            {
                witsmlWellbore.Number = wellbore.Number;
            }

            if (!string.IsNullOrEmpty(wellbore.SuffixAPI))
            {
                witsmlWellbore.SuffixAPI = wellbore.SuffixAPI;
            }

            if (!string.IsNullOrEmpty(wellbore.NumGovt))
            {
                witsmlWellbore.NumGovt = wellbore.NumGovt;
            }

            if (!string.IsNullOrEmpty(wellbore.WellborePurpose))
            {
                witsmlWellbore.PurposeWellbore = wellbore.WellborePurpose;
            }

            if (wellbore.DTimeKickoff != null)
            {
                witsmlWellbore.DTimKickoff = wellbore.DTimeKickoff;
            }

            if (wellbore.Md != null)
            {
                witsmlWellbore.Md = new WitsmlMeasuredDepthCoord { Uom = wellbore.Md.Uom, Value = wellbore.Md.Value.ToString(CultureInfo.InvariantCulture) };
            }

            if (wellbore.Tvd != null)
            {
                witsmlWellbore.Tvd = new WitsmlWellVerticalDepthCoord { Uom = wellbore.Tvd.Uom, Value = wellbore.Tvd.Value.ToString(CultureInfo.InvariantCulture) };
            }

            if (wellbore.MdKickoff != null)
            {
                witsmlWellbore.MdKickoff = new WitsmlMeasuredDepthCoord { Uom = wellbore.MdKickoff.Uom, Value = wellbore.MdKickoff.Value.ToString(CultureInfo.InvariantCulture) };
            }

            if (wellbore.TvdKickoff != null)
            {
                witsmlWellbore.TvdKickoff = new WitsmlWellVerticalDepthCoord { Uom = wellbore.TvdKickoff.Uom, Value = wellbore.TvdKickoff.Value.ToString(CultureInfo.InvariantCulture) };
            }

            if (wellbore.MdPlanned != null)
            {
                witsmlWellbore.MdPlanned = new WitsmlMeasuredDepthCoord { Uom = wellbore.MdPlanned.Uom, Value = wellbore.MdPlanned.Value.ToString(CultureInfo.InvariantCulture) };
            }

            if (wellbore.TvdPlanned != null)
            {
                witsmlWellbore.TvdPlanned = new WitsmlWellVerticalDepthCoord { Uom = wellbore.TvdPlanned.Uom, Value = wellbore.TvdPlanned.Value.ToString(CultureInfo.InvariantCulture) };
            }

            if (wellbore.MdSubSeaPlanned != null)
            {
                witsmlWellbore.MdSubSeaPlanned = new WitsmlMeasuredDepthCoord { Uom = wellbore.MdSubSeaPlanned.Uom, Value = wellbore.MdSubSeaPlanned.Value.ToString(CultureInfo.InvariantCulture) };
            }

            if (wellbore.TvdSubSeaPlanned != null)
            {
                witsmlWellbore.TvdSubSeaPlanned = new WitsmlWellVerticalDepthCoord { Uom = wellbore.TvdSubSeaPlanned.Uom, Value = wellbore.TvdSubSeaPlanned.Value.ToString(CultureInfo.InvariantCulture) };
            }

            if (wellbore.DayTarget != null)
            {
                witsmlWellbore.DayTarget = new WitsmlDayMeasure { Uom = wellbore.DayTarget.Uom, Value = wellbore.DayTarget.Value.ToString(CultureInfo.InvariantCulture) };
            }

            if (!string.IsNullOrEmpty(wellbore.Comments))
            {
                witsmlWellbore.CommonData ??= new WitsmlCommonData();
                witsmlWellbore.CommonData.Comments = wellbore.Comments;
            }

            return new WitsmlWellbores
            {
                Wellbores = witsmlWellbore.AsItemInList()
            };
        }

        public static WitsmlWellbores CreateWitsmlWellbore(Wellbore wellbore)
        {
            WitsmlParentWellbore parentWellbore = (wellbore.WellboreParentUid == null && wellbore.WellboreParentName == null) ? null
                : new WitsmlParentWellbore
                {
                    UidRef = wellbore.WellboreParentUid,
                    Value = wellbore.WellboreParentName
                };
            return new WitsmlWellbores
            {
                Wellbores = new WitsmlWellbore
                {
                    Uid = wellbore.Uid,
                    Name = wellbore.Name,
                    UidWell = wellbore.WellUid,
                    NameWell = wellbore.WellName,
                    ParentWellbore = parentWellbore,
                    StatusWellbore = wellbore.WellboreStatus,
                    TypeWellbore = wellbore.WellboreType,
                    Number = wellbore.Number,
                    SuffixAPI = wellbore.SuffixAPI,
                    NumGovt = wellbore.NumGovt,
                    Shape = wellbore.Shape,
                    DTimKickoff = wellbore.DTimeKickoff,
                    PurposeWellbore = wellbore.WellborePurpose,
                    Md = wellbore.Md?.ToWitsml<WitsmlMeasuredDepthCoord>(),
                    Tvd = wellbore.Tvd?.ToWitsml<WitsmlWellVerticalDepthCoord>(),
                    MdKickoff = wellbore.MdKickoff?.ToWitsml<WitsmlMeasuredDepthCoord>(),
                    TvdKickoff = wellbore.TvdKickoff?.ToWitsml<WitsmlWellVerticalDepthCoord>(),
                    MdPlanned = wellbore.MdPlanned?.ToWitsml<WitsmlMeasuredDepthCoord>(),
                    TvdPlanned = wellbore.TvdPlanned?.ToWitsml<WitsmlWellVerticalDepthCoord>(),
                    MdSubSeaPlanned = wellbore.MdSubSeaPlanned?.ToWitsml<WitsmlMeasuredDepthCoord>(),
                    TvdSubSeaPlanned = wellbore.TvdSubSeaPlanned?.ToWitsml<WitsmlWellVerticalDepthCoord>(),
                    DayTarget = wellbore.DayTarget?.ToWitsml(),
                    CommonData = wellbore.Comments == null ? null : new WitsmlCommonData
                    {
                        Comments = wellbore.Comments
                    }
                }.AsItemInList()
            };
        }

        public static WitsmlWellbores DeleteWitsmlWellbore(string wellUid, string wellboreUid)
        {
            return new WitsmlWellbores
            {
                Wellbores = new WitsmlWellbore
                {
                    Uid = wellboreUid,
                    UidWell = wellUid
                }.AsItemInList()
            };
        }
    }
}
