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
        public JobType JobType => JobType.ModifyMessageObject;

        public ModifyMessageWorker(ILogger<ModifyMessageObjectJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider, logger) { }
        public override async Task<(WorkerResult, RefreshAction)> Execute(ModifyMessageObjectJob job)
        {
            WitsmlMessages modifyMessageQuery = MessageQueries.CreateMessageObject(job.MessageObject);
            QueryResult modifyMessageResult = await GetTargetWitsmlClientOrThrow().UpdateInStoreAsync(modifyMessageQuery);

            if (!modifyMessageResult.IsSuccessful)
            {
                const string errorMessage = "Failed to modify message object";
                Logger.LogError("{ErrorMessage}. {jobDescription}}", errorMessage, job.Description());
                return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, errorMessage, modifyMessageResult.Reason), null);
            }

            Logger.LogInformation("Message modified. {jobDescription}", job.Description());
            RefreshMessageObjects refreshAction = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), job.MessageObject.WellUid, job.MessageObject.WellboreUid, RefreshType.Update);
            WorkerResult workerResult = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, $"MessageObject {job.MessageObject.Name} updated for {job.MessageObject.WellboreName}");

            return (workerResult, refreshAction);
        }
    }
}
