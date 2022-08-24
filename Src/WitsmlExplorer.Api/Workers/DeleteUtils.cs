using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.Data;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers
{

    public interface IDeleteUtils
    {
        public Task<(WorkerResult, RefreshAction)> DeleteObjectsOnWellbore<T>(IEnumerable<ObjectOnWellbore<T>> queries, RefreshAction refreshAction) where T : IWitsmlQueryType;
    }

    public class DeleteUtils : IDeleteUtils
    {
        private readonly IWitsmlClient _witsmlClient;
        private readonly ILogger<DeleteUtils> _logger;

        public DeleteUtils(ILogger<DeleteUtils> logger, IWitsmlClientProvider witsmlClientProvider)
        {
            _witsmlClient = witsmlClientProvider.GetClient();
            _logger = logger;
        }

        public async Task<(WorkerResult, RefreshAction)> DeleteObjectsOnWellbore<T>(IEnumerable<ObjectOnWellbore<T>> queries, RefreshAction refreshAction) where T : IWitsmlQueryType
        {
            string uidWell = queries.First().UidWell;
            string uidWellbore = queries.First().UidWellbore;

            bool error = false;
            List<string> successUids = new();
            string errorReason = null;

            QueryResult[] results = await Task.WhenAll(queries.Select(async (query) =>
            {
                try
                {
                    QueryResult result = await _witsmlClient.DeleteFromStoreAsync(query.AsSingletonWitsmlList());
                    if (result.IsSuccessful)
                    {
                        _logger.LogInformation("Deleted {ObjectType} successfully, UidWell: {WellUid}, UidWellbore: {WellboreUid}, ObjectUid: {Uid}.",
                        query.GetType().Name, uidWell, uidWellbore, query.Uid);
                        successUids.Add(query.Uid);
                    }
                    else
                    {
                        _logger.LogError("Failed to delete {ObjectType}. WellUid: {WellUid}, WellboreUid: {WellboreUid}, Uid: {Uid}, Reason: {Reason}",
                        query.GetType(),
                        uidWell,
                        uidWellbore,
                        query.Uid,
                        result.Reason);
                        if (!error)
                        {
                            errorReason = result.Reason;
                        }
                        error = true;
                    }
                    return result;
                }
                catch (Exception ex)
                {
                    _logger.LogError("An unexpected exception has occured: {ex}", ex);
                    throw;
                }
            }));

            string successString = successUids.Count > 0 ? $"Deleted {queries.First().GetType()}s: {string.Join(", ", successUids)}." : "";
            return !error
                ? (new WorkerResult(_witsmlClient.GetServerHostname(), true, successString), refreshAction)
                : (new WorkerResult(_witsmlClient.GetServerHostname(), false, $"{successString} Failed to delete some {queries.First().GetType().Name}s", errorReason, null), successUids.Count > 0 ? refreshAction : null);
        }
    }
}
