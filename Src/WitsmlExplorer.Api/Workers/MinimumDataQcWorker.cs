using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;

using Witsml;
using Witsml.Data;
using Witsml.Data.Curves;
using Witsml.Extensions;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Middleware;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Models.Reports;
using WitsmlExplorer.Api.Services;

using Index = Witsml.Data.Curves.Index;

namespace WitsmlExplorer.Api.Workers
{
    public class MinimumDataQcWorker : BaseWorker<MinimumDataQcJob>, IWorker
    {
        public JobType JobType => JobType.MinimumDataQc;

        private const int MAX_MNEMONICS = 200;

        public MinimumDataQcWorker(ILogger<MinimumDataQcJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider, logger) { }

        public override async Task<(WorkerResult WorkerResult, RefreshAction RefreshAction)> Execute(MinimumDataQcJob job, CancellationToken? cancellationToken = null)
        {
            Logger.LogInformation($"Minimum data QC job started. {job.Description()}");

            var jobValidationMessage = JobValidation(job);

            if (!jobValidationMessage.IsNullOrEmpty())
            {
                return GetFailedWorkerResult(jobValidationMessage);
            }

            var witsmlLog = await LogWorkerTools.GetLog(GetTargetWitsmlClientOrThrow(), job.LogReference, ReturnElements.HeaderOnly);

            if (witsmlLog == null)
            {
                return GetFailedWorkerResult($"Witsml log for {job.Description()} not found.");
            }

            var isDepthLog = witsmlLog.IndexType == WitsmlLog.WITSML_INDEX_TYPE_MD;

            if (isDepthLog && (job.DepthGap == null || job.DepthGap.Value == 0.0))
            {
                return GetFailedWorkerResult("Depth gap is 0 or not set.");
            }

            if (!isDepthLog && (job.TimeGap == null || job.TimeGap.Value == 0))
            {
                return GetFailedWorkerResult("Time gap is 0 or not set.");
            }

            var startIndex = Index.Start(witsmlLog);
            var endIndex = Index.End(witsmlLog);
            var isLogIncreasing = witsmlLog.IsIncreasing();

            DataCheck(job, witsmlLog, isDepthLog, startIndex, endIndex, isLogIncreasing);

            var indexCurve = job.LogReference.IndexCurve;

            var reportItems = new List<MinimumDataQcReportItem>();
            var logCurvesToCheck = new List<WitsmlLogCurveInfo>();

            foreach (var mnemonic in job.Mnemonics)
            {
                if (mnemonic == indexCurve) continue;

                var timestamp = DateTime.Now;

                var logCurve = witsmlLog.LogCurveInfo.Where(lci => lci.Mnemonic == mnemonic).FirstOrDefault();

                if (logCurve != null)
                {
                    logCurvesToCheck.Add(logCurve);
                }
                else
                {
                    reportItems.Add(new MinimumDataQcReportItem
                    {
                        Mnemonic = mnemonic,
                        QcIssues = new List<string> { QcIssue.NOT_FOUND },
                        Timestamp = timestamp
                    });
                }
            }

            if (!logCurvesToCheck.IsNullOrEmpty())
            {
                await using LogDataReader logDataReader = new(GetTargetWitsmlClientOrThrow(), witsmlLog, new List<string>(logCurvesToCheck.Select(l => l.Mnemonic)), Logger, startIndex, endIndex);

                var logDataRows = new List<string[]>();
                var logData = await logDataReader.GetNextBatch();
                var logColumns = logData?.MnemonicList.Split(CommonConstants.DataSeparator).Select((value, index) => new WitsmlLogColumns { Index = index, Mnemonic = value }).ToList();
                while (logData != null)
                {
                    logDataRows.AddRange(logData.Data?.Select(x => x.Data.Split(CommonConstants.DataSeparator)) ?? Array.Empty<string[]>());
                    logData = await logDataReader.GetNextBatch();
                }

                if (!logDataRows.Any() || logColumns.IsNullOrEmpty())
                {
                    var timestamp = DateTime.Now;

                    foreach (var logCurve in logCurvesToCheck)
                    {
                        reportItems.Add(new MinimumDataQcReportItem
                        {
                            Mnemonic = logCurve.Mnemonic,
                            QcIssues = new List<string> { QcIssue.NO_DATA },
                            Timestamp = timestamp
                        });
                    }
                }
                else
                {
                    if (logDataRows.Any(x => x.Length < logColumns.Count))
                    {
                        throw new WitsmlResultParsingException($"Unable to parse log data due to unexpected amount of commas in data row.", (int)HttpStatusCode.InternalServerError);
                    }

                    int mnemonicCurveIndex = logColumns.FirstOrDefault(x => x.Mnemonic == indexCurve).Index;

                    if (isDepthLog)
                    {
                        reportItems.AddRange(
                            DepthQc(job, logCurvesToCheck, logColumns, isLogIncreasing, startIndex, endIndex, logDataRows, mnemonicCurveIndex));
                    }
                    else
                    {
                        reportItems.AddRange(
                            DateTimeQc(job, logCurvesToCheck, logColumns, isLogIncreasing, startIndex, endIndex, logDataRows, mnemonicCurveIndex));
                    }
                }
            }

            Logger.LogInformation($"Minimum data QC job finished. {job.Description()}");

            job.JobInfo.Report = new MinimumDataQcReport
            {
                Title = "Minimum data QC report",
                Summary = $"Analyzed {job.Mnemonics.Count} of which {reportItems.Count(i => i.QcIssues.Count > 0)} have QC issues.",
                LogReference = job.LogReference,
                ReportItems = reportItems
            };

            WorkerResult workerResult = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, $"Minimum datat QC for log: {job.LogReference.Uid}", jobId: job.JobInfo.Id);
            return new(workerResult, null);
        }

