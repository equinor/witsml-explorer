using Witsml.Data;
using Witsml.Extensions;

namespace Witsml.Query
{
    public static class WellboreQueries
    {
        public static WitsmlWellbores QueryAll()
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

        public static WitsmlWellbores QueryByWell(string wellUid)
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

        public static WitsmlWellbores QueryByUid(string wellUid, string wellboreUid)
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

        public static WitsmlWellbores UpdateWellboreQuery(string wellUid, string wellboreUid)
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

        public static WitsmlWellbores DeleteWellboreQuery(string wellUid, string wellboreUid)
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
