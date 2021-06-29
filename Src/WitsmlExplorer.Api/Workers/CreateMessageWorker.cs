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
    public interface ICreateMessageObjectWorker
    {
        Task<(WorkerResult, RefreshAction)> Execute(CreateMessageObjectJob job);
    }

    public class CreateMessageWorker : ICreateMessageObjectWorker
    {
        private readonly IWitsmlClient witsmlClient;

        public CreateMessageWorker(IWitsmlClientProvider witsmlClientProvider)
        {
            witsmlClient = witsmlClientProvider.GetClient();
        }

        public async Task<(WorkerResult, RefreshAction)> Execute(CreateMessageObjectJob job)
        {
            var targetWellbore = await GetWellbore(witsmlClient, job.MessageObject);
            var copyMessageQuery = MessageQueries.CreateMessageObject(job.MessageObject, targetWellbore);
            var createMessageResult = await witsmlClient.AddToStoreAsync(copyMessageQuery);
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

        private static async Task<WitsmlWellbore> GetWellbore(IWitsmlClient client, MessageObject messageObject)
        {
            var query = WellboreQueries.GetWitsmlWellboreByUid(messageObject.WellUid, messageObject.WellboreUid);
            var wellbores = await client.GetFromStoreAsync(query, OptionsIn.Requested);
            return !wellbores.Wellbores.Any() ? null : wellbores.Wellbores.First();
        }
    }
}
