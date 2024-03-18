using System.Collections.Generic;
using System.Linq;

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

        public static void EnsureIndexCurveIsFirst(this WitsmlLogs witsmlLogs)
        {
            foreach (var log in witsmlLogs.Logs)
            {
                log.EnsureIndexCurveIsFirst();
            }
        }

        public static void EnsureIndexCurveIsFirst(this WitsmlLog witsmlLog)
        {
            witsmlLog.LogCurveInfo.EnsureIndexCurveIsFirst(witsmlLog.IndexCurve?.Value);
        }

        public static void EnsureIndexCurveIsFirst(this IList<WitsmlLogCurveInfo> witsmlLogCurveInfos, string indexCurve)
        {
            PlaceIndexCurveFirst(witsmlLogCurveInfos, indexCurve);
        }

        private static void PlaceIndexCurveFirst(IList<WitsmlLogCurveInfo> witsmlLogCurveInfos, string indexCurve)
        {
            if (indexCurve == null) return;

            var indexCurveInfo = witsmlLogCurveInfos.FirstOrDefault(lci => lci.Mnemonic == indexCurve);
            if (indexCurveInfo == null) return;

            witsmlLogCurveInfos.Remove(indexCurveInfo);
            witsmlLogCurveInfos.Insert(0, indexCurveInfo);
        }
    }
}
