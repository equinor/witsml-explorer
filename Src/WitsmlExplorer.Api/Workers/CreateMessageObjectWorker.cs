using System.Linq;
using System.Threading.Tasks;

using Serilog;

using Witsml;
using Witsml.Data;
using Witsml.Extensions;
using Witsml.Query;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers
{
    public interface ICreateMessageObjectWorker
    {
        Task<(WorkerResult, RefreshAction)> Execute(CreateMessageObjectJob job);
    }

    public class CreateMessageObjectWorker : ICreateMessageObjectWorker
    {
        private readonly IWitsmlClient witsmlClient;

        public CreateMessageObjectWorker(IWitsmlClientProvider witsmlClientProvider)
        {
            witsmlClient = witsmlClientProvider.GetClient();
        }

        public async Task<(WorkerResult, RefreshAction)> Execute(CreateMessageObjectJob job)
        {
            var targetWellbore = await GetWellbore(witsmlClient, job.MessageObject);
            var copyMessageQuery = CreateMessageObjectQuery(job, targetWellbore);
            var createMessageObjectResult = await witsmlClient.AddToStoreAsync(copyMessageQuery);
            if (!createMessageObjectResult.IsSuccessful)
            {
                var errorMessage = "Failed to create messageobject.";
                Log.Error("{ErrorMessage}. Target: UidWell: {TargetWellUid}, UidWellbore: {TargetWellboreUid}.",
                    errorMessage, job.MessageObject.WellUid, job.MessageObject.WellboreUid);
                return (new WorkerResult(witsmlClient.GetServerHostname(), false, errorMessage, createMessageObjectResult.Reason), null);
            }

            Log.Information("{JobType} - Job successful. MessageObject created", GetType().Name);
            var refreshAction = new RefreshWellbore(witsmlClient.GetServerHostname(), job.MessageObject.WellUid, job.MessageObject.WellboreUid, RefreshType.Update);
            var workerResult = new WorkerResult(witsmlClient.GetServerHostname(), true, $"MessageObject {job.MessageObject.Name} created for {targetWellbore.Name}");

            return (workerResult, refreshAction);
        }

        private static WitsmlMessageObjects CreateMessageObjectQuery(CreateMessageObjectJob job, WitsmlWellbore targetWellbore)
        {
            return new WitsmlMessageObjects
            {
                MessageObjects = new WitsmlMessageObject
                {
                    UidWell = targetWellbore.UidWell,
                    NameWell = targetWellbore.NameWell,
                    UidWellbore = targetWellbore.Uid,
                    NameWellbore = targetWellbore.Name,
                    Uid = job.MessageObject.Uid,
                    Name = job.MessageObject.Name,
                    MessageText = job.MessageObject.MessageText
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
