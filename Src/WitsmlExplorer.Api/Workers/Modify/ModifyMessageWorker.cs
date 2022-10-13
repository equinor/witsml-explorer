using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.Data;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers.Modify
{
    public class ModifyMessageWorker : BaseWorker<ModifyMessageObjectJob>, IWorker
    {
        private readonly IWitsmlClient _witsmlClient;
        public JobType JobType => JobType.ModifyMessageObject;

        public ModifyMessageWorker(ILogger<ModifyMessageObjectJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(logger)
        {
            _witsmlClient = witsmlClientProvider.GetClient().Result;
        }
        public override async Task<(WorkerResult, RefreshAction)> Execute(ModifyMessageObjectJob job)
        {
            WitsmlMessages modifyMessageQuery = MessageQueries.CreateMessageObject(job.MessageObject);
            QueryResult modifyMessageResult = await _witsmlClient.UpdateInStoreAsync(modifyMessageQuery);

            if (!modifyMessageResult.IsSuccessful)
            {
                const string errorMessage = "Failed to modify message object";
                Logger.LogError("{ErrorMessage}. {jobDescription}}", errorMessage, job.Description());
                return (new WorkerResult(_witsmlClient.GetServerHostname(), false, errorMessage, modifyMessageResult.Reason), null);
            }

            Logger.LogInformation("Message modified. {jobDescription}", job.Description());
            RefreshMessageObjects refreshAction = new(_witsmlClient.GetServerHostname(), job.MessageObject.WellUid, job.MessageObject.WellboreUid, RefreshType.Update);
            WorkerResult workerResult = new(_witsmlClient.GetServerHostname(), true, $"MessageObject {job.MessageObject.Name} updated for {job.MessageObject.WellboreName}");

            return (workerResult, refreshAction);
        }
    }
}
