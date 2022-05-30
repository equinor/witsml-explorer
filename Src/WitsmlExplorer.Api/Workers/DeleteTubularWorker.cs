using System.Linq;
using System.Threading.Tasks;
using Serilog;
using Witsml;
using Witsml.ServiceReference;
using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers
{
    public class DeleteTubularWorker : BaseWorker<DeleteTubularJob>, IWorker
    {
        private readonly IWitsmlClient witsmlClient;
        public JobType JobType => JobType.DeleteTubular;

        public DeleteTubularWorker(IWitsmlClientProvider witsmlClientProvider)
        {
            witsmlClient = witsmlClientProvider.GetClient();
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(DeleteTubularJob job)
        {
            var wellUid = job.TubularReference.WellUid;
            var wellboreUid = job.TubularReference.WellboreUid;
            var tubularUid = job.TubularReference.TubularUid;

            var witsmlTubular = TubularQueries.GetWitsmlTubularById(wellUid, wellboreUid, tubularUid);
            var result = await witsmlClient.DeleteFromStoreAsync(witsmlTubular);
            if (result.IsSuccessful)
            {
                Log.Information("{JobType} - Job successful", GetType().Name);
                var refreshAction = new RefreshWellbore(witsmlClient.GetServerHostname(), wellUid, wellboreUid, RefreshType.Update);
                return (new WorkerResult(witsmlClient.GetServerHostname(), true, $"Deleted tubular: ${tubularUid}"), refreshAction);
            }

            Log.Error("Failed to delete tubular. WellUid: {WellUid}, WellboreUid: {WellboreUid}, Uid: {TubularUid}",
                wellUid,
                wellboreUid,
                tubularUid);

            witsmlTubular = TubularQueries.GetWitsmlTubularById(wellUid, wellboreUid, tubularUid);
            var queryResult = await witsmlClient.GetFromStoreAsync(witsmlTubular, new OptionsIn(ReturnElements.IdOnly));

            var tubular = queryResult.Tubulars.First();
            EntityDescription description = null;
            if (tubular != null)
            {
                description = new EntityDescription
                {
                    WellName = tubular.NameWell,
                    WellboreName = tubular.NameWellbore,
                    ObjectName = tubular.Name
                };
            }
            return (new WorkerResult(witsmlClient.GetServerHostname(), false, "Failed to delete tubular", result.Reason, description), null);
        }
    }
}
