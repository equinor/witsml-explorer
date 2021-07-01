using System;
using System.Linq;
using System.Threading.Tasks;
using Serilog;
using Witsml;
using Witsml.Data;
using Witsml.Extensions;
using Witsml.ServiceReference;
using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers
{
    public class DeleteMessagesWorker : IWorker<DeleteMessageObjectsJob>
    {
        private readonly IWitsmlClient witsmlClient;

        public DeleteMessagesWorker(IWitsmlClientProvider witsmlClientProvider)
        {
            witsmlClient = witsmlClientProvider.GetClient();
        }

        public async Task<(WorkerResult, RefreshAction)> Execute(DeleteMessageObjectsJob job)
        {
            (WorkerResult workerResult, RefreshWellbore refreshAction) results;

            if (!job.MessageObjects.Any()) throw new ArgumentException($"A minimum of one message is required");
            if (job.MessageObjects.Select(l => l.WellboreUid).Distinct().Count() != 1) throw new ArgumentException($"All messages should belong to the same Wellbore");

            var wellUid = job.MessageObjects.FirstOrDefault()?.WellUid;
            var wellboreUid = job.MessageObjects.FirstOrDefault()?.WellboreUid;

            var messagesExpanded = $"[ {string.Join(", ", job.MessageObjects.Select(l => l.Uid))} ]";
            var jobDescription = $"Delete {job.MessageObjects.Count()} Messages under wellUid: {wellUid}, wellboreUid: {wellboreUid}. Messages: {messagesExpanded}";

            var queries = job.MessageObjects.Select(l => MessageQueries.GetMessageById(l.WellUid, l.WellboreUid, l.Uid));
            var tasks = queries.Select(q => witsmlClient.DeleteFromStoreAsync(q));

            await Task.WhenAll(tasks);
            if (tasks.Any(t => t.IsFaulted))
            {
                var numFailed = tasks.Count(t => !t.Result.IsSuccessful);
                var reasons = string.Join(",", tasks.Where(t => !t.Result.IsSuccessful).Select(t => t.Result.Reason).ToArray());
                Log.Error($"FAILURE deleting {numFailed} of {tasks.Count()} Messages due to {reasons}");
                results =
                (
                    new WorkerResult(witsmlClient.GetServerHostname(), false, $"Job failed deleting {numFailed} messages. Reasons: {reasons}"),
                    null
                );

            }
            else
            {
                Log.Information($"SUCCESS - {jobDescription}");
                results =
                (
                    new WorkerResult(witsmlClient.GetServerHostname(), true, $"{tasks.Count()} mesages deleted for wellbore {wellboreUid}"),
                    new RefreshWellbore(witsmlClient.GetServerHostname(), wellUid, wellboreUid, RefreshType.Update)
                );
            }
            return results;
        }

    }
}
