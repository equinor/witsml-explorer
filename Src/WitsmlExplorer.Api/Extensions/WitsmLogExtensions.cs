using Witsml.Data;
using WitsmlExplorer.Api.Workers;

namespace WitsmlExplorer.Api.Extensions
{
    public static class WitsmLogExtensions
    {
        public static EntityDescription GetDescription(this WitsmlLog witsmlLog)
        {
            return new EntityDescription
            {
                WellName = witsmlLog.NameWell,
                WellboreName = witsmlLog.NameWellbore,
                ObjectName = witsmlLog.Name
            };
        }
    }
}