        private IList<MinimumDataQcReportItem> DepthQc(
            MinimumDataQcJob job,
            List<WitsmlLogCurveInfo> logCurvesToCheck,
            ICollection<WitsmlLogColumns> logColumns,
            bool isLogIncreasing,
            Index startIndex,
            Index endIndex,
            List<string[]> logDataRows,
            int mnemonicCurveIndex)
        {
            var reportItems = new List<MinimumDataQcReportItem>();

            var firstIndex = (isLogIncreasing ? startIndex : endIndex) as DepthIndex;
            var indexSpan = ((isLogIncreasing ? endIndex - startIndex : startIndex - endIndex) as DepthIndex).Value;
            var maxGap = new DepthIndex(job.DepthGap.Value, (startIndex as DepthIndex).Uom);

            foreach (var logCurve in logCurvesToCheck)
            {
                var reportItem = new MinimumDataQcReportItem
                {
                    Mnemonic = logCurve.Mnemonic
                };

                var logCurveIndex = logColumns.First(lm => lm.Mnemonic == logCurve.Mnemonic).Index;

                var dataPoints = 0;
                var lastIndexWithData = firstIndex;
                var largeGapFound = false;

                foreach (var logDataRow in logDataRows)
                {
                    var dataPoint = logDataRow[logCurveIndex];

                    if (!dataPoint.IsNullOrEmpty())
                    {
                        dataPoints++;

                        if (!largeGapFound)
                        {
                            var thisIndex =
                                new DepthIndex(double.Parse(logDataRow[mnemonicCurveIndex], CultureInfo.InvariantCulture), logCurve.MinIndex.Uom);

                            var gap = isLogIncreasing ? thisIndex - lastIndexWithData : lastIndexWithData - thisIndex;

                            if (gap >= maxGap)
                            {
                                largeGapFound = true;
                                reportItem.QcIssues.Add(QcIssue.LARGE_GAP);
                            }
                            else
                            {
                                lastIndexWithData = thisIndex;
                            }
                        }
                    }
                }

                var density = dataPoints / indexSpan;

                if (density < job.Density.Value)
                {
                    reportItem.QcIssues.Add(QcIssue.LOW_DENSITY);
                }

                reportItem.Timestamp = DateTime.Now;

                reportItems.Add(reportItem);
            }

            return reportItems;
        }

