using System.Linq;
using System.Threading;
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
        public JobType JobType => JobType.DeleteWell;

        private readonly IUidMappingService _uidMappingService;

        public DeleteWellWorker(ILogger<DeleteWellJob> logger, IWitsmlClientProvider witsmlClientProvider, IUidMappingService uidMappingService)
            : base(witsmlClientProvider, logger)
        {
            _uidMappingService = uidMappingService;
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(DeleteWellJob job, CancellationToken? cancellationToken = null)
        {
            bool cascadedDelete = job.CascadedDelete;
            string wellUid = job.ToDelete.WellUid;

            WitsmlWells witsmlWell = WellQueries.DeleteWitsmlWell(wellUid);
            QueryResult result = cascadedDelete ? await GetTargetWitsmlClientOrThrow().DeleteFromStoreAsync(witsmlWell, new OptionsIn(CascadedDelete: true)) : await GetTargetWitsmlClientOrThrow().DeleteFromStoreAsync(witsmlWell);
            if (result.IsSuccessful)
            {
                await _uidMappingService.DeleteUidMappings(wellUid);

                Logger.LogInformation("Deleted well. WellUid: {WellUid}", wellUid);
                RefreshWell refreshAction = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), wellUid, RefreshType.Remove);
                WorkerResult workerResult = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, $"Deleted well with uid ${wellUid}");
                return (workerResult, refreshAction);
            }

            Logger.LogError("Failed to delete well. WellUid: {WellUid}", wellUid);

            witsmlWell = WellQueries.GetWitsmlWellByUid(wellUid);
            WitsmlWells queryResult = await GetTargetWitsmlClientOrThrow().GetFromStoreAsync(witsmlWell, new OptionsIn(ReturnElements.IdOnly));

            EntityDescription description = null;

            WitsmlWell wellbore = queryResult.Wells.FirstOrDefault();
            if (wellbore != null)
            {
                description = new EntityDescription
                {
                    ObjectName = wellbore.Name
                };
            }

            return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, "Failed to delete well", result.Reason, description), null);
        }
    }
}
