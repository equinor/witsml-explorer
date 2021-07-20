using System.Linq;
using System.Threading.Tasks;
using Serilog;
using Witsml;
using Witsml.Data;
using Witsml.ServiceReference;
using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers
{
    public class ModifyMessageWorker : IWorker<ModifyMessageObjectJob>
    {
        private readonly IWitsmlClient witsmlClient;

        public ModifyMessageWorker(IWitsmlClientProvider witsmlClientProvider)
        {
            witsmlClient = witsmlClientProvider.GetClient();
        }
        public async Task<(WorkerResult, RefreshAction)> Execute(ModifyMessageObjectJob job)
        {
            var modifyMessageQuery = MessageQueries.CreateMessageObject(job.MessageObject);
            var modifyMessageResult = await witsmlClient.UpdateInStoreAsync(modifyMessageQuery);

            if (!modifyMessageResult.IsSuccessful)
            {
                const string errorMessage = "Failed to modify messageobject.";
                Log.Error("{ErrorMessage}. Target: UidWell: {TargetWellUid}, UidWellbore: {TargetWellboreUid}",
                    errorMessage, job.MessageObject.WellUid, job.MessageObject.WellboreUid);
                return (new WorkerResult(witsmlClient.GetServerHostname(), false, errorMessage, modifyMessageResult.Reason), null);
            }

            Log.Information("{JobType} - Job successful. MessageObject modified", GetType().Name);
            var refreshAction = new RefreshWellbore(witsmlClient.GetServerHostname(), job.MessageObject.WellUid, job.MessageObject.WellboreUid, RefreshType.Update);
            var workerResult = new WorkerResult(witsmlClient.GetServerHostname(), true, $"MessageObject {job.MessageObject.Name} updated for {job.MessageObject.WellboreName}");

            return (workerResult, refreshAction);
        }

        private static async Task<WitsmlWellbore> GetWellbore(IWitsmlClient client, MessageObject messageObject)
        {
            var query = WellboreQueries.GetWitsmlWellboreByUid(messageObject.WellUid, messageObject.WellboreUid);
            var wellbores = await client.GetFromStoreAsync(query, new OptionsIn(ReturnElements.Requested));
            return !wellbores.Wellbores.Any() ? null : wellbores.Wellbores.First();
        }
    }
}
