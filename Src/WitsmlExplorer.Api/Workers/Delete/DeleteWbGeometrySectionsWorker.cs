using System.Collections.ObjectModel;
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
    public class DeleteWbGeometrySectionsWorker : BaseWorker<DeleteWbGeometrySectionsJob>, IWorker
    {
        public JobType JobType => JobType.DeleteWbGeometrySections;

        public DeleteWbGeometrySectionsWorker(ILogger<DeleteWbGeometrySectionsJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider, logger) { }

        public override async Task<(WorkerResult, RefreshAction)> Execute(DeleteWbGeometrySectionsJob job)
        {
            string wellUid = job.ToDelete.Parent.WellUid;
            string wellboreUid = job.ToDelete.Parent.WellboreUid;
            string wbGeometryUid = job.ToDelete.Parent.Uid;
            ReadOnlyCollection<string> wbGeometrySections = new(job.ToDelete.ComponentUids.ToList());
            string wbGeometrySectionsString = string.Join(", ", wbGeometrySections);

            WitsmlWbGeometrys query = WbGeometryQueries.DeleteWbGeometrySections(wellUid, wellboreUid, wbGeometryUid, wbGeometrySections);
            QueryResult result = await GetTargetWitsmlClientOrThrow().DeleteFromStoreAsync(query);
            if (result.IsSuccessful)
            {
                Logger.LogInformation("Deleted wbGeometrySections for wbGeometry object. WellUid: {WellUid}, WellboreUid: {WellboreUid}, Uid: {WbGeometryUid}, WbGeometrySections: {WbGeometrySectionsString}",
                    wellUid,
                    wellboreUid,
                    wbGeometryUid,
                    wbGeometrySections);
                RefreshObjects refreshAction = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), wellUid, wellboreUid, EntityType.WbGeometry, wbGeometryUid);
                WorkerResult workerResult = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, $"Deleted wbGeometrySections: {wbGeometrySectionsString} for wbGeometry: {wbGeometryUid}");
                return (workerResult, refreshAction);
            }

            Logger.LogError("Failed to delete wbGeometrySections for wbGeometry object. WellUid: {WellUid}, WellboreUid: {WellboreUid}, Uid: {WbGeometryUid}, WbGeometrySections: {WbGeometrySectionsString}",
                wellUid,
                wellboreUid,
                wbGeometryUid,
                wbGeometrySections);

            query = WbGeometryQueries.GetWitsmlWbGeometryById(wellUid, wellboreUid, wbGeometryUid);
            WitsmlWbGeometrys queryResult = await GetTargetWitsmlClientOrThrow().GetFromStoreAsync(query, new OptionsIn(ReturnElements.IdOnly));

            WitsmlWbGeometry wbGeometry = queryResult.WbGeometrys.First();
            EntityDescription description = null;
            if (wbGeometry != null)
            {
                description = new EntityDescription
                {
                    WellName = wbGeometry.NameWell,
                    WellboreName = wbGeometry.NameWellbore,
                    ObjectName = wbGeometry.Name
                };
            }

            return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, "Failed to delete wbGeometry components", result.Reason, description), null);
        }
    }
}
