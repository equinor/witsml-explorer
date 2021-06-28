using Witsml.Data;
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

        public static WitsmlWellbores UpdateWitsmlWellbore(string wellUid, string wellboreUid)
        {
            return new WitsmlWellbores
            {
                Wellbores = new WitsmlWellbore
                {
                    Uid = wellboreUid,
                    UidWell = wellUid,
                    Name = ""
                }.AsSingletonList()
            };
        }

        public static WitsmlWellbores CreateWitsmlWellbore(Wellbore wellbore)
        {
            if (wellbore.WellboreParentUid != "")
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
