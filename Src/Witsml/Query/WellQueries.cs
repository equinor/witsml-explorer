using Witsml.Data;
using Witsml.Extensions;

namespace Witsml.Query
{
    public static class WellQueries
    {
        public static WitsmlWells QueryAll()
        {
            return GetWellQuery();
        }

        public static WitsmlWells QueryByUid(string wellUid)
        {
            return GetWellQuery(wellUid);
        }

        public static WitsmlWells UpdateQuery(string wellUid, string name)
        {
            return new WitsmlWells
            {
                Wells = new WitsmlWell
                {
                    Uid = wellUid,
                    Name = name
                }.AsSingletonList()
            };
        }

        public static WitsmlWells DeleteQuery(string wellUid)
        {
            return new WitsmlWells {Wells = new WitsmlWell {Uid = wellUid}.AsSingletonList()};
        }

        private static WitsmlWells GetWellQuery(string wellUid = "")
        {
            return new WitsmlWells
            {
                Wells = new WitsmlWell
                {
                    Uid = wellUid,
                    Name = "",
                    Field = "",
                    Operator = "",
                    TimeZone = "",
                    CommonData = new WitsmlCommonData
                    {
                        DTimCreation = "",
                        DTimLastChange = "",
                        ItemState = ""
                    }
                }.AsSingletonList()
            };
        }
    }
}
