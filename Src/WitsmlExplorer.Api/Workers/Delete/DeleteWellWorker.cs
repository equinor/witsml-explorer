using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.Data;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers.Delete
{
    public class DeleteWellWorker : BaseWorker<DeleteWellJob>, IWorker
    {
        private readonly IWitsmlClient _witsmlClient;
        public JobType JobType => JobType.DeleteWell;

        public DeleteWellWorker(ILogger<DeleteWellJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(logger)
        {
            _witsmlClient = witsmlClientProvider.GetClient();
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(DeleteWellJob job)
        {
            string wellUid = job.ToDelete.WellUid;

            WitsmlWells witsmlWell = WellQueries.DeleteWitsmlWell(wellUid);
            QueryResult result = await _witsmlClient.DeleteFromStoreAsync(witsmlWell);
            if (result.IsSuccessful)
            {
                Logger.LogInformation("Deleted well. WellUid: {WellUid}", wellUid);
                RefreshWell refreshAction = new(_witsmlClient.GetServerHostname(), wellUid, RefreshType.Remove);
                WorkerResult workerResult = new(_witsmlClient.GetServerHostname(), true, $"Deleted well with uid ${wellUid}");
                return (workerResult, refreshAction);
            }

            Logger.LogError("Failed to delete well. WellUid: {WellUid}", wellUid);

            witsmlWell = WellQueries.GetWitsmlWellByUid(wellUid);
            WitsmlWells queryResult = await _witsmlClient.GetFromStoreAsync(witsmlWell, new OptionsIn(ReturnElements.IdOnly));

            EntityDescription description = null;

            WitsmlWell wellbore = queryResult.Wells.FirstOrDefault();
            if (wellbore != null)
            {
                description = new EntityDescription
                {
                    ObjectName = wellbore.Name
                };
            }

            return (new WorkerResult(_witsmlClient.GetServerHostname(), false, "Failed to delete well", result.Reason, description), null);
        }
    }
}
