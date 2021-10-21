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
    public class DeleteLogObjectsWorker : BaseWorker<DeleteLogObjectsJob>, IWorker
    {
        private readonly IWitsmlClient witsmlClient;
        public JobType JobType => JobType.DeleteLogObjects;

        public DeleteLogObjectsWorker(IWitsmlClientProvider witsmlClientProvider)
        {
            witsmlClient = witsmlClientProvider.GetClient();
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(DeleteLogObjectsJob job)
        {
            Verify(job);

            var wellUid = job.LogReferences.First().WellUid;
            var wellboreUid = job.LogReferences.First().WellboreUid;

            var logsExpanded = $"[ {string.Join(", ",job.LogReferences.Select(l=>l.LogUid))} ]";
            var jobDescription = $"Delete {job.LogReferences.Count()} Logs under wellUid: {wellUid}, wellboreUid: {wellboreUid}. Logs: {logsExpanded}";

            var queries = job.LogReferences.Select(CreateRequest);
            var tasks = queries.Select(q=> witsmlClient.DeleteFromStoreAsync(q)).ToList();

            await Task.WhenAll(tasks);
            if (tasks.Any(t => t.IsFaulted))
            {
                var numFailed = tasks.Count(t => !t.Result.IsSuccessful);
                var reasons = string.Join(",",tasks.Where(t => !t.Result.IsSuccessful).Select(t => t.Result.Reason).ToArray());
                Log.Error($"FAILURE deleting {numFailed} of {tasks.Count} Logs due to {reasons}");
                return (new WorkerResult(witsmlClient.GetServerHostname(), false, $"Job failed deleting {numFailed} log objects", reasons), null);
            }

            Log.Information($"SUCCESS - {jobDescription}");
            return (
                new WorkerResult(witsmlClient.GetServerHostname(), true, $"{tasks.Count} log objects deleted for wellbore {wellboreUid}"),
                new RefreshWellbore(witsmlClient.GetServerHostname(), wellUid, wellboreUid, RefreshType.Update)
            );
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

        private static void Verify(DeleteLogObjectsJob job)
        {
            if (!job.LogReferences.Any()) throw new ArgumentException("A minimum of one job is required");
            if (job.LogReferences.Select(l => l.WellboreUid).Distinct().Count() != 1)  throw new ArgumentException("All logs should belong to the same Wellbore");
            if (string.IsNullOrEmpty(job.LogReferences.First().WellUid)) throw new ArgumentException("WellUid is required");
            if (string.IsNullOrEmpty(job.LogReferences.First().WellboreUid)) throw new ArgumentException("WellboreUid is required");
        }
    }
}
