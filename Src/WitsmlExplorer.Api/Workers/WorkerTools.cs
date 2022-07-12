using System.Linq;
using System.Threading.Tasks;
using Witsml;
using Witsml.Data;
using Witsml.ServiceReference;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Query;
using Serilog;
using System.Collections.Generic;

namespace WitsmlExplorer.Api.Workers
{
    public static class WorkerTools
    {
        public static async Task<WitsmlWellbore> GetWellbore(IWitsmlClient client, WellboreReference wellboreReference)
        {
            var query = WellboreQueries.GetWitsmlWellboreByUid(wellboreReference.WellUid, wellboreReference.WellboreUid);
            var wellbores = await client.GetFromStoreAsync(query, new OptionsIn(ReturnElements.Requested));
            return !wellbores.Wellbores.Any() ? null : wellbores.Wellbores.First();
        }

        public static async Task<WitsmlLog> GetLog(IWitsmlClient client, LogReference logReference, ReturnElements optionsInReturnElements)
        {
            var logQuery = LogQueries.GetWitsmlLogById(logReference.WellUid, logReference.WellboreUid, logReference.LogUid);
            var result = await client.GetFromStoreAsync(logQuery, new OptionsIn(optionsInReturnElements));
            return !result.Logs.Any() ? null : result.Logs.First();
        }

        public static void LogSuccess(string jobType, string sourceWell, string sourceWellbore, string objectType, string sourceObject, string targetWell, string targetWellbore)
        {
            Log.Information(
                    "{JobType} - Job successful. Source: UidWell: {SourceWell}, UidWellbore: {SourceWellbore}, {objectType}Uid: {sourceObject}. " +
                    "Target: UidWell: {TargetWell}, UidWellbore: {TargetWellbore}", jobType, sourceWell, sourceWellbore, objectType, sourceObject, targetWell, targetWellbore);
        }

        public static void LogError(string jobType, string sourceWell, string sourceWellbore, string objectType, string sourceObject, string targetWell, string targetWellbore)
        {
            Log.Error(
                    "{JobType} - Job failed. Source: UidWell: {SourceWell}, UidWellbore: {SourceWellbore}, {objectType}Uid: {sourceObject}. " +
                    "Target: UidWell: {TargetWell}, UidWellbore: {TargetWellbore}", jobType, sourceWell, sourceWellbore, objectType, sourceObject, targetWell, targetWellbore);
        }

    }
}
