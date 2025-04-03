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

            reportItems.AddRange(await CopyWellboreObjectsByType(job,
                EntityType.Attachment, sourceClient, cancellationToken));
            reportItems.AddRange(await CopyWellboreObjectsByType(job,
                EntityType.BhaRun, sourceClient, cancellationToken));
            reportItems.AddRange(await CopyWellboreObjectsByType(job,
                EntityType.FluidsReport, sourceClient, cancellationToken));
            reportItems.AddRange(await CopyWellboreObjectsByType(job,
                EntityType.FormationMarker,
                sourceClient, cancellationToken));
            reportItems.AddRange(await CopyWellboreObjectsByType(job,
                EntityType.Message,
                sourceClient, cancellationToken));
            reportItems.AddRange(await CopyWellboreObjectsByType(job,
                EntityType.MudLog,
                sourceClient, cancellationToken));
            reportItems.AddRange(await CopyWellboreObjectsByType(job,
                EntityType.Rig, sourceClient,
                cancellationToken));
            reportItems.AddRange(await CopyWellboreObjectsByType(job,
                EntityType.Risk, sourceClient,
                cancellationToken));
            reportItems.AddRange(await CopyWellboreObjectsByType(job,
                EntityType.Trajectory,
                sourceClient, cancellationToken));
            reportItems.AddRange(await CopyWellboreObjectsByType(job,
                EntityType.Tubular,
                sourceClient, cancellationToken));
            reportItems.AddRange(await CopyWellboreObjectsByType(job,
                EntityType.WbGeometry, sourceClient,
                cancellationToken));

            reportItems.AddRange(await CopyWellboreObjectsByType(job,
                EntityType.Log, sourceClient, cancellationToken,
                WitsmlLog.WITSML_INDEX_TYPE_MD));

            reportItems.AddRange(await CopyWellboreObjectsByType(job,
                EntityType.Log, sourceClient, cancellationToken,
                WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME));

            BaseReport report = CreateCopyWellboreWithObjectsReport(reportItems);
            job.JobInfo.Report = report;

            var fails = reportItems.Count(x => x.Status == "Fail");
            if (fails > 0)
            {
                WorkerResult workerResult = new(targetClient.GetServerHostname(), true, $"Partially copied wellbore with some child objects. Failed to copy {fails} out of {reportItems.Count()} objects.", sourceServerUrl: sourceClient.GetServerHostname());
                RefreshAction refreshAction = new RefreshWell(targetClient.GetServerHostname(), job.Target.WellUid, RefreshType.Update);
                return (workerResult, refreshAction);
            }
            else
            {
                WorkerResult workerResult = new(targetClient.GetServerHostname(), true, $"Successfully copied wellbore with all supported child objects.", sourceServerUrl: sourceClient.GetServerHostname());
                RefreshAction refreshAction = new RefreshWell(targetClient.GetServerHostname(), job.Target.WellUid, RefreshType.Update);
                return (workerResult, refreshAction);
            }
        }

        private CommonCopyReport CreateCopyWellboreWithObjectsReport(List<CopyWellboreWithObjectsReportItem> reportItems)
        {
            return new CommonCopyReport
            {
                Title = $"Copy wellbore with objects report",
                Summary = "Copy wellbore  parent report",
                ReportItems = reportItems,
                JobDetails = "report details"
            };
        }

        private async Task<CopyWellboreWithObjectsReportItem> CopyOneObject(WitsmlObjectOnWellbore objectOnWellbore, CopyWellboreWithObjectsJob job, EntityType entityType, CancellationToken? cancellationToken)
        {
            try
            {
                cancellationToken?.IsCancellationRequested();
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

        private async Task<List<CopyWellboreWithObjectsReportItem>> CopyWellboreObjectsByType(CopyWellboreWithObjectsJob job, EntityType entityType, IWitsmlClient sourceClient, CancellationToken? cancellationToken, string logIndexType = null)
        {
            var reportItems = new List<CopyWellboreWithObjectsReportItem>();
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
                foreach (var objectOnWellbore in result.Objects)
                {
                    var reportItem = await CopyOneObject(objectOnWellbore, job, entityType,
                        cancellationToken);
                    reportItems.Add(reportItem);
                }
            }
            return reportItems;
        }
    }
}
