using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.Data;
using Witsml.Extensions;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Extensions;
using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Models.Reports;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Repositories;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers.DeepComparison;

namespace WitsmlExplorer.Api.Workers;

/// <summary>
/// Worker for comparing sub objects on 2 wellbores.
/// </summary>
public class WellboreSubObjectsComparisonWorker : BaseWorker<WellboreSubObjectsComparisonJob>, IWorker
{
    private const string _witsmlFunctionName = "WMLS_GetFromStore";
    private readonly IDocumentRepository<Server, Guid> _witsmlServerRepository;
    private readonly ICountLogDataRowWorker _countLogDataRowWorker;
    private readonly ICompareLogDataWorker _compareLogDataWorker;
    private readonly IDeepObjectComparer _deepObjectComparer;
    public JobType JobType => JobType.WellboreSubObjectsComparison;

    public WellboreSubObjectsComparisonWorker(
        ILogger<WellboreSubObjectsComparisonJob> logger,
        IWitsmlClientProvider witsmlClientProvider,
        ICountLogDataRowWorker countLogDataRowWorker,
        ICompareLogDataWorker compareLogDataWorker,
        IDocumentRepository<Server, Guid> witsmlServerRepository = null,
        IDeepObjectComparer deepObjectComparer = null) : base(
        witsmlClientProvider, logger)
    {
        _countLogDataRowWorker = countLogDataRowWorker;
        _compareLogDataWorker = compareLogDataWorker;
        _witsmlServerRepository = witsmlServerRepository;
        _deepObjectComparer = deepObjectComparer ?? new DeepObjectComparer();
    }

    /// <summary>
    /// Compares objects, mnemonics and ranges of 2 wellbores.
    /// </summary>
    /// <param name="job">The job model contains job-specific parameters.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Task of the workerResult in a report with a diffences.</returns>
    public override async Task<(WorkerResult, RefreshAction)> Execute(WellboreSubObjectsComparisonJob job, CancellationToken? cancellationToken = null)
    {
        Logger.LogInformation("Comparing of 2 wellbores sub objects started. {jobDescription}", job.Description());

        IWitsmlClient sourceClient = GetTargetWitsmlClientOrThrow();
        IWitsmlClient targetClient = GetSourceWitsmlClientOrThrow();

        ReturnElements wellboreReturnElements = job.CompareWellboreMetadata ? ReturnElements.All : ReturnElements.IdOnly;
        WitsmlWellbore existingTargetWellbore = await WorkerTools.GetWellbore(targetClient, job.TargetWellbore, wellboreReturnElements);
        WitsmlWellbore existingSourceWellbore = await WorkerTools.GetWellbore(sourceClient, job.SourceWellbore, wellboreReturnElements);

        IEnumerable<Server> servers = _witsmlServerRepository == null ? new List<Server>() : await _witsmlServerRepository.GetDocumentsAsync();
        var sourceServerName = servers.FirstOrDefault((server) => server.Url.EqualsIgnoreCase(sourceClient.GetServerHostname()))?.Name;
        var targetServerName = servers.FirstOrDefault((server) => server.Url.EqualsIgnoreCase(targetClient.GetServerHostname()))?.Name;

        if (sourceServerName == targetServerName && existingSourceWellbore.Uid == existingTargetWellbore.Uid && existingSourceWellbore.UidWell == existingTargetWellbore.UidWell)
        {
            string errorMessageSameWellbore = "Failed to compare 2 wellbores with objects - tried to compare the same wellbore under the same well on the same server.";
            Logger.LogError("{ErrorMessage} {Reason} - {JobDescription}", errorMessageSameWellbore, errorMessageSameWellbore, job.Description());
            return (new WorkerResult(sourceClient.GetServerHostname(), false, errorMessageSameWellbore, errorMessageSameWellbore, sourceServerUrl: targetClient.GetServerHostname()), null);
        }

        int decimalPlaces = 0;
        if (job.DecimalMode == DecimalComparisonMode.ServerSettings)
        {
            int sourceDecimals = servers.FirstOrDefault(s => s.Url.EqualsIgnoreCase(sourceClient.GetServerHostname()))?.DepthLogDecimals ?? 0;
            int targetDecimals = servers.FirstOrDefault(s => s.Url.EqualsIgnoreCase(targetClient.GetServerHostname()))?.DepthLogDecimals ?? 0;
            decimalPlaces = Math.Min(sourceDecimals, targetDecimals);
        }
        else
        {
            decimalPlaces = job.CustomDecimalPlaces ?? 0;
        }

        DeepComparisonOptions deepOptions = new()
        {
            OmitCustomData = job.OmitCustomData,
            OmitTimestamps = job.OmitTimestamps,
            DecimalMode = job.DecimalMode,
            DecimalPlaces = (job.DecimalMode == DecimalComparisonMode.Custom || job.DecimalMode == DecimalComparisonMode.AppSettings)
                ? job.CustomDecimalPlaces
                : (job.DecimalMode == DecimalComparisonMode.ServerSettings && decimalPlaces > 0 ? decimalPlaces : null),
            TimezoneMode = job.TimezoneMode,
            Timezone = job.Timezone,
            MatchByNameIfUidDiffers = job.MatchByNameIfUidDiffers,
            ReportAllMismatches = job.ReportAllMismatches,
            MaxMismatchesLimit = job.MaxLogDataMismatches ?? 500
        };

        bool hasChildObjectsToCompare = job.CompareAllObjects || (job.ObjectTypesToCompare != null && job.ObjectTypesToCompare.Any());
        bool compareLogs = job.CompareAllObjects || (job.ObjectTypesToCompare != null && job.ObjectTypesToCompare.Contains(EntityType.Log));

        var objectsOnTargetWellbore = new Dictionary<(EntityType, string), IWitsmlObjectList>();
        var objectsOnSourceWellbore = new Dictionary<(EntityType, string), IWitsmlObjectList>();

        if (hasChildObjectsToCompare)
        {
            ReportProgress(job, 0.05, "Getting server capabilities");
            var supportedObjectTypes = await GetSupportedObjectTypes(sourceClient, targetClient);

            if (!job.CompareAllObjects)
            {
                supportedObjectTypes = supportedObjectTypes
                    .Where(t => job.ObjectTypesToCompare.Any(selected => string.Equals(selected.ToString(), t, StringComparison.OrdinalIgnoreCase)))
                    .ToList();
            }

            ReportProgress(job, 0.15, "Fetching wellbore objects");
            var targetObjectsTask = GetWellboreObjects(job.TargetWellbore.WellUid, job.TargetWellbore.WellboreUid, targetClient, supportedObjectTypes, compareLogs, job.CompareDepthLogs, job.CompareTimeLogs, job.SpecificLogUidsOrNames);
            var sourceObjectsTask = GetWellboreObjects(job.SourceWellbore.WellUid, job.SourceWellbore.WellboreUid, sourceClient, supportedObjectTypes, compareLogs, job.CompareDepthLogs, job.CompareTimeLogs, job.SpecificLogUidsOrNames);
            await Task.WhenAll(targetObjectsTask, sourceObjectsTask);
            objectsOnTargetWellbore = targetObjectsTask.Result;
            objectsOnSourceWellbore = sourceObjectsTask.Result;
            ReportProgress(job, 0.35, "Fetching wellbore objects");
        }

        WitsmlLogs targetLogs = null;
        WitsmlLogs sourceLogs = null;
        if (compareLogs)
        {
            ReportProgress(job, 0.36, "Fetching log headers");
            var targetLogsTask = GetLogs(job.TargetWellbore.WellUid, job.TargetWellbore.WellboreUid, targetClient);
            var sourceLogsTask = GetLogs(job.SourceWellbore.WellUid, job.SourceWellbore.WellboreUid, sourceClient);
            await Task.WhenAll(targetLogsTask, sourceLogsTask);
            targetLogs = targetLogsTask.Result;
            sourceLogs = sourceLogsTask.Result;

            FilterWitsmlLogs(targetLogs, job.CompareDepthLogs, job.CompareTimeLogs, job.SpecificLogUidsOrNames);
            FilterWitsmlLogs(sourceLogs, job.CompareDepthLogs, job.CompareTimeLogs, job.SpecificLogUidsOrNames);
        }
        ReportProgress(job, 0.40, "Filtering logs");

        cancellationToken?.ThrowIfCancellationRequested();

        var reportItems = new List<WellboreSubObjectsComparisonItem>();
        if (job.CompareWellboreMetadata && existingSourceWellbore != null && existingTargetWellbore != null)
        {
            reportItems.AddRange(_deepObjectComparer.CompareWellbore(existingSourceWellbore, existingTargetWellbore, deepOptions));
        }

        if (hasChildObjectsToCompare)
        {
            reportItems.AddRange(FindMissingObjects(objectsOnSourceWellbore, objectsOnTargetWellbore, true, job.MatchByNameIfUidDiffers));
            reportItems.AddRange(FindMissingObjects(objectsOnTargetWellbore, objectsOnSourceWellbore, false, job.MatchByNameIfUidDiffers));
        }
        ReportProgress(job, 0.45, "Comparing object lists");

        bool willCheckLogData = sourceLogs != null && targetLogs != null && (job.CountLogsData || job.CheckLogsData);
        double deepCompareStart = 0.45;
        double deepCompareEnd = willCheckLogData ? 0.75 : 0.95;

        if (hasChildObjectsToCompare && job.DeepCompareObjects)
        {
            IProgress<double> deepCompareProgress = new Progress<double>(p =>
            {
                ReportProgress(job, deepCompareStart + p * (deepCompareEnd - deepCompareStart), "Deep comparing objects");
            });
            reportItems.AddRange(await PerformDeepComparison(objectsOnSourceWellbore, objectsOnTargetWellbore, sourceClient, targetClient, job, deepOptions, cancellationToken, deepCompareProgress));
        }
        ReportProgress(job, deepCompareEnd, "Comparing mnemonics");

        if (sourceLogs != null && targetLogs != null)
        {
            reportItems.AddRange(FindMissingMnemonics(sourceLogs, targetLogs, true, job.SpecificMnemonics));
            reportItems.AddRange(FindMissingMnemonics(targetLogs, sourceLogs, false, job.SpecificMnemonics));
            reportItems.AddRange(FindLogUnitDifferences(sourceLogs, targetLogs, job));

            if (job.DeepCompareObjects)
            {
                reportItems.AddRange(DeepCompareLogCurves(sourceLogs, targetLogs, job, deepOptions));
            }

            if (willCheckLogData)
            {
                IProgress<double> subTaskProgressReporter = new Progress<double>(subTaskProgress =>
                {
                    var progress = subTaskProgress * 0.20 + 0.75;
                    ReportProgress(job, progress);
                });
                reportItems.AddRange(await FindMnemonicIndexRangeDifferences(sourceLogs, targetLogs, job, subTaskProgressReporter, cancellationToken, decimalPlaces, deepOptions));
            }
        }

        ReportProgress(job, 1.0, "Comparison complete");

        WorkerResult workerResult = new(sourceClient.GetServerHostname(), true, $"Comparison of 2 wellbores is done.", jobId: job.JobInfo.Id);
        var report = GenerateReport(reportItems, sourceServerName,
            targetServerName, existingSourceWellbore.Name,
            existingTargetWellbore.Name, job, objectsOnSourceWellbore, objectsOnTargetWellbore);
        job.JobInfo.Report = report;
        Logger.LogInformation("Comparing of 2 wellbores sub objects is done. {jobDescription}", job.Description());
        return (workerResult, null);
    }

