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

            await CopyLogs(job, reportItems, sourceClient, cancellationToken);

            BaseReport report = CreateCopyWithParentReport(reportItems);
            job.JobInfo.Report = report;

            RefreshAction refreshAction = new RefreshWell(targetClient.GetServerHostname(), job.Target.WellUid, RefreshType.Update);
            wellboreResult.refresh = refreshAction;
            return wellboreResult;
        }

        private CommonCopyReport CreateCopyWithParentReport(List<CommonCopyReportItem> reportItems)
        {
            return new CommonCopyReport
            {
                Title = $"Copy wellbore with objects report",
                Summary = "Copy wellbore  parent report",
                ReportItems = reportItems,
                JobDetails = "report details"
            };
        }

        private async Task CopyLogs(CopyWellboreWithObjectsJob job, List<CommonCopyReportItem> reportItems,
            IWitsmlClient sourceClient, CancellationToken? cancellationToken)
        {
            WitsmlLogs witsmlLog = LogQueries.GetWitsmlLogsByWellbore(job.Source.WellUid, job.Source.WellboreUid);
            WitsmlLogs result = await sourceClient.GetFromStoreAsync(witsmlLog, new OptionsIn(ReturnElements.Requested));
            var timeLogs = result.Logs.Where(x =>
                x.IndexType == WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME);
            var depthLogs = result.Logs.Where(x =>
                x.IndexType == WitsmlLog.WITSML_INDEX_TYPE_MD).ToArray();
            foreach (var timeLog in timeLogs)
            {
                await CopyTimeLog(timeLog, job, reportItems, cancellationToken);
            }

            if (depthLogs.Any())
            {
                var copyLogJob = new CopyObjectsJob()
                {
                    Source = new ObjectReferences()
                    {
                        Names = depthLogs.Select(x => x.Name).ToArray(),
                        ObjectUids = depthLogs.Select(x => x.Uid).ToArray(),
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
                    Phase = "Copy Depths Logs",
                    Message = copyLogResult.result.Message,
                    Status = GetJobStatus(copyLogResult.result.IsSuccess, cancellationToken)
                };
                reportItems.Add(reportItem);
            }
        }

        private async Task CopyTimeLog(WitsmlLog timeLog, CopyWellboreWithObjectsJob job, List<CommonCopyReportItem> reportItems, CancellationToken? cancellationToken)
        {
            var copyLogJob = new CopyObjectsJob()
            {
                Source = new ObjectReferences()
                {
                    Names = new[] {timeLog.Name},
                    ObjectUids = new[] {timeLog.Uid},
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
                Phase = "Copy Log " +  timeLog.Name,
                Message = copyLogResult.result.Message,
                Status = GetJobStatus(copyLogResult.result.IsSuccess, cancellationToken)
            };

            reportItems.Add(reportItem);
        }

        private async Task CopyWellboreObjectsByType(CopyWellboreWithObjectsJob job, EntityType entityType, IWitsmlClient sourceClient, List<CommonCopyReportItem> reportItems, CancellationToken? cancellationToken)
        {
            try
            {
                IWitsmlObjectList query = ObjectQueries.GetWitsmlObjectById(job.Source.WellUid, job.Source.WellboreUid, "", entityType);
                IWitsmlObjectList result = await sourceClient.GetFromStoreNullableAsync(query, new OptionsIn(ReturnElements.IdOnly));
                if (result.Objects.Any())
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
                        ObjectUids = result.Objects.Select(x => x.Uid).ToArray()
                    },
                    Target = new WellboreReference()
                    {
                        WellboreName = job.Source.WellboreName,
                        WellboreUid = job.Source.WellboreUid,
                        WellName = job.Target.WellName,
                        WellUid = job.Target.WellUid,
                    }
                };
                (WorkerResult result, RefreshAction refresh) copyResult = await _copyObjectsWorker.Execute(copyJob, cancellationToken);
                var reportItem = new CommonCopyReportItem()
                {
                    Phase = "Copy " + entityType ,
                    Message = copyResult.result.Message,
                    Status = GetJobStatus(copyResult.result.IsSuccess, cancellationToken)
                };
                reportItems.Add(reportItem);
                }
            }
            catch (Exception ex)
            {
                var reportItem = new CommonCopyReportItem()
                {
                    Phase = "Copy " + entityType ,
                    Message = ex.Message,
                    Status = GetJobStatus(false, cancellationToken)
                };
                reportItems.Add(reportItem);
            }
        }
    }
}
