using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;

using Witsml;
using Witsml.Data;
using Witsml.Extensions;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Models.Reports;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers.Delete
{
    public class DeleteEmptyMnemonicsWorker : BaseWorker<DeleteEmptyMnemonicsJob>, IWorker
    {
        public JobType JobType => JobType.DeleteEmptyMnemonics;

        private readonly ILogObjectService _logObjectService;
        private readonly IMnemonicService _mnemonicService;

        public DeleteEmptyMnemonicsWorker(
            ILogger<DeleteEmptyMnemonicsJob> logger,
            IWitsmlClientProvider witsmlClientProvider,
            ILogObjectService logObjectService,
            IMnemonicService mnemonicService)
            : base(witsmlClientProvider, logger)
        {
            _logObjectService = logObjectService;
            _mnemonicService = mnemonicService;
        }

        public override async Task<(WorkerResult WorkerResult, RefreshAction RefreshAction)> Execute(DeleteEmptyMnemonicsJob job, CancellationToken? cancellationToken = null)
        {
            IWitsmlClient client = GetTargetWitsmlClientOrThrow();

            List<LogObject> logsToCheck = new List<LogObject>();

            logsToCheck.AddRange(await ExtractLogs(job.Logs));
            logsToCheck.AddRange(await ExtractLogs(job.Wellbores));
            logsToCheck.AddRange(await ExtractLogs(job.Wells));

            var reportItems = new List<DeleteEmptyMnemonicsReportItem>();
            var logCurvesCheckedCount = 0;

            if (!logsToCheck.IsNullOrEmpty())
            {
                foreach (var logToCheck in logsToCheck)
                {
                    var logCurves = await GetLogCurveInfos(logToCheck);

                    logCurvesCheckedCount += logCurves.Count;

                    var mnemonicsToDelete = FindNullMnemonics(job.NullDepthValue, job.NullTimeValue, job.DeleteNullIndex, logToCheck, logCurves);

                    foreach (var mnemonicToDelete in mnemonicsToDelete)
                    {
                        var result = await DeleteMnemonic(logToCheck.WellUid, logToCheck.WellboreUid, logToCheck.Uid, mnemonicToDelete);

                        var reportItem = new DeleteEmptyMnemonicsReportItem
                        {
                            WellName = logToCheck.WellName,
                            WellUid = logToCheck.WellUid,
                            WellboreName = logToCheck.WellboreName,
                            WellboreUid = logToCheck.WellboreUid,
                            LogName = logToCheck.Name,
                            LogUid = logToCheck.Uid,
                            LogIndexType = logToCheck.IndexType,
                            Mnemonic = mnemonicToDelete.Mnemonic
                        };

                        if (result.IsSuccessful)
                        {
                            reportItems.Add(reportItem);

                            Logger.LogInformation("Successfully deleted empty mnemonic. WellUid: {WellUid}, WellboreUid: {WellboreUid}, Uid: {LogUid}, Mnemonic: {Mnemonic}"
                                , logToCheck.WellUid, logToCheck.WellboreUid, logToCheck.Uid, mnemonicToDelete.Mnemonic);
                        }
                        else
                        {
                            Logger.LogWarning("Failed to delete empty mnemonic. WellUid: {WellUid}, WellboreUid: {WellboreUid}, Uid: {LogUid}, Mnemonic: {Mnemonic}"
                                , logToCheck.WellUid, logToCheck.WellboreUid, logToCheck.Uid, mnemonicToDelete.Mnemonic);
                        }
                    }
                }
            }

            var report = new DeleteEmptyMnemonicsReport()
            {
                Title = "Delete Empty Mnemonics Report",
                Summary = CreateReportSummary(job, logCurvesCheckedCount, reportItems.Count),
                ReportItems = reportItems
            };
            job.JobInfo.Report = report;

            Logger.LogInformation("{JobType} - Job successful. {Message}", GetType().Name, reportItems.IsNullOrEmpty() ? "No empty mnemonics deleted" : "Empty mnemonics deleted.");

            var workerResult = new WorkerResult(client.GetServerHostname(), true, $"Empty mnemonics deleted", jobId: job.JobInfo.Id);

            RefreshAction refreshAction = job.Logs.Any()
                ? new RefreshObjects(GetTargetWitsmlClientOrThrow().GetServerHostname(), job.Logs.First().WellUid, job.Logs.First().WellboreUid, EntityType.Log)
                : job.Wellbores.Any()
                    ? new RefreshWell(GetTargetWitsmlClientOrThrow().GetServerHostname(), job.Wellbores.First().WellUid, RefreshType.Update)
                    : new RefreshWells(GetTargetWitsmlClientOrThrow().GetServerHostname(), job.Wells.Select(well => well.WellUid).ToArray(), RefreshType.Update);

            return (workerResult, refreshAction);
        }

        private string CreateReportSummary(DeleteEmptyMnemonicsJob job, int mnemonicsCheckedCount, int mnemonicsDeletedCount)
        {
            var summary = new StringBuilder();

            switch (mnemonicsCheckedCount)
            {
                case 0:
                    summary = summary.AppendFormat("No mnemonics were");
                    break;
                case 1:
                    summary = summary.AppendFormat("One mnemonic was");
                    break;
                default:
                    summary = summary.AppendFormat("{0} mnemonics were", mnemonicsCheckedCount.ToString());
                    break;
            }

            summary = summary.AppendFormat(" checked for NullDepthValue: \"{0}\" and NullTimeValue: \"{1}\". ",
                job.NullDepthValue.ToString(),
                job.NullTimeValue.ToISODateTimeString());

            switch (mnemonicsDeletedCount)
            {
                case 0:
                    summary = summary.AppendFormat("No empty mnemonics were found and deleted.");
                    break;
                case 1:
                    summary = summary.AppendFormat("One empty mnemonic was found and deleted.");
                    break;
                default:
                    summary = summary.AppendFormat("{0} empty mnemonics were found and deleted.", mnemonicsDeletedCount.ToString());
                    break;
            }

            return summary.ToString();
        }

        private async Task<QueryResult> DeleteMnemonic(string wellUid, string wellboreUid, string logToCheckUid, LogCurveInfo mnemonicToDelete)
        {
            return await _mnemonicService.DeleteMnemonic(wellUid, wellboreUid, logToCheckUid, mnemonicToDelete);
        }

        private ICollection<LogCurveInfo> FindNullMnemonics(double nullDepthValue, DateTime nullTimeValue, bool deleteNullIndex, LogObject logToCheck, ICollection<LogCurveInfo> logCurves)
        {
            var nullMnemonics = new List<LogCurveInfo>();

            var nullDepthValueString = nullDepthValue.ToString("G16", CultureInfo.InvariantCulture);
            var nullTimeValueString = nullTimeValue.ToISODateTimeString();

            if (!logCurves.IsNullOrEmpty())
            {
                if (logToCheck.IndexType == WitsmlLog.WITSML_INDEX_TYPE_MD)
                {
                    nullMnemonics.AddRange(logCurves.Where(logCurve =>
                        (logCurve.MinDepthIndex == nullDepthValueString || (deleteNullIndex && logCurve.MinDepthIndex == null)) &&
                        (logCurve.MaxDepthIndex == nullDepthValueString || (deleteNullIndex && logCurve.MaxDepthIndex == null))
                    ));
                }
                else if (logToCheck.IndexType == WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME)
                {
                    nullMnemonics.AddRange(logCurves.Where(logCurve =>
                        (logCurve.MinDateTimeIndex == nullTimeValueString || (deleteNullIndex && logCurve.MinDateTimeIndex == null)) &&
                        (logCurve.MaxDateTimeIndex == nullTimeValueString || (deleteNullIndex && logCurve.MaxDateTimeIndex == null))
                    ));
                }
            }

            return nullMnemonics;
        }

        private async Task<ICollection<LogCurveInfo>> GetLogCurveInfos(LogObject logToCheck)
        {
            return (await _logObjectService.GetLogCurveInfo(logToCheck.WellUid, logToCheck.WellboreUid, logToCheck.Uid)).ToList();
        }

        private async Task<ICollection<LogObject>> ExtractLogs(ICollection<ObjectReference> logRefs)
        {
            var logs = new List<LogObject>();

            if (!logRefs.IsNullOrEmpty())
            {
                foreach (var logObjectRef in logRefs)
                {
                    var log = await _logObjectService.GetLog(logObjectRef.WellUid, logObjectRef.WellboreUid, logObjectRef.Uid);
                    if (log != null)
                    {
                        logs.Add(log);
                    }
                }
            }

            return logs;
        }
        private async Task<ICollection<LogObject>> ExtractLogs(ICollection<WellboreReference> wellboreRefs)
        {
            var logs = new List<LogObject>();

            if (!wellboreRefs.IsNullOrEmpty())
            {
                foreach (var wellboreRef in wellboreRefs)
                {
                    var wellboreLogs = await _logObjectService.GetLogs(wellboreRef.WellUid, wellboreRef.WellboreUid);
                    if (!wellboreLogs.IsNullOrEmpty())
                    {
                        logs.AddRange(wellboreLogs);
                    }
                }
            }

            return logs;
        }

        private async Task<ICollection<LogObject>> ExtractLogs(ICollection<WellReference> wellRefs)
        {
            var logs = new List<LogObject>();

            if (!wellRefs.IsNullOrEmpty())
            {
                foreach (var wellboreRef in wellRefs)
                {
                    var wellLogs = await _logObjectService.GetLogs(wellboreRef.WellUid, string.Empty);
                    if (!wellLogs.IsNullOrEmpty())
                    {
                        logs.AddRange(wellLogs);
                    }
                }
            }

            return logs;
        }
    }
}