    private void ReportProgress(WellboreSubObjectsComparisonJob job, double progress, string stage = null, string objectName = null, string mnemonic = null, string currentIndex = null, string indexRange = null)
    {
        if (job.JobInfo != null) job.JobInfo.Progress = progress;
        if (job.ProgressUpdateReporter != null)
        {
            job.ProgressUpdateReporter.Report(new JobProgressUpdate(progress, stage, objectName, mnemonic, currentIndex, indexRange));
        }
        else
        {
            job.ProgressReporter?.Report(progress);
        }
    }

    private async Task<List<string>> GetSupportedObjectTypes(IWitsmlClient sourceClient,
        IWitsmlClient targetClient)
    {
        var serverCapabilitiesOnSource = (await sourceClient.GetCap())
            .ServerCapabilities.FirstOrDefault()
            ?.Functions
            .Where(x => x.Name == _witsmlFunctionName)
            .Select(x => x.DataObjects);
        var serverCapabilitiesOnTarget = (await targetClient.GetCap())
            .ServerCapabilities.FirstOrDefault()
            ?.Functions
            .Where(x => x.Name == _witsmlFunctionName)
            .Select(x => x.DataObjects);
        var supportedObjectTypesOnSource = (serverCapabilitiesOnSource ?? Array.Empty<List<WitsmlFunctionDataObject>>()).SelectMany(s => s.Select(ss => ss.Name.ToLower()));
        var supportedObjectTypesOnTarget = (serverCapabilitiesOnTarget ?? Array.Empty<List<WitsmlFunctionDataObject>>()).SelectMany(s => s.Select(ss => ss.Name.ToLower()));
        var result =
            supportedObjectTypesOnSource.Intersect(
                supportedObjectTypesOnTarget);
        return result.ToList();
    }

    private BaseReport GenerateReport(
        List<WellboreSubObjectsComparisonItem> reportItems,
        string sourceServerName,
        string targetServerName,
        string sourceWellbore,
        string targetWellbore,
        WellboreSubObjectsComparisonJob job = null,
        Dictionary<(EntityType, string), IWitsmlObjectList> objectsOnSource = null,
        Dictionary<(EntityType, string), IWitsmlObjectList> objectsOnTarget = null)
    {
        int missingOnTarget = reportItems.Count(x => x.ExistsOnSource == "TRUE" && x.ExistsOnTarget == "FALSE");
        int missingOnSource = reportItems.Count(x => x.ExistsOnSource == "FALSE" && x.ExistsOnTarget == "TRUE");
        int elementDiffs = reportItems.Count(x => x.DifferenceType is "ElementDifference" or "MeasureMismatch" or "UnitMismatch" or "IndexRangeDifference" or "SubObjectMissingOnSource" or "SubObjectMissingOnTarget");
        int matchedCount = reportItems.Count(x => x.DifferenceType is "DataPointsCountMatched" or "Matched");
        int dataDiffs = reportItems.Count(x =>
            x.NumberOfDifferencesInValuesInMnemonics != null ||
            x.DifferenceType == "DataPointsCountDifference" ||
            (x.DataPointsOfMnemonicOnSource != null && x.DifferenceType != "DataPointsCountMatched"));
        int totalMismatches = reportItems.Count - matchedCount;

        var comparedItemsList = new List<string>();
        if (job?.CompareWellboreMetadata == true)
        {
            comparedItemsList.Add("Wellbore metadata");
        }
        if (objectsOnSource != null)
        {
            foreach (var kvp in objectsOnSource)
            {
                int srcCount = kvp.Value?.Objects?.Count() ?? 0;
                int tgtCount = (objectsOnTarget != null && objectsOnTarget.ContainsKey(kvp.Key)) ? (objectsOnTarget[kvp.Key]?.Objects?.Count() ?? 0) : 0;
                if (srcCount > 0 || tgtCount > 0)
                {
                    string typeName = kvp.Key.Item1 == EntityType.Log && !string.IsNullOrEmpty(kvp.Key.Item2)
                        ? $"Log ({kvp.Key.Item2})"
                        : kvp.Key.Item1.ToString();
                    comparedItemsList.Add($"{typeName}: {srcCount} on source, {tgtCount} on target");
                }
            }
        }

        string comparedSummary = comparedItemsList.Count > 0
            ? $"Compared: {string.Join(" | ", comparedItemsList)}."
            : "";

        string summary;
        if (totalMismatches > 0)
        {
            string verifiedNote = matchedCount > 0 ? $" ({matchedCount:n0} mnemonic data point counts verified matching)" : "";
            summary = $"Found {totalMismatches:n0} mismatches between the objects in the wellbores '{sourceWellbore}' and '{targetWellbore}'{verifiedNote}.\n"
                    + (string.IsNullOrEmpty(comparedSummary) ? "" : $"{comparedSummary}\n")
                    + $"Differences breakdown: Missing on target: {missingOnTarget:n0} | Missing on source: {missingOnSource:n0} | Element differences: {elementDiffs:n0} | Data differences: {dataDiffs:n0}";
        }
        else
        {
            string matchNote = matchedCount > 0 ? $" Verified {matchedCount:n0} mnemonic data point counts." : "";
            summary = !string.IsNullOrEmpty(comparedSummary)
                ? $"All compared objects are identical between the wellbores '{sourceWellbore}' and '{targetWellbore}'. No mismatches were found.{matchNote}\n{comparedSummary}"
                : $"No mismatches were found between the objects in the wellbores '{sourceWellbore}' and '{targetWellbore}'.{matchNote}";
        }

        return new BaseReport
        {
            Title = $"Wellbore sub objects comparison",
            ReportItemColumns = CreateReportItemColumns(reportItems, job),
            ReportItems = reportItems,
            Summary = summary,
            JobDetails = $"SourceServer::{sourceServerName}|TargetServer::{targetServerName}|SourceWellbore::{sourceWellbore}|TargetWellbore::{targetWellbore}"
        };
    }
    private ICollection<ReportItemColumn> CreateReportItemColumns(List<WellboreSubObjectsComparisonItem> reportItems, WellboreSubObjectsComparisonJob job)
    {
        if (reportItems.IsNullOrEmpty()) return Array.Empty<ReportItemColumn>();

        var reportItemColumns = new List<ReportItemColumn>();

        if (!(job.CheckDepthBasedLogsData && job.CheckTimeBasedLogsData))
        {
            if (job.CheckDepthBasedLogsData)
            {
                reportItemColumns.Add(new() { Name = "sourcestart", Type = ReportItemType.MEASURE });
                reportItemColumns.Add(new() { Name = "targetstart", Type = ReportItemType.MEASURE });
                reportItemColumns.Add(new() { Name = "sourceend", Type = ReportItemType.MEASURE });
                reportItemColumns.Add(new() { Name = "targetend", Type = ReportItemType.MEASURE });
            }
            else
            {
                reportItemColumns.Add(new() { Name = "sourcestart", Type = ReportItemType.DATE_TIME });
                reportItemColumns.Add(new() { Name = "targetstart", Type = ReportItemType.DATE_TIME });
                reportItemColumns.Add(new() { Name = "sourceend", Type = ReportItemType.DATE_TIME });
                reportItemColumns.Add(new() { Name = "targetend", Type = ReportItemType.DATE_TIME });
            }
        }

        if (reportItems.All(i => i.DataPointsOfMnemonicOnSource != null && i.DataPointsOfMnemonicOnSource.IsNumeric()))
        {
            reportItemColumns.Add(new() { Name = "datapointsofmnemoniconsource", Type = ReportItemType.NUMBER });
        }

        if (reportItems.All(i => i.DataPointsOfMnemonicOnTarget != null && i.DataPointsOfMnemonicOnTarget.IsNumeric()))
        {
            reportItemColumns.Add(new() { Name = "datapointsofmnemonicontarget", Type = ReportItemType.NUMBER });
        }

        if (reportItems.All(i => i.NumberOfDifferencesInValuesInMnemonics != null && i.NumberOfDifferencesInValuesInMnemonics.IsNumeric()))
        {
            reportItemColumns.Add(new() { Name = "NumberOfDifferencesInValuesInMnemonics", Type = ReportItemType.NUMBER });
        }

        return reportItemColumns;
    }

