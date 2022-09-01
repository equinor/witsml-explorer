using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.Data.Tubular;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers.Delete
{
    public class DeleteTubularComponentsWorker : BaseWorker<DeleteTubularComponentsJob>, IWorker
    {
        private readonly IWitsmlClient _witsmlClient;
        public JobType JobType => JobType.DeleteTubularComponents;

        public DeleteTubularComponentsWorker(ILogger<DeleteTubularComponentsJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(logger)
        {
            _witsmlClient = witsmlClientProvider.GetClient();
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(DeleteTubularComponentsJob job)
        {
            string wellUid = job.ToDelete.TubularReference.WellUid;
            string wellboreUid = job.ToDelete.TubularReference.WellboreUid;
            string tubularUid = job.ToDelete.TubularReference.TubularUid;
            ReadOnlyCollection<string> tubularcomponents = new(job.ToDelete.TubularComponentUids.ToList());
            string tubularComponentsString = string.Join(", ", tubularcomponents);

            WitsmlTubulars query = TubularQueries.DeleteTubularComponents(wellUid, wellboreUid, tubularUid, tubularcomponents);
            QueryResult result = await _witsmlClient.DeleteFromStoreAsync(query);
            if (result.IsSuccessful)
            {
                Logger.LogInformation("Deleted tubularcomponents for tubular object. WellUid: {WellUid}, WellboreUid: {WellboreUid}, Uid: {TubularUid}, TubularComponents: {TubularComponentsString}",
                    wellUid,
                    wellboreUid,
                    tubularUid,
                    tubularcomponents);
                RefreshTubulars refreshAction = new(_witsmlClient.GetServerHostname(), wellUid, wellboreUid, RefreshType.Update);
                WorkerResult workerResult = new(_witsmlClient.GetServerHostname(), true, $"Deleted tubularcomponents: {tubularComponentsString} for tubular: {tubularUid}");
                return (workerResult, refreshAction);
            }

            Logger.LogError("Failed to delete tubularcomponents for tubular object. WellUid: {WellUid}, WellboreUid: {WellboreUid}, Uid: {TubularUid}, TubularComponents: {TubularComponentsString}",
                wellUid,
                wellboreUid,
                tubularUid,
                tubularcomponents);

            query = TubularQueries.GetWitsmlTubularById(wellUid, wellboreUid, tubularUid);
            WitsmlTubulars queryResult = await _witsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.IdOnly));

            WitsmlTubular tubular = queryResult.Tubulars.First();
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

            return (new WorkerResult(_witsmlClient.GetServerHostname(), false, "Failed to delete tubular components", result.Reason, description), null);
        }
    }
}