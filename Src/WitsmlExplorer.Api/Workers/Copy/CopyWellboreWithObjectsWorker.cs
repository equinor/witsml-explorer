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
        private readonly IObjectService _objectService;
        private const string Skipped = "Skipped";
        private const string Fail = "Fail";
        private string _sourceServerName;
        private string _targetServerName;
        public CopyWellboreWithObjectsWorker(ILogger<CopyWellboreWithObjectsJob> logger, ICopyWellboreWorker copyWellboreWorker, IWitsmlClientProvider witsmlClientProvider, ICopyObjectsWorker copyObjectsWorker, IObjectService objectService, IDocumentRepository<Server, Guid> witsmlServerRepository = null) : base(witsmlClientProvider, logger)
        {
            _copyWellboreWorker = copyWellboreWorker;
            _copyObjectsWorker = copyObjectsWorker;
            _witsmlServerRepository = witsmlServerRepository;
            _objectService = objectService;
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
                Source = job.Source.WellboreReference
            };
            WitsmlWellbore existingTargetWellbore = await WorkerTools.GetWellbore(targetClient, job.Target, ReturnElements.All);
            WitsmlWellbore sourceWellbore = await WorkerTools.GetWellbore(sourceClient, job.Source.WellboreReference, ReturnElements.All);

            if (existingTargetWellbore != null && _sourceServerName != null && _targetServerName != null && _sourceServerName == _targetServerName && job.Source.WellboreReference.WellboreUid == existingTargetWellbore.Uid && job.Source.WellboreReference.WellUid == existingTargetWellbore.UidWell)
            {
                string errorMessageSameWellbore = "Failed to copy wellbore with objects - tried to copy the same wellbore into the same well on the same server.";
                Logger.LogError("{ErrorMessage} {Reason} - {JobDescription}", errorMessageSameWellbore, errorMessageSameWellbore, job.Description());
                return (new WorkerResult(targetClient.GetServerHostname(), false, errorMessageSameWellbore, errorMessageSameWellbore, sourceServerUrl: sourceClient.GetServerHostname()), null);
            }

            string errorMessage = "Failed to copy wellbore.";

            if (sourceWellbore == null)
            {
                Logger.LogError("{ErrorMessage} - {JobDescription}", errorMessage, job.Description());
                return (new WorkerResult(targetClient.GetServerHostname(), false, errorMessage, sourceServerUrl: sourceClient.GetServerHostname()), null);
            }

            if (cancellationToken is { IsCancellationRequested: true })
            {
                return (new WorkerResult(targetClient.GetServerHostname(), false, CancellationMessage(), CancellationReason(), sourceServerUrl: sourceClient.GetServerHostname()), null);
            }

            sourceWellbore.Uid = job.Target.WellboreUid;
            sourceWellbore.Name = job.Target.WellboreName;
            sourceWellbore.UidWell = job.Target.WellUid;
            sourceWellbore.NameWell = job.Target.WellName;

            WitsmlWellbores wellbores = new() { Wellbores = { sourceWellbore } };

            QueryResult result = existingTargetWellbore == null
                ? await targetClient.AddToStoreAsync(wellbores)
                : await targetClient.UpdateInStoreAsync(wellbores);

            if (!result.IsSuccessful)
            {
                Logger.LogError("{ErrorMessage} {Reason} - {JobDescription}", errorMessage, result.Reason, job.Description());
                return (new WorkerResult(targetClient.GetServerHostname(), false, errorMessage, result.Reason, sourceServerUrl: sourceClient.GetServerHostname()), null);
            }
            Logger.LogInformation("{JobType} - Job successful. {Description}", GetType().Name, job.Description());

            var existingObjectsOnSourceWellbore =
                await GetWellboreObjects(job, sourceClient);
            var existingObjectsOnTargetWellbore = existingTargetWellbore != null ?
                await _objectService.GetAllObjectsOnWellbore(
                    existingTargetWellbore.UidWell, existingTargetWellbore.Uid) : new List<SelectableObjectOnWellbore>();
            var uidsOfObjectsOnTargetWellbore = existingObjectsOnTargetWellbore.Select(x => x.Uid).ToList();

            (WorkerResult result, RefreshAction refresh) wellboreResult =
                await _copyWellboreWorker.Execute(copyWellboreJob,
                    cancellationToken);
            if (!wellboreResult.result.IsSuccess)
            {
                string errorMessageFromWellboreWorker = "Failed to copy wellbore with objects - creation of wellbore failed";
                Logger.LogError("{ErrorMessage} {Reason} - {JobDescription}", errorMessageFromWellboreWorker, wellboreResult.result.Reason, job.Description());
                return (new WorkerResult(targetClient.GetServerHostname(), false, errorMessageFromWellboreWorker, wellboreResult.result.Reason, sourceServerUrl: sourceClient.GetServerHostname()), null);
            }

            var totalEstimatedDuration = CalculateTotalEstimatedDuration(existingObjectsOnSourceWellbore, uidsOfObjectsOnTargetWellbore);
            long elapsedDuration = 0;

            foreach (var ((entityType, logIndexType), objectList) in existingObjectsOnSourceWellbore)
            {
                var nonExistingObjectCount = objectList.Objects.Count(x => uidsOfObjectsOnTargetWellbore.IndexOf(x.Uid) > -1);
                long estimatedObjectDuration = nonExistingObjectCount * GetEstimatedDuration(entityType, logIndexType);
                long currentElapsedDuration = elapsedDuration; // Capture the value to avoid closure issues when we increment the duration later as the progress reporter is async.
                IProgress<double> subJobProgressReporter = new Progress<double>(subJobProgress =>
                {
                    var progress = ((double)currentElapsedDuration / totalEstimatedDuration) + (estimatedObjectDuration * (double)subJobProgress / totalEstimatedDuration);
                    if (job.JobInfo != null) job.JobInfo.Progress = progress;
                    job.ProgressReporter?.Report(progress);
                });

                List<CopyWellboreWithObjectsReportItem> objectTypeReportItems = await CopyWellboreObjectsByType(
                    job, entityType, objectList.Objects, subJobProgressReporter, uidsOfObjectsOnTargetWellbore, cancellationToken
                );
                reportItems.AddRange(objectTypeReportItems);
                elapsedDuration += estimatedObjectDuration;
            }

            var fails = reportItems.Count(x => x.Status == Fail);
            var skipped = reportItems.Count(x => x.Status == Skipped);
            string summary =
                CreateSummaryMessage(fails, skipped, reportItems.Count);
            BaseReport report = CreateCopyWellboreWithObjectsReport(reportItems, summary, job);
            job.JobInfo.Report = report;

            WorkerResult workerResult = new(targetClient.GetServerHostname(), true, summary, sourceServerUrl: sourceClient.GetServerHostname());
            RefreshAction refreshAction = new RefreshWell(targetClient.GetServerHostname(), job.Target.WellUid, RefreshType.Update);
            return (workerResult, refreshAction);
        }

        private static string CreateSummaryMessage(int fails, int skipped,
            int reportItemsCount)
        {
            if (fails == 0 && skipped == 0)
            {
                return
                    "Successfully copied wellbore with all supported child objects.";
            }

            string summary =
                "Partially copied wellbore with some child objects.";
            summary += (fails > 0
                ? $" Failed to copy {fails} out of {reportItemsCount} objects."
                : string.Empty);

            summary += (skipped > 0
                ? $" Skipped to copy {skipped} out of {reportItemsCount} objects."
                : string.Empty);
            return summary;
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

        private static long CalculateTotalEstimatedDuration(Dictionary<(EntityType, string), IWitsmlObjectList> objectsOnWellbore, List<string> uids)
        {
            long estimatedDuration = 0;
            foreach (var ((entityType, logIndexType), objectList) in objectsOnWellbore)
            {
                var nonExistingObjectCount = objectList.Objects.Count(x => uids.IndexOf(x.Uid) > -1);
                estimatedDuration += nonExistingObjectCount * GetEstimatedDuration(entityType, logIndexType);
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
                JobDetails = $"SourceServer::{_sourceServerName}|TargetServer::{_targetServerName}|SourceWell::{job.Source.WellboreReference.WellName}|TargetWell::{job.Target.WellName}|SourceWellbore::{job.Source.WellboreReference.WellboreName}|TargetWellbore::{job.Target.WellboreName}"
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
                        WellName = job.Source.WellboreReference.WellName,
                        WellUid = job.Source.WellboreReference.WellUid,
                        WellboreUid = job.Source.WellboreReference.WellboreUid,
                        WellboreName = job.Source.WellboreReference.WellboreName
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

        private async Task<List<CopyWellboreWithObjectsReportItem>> CopyWellboreObjectsByType(CopyWellboreWithObjectsJob job, EntityType entityType, IEnumerable<WitsmlObjectOnWellbore> objectsToCopy, IProgress<double> progressReporter, List<string> uidsOfObjectsOnTargetWellbore, CancellationToken? cancellationToken)
        {
            var reportItems = new List<CopyWellboreWithObjectsReportItem>();
            var totalObjects = objectsToCopy?.Count() ?? 0;
            if (totalObjects > 0)
            {
                for (int i = 0; i < totalObjects; i++)
                {
                    var currentIndex = i; // Capture the value to avoid closure issues when i is increased as the progress reporter is async.
                    var objectOnWellbore = objectsToCopy.ElementAt(i);
                    if (uidsOfObjectsOnTargetWellbore.IndexOf(objectOnWellbore.Uid) == -1)
                    {
                        IProgress<double> subJobProgressReporter = new Progress<double>(subJobProgress =>
                        {
                            var progress = ((double)currentIndex / totalObjects) + ((double)subJobProgress / totalObjects);
                            progressReporter.Report(progress);
                        });

                        var reportItem = await CopyOneObject(objectOnWellbore, job, entityType, subJobProgressReporter, cancellationToken);
                        reportItems.Add(reportItem);
                    }
                    else
                    {
                        var reportItem = new CopyWellboreWithObjectsReportItem()
                        {
                            Phase = "Copy " + entityType,
                            Name = objectOnWellbore.Name,
                            Uid = objectOnWellbore.Uid,
                            Message = "Object allready exists",
                            Status = Skipped
                        };
                        reportItems.Add(reportItem);
                    }
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
                if (!job.CopyAllChildObjects)
                {
                    var selectedObjects =
                        job.Source.SelectedObjects.Where(x =>
                            x.ObjectType == entityType.ToString());
                    if (!selectedObjects.Any())
                    {
                        continue;
                    }
                }
                result.Add((entityType, null), await GetWellboreObjectsByType(job, sourceClient, entityType));
            }
            result.Add((EntityType.Log, WitsmlLog.WITSML_INDEX_TYPE_MD), await GetWellboreObjectsByType(job, sourceClient, EntityType.Log, WitsmlLog.WITSML_INDEX_TYPE_MD));
            result.Add((EntityType.Log, WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME), await GetWellboreObjectsByType(job, sourceClient, EntityType.Log, WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME));
            return result;
        }

        private static async Task<IWitsmlObjectList> GetWellboreObjectsByType(CopyWellboreWithObjectsJob job, IWitsmlClient sourceClient, EntityType entityType, string logIndexType = null)
        {
            IWitsmlObjectList query = ObjectQueries.GetWitsmlObjectById(
                job.Source.WellboreReference.WellUid,
                job.Source.WellboreReference.WellboreUid,
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

            if (!job.CopyAllChildObjects)
            {
                var selectedObjects =
                    job.Source.SelectedObjects.Where(x =>
                        x.ObjectType == entityType.ToString());

                var selectedWitsmlObjects =
                    witsmlObjectList.Objects.Where(x =>
                        selectedObjects.Count(y => y.Uid == x.Uid) > 0);
                witsmlObjectList.Objects = selectedWitsmlObjects;
            }
            return witsmlObjectList;
        }

    }
}
