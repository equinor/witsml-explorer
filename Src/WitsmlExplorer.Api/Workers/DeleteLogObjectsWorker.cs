using System;
using System.Linq;
using System.Threading.Tasks;
using Serilog;
using Witsml;
using Witsml.Data;
using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;
using Witsml.Extensions;

namespace WitsmlExplorer.Api.Workers
{
    public interface IDeleteLogObjectsWorker
    {
        Task<(WorkerResult workerResult, RefreshWellbore refreshAction)> Execute(DeleteLogObjectsJob job);
    }

    public class DeleteLogObjectsWorker : IDeleteLogObjectsWorker
    {
        private readonly IWitsmlClient witsmlClient;

        public DeleteLogObjectsWorker(IWitsmlClientProvider witsmlClientProvider)
        {
            witsmlClient = witsmlClientProvider.GetClient();
        }

        public async Task<(WorkerResult workerResult, RefreshWellbore refreshAction)> Execute(DeleteLogObjectsJob job)
        {
            (WorkerResult workerResult, RefreshWellbore refreshAction) results;

            if (!job.LogReferences.Any()) throw new ArgumentException($"A minimum of one job is required");
            if (job.LogReferences.Select(l => l.WellboreUid).Distinct().Count() != 1)  throw new ArgumentException($"All logs should belong to the same Wellbore");

            var wellUid = job.LogReferences.FirstOrDefault().WellUid;
            var wellboreUid = job.LogReferences.FirstOrDefault().WellboreUid;

            var logsExpanded = $"[ {string.Join(", ",job.LogReferences.Select(l=>l.LogUid))} ]";
            var jobDescription = $"Delete {job.LogReferences.Count()} Logs under wellUid: {wellUid}, wellboreUid: {wellboreUid}. Logs: {logsExpanded}";

            var queries = job.LogReferences.Select( l => CreateRequest(l) );
            var tasks = queries.Select(q=> witsmlClient.DeleteFromStoreAsync(q));

            await Task.WhenAll(tasks);
            if (tasks.Any(t => t.IsFaulted))
            {
                var numFailed = tasks.Count(t => !t.Result.IsSuccessful);
                var reasons = string.Join(",",tasks.Where(t => !t.Result.IsSuccessful).Select(t => t.Result.Reason).ToArray());
                Log.Error($"FAILURE deleting {numFailed} of {tasks.Count()} Logs due to {reasons}");
                results =
                (
                    new WorkerResult(witsmlClient.GetServerHostname(), false, $"Job failed deleting {numFailed} log objects. Reasons: {reasons}"),
                    null
                );

            } else {
                Log.Information($"SUCCESS - {jobDescription}");
                results =
                (
                    new WorkerResult(witsmlClient.GetServerHostname(), true, $"{tasks.Count()} log objects deleted for wellbore {wellboreUid}"),
                    new RefreshWellbore(witsmlClient.GetServerHostname(),wellUid, wellboreUid, RefreshType.Update)
                );
            }
            return results;
        }

        private static WitsmlLogs CreateRequest(LogReference logReference)
        {
            return new WitsmlLogs
            {
                Logs = new WitsmlLog
                {
                    UidWell = logReference.WellUid,
                    UidWellbore = logReference.WellboreUid,
                    Uid = logReference.LogUid
                }.AsSingletonList()
            };
        }
    }
}
