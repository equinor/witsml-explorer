using System.Collections.ObjectModel;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.Data;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers.Delete
{
    public interface IDeleteComponentsWorker
    {
        Task<(WorkerResult, RefreshAction)> Execute(DeleteComponentsJob job, CancellationToken? cancellationToken = null);
    }

    public class DeleteComponentsWorker : BaseWorker<DeleteComponentsJob>, IWorker, IDeleteComponentsWorker
    {
        public JobType JobType => JobType.DeleteComponents;

        public DeleteComponentsWorker(ILogger<DeleteComponentsJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider, logger) { }

        public override async Task<(WorkerResult, RefreshAction)> Execute(DeleteComponentsJob job, CancellationToken? cancellationToken = null)
        {
            job.ToDelete.Verify();
            string wellUid = job.ToDelete.Parent.WellUid;
            string wellboreUid = job.ToDelete.Parent.WellboreUid;
            string parentUid = job.ToDelete.Parent.Uid;
            ComponentType componentType = job.ToDelete.ComponentType;
            EntityType parentType = componentType.ToParentType();
            ReadOnlyCollection<string> componentUids = new(job.ToDelete.ComponentUids.ToList());
            string componentsName = componentType.ToPluralLowercase();
            string objectsDescription = $"WellUid: {wellUid}, WellboreUid: {wellboreUid}, Uid: {parentUid}, {componentsName}: {string.Join(", ", componentUids)}";

            WitsmlObjectOnWellbore query = ObjectQueries.IdsToObjects(wellUid, wellboreUid, new string[] { parentUid }, parentType).First();
            ObjectQueries.SetComponents(query, componentType, componentUids);
            QueryResult result = await GetTargetWitsmlClientOrThrow().DeleteFromStoreAsync(query.AsItemInWitsmlList());
            if (result.IsSuccessful)
            {
                Logger.LogInformation("Deleted {ComponentType} for {ObjectType}. {Description}", componentsName, parentType, objectsDescription);
                RefreshObjects refreshAction = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), wellUid, wellboreUid, parentType, parentUid);
                WorkerResult workerResult = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, $"Deleted {componentsName}: {string.Join(", ", componentUids)} for {parentType}: {parentUid}");
                return (workerResult, refreshAction);
            }
            Logger.LogError("Failed to delete {ComponentType} for {ObjectType}. {Description}", componentsName, parentType, objectsDescription);

            EntityDescription description = new()
            {
                WellName = job.ToDelete.Parent.WellName,
                WellboreName = job.ToDelete.Parent.WellboreName,
                ObjectName = job.ToDelete.Parent.Name
            };

            return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, $"Failed to delete {componentsName}", result.Reason, description), null);
        }
    }
}