    private async Task<List<WellboreSubObjectsComparisonItem>> PerformDeepComparison(
        Dictionary<(EntityType, string), IWitsmlObjectList> sourceDict,
        Dictionary<(EntityType, string), IWitsmlObjectList> targetDict,
        IWitsmlClient sourceClient,
        IWitsmlClient targetClient,
        WellboreSubObjectsComparisonJob job,
        DeepComparisonOptions deepOptions,
        CancellationToken? cancellationToken,
        IProgress<double> progressReporter = null)
    {
        var resultList = new List<WellboreSubObjectsComparisonItem>();
        var allMatchedPairs = new List<(EntityType EntityType, WitsmlObjectOnWellbore Source, WitsmlObjectOnWellbore Target)>();

        foreach (var (key, sourceObjList) in sourceDict)
        {
            var entityType = key.Item1;
            if (entityType is EntityType.Well or EntityType.Wellbore or EntityType.Log) continue;
            if (!targetDict.ContainsKey(key)) continue;

            var targetObjList = targetDict[key];
            var sourceObjects = sourceObjList?.Objects?.ToList() ?? new();
            var targetObjects = targetObjList?.Objects?.ToList() ?? new();

            var unmatchedSource = new List<WitsmlObjectOnWellbore>(sourceObjects);
            var unmatchedTarget = new List<WitsmlObjectOnWellbore>(targetObjects);

            for (int i = unmatchedSource.Count - 1; i >= 0; i--)
            {
                var s = unmatchedSource[i];
                var t = unmatchedTarget.FirstOrDefault(x => string.Equals(x.Uid, s.Uid, StringComparison.OrdinalIgnoreCase));
                if (t != null)
                {
                    allMatchedPairs.Add((entityType, s, t));
                    unmatchedSource.RemoveAt(i);
                    unmatchedTarget.Remove(t);
                }
            }

            if (job.MatchByNameIfUidDiffers)
            {
                for (int i = unmatchedSource.Count - 1; i >= 0; i--)
                {
                    var s = unmatchedSource[i];
                    if (!string.IsNullOrEmpty(s.Name))
                    {
                        var t = unmatchedTarget.FirstOrDefault(x => string.Equals(x.Name, s.Name, StringComparison.OrdinalIgnoreCase));
                        if (t != null)
                        {
                            allMatchedPairs.Add((entityType, s, t));
                            unmatchedSource.RemoveAt(i);
                            unmatchedTarget.Remove(t);
                        }
                    }
                }
            }
        }

        int totalPairs = allMatchedPairs.Count;
        if (totalPairs == 0) return resultList;

        int completedPairs = 0;
        using var semaphore = new SemaphoreSlim(4);
        var tasks = new List<Task>();

        foreach (var group in allMatchedPairs.GroupBy(p => p.EntityType))
        {
            var entityType = group.Key;
            // Use smaller batches for heavy objects with large child collections, larger for lightweight objects like Message/Risk/BhaRun
            int batchSize = entityType is EntityType.Trajectory or EntityType.Tubular or EntityType.MudLog ? 2 : 15;

            foreach (var chunk in group.Chunk(batchSize))
            {
                var chunkList = chunk.ToList();
                tasks.Add(Task.Run(async () =>
                {
                    await semaphore.WaitAsync(cancellationToken ?? CancellationToken.None);
                    try
                    {
                        cancellationToken?.ThrowIfCancellationRequested();

                        var sourceUids = chunkList.Select(p => p.Source.Uid).Distinct().ToArray();
                        var targetUids = chunkList.Select(p => p.Target.Uid).Distinct().ToArray();

                        var fullSourceQuery = ObjectQueries.GetWitsmlObjectsByIds(job.SourceWellbore.WellUid, job.SourceWellbore.WellboreUid, sourceUids, entityType);
                        var fullTargetQuery = ObjectQueries.GetWitsmlObjectsByIds(job.TargetWellbore.WellUid, job.TargetWellbore.WellboreUid, targetUids, entityType);

                        var sourceTask = sourceClient.GetFromStoreNullableAsync(fullSourceQuery, new OptionsIn(ReturnElements.All));
                        var targetTask = targetClient.GetFromStoreNullableAsync(fullTargetQuery, new OptionsIn(ReturnElements.All));

                        await Task.WhenAll(sourceTask, targetTask);

                        var fullSourceList = sourceTask.Result;
                        var fullTargetList = targetTask.Result;

                        var srcMap = (fullSourceList?.Objects ?? Enumerable.Empty<WitsmlObjectOnWellbore>())
                            .Where(o => !string.IsNullOrEmpty(o.Uid))
                            .GroupBy(o => o.Uid, StringComparer.OrdinalIgnoreCase)
                            .ToDictionary(g => g.Key, g => g.First(), StringComparer.OrdinalIgnoreCase);
                        var tgtMap = (fullTargetList?.Objects ?? Enumerable.Empty<WitsmlObjectOnWellbore>())
                            .Where(o => !string.IsNullOrEmpty(o.Uid))
                            .GroupBy(o => o.Uid, StringComparer.OrdinalIgnoreCase)
                            .ToDictionary(g => g.Key, g => g.First(), StringComparer.OrdinalIgnoreCase);

                        var batchDiffs = new List<WellboreSubObjectsComparisonItem>();

                        foreach (var (type, s, t) in chunkList)
                        {
                            WitsmlObjectOnWellbore fullSourceObj = srcMap.TryGetValue(s.Uid, out var so) ? so : null;
                            WitsmlObjectOnWellbore fullTargetObj = tgtMap.TryGetValue(t.Uid, out var to) ? to : null;

                            // Fallback to single-item fetch if a server did not return the object in batch
                            if (fullSourceObj == null)
                            {
                                var singleQuery = ObjectQueries.GetWitsmlObjectById(job.SourceWellbore.WellUid, job.SourceWellbore.WellboreUid, s.Uid, type);
                                fullSourceObj = (await sourceClient.GetFromStoreNullableAsync(singleQuery, new OptionsIn(ReturnElements.All)))?.Objects?.FirstOrDefault();
                            }
                            if (fullTargetObj == null)
                            {
                                var singleQuery = ObjectQueries.GetWitsmlObjectById(job.TargetWellbore.WellUid, job.TargetWellbore.WellboreUid, t.Uid, type);
                                fullTargetObj = (await targetClient.GetFromStoreNullableAsync(singleQuery, new OptionsIn(ReturnElements.All)))?.Objects?.FirstOrDefault();
                            }

                            if (fullSourceObj != null && fullTargetObj != null)
                            {
                                var diffs = _deepObjectComparer.CompareObjects(type, fullSourceObj, fullTargetObj, deepOptions);
                                batchDiffs.AddRange(diffs);
                            }

                            int done = Interlocked.Increment(ref completedPairs);
                            progressReporter?.Report((double)done / totalPairs);
                        }

                        lock (resultList)
                        {
                            resultList.AddRange(batchDiffs);
                        }
                    }
                    finally
                    {
                        semaphore.Release();
                    }
                }, cancellationToken ?? CancellationToken.None));
            }
        }

        await Task.WhenAll(tasks);
        return resultList;
    }

