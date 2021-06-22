using Witsml.Data;
using Witsml.Extensions;
using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Query
{
    public static class WellQueries
    {
        public static WitsmlWells GetAllWitsmlWells()
        {
            return GetWitsmlWell();
        }

        public static WitsmlWells GetWitsmlWellByUid(string wellUid)
        {
            return GetWitsmlWell(wellUid);
        }

        public static WitsmlWells CreateWitsmlWell(Well well)
        {
            return new WitsmlWells
            {
                Wells = new WitsmlWell
                {
                    Uid = well.Uid,
                    Name = well.Name,
                    Field = well.Field.NullIfEmpty(),
                    Country = well.Country.NullIfEmpty(),
                    Operator = well.Operator.NullIfEmpty(),
                    TimeZone = well.TimeZone
                }.AsSingletonList()
            };
        }

        public static WitsmlWells UpdateWitsmlWell(string wellUid, string name)
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

        public static WitsmlWells UpdateWitsmlWell(Well well)
        {
            return new WitsmlWells
            {
                Wells = new WitsmlWell
                {
                    Uid = well.Uid,
                    Name = well.Name,
                    Field = well.Field,
                    TimeZone = well.TimeZone,
                    Country = well.Country,
                    Operator = well.Operator
                }.AsSingletonList()
            };
        }

        public static WitsmlWells DeleteWitsmlWell(string wellUid)
        {
            return new WitsmlWells {Wells = new WitsmlWell {Uid = wellUid}.AsSingletonList()};
        }

        private static WitsmlWells GetWitsmlWell(string wellUid = "")
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
