using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml.Data;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers.Copy
{
    public interface ICopyObjectsWorker
    {
        Task<(WorkerResult, RefreshAction)> Execute(CopyObjectsJob job, CancellationToken? cancellationToken = null);
    }

    public class CopyObjectsWorker : BaseWorker<CopyObjectsJob>, IWorker, ICopyObjectsWorker
    {
        private readonly ICopyUtils _copyUtils;
        private readonly ICopyLogWorker _copyLogWorker;
        public JobType JobType => JobType.CopyObjects;

        public CopyObjectsWorker(ILogger<CopyObjectsJob> logger, IWitsmlClientProvider witsmlClientProvider, ICopyUtils copyUtils, ICopyLogWorker copyLogWorker) : base(witsmlClientProvider, logger)
        {
            _copyUtils = copyUtils;
            _copyLogWorker = copyLogWorker;
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(CopyObjectsJob job, CancellationToken? cancellationToken = null)
        {
            if (job.Source.ObjectType == EntityType.Log)
            {
                return await _copyLogWorker.Execute(job, cancellationToken);
            }
            return await GenericCopy(job, cancellationToken);
        }

        private async Task<(WorkerResult, RefreshAction)> GenericCopy(CopyObjectsJob job, CancellationToken? cancellationToken = null)
        {
            var duplicate = job.TargetObjectUid != null;
            if (duplicate && job.Source.ObjectUids.Length != 1)
            {
                throw new ArgumentException("You can only duplicate one object at a time.");
            }

            Witsml.IWitsmlClient targetClient = GetTargetWitsmlClientOrThrow();
            Witsml.IWitsmlClient sourceClient = GetSourceWitsmlClientOrThrow();

            WitsmlWellbore targetWellbore = await WorkerTools.GetWellbore(targetClient, job.Target, retry: true);

            List<IWitsmlObjectList> fetchObjectsQueries = job.Source.ObjectUids.Chunk(10).Select(chunk =>
                    ObjectQueries.GetWitsmlObjectsByIds(job.Source.WellUid, job.Source.WellboreUid, chunk, job.Source.ObjectType)
                ).ToList();

            List<Task<IWitsmlObjectList>> fetchObjectsTasks = fetchObjectsQueries.Select(query => sourceClient.GetFromStoreNullableAsync(query, new OptionsIn(ReturnElements.All))).ToList();

            await Task.WhenAll(fetchObjectsTasks);

            List<IWitsmlObjectList> objectListsToCopy = fetchObjectsTasks.Select(task => task.Result).ToList();

            if (objectListsToCopy.Any(witsmlObjectList => witsmlObjectList == null))
            {
                return (new WorkerResult(targetClient.GetServerHostname(), false, "Failed to deserialize response from Witsml server when fetching objects to copy", sourceServerUrl: sourceClient.GetServerHostname()), null);
            }
            if (objectListsToCopy.All(witsmlObjectList => !witsmlObjectList.Objects.Any()))
            {
                return (new WorkerResult(targetClient.GetServerHostname(), false, "Could not find any objects to copy", sourceServerUrl: sourceClient.GetServerHostname()), null);
            }
            if (cancellationToken is { IsCancellationRequested: true })
            {
                return (new WorkerResult(targetClient.GetServerHostname(), false, CancellationMessage(), CancellationReason(), sourceServerUrl: sourceClient.GetServerHostname()), null);
            }

            List<WitsmlObjectOnWellbore> objectsToCopy = objectListsToCopy.SelectMany(objectsToCopy => objectsToCopy.Objects).ToList();

            ICollection<WitsmlObjectOnWellbore> queries = ObjectQueries.CopyObjectsQuery(objectsToCopy, targetWellbore);
            if (duplicate)
            {
                queries.First().Uid = job.TargetObjectUid;
                queries.First().Name = job.TargetObjectName;
            }
            RefreshObjects refreshAction = new(targetClient.GetServerHostname(), job.Target.WellUid, job.Target.WellboreUid, job.Source.ObjectType);
            return await _copyUtils.CopyObjectsOnWellbore(targetClient, sourceClient, queries, refreshAction, job.Source.WellUid, job.Source.WellboreUid);
        }
    }
}