    private async Task<List<WellboreSubObjectsComparisonItem>> FindMnemonicIndexRangeDifferences(
        WitsmlLogs sourceLogs,
        WitsmlLogs targetLogs,
        WellboreSubObjectsComparisonJob job,
        IProgress<double> progressReporter,
        CancellationToken? cancellationToken,
        int? decimalPlaces = null,
        DeepComparisonOptions deepOptions = null)
    {
        var resultList = new List<WellboreSubObjectsComparisonItem>();
        if (sourceLogs?.Logs == null || targetLogs?.Logs == null) return resultList;

        var pairedLogs = PairLogs(sourceLogs, targetLogs, job);
        var totalObjects = pairedLogs.Count;
        var currentIndex = 0;
        foreach (var (witsmlLog, targetLog) in pairedLogs)
        {
            var firstLogCurveInfo = witsmlLog.LogCurveInfo ?? new List<WitsmlLogCurveInfo>();
            var secondLogCurveInfo = targetLog.LogCurveInfo ?? new List<WitsmlLogCurveInfo>();

            var sameLogCurves = firstLogCurveInfo.Where(item1 =>
                    secondLogCurveInfo.Any(item2 => item1.Mnemonic == item2.Mnemonic))
                .ToList();

            if (job.SpecificMnemonics != null && job.SpecificMnemonics.Any())
            {
                sameLogCurves = sameLogCurves.Where(c => job.SpecificMnemonics.Any(m => string.Equals(m, c.Mnemonic, StringComparison.OrdinalIgnoreCase))).ToList();
            }

            if (job.CountLogsData)
            {
                await CountLogsDataForComparison(job, progressReporter,
                    cancellationToken, targetLog, witsmlLog, currentIndex,
                    totalObjects, resultList);
            }

            if (job.CheckLogsData)
            {
                await CheckLogsDataForComparison(job, progressReporter, cancellationToken, witsmlLog, currentIndex, totalObjects, targetLog, resultList, decimalPlaces, deepOptions);
            }

            var currentLogCurveInfoIndex = 0;
            var totalLogCurveInfoElements = sameLogCurves.Count;
            foreach (var logCurveInfo in sameLogCurves)
            {
                var secondMnemonic = secondLogCurveInfo.FirstOrDefault(x => x.Mnemonic == logCurveInfo.Mnemonic)!;

                if (witsmlLog.IndexType == WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME)
                {
                    bool minDiff = deepOptions != null && _deepObjectComparer is DeepObjectComparer docTime
                        ? !docTime.AreValuesEqual(logCurveInfo.MinDateTimeIndex, secondMnemonic.MinDateTimeIndex, "MinDateTimeIndex", deepOptions)
                        : logCurveInfo.MinDateTimeIndex != secondMnemonic.MinDateTimeIndex;
                    bool maxDiff = deepOptions != null && _deepObjectComparer is DeepObjectComparer docTimeMax
                        ? !docTimeMax.AreValuesEqual(logCurveInfo.MaxDateTimeIndex, secondMnemonic.MaxDateTimeIndex, "MaxDateTimeIndex", deepOptions)
                        : logCurveInfo.MaxDateTimeIndex != secondMnemonic.MaxDateTimeIndex;

                    if (minDiff || maxDiff)
                    {
                        string srcMin = deepOptions != null && _deepObjectComparer is DeepObjectComparer docFmt1
                            ? docFmt1.FormatValueForReport(logCurveInfo.MinDateTimeIndex, "MinDateTimeIndex", deepOptions)
                            : logCurveInfo.MinDateTimeIndex;
                        string srcMax = deepOptions != null && _deepObjectComparer is DeepObjectComparer docFmt2
                            ? docFmt2.FormatValueForReport(logCurveInfo.MaxDateTimeIndex, "MaxDateTimeIndex", deepOptions)
                            : logCurveInfo.MaxDateTimeIndex;
                        string tgtMin = deepOptions != null && _deepObjectComparer is DeepObjectComparer docFmt3
                            ? docFmt3.FormatValueForReport(secondMnemonic.MinDateTimeIndex, "MinDateTimeIndex", deepOptions)
                            : secondMnemonic.MinDateTimeIndex;
                        string tgtMax = deepOptions != null && _deepObjectComparer is DeepObjectComparer docFmt4
                            ? docFmt4.FormatValueForReport(secondMnemonic.MaxDateTimeIndex, "MaxDateTimeIndex", deepOptions)
                            : secondMnemonic.MaxDateTimeIndex;

                        var result = new WellboreSubObjectsComparisonItem()
                        {
                            ObjectType = "Log",
                            LogType = witsmlLog.IndexType,
                            ObjectUid = witsmlLog.Uid,
                            ObjectName = witsmlLog.Name,
                            DifferenceType = "IndexRangeDifference",
                            PropertyPath = $"LogCurve[{logCurveInfo.Mnemonic}].IndexRange",
                            IndexOrKey = logCurveInfo.Mnemonic,
                            SourceValue = $"{srcMin} - {srcMax}",
                            TargetValue = $"{tgtMin} - {tgtMax}",
                            Delta = DeepObjectComparer.CalculateIndexRangeDelta(srcMin, srcMax, tgtMin, tgtMax, "DateTimeIndex"),
                            Mnemonic = logCurveInfo.Mnemonic,
                            ExistsOnSource = "TRUE",
                            ExistsOnTarget = "TRUE",
                            SourceStart = srcMin,
                            SourceEnd = srcMax,
                            TargetStart = tgtMin,
                            TargetEnd = tgtMax,
                            Description = $"Index range mismatch for time log curve '{logCurveInfo.Mnemonic}': Source=[{srcMin} - {srcMax}], Target=[{tgtMin} - {tgtMax}]"
                        };
                        resultList.Add(result);
                    }
                }
                if (witsmlLog.IndexType == WitsmlLog.WITSML_INDEX_TYPE_MD)
                {
                    bool minDiff = deepOptions != null && _deepObjectComparer is DeepObjectComparer docMd
                        ? !docMd.AreValuesEqual(logCurveInfo.MinIndex?.Value, secondMnemonic.MinIndex?.Value, "MinIndex", deepOptions)
                        : logCurveInfo.MinIndex?.Value != secondMnemonic.MinIndex?.Value;
                    bool maxDiff = deepOptions != null && _deepObjectComparer is DeepObjectComparer docMdMax
                        ? !docMdMax.AreValuesEqual(logCurveInfo.MaxIndex?.Value, secondMnemonic.MaxIndex?.Value, "MaxIndex", deepOptions)
                        : logCurveInfo.MaxIndex?.Value != secondMnemonic.MaxIndex?.Value;

                    if (minDiff || maxDiff)
                    {
                        var result = new WellboreSubObjectsComparisonItem()
                        {
                            ObjectType = "Log",
                            LogType = witsmlLog.IndexType,
                            ObjectUid = witsmlLog.Uid,
                            ObjectName = witsmlLog.Name,
                            DifferenceType = "IndexRangeDifference",
                            PropertyPath = $"LogCurve[{logCurveInfo.Mnemonic}].IndexRange",
                            IndexOrKey = logCurveInfo.Mnemonic,
                            SourceValue = $"{logCurveInfo.MinIndex?.Value} - {logCurveInfo.MaxIndex?.Value}",
                            TargetValue = $"{secondMnemonic.MinIndex?.Value} - {secondMnemonic.MaxIndex?.Value}",
                            Delta = DeepObjectComparer.CalculateIndexRangeDelta(logCurveInfo.MinIndex?.Value, logCurveInfo.MaxIndex?.Value, secondMnemonic.MinIndex?.Value, secondMnemonic.MaxIndex?.Value, "MinIndex"),
                            Mnemonic = logCurveInfo.Mnemonic,
                            ExistsOnSource = "TRUE",
                            ExistsOnTarget = "TRUE",
                            SourceStart = logCurveInfo.MinIndex?.Value,
                            SourceEnd = logCurveInfo.MaxIndex?.Value,
                            TargetStart = secondMnemonic.MinIndex?.Value,
                            TargetEnd = secondMnemonic.MaxIndex?.Value,
                            Description = $"Index range mismatch for depth log curve '{logCurveInfo.Mnemonic}': Source=[{logCurveInfo.MinIndex?.Value} - {logCurveInfo.MaxIndex?.Value}], Target=[{secondMnemonic.MinIndex?.Value} - {secondMnemonic.MaxIndex?.Value}]"
                        };
                        resultList.Add(result);
                    }
                }
                var subProgress = (double)currentLogCurveInfoIndex / (totalLogCurveInfoElements > 0 ? totalLogCurveInfoElements : 1) * 0.1 + 0.9;
                var progress = ((double)currentIndex / (totalObjects > 0 ? totalObjects : 1)) + (subProgress / (totalObjects > 0 ? totalObjects : 1));
                progressReporter.Report(progress);
                job.ProgressUpdateReporter?.Report(new JobProgressUpdate(progress * 0.20 + 0.75, "Checking Index Ranges", witsmlLog.Name, logCurveInfo.Mnemonic));
                currentLogCurveInfoIndex++;
            }
            currentIndex++;
        }
        return resultList;
    }

    private async Task CheckLogsDataForComparison(WellboreSubObjectsComparisonJob job, IProgress<double> progressReporter,
        CancellationToken? cancellationToken, WitsmlLog witsmlLog, int currentIndex, int totalObjects, WitsmlLog targetLog,
        List<WellboreSubObjectsComparisonItem> resultList, int? decimalPlaces = null, DeepComparisonOptions deepOptions = null)
    {
        if (job.CheckTimeBasedLogsData && witsmlLog.IndexType == WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME || job.CheckDepthBasedLogsData && witsmlLog.IndexType == WitsmlLog.WITSML_INDEX_TYPE_MD)
        {
            IProgress<double> subJobProgressReporter = new Progress<double>(subJobProgress =>
            {
                var progress = ((double)currentIndex / totalObjects) + (subJobProgress * 0.9 / totalObjects);
                progressReporter.Report(progress);
            });
            bool isDepth = witsmlLog.IndexType == WitsmlLog.WITSML_INDEX_TYPE_MD;
            double? samplingInterval = isDepth ? job.DepthInterval : job.TimeIntervalSeconds;
            string startIndex = isDepth ? job.DepthStartIndex : job.TimeStartIndex;
            string endIndex = isDepth ? job.DepthEndIndex : job.TimeEndIndex;

            var checkLogsData = await ChecksLogsData(job, witsmlLog, targetLog, subJobProgressReporter, cancellationToken, decimalPlaces, job.SpecificMnemonics, job.ReportAllMismatches, samplingInterval, startIndex, endIndex, currentIndex, totalObjects, deepOptions);
            resultList.AddRange(checkLogsData);
        }
    }

