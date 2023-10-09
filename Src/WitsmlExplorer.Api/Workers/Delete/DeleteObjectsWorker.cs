using System;
using System.Collections.Generic;
using System.Linq;
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
        Task<(WorkerResult, RefreshAction)> Execute(DeleteObjectsJob job);
    }

    public class DeleteObjectsWorker : BaseWorker<DeleteObjectsJob>, IWorker, IDeleteObjectsWorker
    {
        public JobType JobType => JobType.DeleteObjects;

        public DeleteObjectsWorker(ILogger<DeleteObjectsJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider, logger)
        { }

        public override async Task<(WorkerResult, RefreshAction)> Execute(DeleteObjectsJob job)
        {
            job.ToDelete.Verify();
            IEnumerable<WitsmlObjectOnWellbore> queries = ObjectQueries.DeleteObjectsQuery(job.ToDelete);
            RefreshObjects refreshAction = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), job.ToDelete.WellUid, job.ToDelete.WellboreUid, job.ToDelete.ObjectType);
            return await DeleteObjectsOnWellbore(queries, refreshAction);
        }

        private async Task<(WorkerResult, RefreshAction)> DeleteObjectsOnWellbore(IEnumerable<WitsmlObjectOnWellbore> queries, RefreshAction refreshAction)
        {
            IWitsmlClient witsmlClient = GetTargetWitsmlClientOrThrow();
            string uidWell = queries.First().UidWell;
            string uidWellbore = queries.First().UidWellbore;

            bool error = false;
            List<string> successUids = new();
            string errorReason = null;

            await Task.WhenAll(queries.Select(async (query) =>
            {
                try
                {
                    QueryResult result = await witsmlClient.DeleteFromStoreAsync(query.AsSingletonWitsmlList());
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

            string successString = successUids.Count > 0 ? $"Deleted {queries.First().GetType().Name}s: {string.Join(", ", successUids)}." : "";
            return !error
                ? (new WorkerResult(witsmlClient.GetServerHostname(), true, successString), refreshAction)
                : (new WorkerResult(witsmlClient.GetServerHostname(), false, $"{successString} Failed to delete some {queries.First().GetType().Name}s", errorReason, null), successUids.Count > 0 ? refreshAction : null);
        }
    }
}
