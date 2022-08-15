using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.Data;

using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Workers
{

    public class DeleteUtils
    {

        public static async Task<(WorkerResult, RefreshAction)> DeleteMultiple<T>(IEnumerable<ObjectOnWellbore<T>> queries, ILogger logger, IWitsmlClient witsmlClient) where T : IWitsmlQueryType
        {
            var uidWell = queries.First().UidWell;
            var uidWellbore = queries.First().UidWellbore;

            bool error = false;
            var successUids = new List<string>();
            var errorReasons = new List<string>();
            var errorEnitities = new List<EntityDescription>();

            logger.LogInformation("{Type}", queries.First().GetType());

            var results = await Task.WhenAll(queries.Select(async (query) =>
            {
                var result = await witsmlClient.DeleteFromStoreAsync(query.AsSingletonWitsmlList());
                if (result.IsSuccessful)
                {
                    logger.LogInformation("Deleted {ObjectType} successfully, UidWell: {WellUid}, UidWellbore: {WellboreUid}, ObjectUid: {Uid}.",
                    query.GetType(), uidWell, uidWellbore, query.Uid);
                    successUids.Add(query.Uid);
                }
                else
                {
                    logger.LogError("Failed to delete {ObjectType}. WellUid: {WellUid}, WellboreUid: {WellboreUid}, Uid: {Uid}, Reason: {Reason}",
                    query.GetType(),
                    uidWell,
                    uidWellbore,
                    query.Uid,
                    result.Reason);
                    error = true;
                    errorReasons.Add(result.Reason);
                    errorEnitities.Add(new EntityDescription
                    {
                        WellName = query.NameWell,
                        WellboreName = query.NameWellbore,
                        ObjectName = query.Name
                    });
                }
                return result;
            }));

            var refreshAction = new RefreshRisks(witsmlClient.GetServerHostname(), uidWell, uidWellbore, RefreshType.Update);
            var successString = successUids.Count > 0 ? $"Deleted {queries.First().GetType()}s: {string.Join(", ", successUids)}." : "";
            if (!error)
            {
                return (new WorkerResult(witsmlClient.GetServerHostname(), true, successString), refreshAction);
            }

            return (new WorkerResult(witsmlClient.GetServerHostname(), false, $"{successString} Failed to delete some {queries.First().GetType()}s", errorReasons.First(), errorEnitities.First()), successUids.Count > 0 ? refreshAction : null);
        }
    }
}