    private async Task CountLogsDataForComparison(WellboreSubObjectsComparisonJob job, IProgress<double> progressReporter,
        CancellationToken? cancellationToken, WitsmlLog targetLog, WitsmlLog witsmlLog, int currentIndex, int totalObjects,
        List<WellboreSubObjectsComparisonItem> resultList)
    {
        if (targetLog != null)
        {
            if (job.CheckTimeBasedLogsData && witsmlLog.IndexType ==
                WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME ||
                job.CheckDepthBasedLogsData && witsmlLog.IndexType ==
                WitsmlLog.WITSML_INDEX_TYPE_MD)
            {
                IProgress<double> subJobProgressReporter = new Progress<double>(subJobProgress =>
                {
                    var progress = ((double)currentIndex / totalObjects) + (subJobProgress * 0.9 / totalObjects);
                    progressReporter.Report(progress);
                });

                bool isDepth = witsmlLog.IndexType == WitsmlLog.WITSML_INDEX_TYPE_MD;
                double? samplingInterval = isDepth ? job.DepthInterval : job.TimeIntervalSeconds;
                string startIndex = isDepth ? job.DepthStartIndex : job.TimeStartIndex;
                string endIndex = isDepth ? job.DepthEndIndex : job.TimeEndIndex;

                job.ProgressUpdateReporter?.Report(new JobProgressUpdate(
                    ((double)currentIndex / totalObjects) * 0.20 + 0.75,
                    "Counting Log Rows",
                    witsmlLog.Name));

                var countLogsData = await CountLogsData(witsmlLog,
                    targetLog, subJobProgressReporter, cancellationToken, job.SpecificMnemonics, samplingInterval, startIndex, endIndex);
                resultList.AddRange(countLogsData);
            }
        }
    }

    private async Task<List<WellboreSubObjectsComparisonItem>> CountLogsData(WitsmlLog sourceLog, WitsmlLog targetLog, IProgress<double> progressReporter, CancellationToken? cancellationToken, List<string> specificMnemonics = null, double? samplingInterval = null, string startIndex = null, string endIndex = null)
    {
        var resultList = new List<WellboreSubObjectsComparisonItem>();
        var countLogsDataJobSource = new CountLogDataRowJob()
        {
            LogReference = new LogObject()
            {
                Uid = sourceLog.Uid,
                WellUid = sourceLog.UidWell,
                WellboreUid = sourceLog.UidWellbore,
                IndexCurve = sourceLog.IndexType == WitsmlLog.WITSML_INDEX_TYPE_MD ? "Depth" : "Time",
                IndexType = sourceLog.IndexType,
            },
            ProgressReporter = new Progress<double>(subJobProgress =>
            {
                var progress = subJobProgress / 2;
                progressReporter.Report(progress);
            }),
            UseTargetClient = true,
            Mnemonics = specificMnemonics,
            SamplingInterval = samplingInterval,
            StartIndex = startIndex,
            EndIndex = endIndex
        };
        (WorkerResult WorkerResult, RefreshAction) resultOfTarget = await _countLogDataRowWorker.Execute(countLogsDataJobSource, cancellationToken);
        if (resultOfTarget.WorkerResult.IsSuccess == false)
        {
            var result = new WellboreSubObjectsComparisonItem()
            {
                ObjectType = "Log",
                LogType = sourceLog.IndexType,
                ObjectUid = sourceLog.Uid,
                ObjectName = sourceLog.Name,
                DifferenceType = "CountDataRowFailed",
                ExistsOnSource = "TRUE",
                ExistsOnTarget = "TRUE",
                DataPointsOfMnemonicOnTarget = "Checking number of mnemonics failed.",
                Description = "Checking number of mnemonics failed on target."
            };
            resultList.Add(result);
            return resultList;
        }
        var countLogsDataJobTarget = new CountLogDataRowJob()
        {
            LogReference = new LogObject()
            {
                Uid = targetLog.Uid,
                WellUid = targetLog.UidWell,
                WellboreUid = targetLog.UidWellbore,
                IndexCurve = targetLog.IndexType == WitsmlLog.WITSML_INDEX_TYPE_MD ? "Depth" : "Time",
                IndexType = targetLog.IndexType,
            },
            ProgressReporter = new Progress<double>(subJobProgress =>
            {
                var progress = subJobProgress / 2 + 0.5;
                progressReporter.Report(progress);
            }),
            UseTargetClient = false,
            Mnemonics = specificMnemonics,
            SamplingInterval = samplingInterval,
            StartIndex = startIndex,
            EndIndex = endIndex
        };
        (WorkerResult WorkerResult, RefreshAction) resultOfSource = await _countLogDataRowWorker.Execute(countLogsDataJobTarget, cancellationToken);
        if (resultOfSource.WorkerResult.IsSuccess == false)
        {
            var result = new WellboreSubObjectsComparisonItem()
            {
                ObjectType = "Log",
                LogType = sourceLog.IndexType,
                ObjectUid = sourceLog.Uid,
                ObjectName = sourceLog.Name,
                DifferenceType = "CountDataRowFailed",
                ExistsOnSource = "TRUE",
                ExistsOnTarget = "TRUE",
                DataPointsOfMnemonicOnSource = "Checking number of mnemonics failed.",
                Description = "Checking number of mnemonics failed on source."
            };
            resultList.Add(result);
            return resultList;
        }
        if (countLogsDataJobSource.JobInfo.Report.ReportItems is List<CountLogDataReportItem> mnemonicsOnSource && countLogsDataJobTarget.JobInfo.Report.ReportItems is List<CountLogDataReportItem> mnemonicsOnTarget)
        {
            if (specificMnemonics != null && specificMnemonics.Any())
            {
                mnemonicsOnSource = mnemonicsOnSource.Where(m => specificMnemonics.Any(req => string.Equals(req, m.Mnemonic, StringComparison.OrdinalIgnoreCase))).ToList();
                mnemonicsOnTarget = mnemonicsOnTarget.Where(m => specificMnemonics.Any(req => string.Equals(req, m.Mnemonic, StringComparison.OrdinalIgnoreCase))).ToList();
            }

            var differencesInCount = mnemonicsOnSource.Where(b => mnemonicsOnTarget.Any(a => a.Mnemonic == b.Mnemonic && a.LogDataCount != b.LogDataCount));
            foreach (var difference in differencesInCount)
            {
                var mnemonicOnTarget = mnemonicsOnTarget
                    .FirstOrDefault(x => x.Mnemonic == difference.Mnemonic);
                if (mnemonicOnTarget != null)
                {
                    var result = new WellboreSubObjectsComparisonItem()
                    {
                        ObjectType = "Log",
                        LogType = sourceLog.IndexType,
                        ObjectUid = sourceLog.Uid,
                        ObjectName = sourceLog.Name,
                        DifferenceType = "DataPointsCountDifference",
                        PropertyPath = $"LogCurve[{difference.Mnemonic}].DataPointsCount",
                        IndexOrKey = difference.Mnemonic,
                        SourceValue = difference.LogDataCount.ToString(),
                        TargetValue = mnemonicOnTarget.LogDataCount.ToString(),
                        Delta = Math.Abs(difference.LogDataCount - mnemonicOnTarget.LogDataCount).ToString(),
                        Mnemonic = difference.Mnemonic,
                        ExistsOnSource = "TRUE",
                        ExistsOnTarget = "TRUE",
                        DataPointsOfMnemonicOnSource = difference.LogDataCount.ToString(),
                        DataPointsOfMnemonicOnTarget = mnemonicOnTarget.LogDataCount.ToString(),
                        Description = $"Difference in data point counts for mnemonic '{difference.Mnemonic}': Source={difference.LogDataCount}, Target={mnemonicOnTarget.LogDataCount}"
                    };
                    resultList.Add(result);
                }
            }

            var matchesInCount = mnemonicsOnSource.Where(b => mnemonicsOnTarget.Any(a => a.Mnemonic == b.Mnemonic && a.LogDataCount == b.LogDataCount));
            foreach (var match in matchesInCount)
            {
                var mnemonicOnTarget = mnemonicsOnTarget.FirstOrDefault(x => x.Mnemonic == match.Mnemonic);
                if (mnemonicOnTarget != null)
                {
                    var result = new WellboreSubObjectsComparisonItem()
                    {
                        ObjectType = "Log",
                        LogType = sourceLog.IndexType,
                        ObjectUid = sourceLog.Uid,
                        ObjectName = sourceLog.Name,
                        DifferenceType = "DataPointsCountMatched",
                        PropertyPath = $"LogCurve[{match.Mnemonic}].DataPointsCount",
                        IndexOrKey = match.Mnemonic,
                        SourceValue = match.LogDataCount.ToString(),
                        TargetValue = mnemonicOnTarget.LogDataCount.ToString(),
                        Delta = "0",
                        Mnemonic = match.Mnemonic,
                        ExistsOnSource = "TRUE",
                        ExistsOnTarget = "TRUE",
                        DataPointsOfMnemonicOnSource = match.LogDataCount.ToString(),
                        DataPointsOfMnemonicOnTarget = mnemonicOnTarget.LogDataCount.ToString(),
                        Description = $"Mnemonic '{match.Mnemonic}' data point counts match: {match.LogDataCount} rows."
                    };
                    resultList.Add(result);
                }
            }
        }
        return resultList;
    }

