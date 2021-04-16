using System;
using System.Collections.Generic;
using Witsml.Data;
using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Query
{
    public static class WellUpdateQueries
    {
        public static WitsmlWells UpdateQuery(Well well)
        {
            return new WitsmlWells
            {
                Wells = new List<WitsmlWell>
                {
                    new WitsmlWell
                    {
                        Uid = well.Uid,
                        Name = well.Name,
                        Field = well.Field,
                        TimeZone = well.TimeZone,
                        Country = well.Country,
                        Operator = well.Operator
                    }
                }

            };
        }

        public static WitsmlWells[] UpdateQuery(Well[] wells)
        {
            return Array.ConvertAll(wells, UpdateQuery);
        }
    }
}
