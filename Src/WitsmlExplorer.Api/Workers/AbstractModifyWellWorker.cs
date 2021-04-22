using Witsml.Data;
using Witsml.Extensions;
using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Workers
{
    public abstract class AbstractModifyWellWorker
    {
        protected static WitsmlWells CreateUpdateQuery(Well well)
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
    }
}