    private async Task<List<WellboreSubObjectsComparisonItem>> ChecksLogsData(WellboreSubObjectsComparisonJob job, WitsmlLog sourceLog, WitsmlLog targetLog, IProgress<double> progressReporter, CancellationToken? cancellationToken, int? decimalPlaces = null, List<string> specificMnemonics = null, bool reportAllMismatches = true, double? samplingInterval = null, string startIndex = null, string endIndex = null, int currentIndex = 0, int totalObjects = 1, DeepComparisonOptions deepOptions = null)
    {
        var resultList = new List<WellboreSubObjectsComparisonItem>();
        var compareLogsDataJobSource = new CompareLogDataJob
        {
            SourceLog = new ObjectReference
            {
                Uid = targetLog.Uid,
                WellUid = targetLog.UidWell,
                WellboreUid = targetLog.UidWellbore,
                WellName = targetLog.NameWell,
                WellboreName = targetLog.NameWellbore,
                Name = targetLog.Name
            },
            TargetLog = new ObjectReference
            {
                Uid = sourceLog.Uid,
                WellUid = sourceLog.UidWell,
                WellboreUid = sourceLog.UidWellbore,
                WellName = sourceLog.NameWell,
                WellboreName = sourceLog.NameWellbore,
                Name = sourceLog.Name
            },
            DecimalMode = job.DecimalMode,
            CustomDecimalPlaces = (job.DecimalMode == DecimalComparisonMode.Custom || job.DecimalMode == DecimalComparisonMode.AppSettings)
                ? job.CustomDecimalPlaces
                : null,
            ReportAllMismatches = reportAllMismatches,
            Mnemonics = specificMnemonics,
            SamplingInterval = samplingInterval,
            StartIndex = startIndex,
            EndIndex = endIndex
        };
        compareLogsDataJobSource.ProgressReporter = new Progress<double>(subProgress =>
        {
            var overallProgress = ((double)currentIndex / (totalObjects > 0 ? totalObjects : 1)) + (subProgress * 0.9 / (totalObjects > 0 ? totalObjects : 1));
            var finalOverallProgress = overallProgress * 0.20 + 0.75;
            job.ProgressUpdateReporter?.Report(new JobProgressUpdate(
                finalOverallProgress,
                null,
                targetLog.Name,
                null,
                null,
                null));
        });
        compareLogsDataJobSource.ProgressUpdateReporter = new Progress<JobProgressUpdate>(update =>
        {
            var overallProgress = ((double)currentIndex / (totalObjects > 0 ? totalObjects : 1)) + (update.Progress * 0.9 / (totalObjects > 0 ? totalObjects : 1));
            var finalOverallProgress = overallProgress * 0.20 + 0.75;
            job.ProgressUpdateReporter?.Report(new JobProgressUpdate(
                finalOverallProgress,
                update.CurrentStage,
                update.ObjectName ?? targetLog.Name,
                update.Mnemonic,
                update.CurrentIndex,
                update.IndexRange));
        });
        (WorkerResult WorkerResult, RefreshAction) resultFromWorker = await _compareLogDataWorker.Execute(compareLogsDataJobSource, cancellationToken);
        if (resultFromWorker.WorkerResult.IsSuccess == false)
        {
            var result = new WellboreSubObjectsComparisonItem()
            {
                ObjectType = "Log",
                LogType = sourceLog.IndexType,
                ObjectUid = sourceLog.Uid,
                ObjectName = sourceLog.Name,
                DifferenceType = "LogDataComparisonFailed",
                ExistsOnSource = "TRUE",
                ExistsOnTarget = "TRUE",
                NumberOfDifferencesInValuesInMnemonics = $"Logs comparison failed. {resultFromWorker.WorkerResult.Message}",
                Description = $"Logs comparison failed: {resultFromWorker.WorkerResult.Message}"
            };
            resultList.Add(result);
            return resultList;
        }
        var issues = compareLogsDataJobSource.JobInfo?.Report?.ReportItems;
        if (issues != null && issues.Any())
        {
            string totalDiffCount = issues.Count().ToString();
            foreach (var rawIssue in issues)
            {
                if (rawIssue is ICompareLogDataItem issue)
                {
                    if (specificMnemonics != null && specificMnemonics.Any())
                    {
                        if (!specificMnemonics.Any(m => string.Equals(m, issue.Mnemonic, StringComparison.OrdinalIgnoreCase)))
                        {
                            continue;
                        }
                    }

                    string mnemonic = issue.Mnemonic;
                    string srcVal = issue.TargetValue != null ? _deepObjectComparer.FormatValueForReport(issue.TargetValue, mnemonic, deepOptions) : null;
                    string tgtVal = issue.SourceValue != null ? _deepObjectComparer.FormatValueForReport(issue.SourceValue, mnemonic, deepOptions) : null;
                    string index = null;
                    if (issue is CompareLogDataItem cldi)
                    {
                        index = cldi.Index;
                    }
                    else if (issue is CompareLogDataUnequalServerDecimalsItem udi)
                    {
                        index = udi.TargetIndex ?? udi.SourceIndex;
                    }
                    else if (issue is CompareLogDataUnequalServerDecimalsIndexDuplicateItem didi)
                    {
                        index = didi.TargetIndex ?? didi.SourceIndex;
                    }
                    if (sourceLog.IndexType == WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME && index != null)
                    {
                        index = _deepObjectComparer.FormatValueForReport(index, "DateTimeIndex", deepOptions);
                    }

                    var result = new WellboreSubObjectsComparisonItem()
                    {
                        ObjectType = "Log",
                        LogType = sourceLog.IndexType,
                        ObjectUid = sourceLog.Uid,
                        ObjectName = sourceLog.Name,
                        DifferenceType = "LogDataValueDifference",
                        PropertyPath = $"LogCurve[{mnemonic}]",
                        IndexOrKey = index,
                        SourceValue = srcVal,
                        TargetValue = tgtVal,
                        Delta = DeepObjectComparer.CalculateDelta(srcVal, tgtVal, mnemonic),
                        Mnemonic = mnemonic,
                        ExistsOnSource = "TRUE",
                        ExistsOnTarget = "TRUE",
                        DataPointsOfMnemonicOnSource = issue.TargetDataPoints,
                        DataPointsOfMnemonicOnTarget = issue.SourceDataPoints,
                        NumberOfDifferencesInValuesInMnemonics = totalDiffCount,
                        Description = $"Value mismatch for mnemonic '{mnemonic}' at index {index}: Source='{srcVal}', Target='{tgtVal}'"
                    };
                    resultList.Add(result);
                }
            }
        }
        return resultList;
    }

    private List<WellboreSubObjectsComparisonItem> FindMissingMnemonics(WitsmlLogs sourceLogs, WitsmlLogs targetLogs, bool isSourceFirst, List<string> specificMnemonics = null)
    {
        var resultList = new List<WellboreSubObjectsComparisonItem>();
        if (sourceLogs?.Logs == null || targetLogs?.Logs == null) return resultList;
        var sameLogs = sourceLogs.Logs.Where(item1 => targetLogs.Logs.Any(item2 => item1.Uid == item2.Uid)).ToList();
        foreach (var witsmlLog in sameLogs)
        {
            var firstLogCurveInfo = sourceLogs.Logs.FirstOrDefault(x => x.Uid == witsmlLog.Uid)!.LogCurveInfo ?? new List<WitsmlLogCurveInfo>();
            var secondLogCurveInfo = targetLogs.Logs.FirstOrDefault(x => x.Uid == witsmlLog.Uid)!.LogCurveInfo ?? new List<WitsmlLogCurveInfo>();
            if (specificMnemonics != null && specificMnemonics.Any())
            {
                firstLogCurveInfo = firstLogCurveInfo.Where(c => specificMnemonics.Any(m => string.Equals(m, c.Mnemonic, StringComparison.OrdinalIgnoreCase))).ToList();
                secondLogCurveInfo = secondLogCurveInfo.Where(c => specificMnemonics.Any(m => string.Equals(m, c.Mnemonic, StringComparison.OrdinalIgnoreCase))).ToList();
            }
            var missingLogCurves =
                firstLogCurveInfo.ExceptBy(
                    secondLogCurveInfo.Select(x => x.Uid), x => x.Uid);
            foreach (var logCurveInfo in missingLogCurves)
            {
                var result = new WellboreSubObjectsComparisonItem()
                {
                    ObjectType = "Log",
                    LogType = witsmlLog.IndexType,
                    ObjectUid = witsmlLog.Uid,
                    ObjectName = witsmlLog.Name,
                    DifferenceType = "MissingMnemonic",
                    Mnemonic = logCurveInfo.Mnemonic,
                    ExistsOnSource = isSourceFirst ? "TRUE" : "FALSE",
                    ExistsOnTarget = isSourceFirst ? "FALSE" : "TRUE",
                    Description = isSourceFirst ? $"Mnemonic '{logCurveInfo.Mnemonic}' exists only on source." : $"Mnemonic '{logCurveInfo.Mnemonic}' exists only on target."
                };
                resultList.Add(result);
            }
        }
        return resultList;
    }

