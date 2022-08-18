using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers
{
    public class ModifyMessageWorker : BaseWorker<ModifyMessageObjectJob>, IWorker
    {
        private readonly IWitsmlClient _witsmlClient;
        public JobType JobType => JobType.ModifyMessageObject;

        public ModifyMessageWorker(ILogger<ModifyMessageObjectJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(logger)
        {
            _witsmlClient = witsmlClientProvider.GetClient();
        }
        public override async Task<(WorkerResult, RefreshAction)> Execute(ModifyMessageObjectJob job)
        {
            var modifyMessageQuery = MessageQueries.CreateMessageObject(job.MessageObject);
            var modifyMessageResult = await _witsmlClient.UpdateInStoreAsync(modifyMessageQuery);

            if (!modifyMessageResult.IsSuccessful)
            {
                const string errorMessage = "Failed to modify message object";
                Logger.LogError("{ErrorMessage}. {jobDescription}}", errorMessage, job.Description());
                return (new WorkerResult(_witsmlClient.GetServerHostname(), false, errorMessage, modifyMessageResult.Reason), null);
            }

            Logger.LogInformation("Message modified. {jobDescription}", job.Description());
            var refreshAction = new RefreshMessageObjects(_witsmlClient.GetServerHostname(), job.MessageObject.WellUid, job.MessageObject.WellboreUid, RefreshType.Update);
            var workerResult = new WorkerResult(_witsmlClient.GetServerHostname(), true, $"MessageObject {job.MessageObject.Name} updated for {job.MessageObject.WellboreName}");

            return (workerResult, refreshAction);
        }
    }
}
