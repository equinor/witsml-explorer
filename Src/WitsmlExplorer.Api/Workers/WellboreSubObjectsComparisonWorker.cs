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

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Models.Reports;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Repositories;
using WitsmlExplorer.Api.Services;

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
    public JobType JobType => JobType.WellboreSubObjectsComparison;

    public WellboreSubObjectsComparisonWorker(
        ILogger<WellboreSubObjectsComparisonJob> logger,
        IWitsmlClientProvider witsmlClientProvider,
        ICountLogDataRowWorker countLogDataRowWorker,
        ICompareLogDataWorker compareLogDataWorker,
        IDocumentRepository<Server, Guid> witsmlServerRepository = null) : base(
        witsmlClientProvider, logger)
    {
        _countLogDataRowWorker = countLogDataRowWorker;
        _compareLogDataWorker = compareLogDataWorker;
        _witsmlServerRepository = witsmlServerRepository;
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

        IWitsmlClient sourceClient = GetSourceWitsmlClientOrThrow();
        IWitsmlClient targetClient = GetTargetWitsmlClientOrThrow();

        WitsmlWellbore existingTargetWellbore = await WorkerTools.GetWellbore(targetClient, job.TargetWellbore, ReturnElements.IdOnly);
        WitsmlWellbore existingSourceWellbore = await WorkerTools.GetWellbore(sourceClient, job.SourceWellbore, ReturnElements.IdOnly);

        IEnumerable<Server> servers = _witsmlServerRepository == null ? new List<Server>() : await _witsmlServerRepository.GetDocumentsAsync();
        var sourceServerName = servers.FirstOrDefault((server) => server.Url.EqualsIgnoreCase(sourceClient.GetServerHostname()))?.Name;
        var targetServerName = servers.FirstOrDefault((server) => server.Url.EqualsIgnoreCase(targetClient.GetServerHostname()))?.Name;

        if (sourceServerName == targetServerName && existingSourceWellbore.Uid == existingTargetWellbore.Uid && existingSourceWellbore.UidWell == existingTargetWellbore.UidWell)
        {
            string errorMessageSameWellbore = "Failed to compare 2 wellbores with objects - tried to compare the same wellbore under the same well on the same server.";
            Logger.LogError("{ErrorMessage} {Reason} - {JobDescription}", errorMessageSameWellbore, errorMessageSameWellbore, job.Description());
            return (new WorkerResult(targetClient.GetServerHostname(), false, errorMessageSameWellbore, errorMessageSameWellbore, sourceServerUrl: sourceClient.GetServerHostname()), null);
        }
        var reportItems = new List<WellboreSubObjectsComparisonItem>();
        var supportedObjectTypes = await
            GetSupportedObjectTypes(sourceClient, targetClient);

        ReportProgress(job, 0.025);
        var objectsOnTargetWellbore = await GetWellboreObjects(job.TargetWellbore.WellUid, job.TargetWellbore.WellboreUid, targetClient, supportedObjectTypes);
        ReportProgress(job, 0.05);
        var objectsOnSourceWellbore = await GetWellboreObjects(job.SourceWellbore.WellUid, job.SourceWellbore.WellboreUid, sourceClient, supportedObjectTypes);
        ReportProgress(job, 0.075);

        var targetLogs = await GetLogs(job.TargetWellbore.WellUid, job.TargetWellbore.WellboreUid, targetClient);
        var sourceLogs = await GetLogs(job.SourceWellbore.WellUid, job.SourceWellbore.WellboreUid, sourceClient);
        ReportProgress(job, 0.1);

        cancellationToken?.ThrowIfCancellationRequested();

        reportItems.AddRange(FindMissingObjects(objectsOnSourceWellbore,
            objectsOnTargetWellbore, true));
        reportItems.AddRange(FindMissingObjects(objectsOnTargetWellbore,
            objectsOnSourceWellbore, false));

        reportItems.AddRange(FindMissingMnemonics(sourceLogs, targetLogs, true));
        reportItems.AddRange(FindMissingMnemonics(targetLogs, sourceLogs, false));


        IProgress<double> subTaskProgressReporter = new Progress<double>(subTaskProgress =>
        {
            var progress = subTaskProgress * 0.9 + 0.1; // Scale to final 90% of total progress
            ReportProgress(job, progress);
        });
        reportItems.AddRange(await FindMnemonicIndexRangeDifferences(sourceLogs, targetLogs, job, subTaskProgressReporter, cancellationToken));
        WorkerResult workerResult = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, $"Comparison of 2 wellbores is done.", jobId: job.JobInfo.Id);
        var report = GenerateReport(reportItems, sourceServerName,
            targetServerName, existingSourceWellbore.Name,
            existingTargetWellbore.Name);
        job.JobInfo.Report = report;
        Logger.LogInformation("Comparing of 2 wellbores sub objects is done. {jobDescription}", job.Description());
        return (workerResult, null);
    }

    private void ReportProgress(WellboreSubObjectsComparisonJob job, double progress)
    {
        if (job.JobInfo != null) job.JobInfo.Progress = progress;
        job.ProgressReporter?.Report(progress);
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
        var supportedObjectTypesOnSource = serverCapabilitiesOnSource.SelectMany(s => s.Select(ss => ss.Name.ToLower()));
        var supportedObjectTypesOnTarget = serverCapabilitiesOnTarget.SelectMany(s => s.Select(ss => ss.Name.ToLower()));
        var result =
            supportedObjectTypesOnSource.Intersect(
                supportedObjectTypesOnTarget);
        return result.ToList();
    }

    private BaseReport GenerateReport(List<WellboreSubObjectsComparisonItem> reportItems, string sourceServerName, string targetServerName, string sourceWellbore, string targetWellbore)
    {

        return new BaseReport
        {
            Title = $"Wellbore sub objects comparison",
            ReportItems = reportItems,
            Summary = reportItems.Count > 0
                ? $"Found {reportItems.Count:n0} mismatches between the objects in the wellbores '{sourceWellbore}' and '{targetWellbore}'."
                : $"No mismatches were found between the objects in the wellbores '{sourceWellbore}' and '{targetWellbore}'.",
            JobDetails = $"SourceServer::{sourceServerName}|TargetServer::{targetServerName}|SourceWellbore::{sourceWellbore}|TargetWellbore::{targetWellbore}"
        };
    }

    private async Task<List<WellboreSubObjectsComparisonItem>> FindMnemonicIndexRangeDifferences(
        WitsmlLogs sourceLogs, WitsmlLogs targetLogs, WellboreSubObjectsComparisonJob job, IProgress<double> progressReporter, CancellationToken? cancellationToken)
    {
        var resultList = new List<WellboreSubObjectsComparisonItem>();
        var sameLogs = sourceLogs.Logs.Where(item1 =>
            targetLogs.Logs.Any(item2 => item1.Uid == item2.Uid)).ToList();

        var totalObjects = sameLogs.Count;
        var currentIndex = 0;
        foreach (var witsmlLog in sameLogs)
        {
            var firstLogCurveInfo = witsmlLog.LogCurveInfo!;
            var secondLogCurveInfo = targetLogs.Logs.FirstOrDefault(x => x.Uid == witsmlLog.Uid)!.LogCurveInfo!;

            var sameLogCurves = firstLogCurveInfo.Where(item1 =>
                    secondLogCurveInfo.Any(item2 => item1.Mnemonic == item2.Mnemonic))
                .ToList();
            var targetLog = targetLogs.Logs
                .FirstOrDefault(x => x.Uid == witsmlLog.Uid);
            if (job.CountLogsData)
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
                            var progress = ((double)currentIndex / totalObjects) + ((double)subJobProgress * 0.9 / totalObjects); // Scale to 90% of total progress for this log
                            progressReporter.Report(progress);
                        });

                        var countLogsData = await CountLogsData(witsmlLog,
                            targetLog, subJobProgressReporter, cancellationToken);
                        resultList.AddRange(countLogsData);
                    }
                }
            }

            if (job.CheckLogsData)
            {
                if (job.CheckTimeBasedLogsData && witsmlLog.IndexType == WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME || job.CheckDepthBasedLogsData && witsmlLog.IndexType == WitsmlLog.WITSML_INDEX_TYPE_MD)
                {
                    IProgress<double> subJobProgressReporter = new Progress<double>(subJobProgress =>
                    {
                        var progress = ((double)currentIndex / totalObjects) + ((double)subJobProgress * 0.9 / totalObjects); // Scale to 90% of total progress for this log
                        progressReporter.Report(progress);
                    });
                    var checkLogsData = await ChecksLogsData(witsmlLog, targetLog, subJobProgressReporter, cancellationToken);
                    resultList.AddRange(checkLogsData);
                }
            }

            var currentLogCurveInfoIndex = 0;
            var totalLogCurveInfoElements = sameLogCurves.Count;
            foreach (var logCurveInfo in sameLogCurves)
            {
                var secondMnemonic =
                    secondLogCurveInfo
                        .FirstOrDefault(x => x.Mnemonic == logCurveInfo.Mnemonic)!;

                if (witsmlLog.IndexType ==
                    WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME &&
                    (logCurveInfo.MaxDateTimeIndex !=
                     secondMnemonic.MaxDateTimeIndex ||
                     logCurveInfo.MinDateTimeIndex !=
                     secondMnemonic.MinDateTimeIndex))
                {
                    var result = new WellboreSubObjectsComparisonItem()
                    {
                        ObjectType = "Log",
                        LogType = witsmlLog.IndexType,
                        ObjectUid = witsmlLog.Uid,
                        ObjectName = witsmlLog.Name,
                        Mnemonic = logCurveInfo.Mnemonic,
                        ExistsOnSource = "TRUE",
                        ExistsOnTarget = "TRUE",
                        SourceStart =
                            logCurveInfo.MinDateTimeIndex,
                        SourceEnd = logCurveInfo.MaxDateTimeIndex,
                        TargetStart =
                            secondMnemonic.MinDateTimeIndex,
                        TargetEnd = secondMnemonic.MaxDateTimeIndex
                    };
                    resultList.Add(result);
                }
                if (witsmlLog.IndexType ==
                    WitsmlLog.WITSML_INDEX_TYPE_MD &&
                    (logCurveInfo.MaxIndex?.Value !=
                     secondMnemonic.MaxIndex?.Value ||
                     logCurveInfo.MinIndex?.Value !=
                     secondMnemonic.MinIndex?.Value))
                {
                    var result = new WellboreSubObjectsComparisonItem()
                    {
                        ObjectType = "Log",
                        LogType = witsmlLog.IndexType,
                        ObjectUid = witsmlLog.Uid,
                        ObjectName = witsmlLog.Name,
                        Mnemonic = logCurveInfo.Mnemonic,
                        ExistsOnSource = "TRUE",
                        ExistsOnTarget = "TRUE",
                        SourceStart =
                            logCurveInfo.MinIndex?.Value,
                        SourceEnd = logCurveInfo.MaxIndex?.Value,
                        TargetStart =
                            secondMnemonic.MinIndex?.Value,
                        TargetEnd = secondMnemonic.MaxIndex?.Value
                    };
                    resultList.Add(result);
                }
                var subProgress = (double)currentLogCurveInfoIndex / totalLogCurveInfoElements * 0.1 + 0.9; // Scale to last 10% of total progress for this log
                var progress = ((double)currentIndex / totalObjects) + ((double)subProgress / totalObjects);
                progressReporter.Report(progress);
                currentLogCurveInfoIndex++;
            }
            currentIndex++;
        }
        return resultList;
    }

    private async Task<List<WellboreSubObjectsComparisonItem>> CountLogsData(WitsmlLog sourceLog, WitsmlLog targetLog, IProgress<double> progressReporter, CancellationToken? cancellationToken)
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
                var progress = subJobProgress / 2; // First half of the progress (0 to 0.5)
                progressReporter.Report(progress);
            })
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
                ExistsOnSource = "TRUE",
                ExistsOnTarget = "TRUE",
                DataPointsOfMnemonicOnTarget = "Checking number of mnemonics failed.",
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
                var progress = subJobProgress / 2 + 0.5; // Second half of the progress (0.5 to 1)
                progressReporter.Report(progress);
            }),
            UseTargetClient = false
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
                ExistsOnSource = "TRUE",
                ExistsOnTarget = "TRUE",
                DataPointsOfMnemonicOnSource = "Checking number of mnemonics failed.",
            };
            resultList.Add(result);
            return resultList;
        }
        if (countLogsDataJobSource.JobInfo.Report.ReportItems is List<CountLogDataReportItem> mnemonicsOnSource && countLogsDataJobTarget.JobInfo.Report.ReportItems is List<CountLogDataReportItem> mnemonicsOnTarget)
        {
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
                        Mnemonic = difference.Mnemonic,
                        ExistsOnSource = "TRUE",
                        ExistsOnTarget = "TRUE",
                        DataPointsOfMnemonicOnSource = difference.LogDataCount.ToString(),
                        DataPointsOfMnemonicOnTarget = mnemonicOnTarget.LogDataCount.ToString()
                    };
                    resultList.Add(result);
                }
            }
        }
        return resultList;
    }

    private async Task<List<WellboreSubObjectsComparisonItem>> ChecksLogsData(WitsmlLog sourceLog, WitsmlLog targetLog, IProgress<double> progressReporter, CancellationToken? cancellationToken)
    {
        var resultList = new List<WellboreSubObjectsComparisonItem>();
        var compareLogsDataJobSource = new CompareLogDataJob
        {
            SourceLog = new ObjectReference
            {
                Uid = sourceLog.Uid,
                WellUid = sourceLog.UidWell,
                WellboreUid = sourceLog.UidWellbore,
                WellName = sourceLog.NameWell,
                WellboreName = sourceLog.NameWellbore,
                Name = sourceLog.Name
            },
            TargetLog = new ObjectReference
            {
                Uid = targetLog.Uid,
                WellUid = targetLog.UidWell,
                WellboreUid = targetLog.UidWellbore,
                WellName = targetLog.NameWell,
                WellboreName = targetLog.NameWellbore,
                Name = targetLog.Name
            },
            ProgressReporter = progressReporter,
        };
        (WorkerResult WorkerResult, RefreshAction) resultFromWorker = await _compareLogDataWorker.Execute(compareLogsDataJobSource, cancellationToken);
        if (resultFromWorker.WorkerResult.IsSuccess == false)
        {
            var result = new WellboreSubObjectsComparisonItem()
            {
                ObjectType = "Log",
                LogType = sourceLog.IndexType,
                ObjectUid = sourceLog.Uid,
                ObjectName = sourceLog.Name,
                ExistsOnSource = "TRUE",
                ExistsOnTarget = "TRUE",
                NumberOfDifferencesInValuesInMnemonics = $"Logs comparison failed. {resultFromWorker.WorkerResult.Message}"
            };
            resultList.Add(result);
            return resultList;
        }
        var issues = compareLogsDataJobSource.JobInfo.Report.ReportItems;
        if (issues.Any())
        {
            var result = new WellboreSubObjectsComparisonItem()
            {
                ObjectType = "Log",
                LogType = sourceLog.IndexType,
                ObjectUid = sourceLog.Uid,
                ObjectName = sourceLog.Name,
                ExistsOnSource = "TRUE",
                ExistsOnTarget = "TRUE",
                NumberOfDifferencesInValuesInMnemonics = issues.Count().ToString()
            };
            resultList.Add(result);
        }
        return resultList;
    }


    private List<WellboreSubObjectsComparisonItem> FindMissingMnemonics(WitsmlLogs sourceLogs, WitsmlLogs targetLogs, bool isSourceFirst)
    {
        var resultList = new List<WellboreSubObjectsComparisonItem>();
        var sameLogs = sourceLogs.Logs.Where(item1 => targetLogs.Logs.Any(item2 => item1.Uid == item2.Uid)).ToList();
        foreach (var witsmlLog in sameLogs)
        {
            var firstLogCurveInfo = sourceLogs.Logs.FirstOrDefault(x => x.Uid == witsmlLog.Uid)!.LogCurveInfo!;
            var secondLogCurveInfo = targetLogs.Logs.FirstOrDefault(x => x.Uid == witsmlLog.Uid)!.LogCurveInfo!;
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
                    Mnemonic = logCurveInfo.Mnemonic,
                    ExistsOnSource = isSourceFirst ? "TRUE" : "FALSE",
                    ExistsOnTarget = isSourceFirst ? "FALSE" : "TRUE"
                };
                resultList.Add(result);
            }
        }
        return resultList;
    }


    private List<WellboreSubObjectsComparisonItem> FindMissingObjects(Dictionary<(EntityType, string), IWitsmlObjectList> objectsOnFirst, Dictionary<(EntityType, string), IWitsmlObjectList> objectsOnSecond, bool isSourceFirst)
    {
        var resultList = new List<WellboreSubObjectsComparisonItem>();
        foreach (KeyValuePair<(EntityType, string), IWitsmlObjectList> kvp in objectsOnFirst)
        {
            var missingObjects =
                objectsOnSecond[kvp.Key].Objects.ExceptBy(kvp.Value.Objects.Select(x => x.Uid), x => x.Uid);
            foreach (WitsmlObjectOnWellbore witsmlObjectOnWellbore in missingObjects)
            {
                var result = new WellboreSubObjectsComparisonItem()
                {
                    ObjectType = kvp.Key.Item1.ToString(),
                    ObjectUid = witsmlObjectOnWellbore.Uid,
                    ObjectName = witsmlObjectOnWellbore.Name,
                    ExistsOnSource = isSourceFirst ? "TRUE" : "FALSE",
                    ExistsOnTarget = isSourceFirst ? "FALSE" : "TRUE"
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

    private static async Task<Dictionary<(EntityType, string), IWitsmlObjectList>> GetWellboreObjects(string wellUid, string wellboreUid, IWitsmlClient client, List<string> supportedObjectTypes)
    {
        var result = new Dictionary<(EntityType, string), IWitsmlObjectList>();
        foreach (EntityType entityType in Enum.GetValues(typeof(EntityType)))
        {
            if (supportedObjectTypes.IndexOf(entityType.ToString().ToLower()) < 0) continue;
            if (entityType is EntityType.Well or EntityType.Wellbore or EntityType.Log) continue;

            result.Add((entityType, null), await GetWellboreObjectsByType(wellUid, wellboreUid, client, entityType));
        }
        result.Add((EntityType.Log, WitsmlLog.WITSML_INDEX_TYPE_MD), await GetWellboreObjectsByType(wellUid, wellboreUid, client, EntityType.Log, WitsmlLog.WITSML_INDEX_TYPE_MD));
        result.Add((EntityType.Log, WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME), await GetWellboreObjectsByType(wellUid, wellboreUid, client, EntityType.Log, WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME));
        return result;
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
}