    private List<WellboreSubObjectsComparisonItem> FindMissingObjects(
        Dictionary<(EntityType, string), IWitsmlObjectList> objectsOnFirst,
        Dictionary<(EntityType, string), IWitsmlObjectList> objectsOnSecond,
        bool isSourceFirst,
        bool matchByNameIfUidDiffers = false)
    {
        var resultList = new List<WellboreSubObjectsComparisonItem>();
        foreach (KeyValuePair<(EntityType, string), IWitsmlObjectList> kvp in objectsOnFirst)
        {
            if (!objectsOnSecond.ContainsKey(kvp.Key)) continue;

            var firstObjects = kvp.Value?.Objects?.ToList() ?? new List<WitsmlObjectOnWellbore>();
            var secondObjects = objectsOnSecond[kvp.Key]?.Objects?.ToList() ?? new List<WitsmlObjectOnWellbore>();

            var missingObjects = firstObjects.ExceptBy(secondObjects.Select(x => x.Uid), x => x.Uid).ToList();
            if (matchByNameIfUidDiffers)
            {
                missingObjects = missingObjects.Where(first => !secondObjects.Any(second => string.Equals(first.Name, second.Name, StringComparison.OrdinalIgnoreCase))).ToList();
            }

            foreach (WitsmlObjectOnWellbore witsmlObjectOnWellbore in missingObjects)
            {
                var result = new WellboreSubObjectsComparisonItem()
                {
                    ObjectType = kvp.Key.Item1.ToString(),
                    ObjectUid = witsmlObjectOnWellbore.Uid,
                    ObjectName = witsmlObjectOnWellbore.Name,
                    DifferenceType = isSourceFirst ? "MissingOnTarget" : "MissingOnSource",
                    ExistsOnSource = isSourceFirst ? "TRUE" : "FALSE",
                    ExistsOnTarget = isSourceFirst ? "FALSE" : "TRUE",
                    Description = isSourceFirst ? "Object exists only on source server." : "Object exists only on target server."
                };
                if (kvp.Key.Item1 == EntityType.Log)
                {
                    result.LogType = kvp.Key.Item2;
                }
                resultList.Add(result);
            }
        }

        return resultList;
    }

    private static async Task<Dictionary<(EntityType, string), IWitsmlObjectList>> GetWellboreObjects(
        string wellUid,
        string wellboreUid,
        IWitsmlClient client,
        List<string> supportedObjectTypes,
        bool includeLogs,
        bool compareDepthLogs = true,
        bool compareTimeLogs = true,
        List<string> specificLogUidsOrNames = null)
    {
        var result = new Dictionary<(EntityType, string), IWitsmlObjectList>();
        foreach (EntityType entityType in Enum.GetValues(typeof(EntityType)))
        {
            if (supportedObjectTypes.IndexOf(entityType.ToString().ToLower()) < 0) continue;
            if (entityType is EntityType.Well or EntityType.Wellbore or EntityType.Log) continue;

            result.Add((entityType, null), await GetWellboreObjectsByType(wellUid, wellboreUid, client, entityType));
        }
        if (includeLogs)
        {
            if (compareDepthLogs)
            {
                var depthLogs = await GetWellboreObjectsByType(wellUid, wellboreUid, client, EntityType.Log, WitsmlLog.WITSML_INDEX_TYPE_MD);
                FilterSpecificLogs(depthLogs, specificLogUidsOrNames);
                result.Add((EntityType.Log, WitsmlLog.WITSML_INDEX_TYPE_MD), depthLogs);
            }
            if (compareTimeLogs)
            {
                var timeLogs = await GetWellboreObjectsByType(wellUid, wellboreUid, client, EntityType.Log, WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME);
                FilterSpecificLogs(timeLogs, specificLogUidsOrNames);
                result.Add((EntityType.Log, WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME), timeLogs);
            }
        }
        return result;
    }

    private static void FilterSpecificLogs(IWitsmlObjectList logList, List<string> specificLogUidsOrNames)
    {
        if (logList?.Objects == null || specificLogUidsOrNames == null || !specificLogUidsOrNames.Any()) return;
        logList.Objects = logList.Objects.Where(l =>
            specificLogUidsOrNames.Any(s =>
                string.Equals(s, l.Uid, StringComparison.OrdinalIgnoreCase) ||
                string.Equals(s, l.Name, StringComparison.OrdinalIgnoreCase))).ToList();
    }

    private static void FilterWitsmlLogs(WitsmlLogs logs, bool compareDepthLogs, bool compareTimeLogs, List<string> specificLogUidsOrNames)
    {
        if (logs?.Logs == null) return;
        var list = logs.Logs.ToList();
        if (!compareDepthLogs)
        {
            list.RemoveAll(l => l.IndexType == WitsmlLog.WITSML_INDEX_TYPE_MD);
        }
        if (!compareTimeLogs)
        {
            list.RemoveAll(l => l.IndexType == WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME);
        }
        if (specificLogUidsOrNames != null && specificLogUidsOrNames.Any())
        {
            list.RemoveAll(l => !specificLogUidsOrNames.Any(s =>
                string.Equals(s, l.Uid, StringComparison.OrdinalIgnoreCase) ||
                string.Equals(s, l.Name, StringComparison.OrdinalIgnoreCase)));
        }
        logs.Logs = list;
    }

    private static async Task<WitsmlLogs> GetLogs(string wellUid, string wellboreUid, IWitsmlClient client)
    {
        WitsmlLogs logQuery = LogQueries.GetWitsmlLogsByWellbore(wellUid, wellboreUid);
        WitsmlLogs result = await client.GetFromStoreAsync(logQuery, new OptionsIn(ReturnElements.HeaderOnly));
        return result;
    }

    private static async Task<IWitsmlObjectList> GetWellboreObjectsByType(string wellUid, string wellboreUid, IWitsmlClient client, EntityType entityType, string logIndexType = null)
    {
        IWitsmlObjectList query = ObjectQueries.GetWitsmlObjectById(
            wellUid,
            wellboreUid,
            "",
            entityType
        );

        if (entityType == EntityType.Log)
        {
            ((WitsmlLog)query.Objects.FirstOrDefault()).IndexType = logIndexType;
        }

        IWitsmlObjectList witsmlObjectList = await client.GetFromStoreNullableAsync(
            query,
            new OptionsIn(ReturnElements.IdOnly)
        );

        return witsmlObjectList;
    }

    private static bool AreUnitsDifferent(string unit1, string unit2)
    {
        if (string.IsNullOrWhiteSpace(unit1) && string.IsNullOrWhiteSpace(unit2))
        {
            return false;
        }
        return !string.Equals(unit1?.Trim(), unit2?.Trim(), StringComparison.OrdinalIgnoreCase);
    }

    private static List<(WitsmlLog Source, WitsmlLog Target)> PairLogs(
        WitsmlLogs sourceLogs,
        WitsmlLogs targetLogs,
        WellboreSubObjectsComparisonJob job)
    {
        var pairedLogs = new List<(WitsmlLog Source, WitsmlLog Target)>();
        if (sourceLogs?.Logs == null || targetLogs?.Logs == null) return pairedLogs;

        var unmatchedSource = new List<WitsmlLog>(sourceLogs.Logs);
        var unmatchedTarget = new List<WitsmlLog>(targetLogs.Logs);

        if (job.LogMappings != null && job.LogMappings.Any())
        {
            foreach (var mapping in job.LogMappings)
            {
                var s = unmatchedSource.FirstOrDefault(l =>
                    (!string.IsNullOrEmpty(mapping.SourceLogUid) && string.Equals(l.Uid, mapping.SourceLogUid, StringComparison.OrdinalIgnoreCase)) ||
                    (!string.IsNullOrEmpty(mapping.SourceLogName) && string.Equals(l.Name, mapping.SourceLogName, StringComparison.OrdinalIgnoreCase)));
                var t = unmatchedTarget.FirstOrDefault(l =>
                    (!string.IsNullOrEmpty(mapping.TargetLogUid) && string.Equals(l.Uid, mapping.TargetLogUid, StringComparison.OrdinalIgnoreCase)) ||
                    (!string.IsNullOrEmpty(mapping.TargetLogName) && string.Equals(l.Name, mapping.TargetLogName, StringComparison.OrdinalIgnoreCase)));
                if (s != null && t != null)
                {
                    pairedLogs.Add((s, t));
                    unmatchedSource.Remove(s);
                    unmatchedTarget.Remove(t);
                }
            }
        }

        for (int i = unmatchedSource.Count - 1; i >= 0; i--)
        {
            var s = unmatchedSource[i];
            var t = unmatchedTarget.FirstOrDefault(x => string.Equals(x.Uid, s.Uid, StringComparison.OrdinalIgnoreCase));
            if (t != null)
            {
                pairedLogs.Add((s, t));
                unmatchedSource.RemoveAt(i);
                unmatchedTarget.Remove(t);
            }
        }

        if (job.MatchByNameIfUidDiffers)
        {
            for (int i = unmatchedSource.Count - 1; i >= 0; i--)
            {
                var s = unmatchedSource[i];
                if (!string.IsNullOrEmpty(s.Name))
                {
                    var t = unmatchedTarget.FirstOrDefault(x => string.Equals(x.Name, s.Name, StringComparison.OrdinalIgnoreCase));
                    if (t != null)
                    {
                        pairedLogs.Add((s, t));
                        unmatchedSource.RemoveAt(i);
                        unmatchedTarget.Remove(t);
                    }
                }
            }
        }

        return pairedLogs;
    }

