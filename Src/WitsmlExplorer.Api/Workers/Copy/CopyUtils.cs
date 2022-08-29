using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.Data;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers.Copy
{

    public interface ICopyUtils

    {
        public Task<(WorkerResult, RefreshAction)> CopyObjectsOnWellbore<T>(IEnumerable<ObjectOnWellbore<T>> queries, RefreshAction refreshAction, string sourceWellUid, string sourceWellboreUid) where T : IWitsmlQueryType;
    }

    public class CopyUtils : ICopyUtils

    {
        private readonly IWitsmlClient _witsmlClient;
        private readonly ILogger<CopyUtils> _logger;

        public CopyUtils(ILogger<CopyUtils> logger, IWitsmlClientProvider witsmlClientProvider)
        {
            _witsmlClient = witsmlClientProvider.GetClient();
            _logger = logger;
        }

        public async Task<(WorkerResult, RefreshAction)> CopyObjectsOnWellbore<T>(IEnumerable<ObjectOnWellbore<T>> queries, RefreshAction refreshAction, string sourceWellUid, string sourceWellboreUid) where T : IWitsmlQueryType
        {
            bool error = false;
            List<string> successUids = new();
            string errorReason = null;
            EntityDescription errorEnitity = null;
            QueryResult[] results = await Task.WhenAll(queries.Select(async (query) =>
            {
                try
                {
                    QueryResult result = await _witsmlClient.AddToStoreAsync(query.AsSingletonWitsmlList());
                    if (result.IsSuccessful)
                    {
                        _logger.LogInformation(
                        "Copied {Object} successfully, Source: UidWell: {SourceWellUid}, UidWellbore: {SourceWellboreUid}, Uid: {SourceUid}. " +
                        "Target: UidWell: {TargetWellUid}, UidWellbore: {TargetWellboreUid}",
                        query.GetType().Name, sourceWellUid, sourceWellboreUid, query.Uid,
                        query.UidWell, query.UidWellbore);
                        successUids.Add(query.Uid);
                    }
                    else
                    {
                        _logger.LogError(
                        "Failed to copy {Object}, Source: UidWell: {SourceWellUid}, UidWellbore: {SourceWellboreUid}, Uid: {SourceUid}. " +
                        "Target: UidWell: {TargetWellUid}, UidWellbore: {TargetWellboreUid}",
                        query.GetType().Name, sourceWellUid, sourceWellboreUid, query.Uid,
                        query.UidWell, query.UidWellbore);
                        if (!error)
                        {
                            errorReason = result.Reason;
                            errorEnitity = new EntityDescription
                            {
                                WellName = query.NameWell,
                                WellboreName = query.NameWellbore,
                                ObjectName = query.Name
                            };
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

            string successString = successUids.Count > 0 ? $"Copied {queries.First().GetType().Name}s: {string.Join(", ", successUids)}." : "";
            return !error
                ? (new WorkerResult(_witsmlClient.GetServerHostname(), true, successString), refreshAction)
                : (new WorkerResult(_witsmlClient.GetServerHostname(), false, $"{successString} Failed to copy some {queries.First().GetType().Name}s", errorReason, errorEnitity), successUids.Count > 0 ? refreshAction : null);
        }
    }
}
