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
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Models.Reports;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Repositories;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers.DeepComparison;

namespace WitsmlExplorer.Api.Workers
{
    public class CompareWellWorker : BaseWorker<CompareWellJob>, IWorker
    {
        private readonly IDocumentRepository<Server, Guid> _witsmlServerRepository;
        private readonly IDeepObjectComparer _deepObjectComparer;
        public JobType JobType => JobType.CompareWell;

        public CompareWellWorker(
            ILogger<CompareWellJob> logger,
            IWitsmlClientProvider witsmlClientProvider,
            IDocumentRepository<Server, Guid> witsmlServerRepository = null,
            IDeepObjectComparer deepObjectComparer = null) : base(witsmlClientProvider, logger)
        {
            _witsmlServerRepository = witsmlServerRepository;
            _deepObjectComparer = deepObjectComparer ?? new DeepObjectComparer();
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(CompareWellJob job, CancellationToken? cancellationToken = null)
        {
            Logger.LogInformation("Comparing of 2 wells started. {jobDescription}", job.Description());

            IWitsmlClient sourceClient = GetTargetWitsmlClientOrThrow();
            IWitsmlClient targetClient = GetSourceWitsmlClientOrThrow();

            var servers = _witsmlServerRepository != null ? await _witsmlServerRepository.GetDocumentsAsync() : Enumerable.Empty<Server>();
            var sourceServerName = servers.FirstOrDefault(server => server.Url.EqualsIgnoreCase(sourceClient.GetServerHostname()))?.Name ?? sourceClient.GetServerHostname()?.ToString();
            var targetServerName = servers.FirstOrDefault(server => server.Url.EqualsIgnoreCase(targetClient.GetServerHostname()))?.Name ?? targetClient.GetServerHostname()?.ToString();

            if (sourceServerName == targetServerName && job.SourceWell.WellUid == job.TargetWell.WellUid)
            {
                string errorMessageSameWell = "Failed to compare 2 wells - tried to compare the same well on the same server.";
                Logger.LogError("{ErrorMessage} - {JobDescription}", errorMessageSameWell, job.Description());
                return (new WorkerResult(sourceClient.GetServerHostname(), false, errorMessageSameWell, errorMessageSameWell, jobId: job.JobInfo?.Id, sourceServerUrl: targetClient.GetServerHostname()), null);
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
                MaxMismatchesLimit = job.MaxMismatches ?? 500
            };

            ReportProgress(job, 0.1, "Fetching well objects");
            cancellationToken?.ThrowIfCancellationRequested();

            var sourceQuery = WellQueries.GetFullWitsmlWellByUid(job.SourceWell.WellUid);
            var targetQuery = WellQueries.GetFullWitsmlWellByUid(job.TargetWell.WellUid);

            var sourceTask = sourceClient.GetFromStoreNullableAsync(sourceQuery, new OptionsIn(ReturnElements.All));
            var targetTask = targetClient.GetFromStoreNullableAsync(targetQuery, new OptionsIn(ReturnElements.All));
            await Task.WhenAll(sourceTask, targetTask);

            var sourceWell = sourceTask.Result?.Wells?.FirstOrDefault();
            var targetWell = targetTask.Result?.Wells?.FirstOrDefault();

            ReportProgress(job, 0.4, "Deep comparing well metadata and elements");
            cancellationToken?.ThrowIfCancellationRequested();

            var reportItems = _deepObjectComparer.CompareWell(sourceWell, targetWell, deepOptions);

            if (job.CompareWellboreObjects)
            {
                ReportProgress(job, 0.6, "Fetching child wellbores");
                cancellationToken?.ThrowIfCancellationRequested();

                var sourceWbQuery = WellboreQueries.GetWitsmlWellboreByWell(job.SourceWell.WellUid);
                var targetWbQuery = WellboreQueries.GetWitsmlWellboreByWell(job.TargetWell.WellUid);

                var sourceWbTask = sourceClient.GetFromStoreNullableAsync(sourceWbQuery, new OptionsIn(ReturnElements.All));
                var targetWbTask = targetClient.GetFromStoreNullableAsync(targetWbQuery, new OptionsIn(ReturnElements.All));
                await Task.WhenAll(sourceWbTask, targetWbTask);

                var sourceWellbores = sourceWbTask.Result?.Wellbores ?? new List<WitsmlWellbore>();
                var targetWellbores = targetWbTask.Result?.Wellbores ?? new List<WitsmlWellbore>();

                var matchedPairs = new List<(WitsmlWellbore Source, WitsmlWellbore Target)>();
                var unmatchedSource = new List<WitsmlWellbore>(sourceWellbores);
                var unmatchedTarget = new List<WitsmlWellbore>(targetWellbores);

                for (int i = unmatchedSource.Count - 1; i >= 0; i--)
                {
                    var s = unmatchedSource[i];
                    var t = unmatchedTarget.FirstOrDefault(w => string.Equals(w.Uid, s.Uid, StringComparison.OrdinalIgnoreCase));
                    if (t != null)
                    {
                        matchedPairs.Add((s, t));
                        unmatchedSource.RemoveAt(i);
                        unmatchedTarget.Remove(t);
                    }
                }

                if (job.MatchByNameIfUidDiffers)
                {
                    for (int i = unmatchedSource.Count - 1; i >= 0; i--)
                    {
                        var s = unmatchedSource[i];
                        var t = unmatchedTarget.FirstOrDefault(w => string.Equals(w.Name, s.Name, StringComparison.OrdinalIgnoreCase));
                        if (t != null)
                        {
                            matchedPairs.Add((s, t));
                            unmatchedSource.RemoveAt(i);
                            unmatchedTarget.Remove(t);
                        }
                    }
                }

                foreach (var s in unmatchedSource)
                {
                    reportItems.Add(new WellboreSubObjectsComparisonItem
                    {
                        ObjectType = "Wellbore",
                        ObjectUid = s.Uid,
                        ObjectName = s.Name,
                        DifferenceType = "MissingOnTarget",
                        ExistsOnSource = "TRUE",
                        ExistsOnTarget = "FALSE",
                        Description = $"Wellbore '{s.Name}' (UID: {s.Uid}) exists only on source server."
                    });
                }

                foreach (var t in unmatchedTarget)
                {
                    reportItems.Add(new WellboreSubObjectsComparisonItem
                    {
                        ObjectType = "Wellbore",
                        ObjectUid = t.Uid,
                        ObjectName = t.Name,
                        DifferenceType = "MissingOnSource",
                        ExistsOnSource = "FALSE",
                        ExistsOnTarget = "TRUE",
                        Description = $"Wellbore '{t.Name}' (UID: {t.Uid}) exists only on target server."
                    });
                }

                foreach (var (s, t) in matchedPairs)
                {
                    reportItems.AddRange(_deepObjectComparer.CompareWellbore(s, t, deepOptions));
                }
            }

            int totalMismatches = reportItems.Count;
            string sourceDisplayName = !string.IsNullOrEmpty(job.SourceWell?.WellName) ? job.SourceWell.WellName : job.SourceWell?.WellUid;
            string targetDisplayName = !string.IsNullOrEmpty(job.TargetWell?.WellName) ? job.TargetWell.WellName : job.TargetWell?.WellUid;

            string summary = totalMismatches == 0
                ? $"No mismatches were found when comparing well '{sourceDisplayName}' on {sourceServerName} and '{targetDisplayName}' on {targetServerName}."
                : $"Found {totalMismatches} mismatch(es) when comparing well '{sourceDisplayName}' on {sourceServerName} and '{targetDisplayName}' on {targetServerName}.";

            var report = new WellboreSubObjectsComparisonReport
            {
                Title = $"Compare Wells: {sourceDisplayName} vs {targetDisplayName}",
                Summary = summary,
                ReportItems = reportItems
            };

            if (job.JobInfo != null)
            {
                job.JobInfo.Report = report;
            }

            ReportProgress(job, 1.0, "Comparison completed");
            Logger.LogInformation("Comparing 2 wells is done. {jobDescription}", job.Description());

            var workerResult = new WorkerResult(
                sourceClient.GetServerHostname(),
                true,
                summary,
                jobId: job.JobInfo?.Id,
                sourceServerUrl: targetClient.GetServerHostname());
            return (workerResult, null);
        }

        private void ReportProgress(CompareWellJob job, double progress, string stage = null, string objectName = null, string mnemonic = null, string currentIndex = null, string indexRange = null)
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
    }
}
