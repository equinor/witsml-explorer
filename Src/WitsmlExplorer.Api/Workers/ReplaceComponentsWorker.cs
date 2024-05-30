using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Models.Reports;
using WitsmlExplorer.Api.Workers.Copy;
using WitsmlExplorer.Api.Workers.Delete;

namespace WitsmlExplorer.Api.Workers
{
    public class ReplaceComponentsWorker : BaseWorker<ReplaceComponentsJob>, IWorker
    {
        private readonly ICopyComponentsWorker _copyWorker;
        private readonly IDeleteComponentsWorker _deleteWorker;

        public JobType JobType => JobType.ReplaceComponents;

        public ReplaceComponentsWorker(ILogger<ReplaceComponentsJob> logger, ICopyComponentsWorker copyWorker, IDeleteComponentsWorker deleteWorker) : base(logger)
        {
            _copyWorker = copyWorker;
            _deleteWorker = deleteWorker;
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(ReplaceComponentsJob job, CancellationToken? cancellationToken = null)
        {
            List<ReplaceComponentsReportItem> replaceComponentReportItems = new();
            (WorkerResult WorkerResult, RefreshAction) result = await _deleteWorker.Execute(job.DeleteJob, cancellationToken);
            replaceComponentReportItems.Add(new ReplaceComponentsReportItem
            {
                Object = "Deleted Components",
                Message = result.WorkerResult.Message,
                Status = result.WorkerResult.IsSuccess ? "Success" : "Fail"
            });
            if (!result.WorkerResult.IsSuccess)
            {
                return result;
            }
            var copyResult = await _copyWorker.Execute(job.CopyJob, cancellationToken);
            replaceComponentReportItems.Add(new ReplaceComponentsReportItem
            {
                Object = "Replaced Components",
                Message = copyResult.Item1.Message,
                Status = copyResult.Item1.IsSuccess ? "Success" : "Fail"
            });
            job.JobInfo.Report= GetReplaceComponentReport(replaceComponentReportItems);
            return copyResult;
        }

        private ReplaceComponentsReport GetReplaceComponentReport(List<ReplaceComponentsReportItem> reportItems)
        {
            return new ReplaceComponentsReport
            {
                Title = $"Replace component report",
                Summary = "Replace component report",
                ReportItems = reportItems
            };
        }
    }
}
