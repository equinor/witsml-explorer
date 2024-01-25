using System.Collections.Generic;

using Witsml.Data;
using Witsml.Data.Measures;
using Witsml.Extensions;

using WitsmlExplorer.Api.Models;

using WellDatum = Witsml.Data.WellDatum;

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
                    NumLicense = well.NumLicense.NullIfEmpty(),
                    TimeZone = well.TimeZone
                }.AsItemInList()
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
                }.AsItemInList()
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
                    Operator = well.Operator,
                    NumLicense = well.NumLicense
                }.AsItemInList()
            };
        }

        public static WitsmlWells DeleteWitsmlWell(string wellUid)
        {
            return new WitsmlWells { Wells = new WitsmlWell { Uid = wellUid }.AsItemInList() };
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
                    Country = "",
                    Operator = "",
                    NumLicense = "",
                    TimeZone = "",
                    StatusWell = "",
                    PurposeWell = "",
                    WellDatum = new List<WellDatum>(),
                    WaterDepth = Measure.ToFetch<WitsmlLengthMeasure>(),
                    WellLocation = new List<WitsmlLocation>(),
                    CommonData = new WitsmlCommonData
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
