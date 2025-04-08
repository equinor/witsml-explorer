using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.Data;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Models.Reports;
using WitsmlExplorer.Api.Query;
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
        private const int _timeLogCopyDuration = 600;
        private const int _depthLogCopyDuration = 200;
        public CopyWellboreWithObjectsWorker(ILogger<CopyWellboreWithObjectsJob> logger, ICopyWellboreWorker copyWellboreWorker, IWitsmlClientProvider witsmlClientProvider, ICopyObjectsWorker copyObjectsWorker) : base(witsmlClientProvider, logger)
        {
            _copyWellboreWorker = copyWellboreWorker;
            _copyObjectsWorker = copyObjectsWorker;
        }

        public JobType JobType => JobType.CopyWellboreWithObjects;

        public override async Task<(WorkerResult, RefreshAction)> Execute(CopyWellboreWithObjectsJob job, CancellationToken? cancellationToken = null)
        {
            IWitsmlClient sourceClient = GetSourceWitsmlClientOrThrow();
            IWitsmlClient targetClient = GetTargetWitsmlClientOrThrow();
            var reportItems = new List<CopyWellboreWithObjectsReportItem>();
            var copyWellboreJob = new CopyWellboreJob()
            {
                Target = new WellboreReference()
                {
                    WellUid = job.Target.WellUid,
                    WellboreUid = job.Source.WellboreUid,
                    WellName = job.Target.WellName,
                    WellboreName = job.Source.WellboreName
                }
                ,
                Source = new WellboreReference()
                {
                    WellUid = job.Source.WellUid,
                    WellboreUid = job.Source.WellboreUid,
                    WellName = job.Source.WellName,
                    WellboreName = job.Source.WellboreName
                }
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
            var durationMap = CreateDurationMap();
            var existingTimeLogs =
                new Dictionary<EntityType, IWitsmlObjectList>
                {
                    {
                        EntityType.Log, await FetchWellboreLogs(job,
                            sourceClient,
                            WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME)
                    }
                };
            var existingDepthLogs =
                new Dictionary<EntityType, IWitsmlObjectList>
                {
                    {
                        EntityType.Log, await FetchWellboreLogs(job,
                            sourceClient,
                            WitsmlLog.WITSML_INDEX_TYPE_MD)
                    }
                };
            var existingObjectsOnWellbore =
               await FetchWellboreObjects(job, sourceClient);

            var totalEstimatedLength = CalculateTotalEstimatedTime(
                existingTimeLogs, existingDepthLogs, existingObjectsOnWellbore,
                durationMap);

            reportItems.AddRange(await CopyWellboreObjectsByType(job,
                EntityType.Attachment, existingObjectsOnWellbore, totalEstimatedLength, durationMap,
                cancellationToken));

            reportItems.AddRange(await CopyWellboreObjectsByType(job,
                EntityType.BhaRun, existingObjectsOnWellbore, totalEstimatedLength, durationMap,
                cancellationToken));
            reportItems.AddRange(await CopyWellboreObjectsByType(job,
                EntityType.FluidsReport, existingObjectsOnWellbore, totalEstimatedLength, durationMap,
                cancellationToken));
            reportItems.AddRange(await CopyWellboreObjectsByType(job,
                EntityType.FormationMarker,
                existingObjectsOnWellbore, totalEstimatedLength, durationMap, cancellationToken));
            reportItems.AddRange(await CopyWellboreObjectsByType(job,
                EntityType.Message,
                existingObjectsOnWellbore, totalEstimatedLength, durationMap, cancellationToken));
            reportItems.AddRange(await CopyWellboreObjectsByType(job,
                EntityType.MudLog,
                existingObjectsOnWellbore, totalEstimatedLength, durationMap, cancellationToken));
            reportItems.AddRange(await CopyWellboreObjectsByType(job,
                EntityType.Rig, existingObjectsOnWellbore, totalEstimatedLength, durationMap,
                cancellationToken));
            reportItems.AddRange(await CopyWellboreObjectsByType(job,
                EntityType.Risk, existingObjectsOnWellbore, totalEstimatedLength, durationMap,
                cancellationToken));
            reportItems.AddRange(await CopyWellboreObjectsByType(job,
                EntityType.Trajectory,
                existingObjectsOnWellbore, totalEstimatedLength, durationMap, cancellationToken));
            reportItems.AddRange(await CopyWellboreObjectsByType(job,
                EntityType.Tubular,
                existingObjectsOnWellbore,totalEstimatedLength, durationMap, cancellationToken));
            reportItems.AddRange(await CopyWellboreObjectsByType(job,
                EntityType.WbGeometry, existingObjectsOnWellbore, totalEstimatedLength, durationMap,
                cancellationToken));

            reportItems.AddRange(await CopyWellboreObjectsByType(job,
                EntityType.Log, existingTimeLogs, totalEstimatedLength, durationMap, cancellationToken,
                WitsmlLog.WITSML_INDEX_TYPE_MD));


            reportItems.AddRange(await CopyWellboreObjectsByType(job,
                EntityType.Log, existingDepthLogs, totalEstimatedLength, durationMap, cancellationToken,
                WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME));

            var fails = reportItems.Count(x => x.Status == "Fail");
            string summary = fails > 0
                ? $"Partially copied wellbore with some child objects. Failed to copy {fails} out of {reportItems.Count()} objects."
                : "Successfully copied wellbore with all supported child objects.";
            BaseReport report = CreateCopyWellboreWithObjectsReport(reportItems, summary);
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

        private  Dictionary<EntityType, int> CreateDurationMap()
        {
            var durations = new Dictionary<EntityType, int>
            {
                { EntityType.Attachment, 10 },
                { EntityType.Trajectory, 10 },
                { EntityType.Rig, 10 },
                { EntityType.Tubular, 10 },
                { EntityType.FluidsReport, 10 },
                { EntityType.Message, 10 },
                { EntityType.Risk, 10 },
                { EntityType.BhaRun, 10 },
                { EntityType.FormationMarker, 10 },
                { EntityType.MudLog, 10 },
                { EntityType.WbGeometry, 10 }
            };
            return durations;
        }

        private long CalculateTotalEstimatedTime(
            Dictionary<EntityType, IWitsmlObjectList> existingTimeLogs,
            Dictionary<EntityType, IWitsmlObjectList> existingDepthLogs,
            Dictionary<EntityType, IWitsmlObjectList> objectsOnWellbore,
            Dictionary<EntityType, int> durationMap)
        {
            var result = existingDepthLogs[EntityType.Log].Objects.Count() * _depthLogCopyDuration + existingTimeLogs[EntityType.Log].Objects.Count() * _timeLogCopyDuration;
            foreach (EntityType entityType in
                     Enum.GetValues(typeof(EntityType)))
            {
                if (entityType != EntityType.Log &&
                    entityType != EntityType.Well &&
                    entityType != EntityType.Wellbore)
                {
                    result += objectsOnWellbore[entityType].Objects.Count() *
                              durationMap[entityType];
                }
            }
            return result;
        }

        private void UpdateJobProgress(CopyWellboreWithObjectsJob job, EntityType entityType, string logIndexType, long totalEstimatedLength, Dictionary<EntityType, int> durationMap, int objectsToCopyCount, int count)
        {
            var progress = job.JobInfo.Progress;
            if (entityType == EntityType.Log)
            {
                if (logIndexType == WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME)
                {
                    var step =  (double) _timeLogCopyDuration /totalEstimatedLength * count /objectsToCopyCount;
                    progress += step;
                }
                else
                {
                    var step =  (double) _depthLogCopyDuration /totalEstimatedLength * count /objectsToCopyCount;
                    progress += step;
                }
            }
            else
            {
                var step = (double) durationMap[entityType] /totalEstimatedLength * count /objectsToCopyCount;
                progress += step;
            }

            if (progress > 1)
            {
                progress = 1;
            }
            job.ProgressReporter?.Report(progress);
            if (job.JobInfo != null) job.JobInfo.Progress = progress;
        }
        private CommonCopyReport CreateCopyWellboreWithObjectsReport(List<CopyWellboreWithObjectsReportItem> reportItems, string summary)
        {
            return new CommonCopyReport
            {
                Title = $"Copy wellbore with objects report",
                Summary = summary,
                ReportItems = reportItems
            };
        }

        private async Task<CopyWellboreWithObjectsReportItem> CopyOneObject(WitsmlObjectOnWellbore objectOnWellbore, CopyWellboreWithObjectsJob job, EntityType entityType, CancellationToken? cancellationToken)
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
                    Target = new WellboreReference()
                    {
                        WellboreName = job.Source.WellboreName,
                        WellboreUid = job.Source.WellboreUid,
                        WellName = job.Target.WellName,
                        WellUid = job.Target.WellUid,
                    }
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
                return reportItem;
            }
        }

        private async Task<List<CopyWellboreWithObjectsReportItem>> CopyWellboreObjectsByType(CopyWellboreWithObjectsJob job, EntityType entityType, Dictionary<EntityType, IWitsmlObjectList> existingObjects, long totalEstimatedLength,  Dictionary<EntityType, int> durationMap,  CancellationToken? cancellationToken, string logIndexType = null)
        {
            var reportItems = new List<CopyWellboreWithObjectsReportItem>();
            var objectsToCopy = existingObjects[entityType].Objects;
            if (objectsToCopy.Any())
            {
                int count = 0;
                foreach (var objectOnWellbore in objectsToCopy)
                {
                    var reportItem = await CopyOneObject(objectOnWellbore, job, entityType,
                        cancellationToken);
                    count++;
                    UpdateJobProgress(job, entityType, logIndexType, totalEstimatedLength, durationMap, objectsToCopy.Count(), count );
                    reportItems.Add(reportItem);
                }
            }
            return reportItems;
        }

        private static async Task <IWitsmlObjectList> FetchWellboreLogs(CopyWellboreWithObjectsJob job,
            IWitsmlClient sourceClient, string logIndexType)
        {
            IWitsmlObjectList query =
                ObjectQueries.GetWitsmlObjectById(job.Source.WellUid,
                    job.Source.WellboreUid, "", EntityType.Log);
            ((WitsmlLog)query.Objects.FirstOrDefault()).IndexType = logIndexType;
            IWitsmlObjectList witsmlObjectList =
                await sourceClient.GetFromStoreNullableAsync(query,
                    new OptionsIn(ReturnElements.IdOnly));
            return witsmlObjectList;
        }

        private static async Task<Dictionary<EntityType, IWitsmlObjectList>> FetchWellboreObjects(CopyWellboreWithObjectsJob job,
            IWitsmlClient sourceClient)
        {
            var result = new Dictionary<EntityType, IWitsmlObjectList>();
            foreach (EntityType entityType in Enum.GetValues(typeof(EntityType)))
            {
                if (entityType != EntityType.Log && entityType != EntityType.Well && entityType != EntityType.Wellbore)
                {
                    IWitsmlObjectList query =
                        ObjectQueries.GetWitsmlObjectById(job.Source.WellUid,
                            job.Source.WellboreUid, "", entityType);

                    IWitsmlObjectList witsmlObjectList =
                        await sourceClient.GetFromStoreNullableAsync(query,
                            new OptionsIn(ReturnElements.IdOnly));
                    result.Add(entityType, witsmlObjectList);
                }
            }
            return result;
        }
    }
}
