using System.Collections.ObjectModel;
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
    public class DeleteTubularComponentsWorker : BaseWorker<DeleteTubularComponentsJob>, IWorker
    {
        private readonly IWitsmlClient witsmlClient;
        public JobType JobType => JobType.DeleteTubularComponents;

        public DeleteTubularComponentsWorker(IWitsmlClientProvider witsmlClientProvider)
        {
            witsmlClient = witsmlClientProvider.GetClient();
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(DeleteTubularComponentsJob job)
        {
            var wellUid = job.Tubular.WellUid;
            var wellboreUid = job.Tubular.WellboreUid;
            var tubularUid = job.Tubular.TubularUid;
            var tubularcomponents = new ReadOnlyCollection<string>(job.Uids.ToList());
            var tubularComponentsString = string.Join(", ", tubularcomponents);

            var query = TubularQueries.DeleteTubularComponents(wellUid, wellboreUid, tubularUid, tubularcomponents);
            var result = await witsmlClient.DeleteFromStoreAsync(query);
            if (result.IsSuccessful)
            {
                Log.Information("{JobType} - Job successful", GetType().Name);
                var refreshAction = new RefreshTubular(witsmlClient.GetServerHostname(), wellUid, wellboreUid, tubularUid, RefreshType.Update);
                var workerResult = new WorkerResult(witsmlClient.GetServerHostname(), true, $"Deleted tubularcomponents: {tubularComponentsString} for tubular: {tubularUid}");
                return (workerResult, refreshAction);
            }

            Log.Error("Failed to delete tubularcomponents for tubular object. WellUid: {WellUid}, WellboreUid: {WellboreUid}, Uid: {TubularUid}, TubularComponents: {TubularComponentsString}",
                wellUid,
                wellboreUid,
                tubularUid,
                tubularcomponents);

            query = TubularQueries.GetWitsmlTubularById(wellUid, wellboreUid, tubularUid);
            var queryResult = await witsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.IdOnly));

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

            return (new WorkerResult(witsmlClient.GetServerHostname(), false, "Failed to delete tubular components", result.Reason, description), null);
        }
    }
}
