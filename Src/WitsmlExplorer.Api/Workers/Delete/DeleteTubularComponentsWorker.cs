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
        public JobType JobType => JobType.DeleteTubularComponents;

        public DeleteTubularComponentsWorker(ILogger<DeleteTubularComponentsJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider, logger) { }

        public override async Task<(WorkerResult, RefreshAction)> Execute(DeleteTubularComponentsJob job)
        {
            string wellUid = job.ToDelete.Parent.WellUid;
            string wellboreUid = job.ToDelete.Parent.WellboreUid;
            string tubularUid = job.ToDelete.Parent.Uid;
            ReadOnlyCollection<string> tubularcomponents = new(job.ToDelete.ComponentUids.ToList());
            string tubularComponentsString = string.Join(", ", tubularcomponents);

            WitsmlTubulars query = TubularQueries.DeleteTubularComponents(wellUid, wellboreUid, tubularUid, tubularcomponents);
            QueryResult result = await GetTargetWitsmlClientOrThrow().DeleteFromStoreAsync(query);
            if (result.IsSuccessful)
            {
                Logger.LogInformation("Deleted tubularcomponents for tubular object. WellUid: {WellUid}, WellboreUid: {WellboreUid}, Uid: {TubularUid}, TubularComponents: {TubularComponentsString}",
                    wellUid,
                    wellboreUid,
                    tubularUid,
                    tubularcomponents);
                RefreshObjects refreshAction = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), wellUid, wellboreUid, EntityType.Tubular, tubularUid);
                WorkerResult workerResult = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, $"Deleted tubularcomponents: {tubularComponentsString} for tubular: {tubularUid}");
                return (workerResult, refreshAction);
            }

            Logger.LogError("Failed to delete tubularcomponents for tubular object. WellUid: {WellUid}, WellboreUid: {WellboreUid}, Uid: {TubularUid}, TubularComponents: {TubularComponentsString}",
                wellUid,
                wellboreUid,
                tubularUid,
                tubularcomponents);

            query = TubularQueries.GetWitsmlTubular(wellUid, wellboreUid, tubularUid);
            WitsmlTubulars queryResult = await GetTargetWitsmlClientOrThrow().GetFromStoreAsync(query, new OptionsIn(ReturnElements.IdOnly));

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

            return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, "Failed to delete tubular components", result.Reason, description), null);
        }
    }
}
