using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using MongoDB.Driver.Linq;

using Witsml;
using Witsml.Data;
using Witsml.Extensions;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Models.Reports;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Repositories;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers;

/// <summary>
/// Worker for counting how many values are in each curve.
/// </summary>
public class WellboreSubObjectsComparisonWorker : BaseWorker<WellboreSubObjectsComparisonJob>, IWorker
{
    private readonly IDocumentRepository<Server, Guid> _witsmlServerRepository;
    public JobType JobType => JobType.WellboreSubObjectsComparison;

    public WellboreSubObjectsComparisonWorker(
        ILogger<WellboreSubObjectsComparisonJob> logger,
        IWitsmlClientProvider witsmlClientProvider,
        IDocumentRepository<Server, Guid> witsmlServerRepository = null) : base(
        witsmlClientProvider, logger)
    {
        _witsmlServerRepository = witsmlServerRepository;
    }

    /// <summary>
    /// Compares objects, mnemonics and ranges of 2 wellbores.
    /// </summary>
    /// <param name="job">The job model contains job-specific parameters.</param>
    /// <returns>Task of the workerResult in a report with a diffences.</returns>
    public override async Task<(WorkerResult, RefreshAction)> Execute(WellboreSubObjectsComparisonJob job, CancellationToken? cancellationToken = null)
    {
        Logger.LogInformation("Comparing of 2 wellbores sub objects started. {jobDescription}", job.Description());

        IWitsmlClient sourceClient = GetSourceWitsmlClientOrThrow();
        IWitsmlClient targetClient = GetTargetWitsmlClientOrThrow();

        WitsmlWellbore existingTargetWellbore = await WorkerTools.GetWellbore(targetClient, job.TargetWellbore, ReturnElements.All);
        WitsmlWellbore existingSourceWellbore = await WorkerTools.GetWellbore(sourceClient, job.SourceWellbore, ReturnElements.All);

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
        var objectsOnTargetWellbore = await GetWellboreObjects(job.TargetWellbore.WellUid, job.TargetWellbore.WellboreUid, targetClient);
        var objectsOnSourceWellbore = await GetWellboreObjects(job.SourceWellbore.WellUid, job.SourceWellbore.WellboreUid, sourceClient);
        var targetLogs = await GetLogs(job.TargetWellbore.WellUid, job.TargetWellbore.WellboreUid, targetClient);
        var sourceLogs = await GetLogs(job.SourceWellbore.WellUid, job.SourceWellbore.WellboreUid, sourceClient);

        reportItems.AddRange(FindMissingObjects(objectsOnSourceWellbore,
            objectsOnTargetWellbore, true));
        reportItems.AddRange(FindMissingObjects(objectsOnTargetWellbore,
            objectsOnSourceWellbore, true));

        reportItems.AddRange(ReportMissingMnemonics(sourceLogs, targetLogs, true));
        reportItems.AddRange(ReportMissingMnemonics(targetLogs, sourceLogs, false));

        reportItems.AddRange(ReportDifferentMnemonics(sourceLogs, targetLogs));
        WorkerResult workerResult = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, $"Comparison of 2 wellbores: ", jobId: job.JobInfo.Id);
        var report = GenerateReport(reportItems, sourceServerName,
            targetServerName, existingSourceWellbore.Name,
            existingTargetWellbore.Name);
        job.JobInfo.Report = report;
        Logger.LogInformation("Comparing of 2 wellbores sub objects is done. {jobDescription}", job.Description());
        return (workerResult, null);
    }

    private BaseReport GenerateReport(List<WellboreSubObjectsComparisonItem> reportItems, string sourceServerName, string targetServerName, string sourceWellbore, string targetWellbore)
    {

        return new BaseReport
        {
            Title = $"Wellbore sub objects comparison",
            ReportItems = reportItems,
            JobDetails = $"SourceServer::{sourceServerName}|TargetServer::{targetServerName}|SourceWellbore::{sourceWellbore}|TargetWellbore::{targetWellbore}"
        };
    }

    private List<WellboreSubObjectsComparisonItem> ReportDifferentMnemonics(
        WitsmlLogs firstLogs, WitsmlLogs secondLogs)
    {
        var resultList = new List<WellboreSubObjectsComparisonItem>();
        var sameLogs = firstLogs.Logs.Where(item1 =>
            secondLogs.Logs.Any(item2 => item1.Uid == item2.Uid)).ToList();
        foreach (var witsmlLog in sameLogs)
        {
            var firstLogCurveInfo =
                firstLogs.Logs.Where(x => x.Uid == witsmlLog.Uid)
                    .Select(x => x.LogCurveInfo).FirstOrDefault();
            var secondLogCurveInfo =
                secondLogs.Logs.Where(x => x.Uid == witsmlLog.Uid)
                    .Select(x => x.LogCurveInfo).FirstOrDefault();

            if (firstLogCurveInfo != null && secondLogCurveInfo != null)
            {
                var sameLogCurves = firstLogCurveInfo.Where(item1 =>
                        secondLogCurveInfo.Any(item2 => item1.Uid == item2.Uid))
                    .ToList();

                foreach (var logCurveInfo in sameLogCurves)
                {
                    var firstMnemonic =
                        firstLogCurveInfo
                            .FirstOrDefault(x => x.Mnemonic == logCurveInfo.Mnemonic);
                    var secondMnemonic =
                        secondLogCurveInfo
                            .FirstOrDefault(x => x.Mnemonic == logCurveInfo.Mnemonic);

                    if (firstMnemonic != null && secondMnemonic != null)
                    {
                        if (witsmlLog.IndexType ==
                            WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME &&
                            (firstMnemonic.MaxDateTimeIndex !=
                             secondMnemonic.MaxDateTimeIndex ||
                             firstMnemonic.MinDateTimeIndex !=
                             secondMnemonic.MinDateTimeIndex))
                        {
                            var result = new WellboreSubObjectsComparisonItem()
                            {
                                ObjectType = "Log",
                                ObjectUid = witsmlLog.Uid,
                                ObjectName = witsmlLog.Name,
                                Mnemonic = logCurveInfo.Mnemonic,
                                ExistsOnSource = "TRUE",
                                ExistsOnTarget = "TRUE",
                                SourceStart =
                                    firstMnemonic.MinDateTimeIndex,
                                SourceEnd = firstMnemonic.MaxDateTimeIndex,
                                TargetStart =
                                    secondMnemonic.MinDateTimeIndex,
                                TargetEnd = secondMnemonic.MaxDateTimeIndex
                            };
                            resultList.Add(result);
                        }
                        if (witsmlLog.IndexType ==
                            WitsmlLog.WITSML_INDEX_TYPE_MD &&
                            (firstMnemonic.MaxIndex !=
                             secondMnemonic.MaxIndex ||
                             firstMnemonic.MinIndex !=
                             secondMnemonic.MinIndex))
                        {
                            var result = new WellboreSubObjectsComparisonItem()
                            {
                                ObjectType = "Log",
                                ObjectUid = witsmlLog.Uid,
                                ObjectName = witsmlLog.Name,
                                Mnemonic = logCurveInfo.Mnemonic,
                                ExistsOnSource = "TRUE",
                                ExistsOnTarget = "TRUE",
                                SourceStart =
                                    firstMnemonic.MinIndex?.Value,
                                SourceEnd = firstMnemonic.MaxIndex?.Value,
                                TargetStart =
                                    secondMnemonic.MinIndex?.Value,
                                TargetEnd = secondMnemonic.MaxIndex.Value
                            };
                            resultList.Add(result);
                        }
                    }
                }
            }
        }
        return resultList;
    }

    private List<WellboreSubObjectsComparisonItem> ReportMissingMnemonics(WitsmlLogs firstLogs, WitsmlLogs secondLogs, bool missingSecond)
    {
        var resultList = new List<WellboreSubObjectsComparisonItem>();
        var sameLogs = firstLogs.Logs.Where(item1 => secondLogs.Logs.Any(item2 => item1.Uid == item2.Uid)).ToList();
        foreach (var witsmlLog in sameLogs)
        {
            var firstLogCurveInfo =
                 firstLogs.Logs.Where(x => x.Uid == witsmlLog.Uid).Select(x => x.LogCurveInfo).FirstOrDefault();
            var secondLogCurveInfo =
                secondLogs.Logs.Where(x => x.Uid == witsmlLog.Uid).Select(x => x.LogCurveInfo).FirstOrDefault();

            if (firstLogCurveInfo != null && secondLogCurveInfo != null)
            {
                var missingLogCurves =
                    firstLogCurveInfo.ExceptBy(
                        secondLogCurveInfo.Select(x => x.Uid), x => x.Uid);
                foreach (var logCurveInfo in missingLogCurves)
                {
                    var result = new WellboreSubObjectsComparisonItem()
                    {
                        ObjectType = "Log",
                        ObjectUid = witsmlLog.Uid,
                        ObjectName = witsmlLog.Name,
                        Mnemonic = logCurveInfo.Mnemonic,
                        ExistsOnSource = missingSecond ? "TRUE" : "FALSE",
                        ExistsOnTarget = missingSecond ? "FALSE" : "TRUE"
                    };
                    resultList.Add(result);
                }
            }
        }

        return resultList;
    }


    private List<WellboreSubObjectsComparisonItem> FindMissingObjects(Dictionary<(EntityType, string), IWitsmlObjectList> objectsOnFirst, Dictionary<(EntityType, string), IWitsmlObjectList> objectsOnSecond, bool missingSecond)
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
                    ExistsOnSource = missingSecond ? "TRUE" : "FALSE",
                    ExistsOnTarget = missingSecond ? "FALSE" : "TRUE"
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

    private static async Task<Dictionary<(EntityType, string), IWitsmlObjectList>> GetWellboreObjects(string wellUid, string wellboreUid, IWitsmlClient client)
    {
        var result = new Dictionary<(EntityType, string), IWitsmlObjectList>();
        foreach (EntityType entityType in Enum.GetValues(typeof(EntityType)))
        {
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
