using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.Data;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers.Delete
{
    public interface IDeleteObjectsWorker
    {
        Task<(WorkerResult, RefreshAction)> Execute(DeleteObjectsJob job, CancellationToken? cancellationToken = null);
    }

    public class DeleteObjectsWorker : BaseWorker<DeleteObjectsJob>, IWorker, IDeleteObjectsWorker
    {
        public JobType JobType => JobType.DeleteObjects;

        public DeleteObjectsWorker(ILogger<DeleteObjectsJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider, logger)
        { }

        public override async Task<(WorkerResult, RefreshAction)> Execute(DeleteObjectsJob job, CancellationToken? cancellationToken = null)
        {
            job.ToDelete.Verify();
            ICollection<WitsmlObjectOnWellbore> queries = ObjectQueries.DeleteObjectsQuery(job.ToDelete);
            RefreshObjects refreshAction = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), job.ToDelete.WellUid, job.ToDelete.WellboreUid, job.ToDelete.ObjectType);
            return await DeleteObjectsOnWellbore(queries, refreshAction);
        }

        private async Task<(WorkerResult, RefreshAction)> DeleteObjectsOnWellbore(ICollection<WitsmlObjectOnWellbore> queries, RefreshAction refreshAction)
        {
            IWitsmlClient witsmlClient = GetTargetWitsmlClientOrThrow();
            var witsmlObjectOnWellbore = queries.FirstOrDefault();

            string uidWell = witsmlObjectOnWellbore?.UidWell;
            string uidWellbore = witsmlObjectOnWellbore?.UidWellbore;

            bool error = false;
            ConcurrentBag<string> successUids = new();
            string errorReason = null;

            await Task.WhenAll(queries.Select(async (query) =>
            {
                try
                {
                    QueryResult result = await witsmlClient.DeleteFromStoreAsync(query.AsItemInWitsmlList());
                    if (result.IsSuccessful)
                    {
                        Logger.LogInformation("Deleted {ObjectType} successfully, UidWell: {WellUid}, UidWellbore: {WellboreUid}, ObjectUid: {Uid}.",
                        query.GetType().Name, uidWell, uidWellbore, query.Uid);
                        successUids.Add(query.Uid);
                    }
                    else
                    {
                        Logger.LogError("Failed to delete {ObjectType}. WellUid: {WellUid}, WellboreUid: {WellboreUid}, Uid: {Uid}, Reason: {Reason}",
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
                    Logger.LogError("An unexpected exception has occured: {ex}", ex);
                    throw;
                }
            }).ToList());

            string successString = successUids.Count > 0 ? $"Deleted {witsmlObjectOnWellbore?.GetType().Name}s: {string.Join(", ", successUids)}." : "";
            return !error
                ? (new WorkerResult(witsmlClient.GetServerHostname(), true, successString), refreshAction)
                : (new WorkerResult(witsmlClient.GetServerHostname(), false, $"{successString}Failed to delete some {witsmlObjectOnWellbore?.GetType().Name}s", errorReason, null), successUids.Count > 0 ? refreshAction : null);
        }
    }
}
