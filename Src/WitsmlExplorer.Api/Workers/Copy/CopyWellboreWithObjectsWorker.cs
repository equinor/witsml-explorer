using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Mvc;
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
        private readonly ICopyLogWorker _copyLogWorker;
        private readonly ICopyObjectsWorker _copyObjectsWorker;
        public CopyWellboreWithObjectsWorker(ILogger<CopyWellboreWithObjectsJob> logger, ICopyWellboreWorker copyWellboreWorker, ICopyLogWorker copyLogWorker, IWitsmlClientProvider witsmlClientProvider, ICopyObjectsWorker copyObjectsWorker) : base(witsmlClientProvider, logger)
        {
            _copyWellboreWorker = copyWellboreWorker;
            _copyLogWorker = copyLogWorker;
            _copyObjectsWorker = copyObjectsWorker;
        }

        public JobType JobType => JobType.CopyWellboreWithObjects;

        public override async Task<(WorkerResult, RefreshAction)> Execute(CopyWellboreWithObjectsJob job, CancellationToken? cancellationToken = null)
        {
            IWitsmlClient sourceClient = GetSourceWitsmlClientOrThrow();
            IWitsmlClient targetClient = GetTargetWitsmlClientOrThrow();
            var reportItems = new List<CommonCopyReportItem>();
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
            (WorkerResult result, RefreshAction refresh) wellboreResult =
                await _copyWellboreWorker.Execute(copyWellboreJob,
                    cancellationToken);
            string wellboreAlredyExists = "Target wellbore already exists";
            if (wellboreResult.result.Message == wellboreAlredyExists)
            {
                string errorMessage = "Failed to copy wellbore with objects. " + wellboreAlredyExists;
                Logger.LogError("{ErrorMessage} {Reason} - {JobDescription}", errorMessage, errorMessage, job.Description());
                return (new WorkerResult(targetClient.GetServerHostname(), false, errorMessage, errorMessage, sourceServerUrl: sourceClient.GetServerHostname()), null);
            }
            if (!wellboreResult.result.IsSuccess)
            {
                string errorMessage = "Failed to copy wellbore with objects - creation of wellbore failed";
                Logger.LogError("{ErrorMessage} {Reason} - {JobDescription}", errorMessage, wellboreResult.result.Reason, job.Description());
                return (new WorkerResult(targetClient.GetServerHostname(), false, errorMessage, wellboreResult.result.Reason, sourceServerUrl: sourceClient.GetServerHostname()), null);
            }
            await CopyWellboreObjectsByType(job,
                EntityType.Attachment, sourceClient, reportItems,
                cancellationToken);
            await CopyWellboreObjectsByType(job,
                EntityType.BhaRun, sourceClient, reportItems,
                cancellationToken);
            await CopyWellboreObjectsByType(job,
                EntityType.FluidsReport, sourceClient, reportItems,
                cancellationToken);
            await CopyWellboreObjectsByType(job, EntityType.FormationMarker,
                sourceClient, reportItems, cancellationToken);
            await CopyWellboreObjectsByType(job, EntityType.Message,
                sourceClient, reportItems, cancellationToken);
            await CopyWellboreObjectsByType(job, EntityType.MudLog,
                sourceClient, reportItems, cancellationToken);
            await CopyWellboreObjectsByType(job, EntityType.Rig, sourceClient,
                reportItems, cancellationToken);
            await CopyWellboreObjectsByType(job, EntityType.Risk, sourceClient,
                reportItems, cancellationToken);
            await CopyWellboreObjectsByType(job, EntityType.Trajectory,
                sourceClient, reportItems, cancellationToken);
            await CopyWellboreObjectsByType(job, EntityType.Tubular,
                sourceClient, reportItems, cancellationToken);
            await CopyWellboreObjectsByType(job,
                EntityType.WbGeometry, sourceClient, reportItems,
                cancellationToken);

            await CopyWellboreObjectsByType(job,
                EntityType.Log, sourceClient, reportItems,
                cancellationToken, WitsmlLog.WITSML_INDEX_TYPE_MD);

            await CopyWellboreObjectsByType(job,
                EntityType.Log, sourceClient, reportItems,
                cancellationToken, WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME);

            BaseReport report = CreateCopyWellboreWithObjectsReport(reportItems);
            job.JobInfo.Report = report;

            var fails = reportItems.Count(x => x.Status == "Fail");
            if (fails > 0)
            {
                WorkerResult workerResult = new(targetClient.GetServerHostname(), true, $"Successfully copied wellbore with supported child objects, copying of some objects failed: {job.Source.WellboreUid} -> {job.Source.WellboreUid}", sourceServerUrl: sourceClient.GetServerHostname());
                RefreshAction refreshAction = new RefreshWell(targetClient.GetServerHostname(), job.Target.WellUid, RefreshType.Update);
                return (workerResult, refreshAction);
            }
            else
            {
                WorkerResult workerResult = new(targetClient.GetServerHostname(), true, $"Successfully copied wellbore with all supported child objects: {job.Source.WellboreUid} -> {job.Source.WellboreUid}", sourceServerUrl: sourceClient.GetServerHostname());
                RefreshAction refreshAction = new RefreshWell(targetClient.GetServerHostname(), job.Target.WellUid, RefreshType.Update);
                return (workerResult, refreshAction);
            }
        }

        private CommonCopyReport CreateCopyWellboreWithObjectsReport(List<CommonCopyReportItem> reportItems)
        {
            return new CommonCopyReport
            {
                Title = $"Copy wellbore with objects report",
                Summary = "Copy wellbore  parent report",
                ReportItems = reportItems,
                JobDetails = "report details"
            };
        }

        private async Task CopyTimeLog(WitsmlObjectOnWellbore timeLog, CopyWellboreWithObjectsJob job, List<CommonCopyReportItem> reportItems, CancellationToken? cancellationToken)
        {
            try
            {
                var copyLogJob = new CopyObjectsJob()
                {
                    Source = new ObjectReferences()
                    {
                        Names = new[]
                        {
                            timeLog.Name
                        },
                        ObjectUids = new[]
                        {
                            timeLog.Uid
                        },
                        ObjectType = EntityType.Log,
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
                (WorkerResult result, RefreshAction refresh) copyLogResult = await _copyLogWorker.Execute(copyLogJob, cancellationToken);
                var reportItem = new CommonCopyReportItem()
                {
                    Phase = "Copy time based log " + timeLog.Name,
                    Message = copyLogResult.result.Message,
                    Status = GetJobStatus(copyLogResult.result.IsSuccess, cancellationToken)
                };
                reportItems.Add(reportItem);
            }
            catch (Exception ex)
            {
                var reportItem = new CommonCopyReportItem()
                {
                    Phase = "Copy time based log " + timeLog.Name,
                    Message = ex.Message,
                    Status = GetJobStatus(false, cancellationToken)
                };
                reportItems.Add(reportItem);
            }
        }

        private async Task CopyWellboreObjectsByType(CopyWellboreWithObjectsJob job, EntityType entityType, IWitsmlClient sourceClient, List<CommonCopyReportItem> reportItems, CancellationToken? cancellationToken, string logIndexType = null)
        {
            var types = EntityTypeHelper.ToPluralLowercase();
            try
            {
                IWitsmlObjectList query =
                    ObjectQueries.GetWitsmlObjectById(job.Source.WellUid,
                        job.Source.WellboreUid, "", entityType);
                if (entityType == EntityType.Log)
                {
                    ((WitsmlLog)query.Objects.FirstOrDefault()).IndexType = logIndexType;
                }
                IWitsmlObjectList result =
                    await sourceClient.GetFromStoreNullableAsync(query,
                        new OptionsIn(ReturnElements.IdOnly));
                if (result.Objects.Any())
                {
                    if (entityType == EntityType.Log && logIndexType ==
                        WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME)
                    {
                        foreach (var timeLog in result.Objects)
                        {
                            await CopyTimeLog(timeLog, job, reportItems,
                                cancellationToken);
                        }
                    }
                    else
                    {
                        var copyJob = new CopyObjectsJob()
                        {
                            Source = new ObjectReferences()
                            {
                                WellUid = job.Source.WellUid,
                                WellName = job.Source.WellName,
                                WellboreUid = job.Source.WellboreUid,
                                WellboreName = job.Source.WellboreUid,
                                ObjectType = entityType,
                                ObjectUids =
                                    result.Objects.Select(x => x.Uid).ToArray()
                            },
                            Target = new WellboreReference()
                            {
                                WellboreName = job.Source.WellboreName,
                                WellboreUid = job.Source.WellboreUid,
                                WellName = job.Target.WellName,
                                WellUid = job.Target.WellUid,
                            }
                        };
                        (WorkerResult result, RefreshAction refresh)
                            copyResult =
                                await _copyObjectsWorker.Execute(copyJob,
                                    cancellationToken);
                        var reportItem = new CommonCopyReportItem()
                        {
                            Phase = "Copy " + types[entityType],
                            Message = copyResult.result.Message,
                            Status = GetJobStatus(copyResult.result.IsSuccess,
                                cancellationToken)
                        };
                        reportItems.Add(reportItem);
                    }
                }
            }
            catch (Exception ex)
            {
                var reportItem = new CommonCopyReportItem()
                {
                    Phase = "Copy " + types[entityType],
                    Message = ex.Message,
                    Status = GetJobStatus(false, cancellationToken)
                };
                reportItems.Add(reportItem);
            }
        }
    }
}
