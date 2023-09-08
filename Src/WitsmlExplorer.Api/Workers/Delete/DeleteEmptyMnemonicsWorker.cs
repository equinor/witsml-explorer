using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Primitives;
using Microsoft.IdentityModel.Tokens;

using Witsml;
using Witsml.Data;
using Witsml.Extensions;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Models.Reports;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers.Delete
{
    public class DeleteEmptyMnemonicsWorker : BaseWorker<DeleteEmptyMnemonicsJob>, IWorker
    {
        public JobType JobType => JobType.DeleteEmptyMnemonics;

        private readonly IWellboreService _wellboreService;
        private readonly ILogObjectService _logObjectService;
        private readonly IMnemonicService _mnemonicService;

        public DeleteEmptyMnemonicsWorker(
            ILogger<DeleteEmptyMnemonicsJob> logger,
            IWitsmlClientProvider witsmlClientProvider,
            IWellboreService wellboreService,
            ILogObjectService logObjectService,
            IMnemonicService mnemonicService)
            : base(witsmlClientProvider, logger)
        {
            _wellboreService = wellboreService;
            _logObjectService = logObjectService;
            _mnemonicService = mnemonicService;
        }

        public override async Task<(WorkerResult WorkerResult, RefreshAction RefreshAction)> Execute(DeleteEmptyMnemonicsJob job)
        {
            IWitsmlClient client = GetTargetWitsmlClientOrThrow();

            var wellboreRefsToCheck = job.Wellbores.ToList();

            wellboreRefsToCheck.AddRange(await ExtractWellboreRefs(job.Wells));

            var reportItems = new List<DeleteEmptyMnemonicsReportItem>();
            var logCurvesCheckedCount = 0;

            foreach (var wellboreRef in wellboreRefsToCheck)
            {
                var logsToCheck = await ExtractLogs(wellboreRef);

                if (!logsToCheck.IsNullOrEmpty())
                {
                    foreach (var logToCheck in logsToCheck)
                    {
                        var logCurves = await GetLogCurveInfos(logToCheck);

                        logCurvesCheckedCount += logCurves.Count();

                        var mnemonicsToDelete = FindNullMnemonics(job.NullDepthValue, job.NullTimeValue, logToCheck, logCurves);

                        foreach (var mnemonicToDelete in mnemonicsToDelete)
                        {
                            var result = await DeleteMnemonic(wellboreRef.WellUid, wellboreRef.WellboreUid, logToCheck.Uid, mnemonicToDelete);

                            var reportItem = new DeleteEmptyMnemonicsReportItem
                            {
                                WellName = wellboreRef.WellName,
                                WellUid = wellboreRef.WellUid,
                                WellboreName = wellboreRef.WellboreName,
                                WellboreUid = wellboreRef.WellboreUid,
                                LogName = logToCheck.Name,
                                LogUid = logToCheck.Uid,
                                LogIndexType = logToCheck.IndexType,
                                Mnemonic = mnemonicToDelete.Mnemonic
                            };

                            if (result.IsSuccessful)
                            {
                                reportItems.Add(reportItem);

                                Logger.LogInformation("Successfully deleted empty mnemonic. WellUid: {WellUid}, WellboreUid: {WellboreUid}, Uid: {LogUid}, Mnemonic: {Mnemonic}"
                                    , wellboreRef.WellUid, wellboreRef.WellboreUid, logToCheck.Uid, mnemonicToDelete.Mnemonic);
                            }
                            else
                            {
                                Logger.LogWarning("Failed to delete empty mnemonic. WellUid: {WellUid}, WellboreUid: {WellboreUid}, Uid: {LogUid}, Mnemonic: {Mnemonic}"
                                    , wellboreRef.WellUid, wellboreRef.WellboreUid, logToCheck.Uid, mnemonicToDelete.Mnemonic);
                            }
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

            return (
                new WorkerResult(client.GetServerHostname(), true, $"Empty mnemonics deleted"),
                null);
        }

        private string CreateReportSummary(DeleteEmptyMnemonicsJob job, int mnemonicsCheckedCount, int mnemonicsDeletedCount)
        {
            var summary = new StringBuilder();

            if (mnemonicsCheckedCount > 0)
            {
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
            }
            else
            {
                summary = summary.AppendFormat("No mnemonics were checked for NullDepthValue: \"{0}\" and NullTimeValue: \"{1}\".",
                    job.NullDepthValue.ToString(),
                    job.NullTimeValue.ToISODateTimeString());
            }

            return summary.ToString();
        }

        private async Task<QueryResult> DeleteMnemonic(string wellUid, string wellboreUid, string logToCheckUid, LogCurveInfo mnemonicToDelete)
        {
            return await _mnemonicService.DeleteMnemonic(wellUid, wellboreUid, logToCheckUid, mnemonicToDelete);
        }

        private ICollection<LogCurveInfo> FindNullMnemonics(double nullDepthValue, DateTime nullTimeValue, LogObject logToCheck, ICollection<LogCurveInfo> logCurves)
        {
            var nullMnemonics = new List<LogCurveInfo>();

            var nullDepthValueString = nullDepthValue.ToString("G16", CultureInfo.InvariantCulture);
            var nullTimeValueString = nullTimeValue.ToISODateTimeString();

            if (!logCurves.IsNullOrEmpty())
            {
                if (logToCheck.IndexType == WitsmlLog.WITSML_INDEX_TYPE_MD)
                {
                    foreach (var logCurve in logCurves)
                    {
                        if (logCurve.MinDepthIndex == nullDepthValueString && logCurve.MaxDepthIndex == nullDepthValueString)
                        {
                            nullMnemonics.Add(logCurve);
                        }
                    }
                }
                else if (logToCheck.IndexType == WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME)
                {
                    foreach (var logCurve in logCurves)
                    {
                        if (logCurve.MinDateTimeIndex == nullTimeValueString && logCurve.MaxDateTimeIndex == nullTimeValueString)
                        {
                            nullMnemonics.Add(logCurve);
                        }
                    }
                }
            }

            return nullMnemonics;
        }

        private async Task<ICollection<LogCurveInfo>> GetLogCurveInfos(LogObject logToCheck)
        {
            return (await _logObjectService.GetLogCurveInfo(logToCheck.WellUid, logToCheck.WellboreUid, logToCheck.Uid)).ToList();
        }

        private async Task<ICollection<LogObject>> ExtractLogs(WellboreReference wellboreRef)
        {
            return (await _logObjectService.GetLogs(wellboreRef.WellUid, wellboreRef.WellboreUid)).ToList();
        }

        private async Task<ICollection<WellboreReference>> ExtractWellboreRefs(IEnumerable<WellReference> wellRefs)
        {
            var wellboreRefs = new List<WellboreReference>();

            if (!wellRefs.IsNullOrEmpty())
            {
                foreach (var wellRef in wellRefs)
                {
                    var wellbores = await _wellboreService.GetWellbores(wellRef.WellUid);

                    if (!wellbores.IsNullOrEmpty())
                    {
                        wellboreRefs = wellboreRefs.Concat(wellbores.Select(wb =>
                            new WellboreReference
                            {
                                WellboreUid = wb.Uid,
                                WellboreName = wb.Name,
                                WellUid = wb.WellUid,
                                WellName = wb.WellName
                            }))
                            .ToList();
                    }
                }
            }

            return wellboreRefs;
        }
    }
}
