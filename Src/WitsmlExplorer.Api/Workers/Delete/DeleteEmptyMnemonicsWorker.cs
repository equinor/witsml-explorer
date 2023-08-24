using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;

using Witsml;
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

            foreach (var wellboreRef in wellboreRefsToCheck)
            {
                var logsToCheck = await ExtractLogs(wellboreRef);

                if (!logsToCheck.IsNullOrEmpty())
                {
                    foreach (var logToCheck in logsToCheck)
                    {
                        var logCurves = await GetLogCurveInfos(logToCheck);

                        var mnemonicsToDelete = FindNullMnemonics(job.NullDepthValue, job.NullTimeValue, logCurves);

                        foreach (var mnemonicToDelete in mnemonicsToDelete)
                        {
                            var result = await DeleteMnemonic(wellboreRef.WellUid, wellboreRef.WellboreUid, logToCheck.Uid, mnemonicToDelete);

                            if (result.IsSuccessful)
                            {
                                reportItems.Add(new DeleteEmptyMnemonicsReportItem { WellboreReference = wellboreRef, LogCurveInfo = mnemonicToDelete });

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

            var report = new DeleteEmptyMnemonicsReport() { ReportItems = reportItems };
            job.JobInfo.Report = report;

            Logger.LogInformation("{JobType} - Job successful. Empty mnemonics deleted.", GetType().Name);

            var updatedWells = job.Wells.Select(w => w.WellUid)
                .Concat(job.Wellbores.Select(w => w.WellUid))
                .Distinct()
                .ToArray();

            return (
                new WorkerResult(client.GetServerHostname(), true, $"Empty mnemonics deleted"),
                new RefreshWells(client.GetServerHostname(), updatedWells, RefreshType.BatchUpdate));
        }

        private async Task<QueryResult> DeleteMnemonic(string wellUid, string wellboreUid, string logToCheckUid, LogCurveInfo mnemonicToDelete)
        {
            return await _mnemonicService.DeleteMnemonic(wellUid, wellboreUid, logToCheckUid, mnemonicToDelete);
        }

        private ICollection<LogCurveInfo> FindNullMnemonics(double nullDepthValue, DateTime nullTimeValue, ICollection<LogCurveInfo> logCurves)
        {
            var nullMnemonics = new List<LogCurveInfo>();

            var nullDepthValueString = nullDepthValue.ToString("G16", CultureInfo.InvariantCulture);
            var nullTimeValueString = nullTimeValue.ToISODateTimeString();

            if (!logCurves.IsNullOrEmpty())
            {
                foreach (var logCurve in logCurves)
                {
                    if (logCurve.MinDepthIndex == nullDepthValueString || logCurve.MaxDepthIndex == nullDepthValueString
                        || logCurve.MinDateTimeIndex == nullTimeValueString || logCurve.MaxDateTimeIndex == nullTimeValueString)
                    {
                        nullMnemonics.Add(logCurve);
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
