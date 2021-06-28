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
    public class DeleteMessageWorker : IWorker<DeleteMessageObjectJob>
    {
        private readonly IWitsmlClient witsmlClient;

        public DeleteMessageWorker(IWitsmlClientProvider witsmlClientProvider)
        {
            witsmlClient = witsmlClientProvider.GetClient();
        }

        public async Task<(WorkerResult, RefreshAction)> Execute(DeleteMessageObjectJob job)
        {
            var targetWellbore = await GetWellbore(witsmlClient, job.MessageObject);
            var deleteMessageQuery = DeleteMessageObjectQuery(job, targetWellbore);
            var createMessageResult = await witsmlClient.AddToStoreAsync(deleteMessageQuery);
            if (!createMessageResult.IsSuccessful)
            {
                var errorMessage = "Failed to create messageobject.";
                Log.Error("{ErrorMessage}. Target: UidWell: {TargetWellUid}, UidWellbore: {TargetWellboreUid}.",
                    errorMessage, job.MessageObject.WellUid, job.MessageObject.WellboreUid);
                return (new WorkerResult(witsmlClient.GetServerHostname(), false, errorMessage, createMessageResult.Reason), null);
            }

            Log.Information("{JobType} - Job successful. MessageObject created", GetType().Name);
            var refreshAction = new RefreshWellbore(witsmlClient.GetServerHostname(), job.MessageObject.WellUid, job.MessageObject.WellboreUid, RefreshType.Update);
            var workerResult = new WorkerResult(witsmlClient.GetServerHostname(), true, $"MessageObject {job.MessageObject.Name} created for {targetWellbore.Name}");

            return (workerResult, refreshAction);
        }

        private static WitsmlMessages DeleteMessageObjectQuery(DeleteMessageObjectJob job, WitsmlWellbore targetWellbore)
        {
            return new()
            {
                Messages = new WitsmlMessage
                {
                    UidWell = targetWellbore.UidWell,
                    NameWell = targetWellbore.NameWell,
                    UidWellbore = targetWellbore.Uid,
                    NameWellbore = targetWellbore.Name,
                    Uid = job.MessageObject.Uid,
                    Name = job.MessageObject.Name,
                }.AsSingletonList()
            };
        }

        private static async Task<WitsmlWellbore> GetWellbore(IWitsmlClient client, MessageObject messageObject)
        {
            var query = WellboreQueries.QueryByUid(messageObject.WellUid, messageObject.WellboreUid);
            var wellbores = await client.GetFromStoreAsync(query, OptionsIn.Requested);
            return !wellbores.Wellbores.Any() ? null : wellbores.Wellbores.First();
        }
    }
}
