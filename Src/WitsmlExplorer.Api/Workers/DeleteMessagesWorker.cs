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
        private readonly IWitsmlClient _witsmlClient;
        public JobType JobType => JobType.DeleteMessageObjects;

        public DeleteMessagesWorker(IWitsmlClientProvider witsmlClientProvider)
        {
            _witsmlClient = witsmlClientProvider.GetClient();
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(DeleteMessageObjectsJob job)
        {
            Verify(job);

            var wellUid = job.ToDelete.WellUid;
            var wellboreUid = job.ToDelete.WellboreUid;

            var messagesExpanded = $"[ {string.Join(", ", job.ToDelete.MessageObjectUids)} ]";
            var jobDescription = $"Delete {job.ToDelete.MessageObjectUids.Length} Messages under wellUid: {wellUid}, wellboreUid: {wellboreUid}. Messages: {messagesExpanded}";

            var queries = job.ToDelete.MessageObjectUids.Select(id => MessageQueries.GetMessageById(wellUid, wellboreUid, id));
            var tasks = queries.Select(q => _witsmlClient.DeleteFromStoreAsync(q)).ToList();

            await Task.WhenAll(tasks);
            if (tasks.Any(t => t.IsFaulted))
            {
                var numFailed = tasks.Count(t => !t.Result.IsSuccessful);
                var reasons = string.Join(",", tasks.Where(t => !t.Result.IsSuccessful).Select(t => t.Result.Reason).ToArray());
                Log.Error($"FAILURE deleting {numFailed} of {tasks.Count} Messages due to {reasons}");
                return (new WorkerResult(_witsmlClient.GetServerHostname(), false, $"Job failed deleting {numFailed} messages", reasons), null);
            }

            Log.Information($"SUCCESS - {jobDescription}");
            return (
                new WorkerResult(_witsmlClient.GetServerHostname(), true, $"{tasks.Count} messages deleted for wellbore {wellboreUid}"),
                new RefreshMessageObjects(_witsmlClient.GetServerHostname(), wellUid, wellboreUid, RefreshType.Update)
            );
        }

        private static void Verify(DeleteMessageObjectsJob job)
        {
            if (!job.ToDelete.MessageObjectUids.Any()) throw new ArgumentException($"A minimum of one message is required");
            if (string.IsNullOrEmpty(job.ToDelete.WellUid)) throw new ArgumentException("WellUid is required");
            if (string.IsNullOrEmpty(job.ToDelete.WellboreUid)) throw new ArgumentException("WellboreUid is required");
        }
    }
}
