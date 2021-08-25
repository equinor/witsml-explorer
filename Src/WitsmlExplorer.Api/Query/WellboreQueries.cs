using System;
using Witsml.Data;
using Witsml.Data.Measures;
using Witsml.Extensions;
using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Query
{
    public static class WellboreQueries
    {
        public static WitsmlWellbores GetAllWitsmlWellbores()
        {
            return new WitsmlWellbores
            {
                Wellbores = new WitsmlWellbore
                {
                    Uid = "",
                    UidWell = "",
                    Name = "",
                    NameWell = "",
                    TypeWellbore = "",
                    StatusWellbore = "",
                    IsActive = "",
                    CommonData = new WitsmlCommonData()
                }.AsSingletonList()
            };
        }

        public static WitsmlWellbores GetWitsmlWellboreByWell(string wellUid)
        {
            return new WitsmlWellbores
            {
                Wellbores = new WitsmlWellbore
                {
                    Uid = "",
                    UidWell = wellUid,
                    CommonData = new WitsmlCommonData()
                }.AsSingletonList()
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
                }.AsSingletonList()
            };
        }

        public static WitsmlWellbores UpdateWitsmlWellbore(Wellbore wellbore)
        {
            var witsmlWellbore = new WitsmlWellbore
            {
                Uid = wellbore.Uid,
                UidWell = wellbore.WellUid
            };

            if (!string.IsNullOrEmpty(wellbore.Name))
                witsmlWellbore.Name = wellbore.Name;

            if (!string.IsNullOrEmpty(wellbore.Number))
                witsmlWellbore.Number = wellbore.Number;

            if (!string.IsNullOrEmpty(wellbore.SuffixAPI))
                witsmlWellbore.SuffixAPI = wellbore.SuffixAPI;

            if (!string.IsNullOrEmpty(wellbore.NumGovt))
                witsmlWellbore.NumGovt = wellbore.NumGovt;

            if (wellbore.DTimeKickoff != null)
                witsmlWellbore.DTimKickoff = ((DateTime) wellbore.DTimeKickoff).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ");

            if (wellbore.Md != null)
                witsmlWellbore.Md = new WitsmlMeasuredDepthCoord { Uom = wellbore.Md.Uom, Value = wellbore.Md.Value.ToString() };

            if (wellbore.Tvd != null)
                witsmlWellbore.Tvd = new WitsmlWellVerticalDepthCoord { Uom = wellbore.Tvd.Uom, Value = wellbore.Tvd.Value.ToString() };

            if (wellbore.MdKickoff != null)
                witsmlWellbore.MdKickoff = new WitsmlMeasuredDepthCoord { Uom = wellbore.MdKickoff.Uom, Value = wellbore.MdKickoff.Value.ToString() };

            if (wellbore.TvdKickoff != null)
                witsmlWellbore.TvdKickoff = new WitsmlWellVerticalDepthCoord { Uom = wellbore.TvdKickoff.Uom, Value = wellbore.TvdKickoff.Value.ToString() };

            if (wellbore.MdPlanned != null)
                witsmlWellbore.MdPlanned = new WitsmlMeasuredDepthCoord { Uom = wellbore.MdPlanned.Uom, Value = wellbore.MdPlanned.Value.ToString() };

            if (wellbore.TvdPlanned != null)
                witsmlWellbore.TvdPlanned = new WitsmlWellVerticalDepthCoord { Uom = wellbore.TvdPlanned.Uom, Value = wellbore.TvdPlanned.Value.ToString() };

            if (wellbore.MdSubSeaPlanned != null)
                witsmlWellbore.MdSubSeaPlanned = new WitsmlMeasuredDepthCoord { Uom = wellbore.MdSubSeaPlanned.Uom, Value = wellbore.MdSubSeaPlanned.Value.ToString() };

            if (wellbore.TvdSubSeaPlanned != null)
                witsmlWellbore.TvdSubSeaPlanned = new WitsmlWellVerticalDepthCoord { Uom = wellbore.TvdSubSeaPlanned.Uom, Value = wellbore.TvdSubSeaPlanned.Value.ToString() };

            if (wellbore.DayTarget != null)
                witsmlWellbore.DayTarget = new WitsmlDayMeasure { Uom = wellbore.DayTarget.Uom, Value = wellbore.DayTarget.Value.ToString() };

            return new WitsmlWellbores
            {
                Wellbores = witsmlWellbore.AsSingletonList()
            };
        }

        public static WitsmlWellbores CreateWitsmlWellbore(Wellbore wellbore)
        {
            if (!string.IsNullOrEmpty(wellbore.WellboreParentUid))
            {
                return new WitsmlWellbores
                {
                    Wellbores = new WitsmlWellbore
                    {
                        Uid = wellbore.Uid,
                        Name = wellbore.Name,
                        UidWell = wellbore.WellUid,
                        NameWell = wellbore.WellName,
                        ParentWellbore = new WitsmlParentWellbore
                        {
                            UidRef = wellbore.WellboreParentUid,
                            Value = wellbore.WellboreParentName
                        },
                        PurposeWellbore = wellbore.WellborePurpose

                    }.AsSingletonList()
                };
            }

            return new WitsmlWellbores
            {
                Wellbores = new WitsmlWellbore
                {
                    Uid = wellbore.Uid,
                    Name = wellbore.Name,
                    UidWell = wellbore.WellUid,
                    NameWell = wellbore.WellName,
                    PurposeWellbore = wellbore.WellborePurpose
                }.AsSingletonList()
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
                }.AsSingletonList()
            };
        }
    }
}