        private IList<MinimumDataQcReportItem> DateTimeQc(
            MinimumDataQcJob job,
            List<WitsmlLogCurveInfo> logCurvesToCheck,
            ICollection<WitsmlLogColumns> logColumns,
            bool isLogIncreasing,
            Index startIndex,
            Index endIndex,
            List<string[]> logDataRows,
            int mnemonicCurveIndex)
        {
            var reportItems = new List<MinimumDataQcReportItem>();

            var firstIndex = (isLogIncreasing ? startIndex : endIndex) as DateTimeIndex;
            var indexSpan = ((isLogIncreasing ? endIndex - startIndex : startIndex - endIndex) as TimeSpanIndex).Value.TotalHours;
            var maxGap = job.TimeGap.Value * 100;

            foreach (var logCurve in logCurvesToCheck)
            {
                var reportItem = new MinimumDataQcReportItem
                {
                    Mnemonic = logCurve.Mnemonic
                };

                var logCurveIndex = logColumns.First(lm => lm.Mnemonic == logCurve.Mnemonic).Index;

                var dataPoints = 0;
                var lastIndexWithData = firstIndex;
                var largeGapFound = false;

                foreach (var logDataRow in logDataRows)
                {
                    var dataPoint = logDataRow[logCurveIndex];

                    if (!dataPoint.IsNullOrEmpty())
                    {
                        dataPoints++;

                        if (!largeGapFound)
                        {
                            var thisIndex = new DateTimeIndex(DateTime.Parse(logDataRow[mnemonicCurveIndex], CultureInfo.InvariantCulture));

                            var gap = isLogIncreasing ? thisIndex - lastIndexWithData : lastIndexWithData - thisIndex;

                            if (gap.TotalMilliseconds >= maxGap)
                            {
                                largeGapFound = true;
                                reportItem.QcIssues.Add(QcIssue.LARGE_GAP);
                            }
                            else
                            {
                                lastIndexWithData = thisIndex;
                            }
                        }
                    }
                }

                var density = dataPoints / indexSpan;

                if (density < job.Density.Value)
                {
                    reportItem.QcIssues.Add(QcIssue.LOW_DENSITY);
                }

                reportItem.Timestamp = DateTime.Now;

                reportItems.Add(reportItem);
            }

            return reportItems;
        }

        private string JobValidation(MinimumDataQcJob job)
        {
            if (job.Density == null || job.Density.Value == 0.0)
            {
                return "Density not set.";
            }

            if (job.Mnemonics.IsNullOrEmpty())
            {
                return "Job contains no mnemonics.";
            }

            if (job.Mnemonics.Count > MAX_MNEMONICS)
            {
                return $"Job contains too many mnemonics. Mnemonic count: {job.Mnemonics.Count}";
            }

            if ((job.DepthGap == null || job.DepthGap.Value == 0.0) && (job.TimeGap == null || job.TimeGap.Value == 0))
            {
                return "At least one of DepthGap or TimeGap must be set or greater then 0.";
            }

            return "";
        }

        private void DataCheck(MinimumDataQcJob job, WitsmlLog witsmlLog, bool isDepthLog, Index startIndex, Index endIndex, bool isLogIncreasing)
        {
            if (witsmlLog.LogCurveInfo.IsNullOrEmpty())
            {
                throw new DataException("Witsml log is empty.");
            }

            if (startIndex == null)
            {
                throw new DataException("Start index is missing.");
            }

            if (endIndex == null)
            {
                throw new DataException("End index is missing.");
            }

            if ((isLogIncreasing && startIndex > endIndex) || (!isLogIncreasing && startIndex < endIndex))
            {
                throw new DataException($"Wrong index order - log direction: {witsmlLog.Direction}, start index: {startIndex.ToString()}, end index: {endIndex.ToString()}");
            }
        }

        private (WorkerResult WorkerResult, RefreshAction RefreshAction) GetFailedWorkerResult(string message)
        {
            Logger.LogInformation(message);
            return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, message), null);
        }

        private struct WitsmlLogColumns
        {
            public int Index { get; set; }
            public string Mnemonic { get; set; }
        }
    }
}
