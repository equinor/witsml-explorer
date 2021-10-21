using System;
using System.Linq;
using System.Threading.Tasks;
using Serilog;
using Witsml;
using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers
{
    public class DeleteMessagesWorker : BaseWorker<DeleteMessageObjectsJob>, IWorker
    {
        private readonly IWitsmlClient witsmlClient;
        public JobType JobType => JobType.DeleteMessageObjects;

        public DeleteMessagesWorker(IWitsmlClientProvider witsmlClientProvider)
        {
            witsmlClient = witsmlClientProvider.GetClient();
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(DeleteMessageObjectsJob job)
        {
            Verify(job);

            var wellUid = job.MessageObjects.First().WellUid;
            var wellboreUid = job.MessageObjects.First().WellboreUid;

            var messagesExpanded = $"[ {string.Join(", ", job.MessageObjects.Select(l => l.Uid))} ]";
            var jobDescription = $"Delete {job.MessageObjects.Count()} Messages under wellUid: {wellUid}, wellboreUid: {wellboreUid}. Messages: {messagesExpanded}";

            var queries = job.MessageObjects.Select(l => MessageQueries.GetMessageById(l.WellUid, l.WellboreUid, l.Uid));
            var tasks = queries.Select(q => witsmlClient.DeleteFromStoreAsync(q)).ToList();

            await Task.WhenAll(tasks);
            if (tasks.Any(t => t.IsFaulted))
            {
                var numFailed = tasks.Count(t => !t.Result.IsSuccessful);
                var reasons = string.Join(",", tasks.Where(t => !t.Result.IsSuccessful).Select(t => t.Result.Reason).ToArray());
                Log.Error($"FAILURE deleting {numFailed} of {tasks.Count} Messages due to {reasons}");
                return (new WorkerResult(witsmlClient.GetServerHostname(), false, $"Job failed deleting {numFailed} messages", reasons), null);
            }

            Log.Information($"SUCCESS - {jobDescription}");
            return (
                new WorkerResult(witsmlClient.GetServerHostname(), true, $"{tasks.Count} messages deleted for wellbore {wellboreUid}"),
                new RefreshMessageObjects(witsmlClient.GetServerHostname(), wellUid, wellboreUid, RefreshType.Update)
            );
        }

        private static void Verify(DeleteMessageObjectsJob job)
        {
            if (!job.MessageObjects.Any()) throw new ArgumentException($"A minimum of one message is required");
            if (job.MessageObjects.Select(l => l.WellboreUid).Distinct().Count() != 1) throw new ArgumentException($"All messages should belong to the same Wellbore");
            if (string.IsNullOrEmpty(job.MessageObjects.First().WellUid)) throw new ArgumentException("WellUid is required");
            if (string.IsNullOrEmpty(job.MessageObjects.First().WellboreUid)) throw new ArgumentException("WellboreUid is required");
        }
    }
}
