using System.Threading.Tasks;
using Serilog;
using Witsml;
using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers
{
    public class ModifyMessageWorker : BaseWorker<ModifyMessageObjectJob>, IWorker
    {
        private readonly IWitsmlClient witsmlClient;
        public JobType JobType => JobType.ModifyMessageObject;

        public ModifyMessageWorker(IWitsmlClientProvider witsmlClientProvider)
        {
            witsmlClient = witsmlClientProvider.GetClient();
        }
        public override async Task<(WorkerResult, RefreshAction)> Execute(ModifyMessageObjectJob job)
        {
            var modifyMessageQuery = MessageQueries.CreateMessageObject(job.MessageObject);
            var modifyMessageResult = await witsmlClient.UpdateInStoreAsync(modifyMessageQuery);

            if (!modifyMessageResult.IsSuccessful)
            {
                const string errorMessage = "Failed to modify message object";
                Log.Error("{ErrorMessage}. Target: UidWell: {TargetWellUid}, UidWellbore: {TargetWellboreUid}",
                    errorMessage, job.MessageObject.WellUid, job.MessageObject.WellboreUid);
                return (new WorkerResult(witsmlClient.GetServerHostname(), false, errorMessage, modifyMessageResult.Reason), null);
            }

            Log.Information("{JobType} - Job successful. MessageObject modified", GetType().Name);
            var refreshAction = new RefreshMessageObjects(witsmlClient.GetServerHostname(), job.MessageObject.WellUid, job.MessageObject.WellboreUid, RefreshType.Update);
            var workerResult = new WorkerResult(witsmlClient.GetServerHostname(), true, $"MessageObject {job.MessageObject.Name} updated for {job.MessageObject.WellboreName}");

            return (workerResult, refreshAction);
        }
    }
}
