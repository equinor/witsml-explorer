using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.Data;

using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Workers.Copy
{

    public interface ICopyUtils
    {
        public Task<(WorkerResult, RefreshAction)> CopyObjectsOnWellbore(IWitsmlClient targetClient, IWitsmlClient sourceClient, IEnumerable<WitsmlObjectOnWellbore> queries, RefreshAction refreshAction, string sourceWellUid, string sourceWellboreUid);
    }

    public class CopyUtils : ICopyUtils
    {
        private readonly ILogger<CopyUtils> _logger;

        public CopyUtils(ILogger<CopyUtils> logger)
        {
            _logger = logger;
        }

        public async Task<(WorkerResult, RefreshAction)> CopyObjectsOnWellbore(IWitsmlClient targetClient, IWitsmlClient sourceClient, IEnumerable<WitsmlObjectOnWellbore> queries, RefreshAction refreshAction, string sourceWellUid, string sourceWellboreUid)
        {
            bool error = false;
            List<string> successUids = new();
            string errorReason = null;
            EntityDescription errorEntity = null;
            QueryResult[] results = await Task.WhenAll(queries.Select(async (query) =>
            {
                try
                {
                    QueryResult result = await targetClient.AddToStoreAsync(query.AsItemInWitsmlList());
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
                            errorEntity = new EntityDescription
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
            }).ToList());

            var typeName = queries.FirstOrDefault()?.GetType().Name;
            string successString = successUids.Count > 0 ? $"Copied {typeName}s: {string.Join(", ", successUids)}." : "";
            return !error
                ? (new WorkerResult(targetClient.GetServerHostname(), true, successString, sourceServerUrl: sourceClient.GetServerHostname()), refreshAction)
                : (new WorkerResult(targetClient.GetServerHostname(), false, $"{successString} Failed to copy some {typeName}s", errorReason, errorEntity, sourceServerUrl: sourceClient.GetServerHostname()), successUids.Count > 0 ? refreshAction : null);
        }
    }
}
