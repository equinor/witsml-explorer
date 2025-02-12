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

namespace WitsmlExplorer.Api.Workers;

/// <summary>
/// Worker for analyzing gaps for curves of log data.
/// </summary>
public class AnalyzeGapWorker : BaseWorker<AnalyzeGapJob>, IWorker
{
    public JobType JobType => JobType.AnalyzeGaps;
    public AnalyzeGapWorker(ILogger<AnalyzeGapJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider, logger) { }

    /// <summary>
    /// Find all gaps for selected mnemonics and required size of gap. If no mnemonics are selected, all mnemonics on the log will be analyzed.
    /// </summary>
    /// <param name="job">Job model of logObject, array of mnemonics, gapSize...</param>
    /// <returns>Task of workerResult with gap report items.</returns>
    public override async Task<(WorkerResult, RefreshAction)> Execute(AnalyzeGapJob job, CancellationToken? cancellationToken = null)
    {
        Logger.LogInformation("Analyzing gaps started. {jobDescription}", job.Description());
        string indexCurve = job.LogReference.IndexCurve;
        string logUid = job.LogReference.Uid;
        bool isDepthLog = job.LogReference.IndexType == WitsmlLog.WITSML_INDEX_TYPE_MD;
        List<AnalyzeGapReportItem> gapReportItems = new();
        List<string[]> logDataRows = new();

        var witsmlLog = await LogWorkerTools.GetLog(GetTargetWitsmlClientOrThrow(), job.LogReference, ReturnElements.HeaderOnly);
        if (witsmlLog == null)
        {
            var message = $"AnalyzeGapJob failed. Can not find witsml log for {job.Description()}";
            Logger.LogError(message);
            return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, message), null);
        }

        var jobMnemonics = job.Mnemonics.Any() ? job.Mnemonics.ToList() : witsmlLog.LogCurveInfo.Select(x => x.Mnemonic).ToList();
        var startIndex = Index.Start(witsmlLog, job.StartIndex);
        var endIndex = Index.End(witsmlLog, job.EndIndex);
        if ((!witsmlLog.IsDecreasing() && startIndex > endIndex) || (witsmlLog.IsDecreasing() && startIndex < endIndex))
        {
            return GetGapReportResult(job, jobMnemonics, new List<AnalyzeGapReportItem>(), isDepthLog, logUid, startIndex, endIndex);
        }

        await using LogDataReader logDataReader = new(GetTargetWitsmlClientOrThrow(), witsmlLog, new List<string>(jobMnemonics), Logger, startIndex, endIndex);

        WitsmlLogData logData = await logDataReader.GetNextBatch();
        var jobMnemonicsMinusLogMnemonics = logData != null ?
            jobMnemonics.Except(logData.MnemonicList.Split(",").ToList()).ToList() : null;
        var logMnemonics = logData?.MnemonicList.Split(CommonConstants.DataSeparator).Select((value, index) => new { index, value }).ToList();
        while (logData != null)
        {
            logDataRows.AddRange(logData.Data?.Select(x => x.Data.Split(CommonConstants.DataSeparator)) ?? Array.Empty<string[]>());
            logData = await logDataReader.GetNextBatch();
        }
        var isLogIncreasing = witsmlLog.IsIncreasing();
        var startIndexForGap = isLogIncreasing ? startIndex : endIndex;
        var endIndexForGap = isLogIncreasing ? endIndex : startIndex;
        if (!logDataRows.Any() || logMnemonics.IsNullOrEmpty())
        {
            var emptyGapReportItems = new List<AnalyzeGapReportItem>();
            foreach (string jobMnemonic in jobMnemonics)
            {
                Index gapSize = isDepthLog
                    ? new DepthIndex(job.GapSize)
                    : new TimeSpanIndex(job.TimeGapSize);
                CreateNoDataReportItem(emptyGapReportItems, startIndexForGap,
                    endIndexForGap, gapSize, jobMnemonic, isLogIncreasing);
            }
            return GetGapReportResult(job, jobMnemonics, emptyGapReportItems, isDepthLog, logUid, startIndex, endIndex);
        }

        if (jobMnemonicsMinusLogMnemonics != null && jobMnemonicsMinusLogMnemonics.Any())
        {
            foreach (string jobMnemonic in jobMnemonicsMinusLogMnemonics)
            {
                Index gapSize = isDepthLog
                    ? new DepthIndex(job.GapSize)
                    : new TimeSpanIndex(job.TimeGapSize);
                CreateNoDataReportItem(gapReportItems, startIndexForGap,
                    endIndexForGap, gapSize, jobMnemonic, isLogIncreasing);
            }
        }

        if (logDataRows.Any(x => x.Length < logMnemonics.Count))
        {
            throw new WitsmlResultParsingException($"Unable to parse log data due to unexpected amount of commas in data row.", (int)HttpStatusCode.InternalServerError);
        }


        int mnemonicCurveIndex = logMnemonics.FirstOrDefault(x => x.value == indexCurve)?.index ?? 0;
        var logCurveMinMaxIndexDictionary = witsmlLog.LogCurveInfo
            .Where(x => isDepthLog ? x.MinIndex != null && x.MaxIndex != null : x.MinDateTimeIndex != null && x.MaxDateTimeIndex != null)
            .ToDictionary(x => x.Mnemonic, y => new LogCurveIndex { MinIndex = Index.Min(job.LogReference.IndexType, y), MaxIndex = Index.Max(job.LogReference.IndexType, y) });

        foreach (var logMnemonic in logMnemonics.Where(x => x.index != mnemonicCurveIndex))
        {
            var logCurveMinMaxIndex = logCurveMinMaxIndexDictionary.GetValueOrDefault(logMnemonic.value, null);
            if (logCurveMinMaxIndex == null)
            {
                continue;
            }

            var inputAnalyzeDataList = logDataRows
                .Where(dataRow => !string.IsNullOrEmpty(dataRow[logMnemonic.index]))
                .Select(dataRow => GetDepthOrDateTimeIndex(isDepthLog, dataRow[mnemonicCurveIndex], logCurveMinMaxIndex))
                .Where(dataRowCurveIndex => dataRowCurveIndex >= logCurveMinMaxIndex.MinIndex && dataRowCurveIndex <= logCurveMinMaxIndex.MaxIndex)
                .ToList();

            Index gapSize = isDepthLog && logCurveMinMaxIndex.MinIndex is DepthIndex depthMinIndex
                ? new DepthIndex(job.GapSize, depthMinIndex.Uom)
                : new TimeSpanIndex(job.TimeGapSize);


            if (startIndexForGap < logCurveMinMaxIndex.MinIndex && isLogIncreasing)
            {
                CreateNoDataReportItem(gapReportItems, startIndexForGap, logCurveMinMaxIndex.MinIndex, gapSize, logMnemonic.value, isLogIncreasing, false);
            }
            if (endIndexForGap > logCurveMinMaxIndex.MaxIndex && !isLogIncreasing)
            {
                CreateNoDataReportItem(gapReportItems, logCurveMinMaxIndex.MaxIndex, endIndexForGap, gapSize, logMnemonic.value, isLogIncreasing, false);
            }
            gapReportItems.AddRange(GetAnalyzeGapReportItem(logMnemonic.value, inputAnalyzeDataList, gapSize, isLogIncreasing));
            if (endIndexForGap > logCurveMinMaxIndex.MaxIndex && isLogIncreasing)
            {
                CreateNoDataReportItem(gapReportItems, logCurveMinMaxIndex.MaxIndex, endIndexForGap, gapSize, logMnemonic.value, isLogIncreasing, false);
            }
            if (startIndexForGap < logCurveMinMaxIndex.MinIndex && !isLogIncreasing)
            {
                CreateNoDataReportItem(gapReportItems, startIndexForGap, logCurveMinMaxIndex.MinIndex, gapSize, logMnemonic.value, isLogIncreasing, false);
            }
        }
        return GetGapReportResult(job, jobMnemonics, gapReportItems, isDepthLog, logUid, startIndex, endIndex);
    }

    private static void CreateNoDataReportItem(List<AnalyzeGapReportItem> reportItems, Index startIndex, Index endIndex, Index requestedGapSize,
        string logMnemonic, bool isIncreasing, bool noData = true)
    {
        var gapSize = isIncreasing ? (endIndex - startIndex) : (startIndex - endIndex);
        string message = noData
            ? "No data found in given range"
            :
            (gapSize is DepthIndex depthIndex)
                ?
                depthIndex.ToString(
                    CommonConstants.DefaultNumberOfRoundedPlaces)
                : gapSize is TimeSpanIndex index ? index.Value.ToString() : gapSize.ToString();
        if (gapSize > requestedGapSize)
        {
            var reportItem = new AnalyzeGapReportItem
            {
                Mnemonic = logMnemonic,
                Start = isIncreasing ? startIndex.ToString() : endIndex.ToString(),
                End = isIncreasing ? endIndex.ToString() : startIndex.ToString(),
                GapSize = message,
            };
            reportItems.Add(reportItem);
        }
    }

    private static Index GetDepthOrDateTimeIndex(bool isDepthLog, string value, LogCurveIndex logCurveIndex)
    {
        return isDepthLog && logCurveIndex.MinIndex is DepthIndex depthMinIndex
            ? new DepthIndex(double.Parse(value, CultureInfo.InvariantCulture), (depthMinIndex).Uom)
            : new DateTimeIndex(DateTime.Parse(value, CultureInfo.InvariantCulture));
    }

    private (WorkerResult, RefreshAction) GetGapReportResult(AnalyzeGapJob job, IList<string> selectedMnemonics, IList<AnalyzeGapReportItem> gapReportItems, bool isDepth,
        string logUid, Index startIndex, Index endIndex)
    {
        Logger.LogInformation("Analyzing gaps is done. {jobDescription}", job.Description());
        job.JobInfo.Report = GetGapReport(selectedMnemonics, gapReportItems, job.LogReference, isDepth, startIndex, endIndex);
        WorkerResult workerResult = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, $"Analyze gaps for log: {logUid}", jobId: job.JobInfo.Id);
        return (workerResult, null);
    }

    private AnalyzeGapReport GetGapReport(IList<string> selectedMnemonics, IList<AnalyzeGapReportItem> analyzeGapItems, LogObject logReference, bool isDepthLog, Index startIndex,
        Index endIndex)
    {
        var mnemonics = CommonConstants.NewLine + string.Join(CommonConstants.NewLine, selectedMnemonics);
        var intervalMessage = $"in the interval {startIndex.GetValueAsString()} - {endIndex.GetValueAsString()}";
        return new AnalyzeGapReport
        {
            Title = $"Analyze gaps report",
            Summary = analyzeGapItems.Count > 0
                ? $"Found {analyzeGapItems.Count} gaps in the {(isDepthLog ? "depth" : "time")} log '{logReference.Name}' {intervalMessage} for mnemonics: {mnemonics}."
                : $"No gaps were found {intervalMessage} for mnemonics: {mnemonics}.",
            LogReference = logReference,
            ReportItems = analyzeGapItems
        };
    }

    /// <summary>
    /// Get all gaps for input list of mnemonic values larger then requested gap size.
    /// </summary>
    /// <param name="mnemonic">Name of mnemonic.</param>
    /// <param name="inputIndexList">Input list of indexes.</param>
    /// <param name="requestedGapSize">Requested gap size defined by user.</param>
    /// <param name="isLogIncreasing">Is log direction increasing.</param>
    /// <returns>Report items with gap size information.</returns>
    private IEnumerable<AnalyzeGapReportItem> GetAnalyzeGapReportItem(string mnemonic, IList<Index> inputIndexList, Index requestedGapSize, bool isLogIncreasing)
    {
        List<AnalyzeGapReportItem> gapValues = new();
        Index lastValueIndex = inputIndexList?.FirstOrDefault();

        if (lastValueIndex == null) return gapValues;

        foreach (var inputIndex in inputIndexList.Skip(1))
        {
            var gapSize = isLogIncreasing ? (inputIndex - lastValueIndex) : (lastValueIndex - inputIndex);
            if (gapSize >= requestedGapSize)
            {
                gapValues.Add(new AnalyzeGapReportItem
                {
                    Mnemonic = mnemonic,
                    Start = lastValueIndex.ToString(),
                    End = inputIndex.ToString(),
                    GapSize = (gapSize is DepthIndex depthIndex) ? depthIndex.ToString(CommonConstants.DefaultNumberOfRoundedPlaces) : gapSize.ToString(),
                });
            }
            lastValueIndex = inputIndex;
        }
        return gapValues;
    }
}
