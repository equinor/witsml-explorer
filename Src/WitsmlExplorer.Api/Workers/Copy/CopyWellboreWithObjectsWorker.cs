using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.Data;
using Witsml.Extensions;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Models.Reports;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Repositories;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers.Copy
{
    public interface ICopyWellboreWithObjectsWorker
    {
        Task<(WorkerResult, RefreshAction)> Execute(CopyWellboreWithObjectsJob job, CancellationToken? cancellationToken = null);
    }

    public class CopyWellboreWithObjectsWorker : BaseWorker<CopyWellboreWithObjectsJob>, IWorker, ICopyWellboreWithObjectsWorker
    {
        private readonly ICopyWellboreWorker _copyWellboreWorker;
        private readonly ICopyObjectsWorker _copyObjectsWorker;
        private readonly IDocumentRepository<Server, Guid> _witsmlServerRepository;
        private string _sourceServerName;
        private string _targetServerName;
        public CopyWellboreWithObjectsWorker(ILogger<CopyWellboreWithObjectsJob> logger, ICopyWellboreWorker copyWellboreWorker, IWitsmlClientProvider witsmlClientProvider, ICopyObjectsWorker copyObjectsWorker, IDocumentRepository<Server, Guid> witsmlServerRepository = null) : base(witsmlClientProvider, logger)
        {
            _copyWellboreWorker = copyWellboreWorker;
            _copyObjectsWorker = copyObjectsWorker;
            _witsmlServerRepository = witsmlServerRepository;
        }

        public JobType JobType => JobType.CopyWellboreWithObjects;

        public override async Task<(WorkerResult, RefreshAction)> Execute(CopyWellboreWithObjectsJob job, CancellationToken? cancellationToken = null)
        {
            IWitsmlClient sourceClient = GetSourceWitsmlClientOrThrow();
            IWitsmlClient targetClient = GetTargetWitsmlClientOrThrow();
            IEnumerable<Server> servers = _witsmlServerRepository == null ? new List<Server>() : await _witsmlServerRepository.GetDocumentsAsync();
            Uri sourceHostname = GetSourceWitsmlClientOrThrow().GetServerHostname();
            Uri targetHostname = GetTargetWitsmlClientOrThrow().GetServerHostname();
            _sourceServerName = servers.FirstOrDefault((server) => server.Url.EqualsIgnoreCase(sourceHostname))?.Name;
            _targetServerName = servers.FirstOrDefault((server) => server.Url.EqualsIgnoreCase(targetHostname))?.Name;
            var reportItems = new List<CopyWellboreWithObjectsReportItem>();
            var copyWellboreJob = new CopyWellboreJob()
            {
                Target = job.Target,
                Source = job.Source
            };
            var existingWellbore = await WorkerTools.GetWellbore(targetClient, copyWellboreJob.Target);

            if (existingWellbore != null)
            {
                string errorMessage = "Failed to copy wellbore with objects. Target wellbore already exists.";
                Logger.LogError("{ErrorMessage} {Reason} - {JobDescription}", errorMessage, errorMessage, job.Description());
                return (new WorkerResult(targetClient.GetServerHostname(), false, errorMessage, errorMessage, sourceServerUrl: sourceClient.GetServerHostname()), null);
            }

            (WorkerResult result, RefreshAction refresh) wellboreResult =
                await _copyWellboreWorker.Execute(copyWellboreJob,
                    cancellationToken);
            if (!wellboreResult.result.IsSuccess)
            {
                string errorMessage = "Failed to copy wellbore with objects - creation of wellbore failed";
                Logger.LogError("{ErrorMessage} {Reason} - {JobDescription}", errorMessage, wellboreResult.result.Reason, job.Description());
                return (new WorkerResult(targetClient.GetServerHostname(), false, errorMessage, wellboreResult.result.Reason, sourceServerUrl: sourceClient.GetServerHostname()), null);
            }

            var existingObjectsOnWellbore =
               await GetWellboreObjects(job, sourceClient);

            var totalEstimatedDuration = CalculateTotalEstimatedDuration(existingObjectsOnWellbore);
            long elapsedDuration = 0;

            foreach (var ((entityType, logIndexType), objectList) in existingObjectsOnWellbore)
            {
                long estimatedObjectDuration = objectList.Objects.Count() * GetEstimatedDuration(entityType, logIndexType);
                long currentElapsedDuration = elapsedDuration; // Capture the value to avoid closure issues when we increment the duration later as the progress reporter is async.
                IProgress<double> subJobProgressReporter = new Progress<double>(subJobProgress =>
                {
                    var progress = ((double)currentElapsedDuration / totalEstimatedDuration) + (estimatedObjectDuration * (double)subJobProgress / totalEstimatedDuration);
                    if (job.JobInfo != null) job.JobInfo.Progress = progress;
                    job.ProgressReporter?.Report(progress);
                });

                List<CopyWellboreWithObjectsReportItem> objectTypeReportItems = await CopyWellboreObjectsByType(
                    job, entityType, objectList.Objects, subJobProgressReporter, cancellationToken
                );
                reportItems.AddRange(objectTypeReportItems);
                elapsedDuration += estimatedObjectDuration;
            }

            var fails = reportItems.Count(x => x.Status == "Fail");
            string summary = fails > 0
                ? $"Partially copied wellbore with some child objects. Failed to copy {fails} out of {reportItems.Count} objects."
                : "Successfully copied wellbore with all supported child objects.";
            BaseReport report = CreateCopyWellboreWithObjectsReport(reportItems, summary, job);
            job.JobInfo.Report = report;
            if (fails > 0)
            {
                WorkerResult workerResult = new(targetClient.GetServerHostname(), true, summary, sourceServerUrl: sourceClient.GetServerHostname());
                RefreshAction refreshAction = new RefreshWell(targetClient.GetServerHostname(), job.Target.WellUid, RefreshType.Update);
                return (workerResult, refreshAction);
            }
            else
            {
                WorkerResult workerResult = new(targetClient.GetServerHostname(), true, summary, sourceServerUrl: sourceClient.GetServerHostname());
                RefreshAction refreshAction = new RefreshWell(targetClient.GetServerHostname(), job.Target.WellUid, RefreshType.Update);
                return (workerResult, refreshAction);
            }
        }

        private static long GetEstimatedDuration(EntityType objectType, string logIndexType = null)
        {
            // Roughly estimate the duration without knowing the size of any object.
            if (objectType == EntityType.Log)
            {
                return logIndexType == WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME ? 600 : 200;
            }
            return 10;
        }

        private static long CalculateTotalEstimatedDuration(Dictionary<(EntityType, string), IWitsmlObjectList> objectsOnWellbore)
        {
            long estimatedDuration = 0;
            foreach (var ((entityType, logIndexType), objectList) in objectsOnWellbore)
            {
                estimatedDuration += objectList.Objects.Count() * GetEstimatedDuration(entityType, logIndexType);
            }
            return estimatedDuration;
        }

        private CommonCopyReport CreateCopyWellboreWithObjectsReport(List<CopyWellboreWithObjectsReportItem> reportItems, string summary, CopyWellboreWithObjectsJob job)
        {
            return new CommonCopyReport
            {
                Title = $"Copy wellbore with objects report",
                Summary = summary,
                ReportItems = reportItems,
                JobDetails = $"SourceServer::{_sourceServerName}|TargetServer::{_targetServerName}|SourceWell::{job.Source.WellName}|TargetWell::{job.Target.WellName}|SourceWellbore::{job.Source.WellboreName}|TargetWellbore::{job.Target.WellboreName}"
            };
        }

        private async Task<CopyWellboreWithObjectsReportItem> CopyOneObject(WitsmlObjectOnWellbore objectOnWellbore, CopyWellboreWithObjectsJob job, EntityType entityType, IProgress<double> progressReporter, CancellationToken? cancellationToken)
        {
            try
            {
                cancellationToken?.ThrowIfCancellationRequested();
                var copyObjectJob = new CopyObjectsJob()
                {
                    Source = new ObjectReferences()
                    {
                        Names = new[]
                        {
                            objectOnWellbore.Name
                        },
                        ObjectUids = new[]
                        {
                            objectOnWellbore.Uid
                        },
                        ObjectType = entityType,
                        WellName = job.Source.WellName,
                        WellUid = job.Source.WellUid,
                        WellboreUid = job.Source.WellboreUid,
                        WellboreName = job.Source.WellboreName
                    },
                    Target = job.Target,
                    ProgressReporter = progressReporter
                };
                (WorkerResult result, RefreshAction refresh) copyObjectResult = await _copyObjectsWorker.Execute(copyObjectJob, cancellationToken);
                var reportItem = new CopyWellboreWithObjectsReportItem()
                {
                    Phase = "Copy " + entityType,
                    Name = objectOnWellbore.Name,
                    Uid = objectOnWellbore.Uid,
                    Message = copyObjectResult.result.Message,
                    Status = GetJobStatus(copyObjectResult.result.IsSuccess, cancellationToken)
                };
                progressReporter.Report(1.0); //Report the progress for this object in case the sub-job does not report any progress.
                return reportItem;
            }
            catch (Exception ex)
            {
                var reportItem = new CopyWellboreWithObjectsReportItem()
                {
                    Phase = "Copy " + entityType,
                    Name = objectOnWellbore.Name,
                    Uid = objectOnWellbore.Uid,
                    Message = ex.Message,
                    Status = GetJobStatus(false, cancellationToken)
                };
                progressReporter.Report(1.0); //Report the progress for this object in case the sub-job does not report any progress.
                return reportItem;
            }
        }

        private async Task<List<CopyWellboreWithObjectsReportItem>> CopyWellboreObjectsByType(CopyWellboreWithObjectsJob job, EntityType entityType, IEnumerable<WitsmlObjectOnWellbore> objectsToCopy, IProgress<double> progressReporter, CancellationToken? cancellationToken)
        {
            var reportItems = new List<CopyWellboreWithObjectsReportItem>();
            var totalObjects = objectsToCopy?.Count() ?? 0;
            if (totalObjects > 0)
            {
                for (int i = 0; i < totalObjects; i++)
                {
                    var currentIndex = i; // Capture the value to avoid closure issues when i is increased as the progress reporter is async.
                    var objectOnWellbore = objectsToCopy.ElementAt(i);
                    IProgress<double> subJobProgressReporter = new Progress<double>(subJobProgress =>
                    {
                        var progress = ((double)currentIndex / totalObjects) + ((double)subJobProgress / totalObjects);
                        progressReporter.Report(progress);
                    });
                    var reportItem = await CopyOneObject(objectOnWellbore, job, entityType, subJobProgressReporter, cancellationToken);
                    reportItems.Add(reportItem);
                }
            }
            return reportItems;
        }

        private static async Task<Dictionary<(EntityType, string), IWitsmlObjectList>> GetWellboreObjects(CopyWellboreWithObjectsJob job, IWitsmlClient sourceClient)
        {
            var result = new Dictionary<(EntityType, string), IWitsmlObjectList>();
            foreach (EntityType entityType in Enum.GetValues(typeof(EntityType)))
            {
                if (entityType is EntityType.Well or EntityType.Wellbore or EntityType.Log) continue;
                result.Add((entityType, null), await GetWellboreObjectsByType(job, sourceClient, entityType));
            }
            result.Add((EntityType.Log, WitsmlLog.WITSML_INDEX_TYPE_MD), await GetWellboreObjectsByType(job, sourceClient, EntityType.Log, WitsmlLog.WITSML_INDEX_TYPE_MD));
            result.Add((EntityType.Log, WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME), await GetWellboreObjectsByType(job, sourceClient, EntityType.Log, WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME));
            return result;
        }

        private static async Task<IWitsmlObjectList> GetWellboreObjectsByType(CopyWellboreWithObjectsJob job, IWitsmlClient sourceClient, EntityType entityType, string logIndexType = null)
        {
            IWitsmlObjectList query = ObjectQueries.GetWitsmlObjectById(
                job.Source.WellUid,
                job.Source.WellboreUid,
                "",
                entityType
            );

            if (entityType == EntityType.Log)
            {
                ((WitsmlLog)query.Objects.FirstOrDefault()).IndexType = logIndexType;
            }

            IWitsmlObjectList witsmlObjectList = await sourceClient.GetFromStoreNullableAsync(
                query,
                new OptionsIn(ReturnElements.IdOnly)
            );

            return witsmlObjectList;
        }

    }
}