    private List<WellboreSubObjectsComparisonItem> FindLogUnitDifferences(
        WitsmlLogs sourceLogs,
        WitsmlLogs targetLogs,
        WellboreSubObjectsComparisonJob job)
    {
        var resultList = new List<WellboreSubObjectsComparisonItem>();
        if (sourceLogs?.Logs == null || targetLogs?.Logs == null) return resultList;

        var pairedLogs = PairLogs(sourceLogs, targetLogs, job);
        foreach (var (sLog, tLog) in pairedLogs)
        {
            if (AreUnitsDifferent(sLog.StartIndex?.Uom, tLog.StartIndex?.Uom))
            {
                resultList.Add(new WellboreSubObjectsComparisonItem
                {
                    ObjectType = "Log",
                    LogType = sLog.IndexType,
                    ObjectUid = sLog.Uid,
                    ObjectName = sLog.Name,
                    DifferenceType = "UnitMismatch",
                    PropertyPath = "StartIndex.Uom",
                    IndexOrKey = sLog.Uid,
                    SourceValue = sLog.StartIndex?.Uom,
                    TargetValue = tLog.StartIndex?.Uom,
                    ExistsOnSource = "TRUE",
                    ExistsOnTarget = "TRUE",
                    Description = $"StartIndex unit mismatch for log '{sLog.Name ?? sLog.Uid}': Source='{sLog.StartIndex?.Uom ?? "<null>"}', Target='{tLog.StartIndex?.Uom ?? "<null>"}'"
                });
            }

            if (AreUnitsDifferent(sLog.EndIndex?.Uom, tLog.EndIndex?.Uom))
            {
                resultList.Add(new WellboreSubObjectsComparisonItem
                {
                    ObjectType = "Log",
                    LogType = sLog.IndexType,
                    ObjectUid = sLog.Uid,
                    ObjectName = sLog.Name,
                    DifferenceType = "UnitMismatch",
                    PropertyPath = "EndIndex.Uom",
                    IndexOrKey = sLog.Uid,
                    SourceValue = sLog.EndIndex?.Uom,
                    TargetValue = tLog.EndIndex?.Uom,
                    ExistsOnSource = "TRUE",
                    ExistsOnTarget = "TRUE",
                    Description = $"EndIndex unit mismatch for log '{sLog.Name ?? sLog.Uid}': Source='{sLog.EndIndex?.Uom ?? "<null>"}', Target='{tLog.EndIndex?.Uom ?? "<null>"}'"
                });
            }

            var firstCurves = sLog.LogCurveInfo ?? new List<WitsmlLogCurveInfo>();
            var secondCurves = tLog.LogCurveInfo ?? new List<WitsmlLogCurveInfo>();
            var sameCurves = firstCurves.Where(c1 => secondCurves.Any(c2 => c1.Mnemonic == c2.Mnemonic)).ToList();
            if (job.SpecificMnemonics != null && job.SpecificMnemonics.Any())
            {
                sameCurves = sameCurves.Where(c => job.SpecificMnemonics.Any(m => string.Equals(m, c.Mnemonic, StringComparison.OrdinalIgnoreCase))).ToList();
            }

            foreach (var curve in sameCurves)
            {
                var targetCurve = secondCurves.FirstOrDefault(c => c.Mnemonic == curve.Mnemonic);
                if (targetCurve == null) continue;

                if (AreUnitsDifferent(curve.Unit, targetCurve.Unit))
                {
                    resultList.Add(new WellboreSubObjectsComparisonItem
                    {
                        ObjectType = "Log",
                        LogType = sLog.IndexType,
                        ObjectUid = sLog.Uid,
                        ObjectName = sLog.Name,
                        DifferenceType = "UnitMismatch",
                        PropertyPath = $"LogCurve[{curve.Mnemonic}].Unit",
                        IndexOrKey = curve.Mnemonic,
                        SourceValue = curve.Unit,
                        TargetValue = targetCurve.Unit,
                        Mnemonic = curve.Mnemonic,
                        ExistsOnSource = "TRUE",
                        ExistsOnTarget = "TRUE",
                        Description = $"Unit mismatch for log curve '{curve.Mnemonic}': Source='{curve.Unit ?? "<null>"}', Target='{targetCurve.Unit ?? "<null>"}'"
                    });
                }

                if (AreUnitsDifferent(curve.MinIndex?.Uom, targetCurve.MinIndex?.Uom))
                {
                    resultList.Add(new WellboreSubObjectsComparisonItem
                    {
                        ObjectType = "Log",
                        LogType = sLog.IndexType,
                        ObjectUid = sLog.Uid,
                        ObjectName = sLog.Name,
                        DifferenceType = "UnitMismatch",
                        PropertyPath = $"LogCurve[{curve.Mnemonic}].MinIndex.Uom",
                        IndexOrKey = curve.Mnemonic,
                        SourceValue = curve.MinIndex?.Uom,
                        TargetValue = targetCurve.MinIndex?.Uom,
                        Mnemonic = curve.Mnemonic,
                        ExistsOnSource = "TRUE",
                        ExistsOnTarget = "TRUE",
                        Description = $"MinIndex unit mismatch for log curve '{curve.Mnemonic}': Source='{curve.MinIndex?.Uom ?? "<null>"}', Target='{targetCurve.MinIndex?.Uom ?? "<null>"}'"
                    });
                }

                if (AreUnitsDifferent(curve.MaxIndex?.Uom, targetCurve.MaxIndex?.Uom))
                {
                    resultList.Add(new WellboreSubObjectsComparisonItem
                    {
                        ObjectType = "Log",
                        LogType = sLog.IndexType,
                        ObjectUid = sLog.Uid,
                        ObjectName = sLog.Name,
                        DifferenceType = "UnitMismatch",
                        PropertyPath = $"LogCurve[{curve.Mnemonic}].MaxIndex.Uom",
                        IndexOrKey = curve.Mnemonic,
                        SourceValue = curve.MaxIndex?.Uom,
                        TargetValue = targetCurve.MaxIndex?.Uom,
                        Mnemonic = curve.Mnemonic,
                        ExistsOnSource = "TRUE",
                        ExistsOnTarget = "TRUE",
                        Description = $"MaxIndex unit mismatch for log curve '{curve.Mnemonic}': Source='{curve.MaxIndex?.Uom ?? "<null>"}', Target='{targetCurve.MaxIndex?.Uom ?? "<null>"}'"
                    });
                }
            }
        }

        return resultList;
    }

    private List<WellboreSubObjectsComparisonItem> DeepCompareLogCurves(
        WitsmlLogs sourceLogs,
        WitsmlLogs targetLogs,
        WellboreSubObjectsComparisonJob job,
        DeepComparisonOptions deepOptions)
    {
        var resultList = new List<WellboreSubObjectsComparisonItem>();
        if (sourceLogs?.Logs == null || targetLogs?.Logs == null) return resultList;

        var pairedLogs = PairLogs(sourceLogs, targetLogs, job);
        foreach (var (sLog, tLog) in pairedLogs)
        {
            if (job.SpecificMnemonics == null || !job.SpecificMnemonics.Any())
            {
                resultList.AddRange(_deepObjectComparer.CompareLogHeader(sLog, tLog, deepOptions));
            }

            var firstCurves = sLog.LogCurveInfo ?? new List<WitsmlLogCurveInfo>();
            var secondCurves = tLog.LogCurveInfo ?? new List<WitsmlLogCurveInfo>();
            var sameCurves = firstCurves.Where(c1 => secondCurves.Any(c2 => c1.Mnemonic == c2.Mnemonic)).ToList();
            if (job.SpecificMnemonics != null && job.SpecificMnemonics.Any())
            {
                sameCurves = sameCurves.Where(c => job.SpecificMnemonics.Any(m => string.Equals(m, c.Mnemonic, StringComparison.OrdinalIgnoreCase))).ToList();
            }

            foreach (var curve in sameCurves)
            {
                var targetCurve = secondCurves.FirstOrDefault(c => c.Mnemonic == curve.Mnemonic);
                if (targetCurve == null) continue;

                var diffs = _deepObjectComparer.CompareLogCurveInfo(sLog.IndexType, sLog.Uid, sLog.Name, curve, targetCurve, deepOptions);
                resultList.AddRange(diffs);
            }
        }

        return resultList;
    }
}
