using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.Data;
using Witsml.Extensions;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Middleware;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Models.Reports;
using WitsmlExplorer.Api.Repositories;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers
{
    public class CompareLogDataWorker : BaseWorker<CompareLogDataJob>, IWorker
    {
        private readonly IDocumentRepository<Server, Guid> _witsmlServerRepository;
        public JobType JobType => JobType.CompareLogData;
        private List<ICompareLogDataItem> _compareLogDataReportItems;
        private Dictionary<string, int> _mnemonicsMismatchCount;
        private Dictionary<string, string> _unsharedMnemonics;
        private string _sourceServerName;
        private string _targetServerName;
        private const int MaxMismatchesLimit = 500;
        private int _sourceDepthLogDecimals;
        private int _targetDepthLogDecimals;
        private int _smallestDepthLogDecimals;
        private bool _isEqualNumOfDecimals;
        private bool _isDecreasing;
        private bool _isDepthLog;
        private bool _includeIndexDuplicates;
        private bool _compareAllIndexes;

        public CompareLogDataWorker(ILogger<CompareLogDataJob> logger, IWitsmlClientProvider witsmlClientProvider, IDocumentRepository<Server, Guid> witsmlServerRepository = null) : base(witsmlClientProvider, logger)
        {
            _witsmlServerRepository = witsmlServerRepository;
        }
        public override async Task<(WorkerResult, RefreshAction)> Execute(CompareLogDataJob job, CancellationToken? cancellationToken = null)
        {
            Uri sourceHostname = GetSourceWitsmlClientOrThrow().GetServerHostname();
            Uri targetHostname = GetTargetWitsmlClientOrThrow().GetServerHostname();
            IEnumerable<Server> servers = _witsmlServerRepository == null ? new List<Server>() : await _witsmlServerRepository.GetDocumentsAsync();
            _sourceDepthLogDecimals = servers.FirstOrDefault((server) => server.Url.EqualsIgnoreCase(sourceHostname))?.DepthLogDecimals ?? 0;
            _targetDepthLogDecimals = servers.FirstOrDefault((server) => server.Url.EqualsIgnoreCase(targetHostname))?.DepthLogDecimals ?? 0;
            _sourceServerName = servers.FirstOrDefault((server) => server.Url.EqualsIgnoreCase(sourceHostname))?.Name;
            _targetServerName = servers.FirstOrDefault((server) => server.Url.EqualsIgnoreCase(targetHostname))?.Name;
            _smallestDepthLogDecimals = Math.Min(_sourceDepthLogDecimals, _targetDepthLogDecimals);
            _isEqualNumOfDecimals = _sourceDepthLogDecimals == _targetDepthLogDecimals;

            // Set up log report list
            _compareLogDataReportItems = new();

            // Set up mnemonics mismatch count dictionary
            _mnemonicsMismatchCount = new Dictionary<string, int>();

            // Set up unshared mnemonics dictionary
            _unsharedMnemonics = new Dictionary<string, string>();

            // Get logs
            WitsmlLog sourceLog = await LogWorkerTools.GetLog(GetSourceWitsmlClientOrThrow(), job.SourceLog, ReturnElements.HeaderOnly);
            WitsmlLog targetLog = await LogWorkerTools.GetLog(GetTargetWitsmlClientOrThrow(), job.TargetLog, ReturnElements.HeaderOnly);
            _includeIndexDuplicates = job.IncludeIndexDuplicates;
            _compareAllIndexes = job.CompareAllIndexes;

            try
            {
                VerifyLogs(sourceLog, targetLog);

                // Check log type
                _isDecreasing = sourceLog.Direction == WitsmlLog.WITSML_DIRECTION_DECREASING;
                _isDepthLog = sourceLog.IndexType == WitsmlLog.WITSML_INDEX_TYPE_MD;

                // Set the logs shared index interval
                if (!_compareAllIndexes)
                {
                    (sourceLog, targetLog) = SetSharedIndexInterval(sourceLog, targetLog);
                }

                List<string> sourceLogMnemonics = GetLogMnemonics(sourceLog);
                List<string> targetLogMnemonics = GetLogMnemonics(targetLog);

                // Get all mnemonics in source and target log
                List<string> allMnemonics = sourceLogMnemonics.Union(targetLogMnemonics).ToList();

                // Get shared mnemonics in source and target log
                List<string> sharedMnemonics = sourceLogMnemonics.Intersect(targetLogMnemonics).ToList();

                for (int i = 0; i < allMnemonics.Count; i++)
                {
                    cancellationToken?.ThrowIfCancellationRequested();
                    string mnemonic = allMnemonics[i];

                    _mnemonicsMismatchCount[mnemonic] = 0;
                    if (sharedMnemonics.Contains(mnemonic))
                    {
                        await AddSharedMnemonicData(sourceLog, targetLog, mnemonic);
                    }
                    else if (sourceLogMnemonics.Contains(mnemonic))
                    {
                        _unsharedMnemonics[mnemonic] = sourceLog.Name;

                    }
                    else if (targetLogMnemonics.Contains(mnemonic))
                    {
                        _unsharedMnemonics[mnemonic] = targetLog.Name;
                    }
                    else
                    {
                        throw new ArgumentException($"mnemonic={mnemonic} does not exist in source log or target log.");
                    }
                    ReportProgress(job, (double)i / allMnemonics.Count);
                }

                BaseReport report = GenerateReport(sourceLog, targetLog);
                job.JobInfo.Report = report;
            }
            catch (ArgumentException e)
            {
                string message = $"Compared log data for log: '{sourceLog.Name}' and '{targetLog.Name}'";
                Logger.LogError(message);
                return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, message, e.Message, jobId: job.JobInfo.Id, sourceServerUrl: GetSourceWitsmlClientOrThrow().GetServerHostname()), null);
            }

            Logger.LogInformation("{JobType} - Job successful", GetType().Name);
            WorkerResult workerResult = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, $"Compared log data for log: '{sourceLog.Name}' and '{targetLog.Name}'", jobId: job.JobInfo.Id, sourceServerUrl: GetSourceWitsmlClientOrThrow().GetServerHostname());
            return (workerResult, null);
        }

        private static void ReportProgress(CompareLogDataJob job, double progress)
        {
            if (job.JobInfo != null) job.JobInfo.Progress = progress;
            job.ProgressReporter?.Report(progress);
        }

        private async Task AddSharedMnemonicData(WitsmlLog sourceLog, WitsmlLog targetLog, string mnemonic)
        {
            WitsmlLogData sourceLogData = await LogWorkerTools.GetLogDataForCurve(GetSourceWitsmlClientOrThrow(), sourceLog, mnemonic, Logger);
            WitsmlLogData targetLogData = await LogWorkerTools.GetLogDataForCurve(GetTargetWitsmlClientOrThrow(), targetLog, mnemonic, Logger);
            Dictionary<string, string> sourceData = WitsmlLogDataToDictionary(sourceLogData);
            Dictionary<string, string> targetData = WitsmlLogDataToDictionary(targetLogData);

            if (!_isEqualNumOfDecimals)
            {
                CompareLogDataWithUnequalNumOfDecimals(sourceData, targetData, mnemonic);
            }
            else
            {
                CompareLogData(sourceData, targetData, mnemonic);
            }
        }

        private void CompareLogData(Dictionary<string, string> sourceData, Dictionary<string, string> targetData, string mnemonic)
        {
            List<string> indexes = sourceData.Keys.Union(targetData.Keys).ToList();
            indexes = SortIndexes(indexes);

            foreach (string index in indexes)
            {
                if (_mnemonicsMismatchCount[mnemonic] >= MaxMismatchesLimit) break;

                if (sourceData.ContainsKey(index) && targetData.ContainsKey(index))
                {
                    string sourceValue = sourceData[index];
                    string targetValue = targetData[index];
                    if (!IsMnemonicDataEqual(sourceValue, targetValue))
                    {
                        AddReportItem(mnemonic, index, sourceValue, targetValue);
                    }
                }
                else if (sourceData.ContainsKey(index))
                {
                    AddReportItem(mnemonic, index, sourceData[index], null);
                }
                else if (targetData.ContainsKey(index))
                {
                    AddReportItem(mnemonic, index, null, targetData[index]);
                }
                else
                {
                    throw new ArgumentException($"index={index} does not exist in source log or target log.");
                }
            }
        }

        private void CompareLogDataWithUnequalNumOfDecimals(Dictionary<string, string> sourceData, Dictionary<string, string> targetData, string mnemonic)
        {
            (Dictionary<string, string> LessDecimals, Dictionary<string, string> MoreDecimals) Logs = _sourceDepthLogDecimals < _targetDepthLogDecimals ? (sourceData, targetData) : (targetData, sourceData);
            List<string> lessDecimalsIndexes = Logs.LessDecimals.Keys.ToList();
            List<string> moreDecimalsIndexes = Logs.MoreDecimals.Keys.ToList();

            if (!_includeIndexDuplicates)
            {
                moreDecimalsIndexes = RemoveRoundedIndexDuplicates(moreDecimalsIndexes);
            }

            List<string> allIndexes = lessDecimalsIndexes.Union(moreDecimalsIndexes).ToList();
            allIndexes = SortIndexes(allIndexes);

            List<string> moreDecimalsRoundedIndexes = moreDecimalsIndexes.Select(x => RoundStringDouble(x, _smallestDepthLogDecimals)).ToList();
            List<string> moreDecimalsRoundedIndexesDuplicates = GetIndexDuplicates(moreDecimalsRoundedIndexes);

            foreach (string index in allIndexes)
            {
                if (_mnemonicsMismatchCount[mnemonic] >= MaxMismatchesLimit) break;

                string roundedIndex = RoundStringDouble(index, _smallestDepthLogDecimals);

                if (lessDecimalsIndexes.Contains(roundedIndex) && moreDecimalsIndexes.Contains(index))
                {
                    string lessDecimalsValue = Logs.LessDecimals[roundedIndex];
                    string moreDecimalsValue = Logs.MoreDecimals[index];
                    if (moreDecimalsRoundedIndexesDuplicates.Contains(roundedIndex))
                    {
                        AddUnequalServerDecimalsReportItem(mnemonic, roundedIndex, index, lessDecimalsValue, moreDecimalsValue, true);
                    }
                    else if (!IsMnemonicDataEqual(lessDecimalsValue, moreDecimalsValue))
                    {
                        AddUnequalServerDecimalsReportItem(mnemonic, roundedIndex, index, lessDecimalsValue, moreDecimalsValue);
                    }
                }
                else if (lessDecimalsIndexes.Contains(index) && !moreDecimalsRoundedIndexes.Contains(index))
                {
                    string lessDecimalsValue = Logs.LessDecimals[index];
                    AddUnequalServerDecimalsReportItem(mnemonic, index, null, lessDecimalsValue, null);
                }
                else if (moreDecimalsIndexes.Contains(index) && !lessDecimalsIndexes.Contains(index))
                {
                    string moreDecimalsValue = Logs.MoreDecimals[index];
                    AddUnequalServerDecimalsReportItem(mnemonic, null, index, null, moreDecimalsValue);
                }
            }
        }

        private bool IsMnemonicDataEqual(string sourceValue, string targetValue)
        {
            return String.Equals(sourceValue, targetValue);
        }

        private BaseReport GenerateReport(WitsmlLog sourceLog, WitsmlLog targetLog)
        {
            var sortedMnemonicsMismatchCount = _mnemonicsMismatchCount.OrderByDescending(x => x.Value);
            string mnemonicsMismatchCountResult = "\nNumber of mismatches for each shared mnemonic:";
            foreach (KeyValuePair<string, int> keyValues in sortedMnemonicsMismatchCount)
            {
                mnemonicsMismatchCountResult += keyValues.Value >= 500 ? $"\n{keyValues.Key}: {keyValues.Value:n0} or more" : $"\n{keyValues.Key}: {keyValues.Value:n0}";
            }

            string unsharedMnemonicsResult = _unsharedMnemonics.Count > 0 ? "\nUnshared mnemonics:" : "";
            foreach (KeyValuePair<string, string> mnemonic in _unsharedMnemonics)
            {
                unsharedMnemonicsResult += $"\n{mnemonic.Key}: Only exists in {mnemonic.Value}";
            }

            string indexRange = _compareAllIndexes ? "" : GetSharedIntervalReportFormat(sourceLog, targetLog);

            return new BaseReport
            {
                Title = $"Log data comparison",
                Summary = _compareLogDataReportItems.Count > 0
                ? $"Found {_compareLogDataReportItems.Count:n0} mismatches in the shared mnemonics in the {(_isDepthLog ? "depth" : "time")} logs '{sourceLog.Name}' and '{targetLog.Name}':{indexRange}" + unsharedMnemonicsResult + mnemonicsMismatchCountResult
                : $"No mismatches were found in the data indexes of the {(_isDepthLog ? "depth" : "time")} logs '{sourceLog.Name}' and '{targetLog.Name}'{indexRange}.",
                ReportItems = _compareLogDataReportItems,
                WarningMessage = _compareLogDataReportItems.Count >= MaxMismatchesLimit ? $"When finding {MaxMismatchesLimit:n0} mismatches while searching through data indexes for any mnemonic, we stop comparing the log data for that particular mnemonic. This is because {MaxMismatchesLimit:n0} is the maximum limit for mismatches during the search for each mnemonic. It indicates that there might be an issue with the compare log setup. However, you can still access the report for the comparison performed below." : null,
                JobDetails = $"SourceServer::{_sourceServerName}|TargetServer::{_targetServerName}|SourceLog::{sourceLog.Name}|TargetLog::{targetLog.Name}|Number of mismatches for shared mnemonics::{_compareLogDataReportItems.Count:n0}|Number of unshared mnemonics::{_unsharedMnemonics.Count:n0}"
            };
        }

        private string GetSharedIntervalReportFormat(WitsmlLog sourceLog, WitsmlLog targetLog)
        {
            return _isDepthLog ? $"\nIndex interval: {sourceLog.StartIndex.Value} - {sourceLog.EndIndex.Value}" : $"\nIndex interval: {sourceLog.StartDateTimeIndex} - {sourceLog.EndDateTimeIndex}";
        }

        private List<string> GetLogMnemonics(WitsmlLog log)
        {
            return log.LogCurveInfo.Select(logCurveInfo => logCurveInfo.Mnemonic).Skip(1).ToList();
        }

        private void AddReportItem(string mnemonic, string index, string sourceValue, string targetValue)
        {
            _mnemonicsMismatchCount[mnemonic]++;
            _compareLogDataReportItems.Add(new CompareLogDataItem
            {
                Mnemonic = mnemonic,
                Index = index,
                SourceValue = sourceValue,
                TargetValue = targetValue,
            });
        }

        private void AddUnequalServerDecimalsReportItem(string mnemonic, string lessDecimalsIndex, string moreDecimalsIndex, string lessDecimalsValue, string moreDecimalsValue, bool isDuplicate = false)
        {
            _mnemonicsMismatchCount[mnemonic]++;
            if (_includeIndexDuplicates)
            {
                _compareLogDataReportItems.Add(new CompareLogDataUnequalServerDecimalsIndexDuplicateItem
                {
                    Mnemonic = mnemonic,
                    SourceIndex = _sourceDepthLogDecimals < _targetDepthLogDecimals ? lessDecimalsIndex : moreDecimalsIndex,
                    TargetIndex = _targetDepthLogDecimals < _sourceDepthLogDecimals ? lessDecimalsIndex : moreDecimalsIndex,
                    SourceValue = _sourceDepthLogDecimals < _targetDepthLogDecimals ? lessDecimalsValue : moreDecimalsValue,
                    TargetValue = _targetDepthLogDecimals < _sourceDepthLogDecimals ? lessDecimalsValue : moreDecimalsValue,
                    IndexDuplicate = isDuplicate ? "X" : null
                });
            }
            else
            {
                _compareLogDataReportItems.Add(new CompareLogDataUnequalServerDecimalsItem
                {
                    Mnemonic = mnemonic,
                    SourceIndex = _sourceDepthLogDecimals < _targetDepthLogDecimals ? lessDecimalsIndex : moreDecimalsIndex,
                    TargetIndex = _targetDepthLogDecimals < _sourceDepthLogDecimals ? lessDecimalsIndex : moreDecimalsIndex,
                    SourceValue = _sourceDepthLogDecimals < _targetDepthLogDecimals ? lessDecimalsValue : moreDecimalsValue,
                    TargetValue = _targetDepthLogDecimals < _sourceDepthLogDecimals ? lessDecimalsValue : moreDecimalsValue,
                });
            }
        }

        private List<string> SortIndexes(List<string> indexes)
        {
            if (_isDecreasing)
            {
                return _isDepthLog ? indexes.OrderByDescending(StringHelpers.ToDouble).ToList() : indexes.OrderByDescending(DateTime.Parse).ToList();
            }
            else
            {
                return _isDepthLog ? indexes.OrderBy(StringHelpers.ToDouble).ToList() : indexes.OrderBy(DateTime.Parse).ToList();
            }
        }

        private Dictionary<string, string> WitsmlLogDataToDictionary(WitsmlLogData logData)
        {
            return logData.Data?.ToDictionary(row => row.Data.Split(CommonConstants.DataSeparator).First(), row => row.Data.Split(CommonConstants.DataSeparator).Last());
        }

        private void VerifyLogs(WitsmlLog sourceLog, WitsmlLog targetLog)
        {
            if (sourceLog == null) throw new ArgumentException("Source log could not be fetched.");
            if (targetLog == null) throw new ArgumentException("Target log could not be fetched.");
            if (sourceLog.IndexType != targetLog.IndexType) throw new ArgumentException($"SourceLog.IndexType={sourceLog.IndexType} should match TargetLog.IndexType={targetLog.IndexType}");
            if (sourceLog.Direction != targetLog.Direction) throw new ArgumentException($"SourceLog.Direction={sourceLog.Direction} should match TargetLog.Direction={targetLog.Direction}");
        }

        private string RoundStringDouble(string value, int digits)
        {
            return Math.Round(StringHelpers.ToDouble(value), digits, MidpointRounding.AwayFromZero).ToString(CultureInfo.InvariantCulture);
        }

        private List<string> GetIndexDuplicates(List<string> indexes)
        {
            return indexes.GroupBy(x => x)
                    .Where(g => g.Count() > 1)
                    .Select(y => y.Key)
                    .ToList();
        }

        private List<string> RemoveRoundedIndexDuplicates(List<string> indexes)
        {
            List<string> newIndexes = new List<string>();
            List<string> roundedIndexes = new List<string>();
            foreach (string index in indexes)
            {
                string roundedIndex = RoundStringDouble(index, _smallestDepthLogDecimals);
                if (!roundedIndexes.Contains(roundedIndex))
                {
                    newIndexes.Add(index);
                    roundedIndexes.Add(roundedIndex);
                }
            }
            return newIndexes;
        }

        private (WitsmlLog, WitsmlLog) SetSharedIndexInterval(WitsmlLog sourceLog, WitsmlLog targetLog)
        {
            if (_isDepthLog)
            {
                if (sourceLog.StartIndex == null || sourceLog.EndIndex == null) throw new ArgumentException("The source log does not contain StartIndex or EndIndex.");
                if (targetLog.StartIndex == null || targetLog.EndIndex == null) throw new ArgumentException("The target log does not contain StartIndex or EndIndex.");
                double sourceLogStartIndex = StringHelpers.ToDouble(sourceLog.StartIndex.Value);
                double sourceLogEndIndex = StringHelpers.ToDouble(sourceLog.EndIndex.Value);
                double targetLogStartIndex = StringHelpers.ToDouble(targetLog.StartIndex.Value);
                double targetLogEndIndex = StringHelpers.ToDouble(targetLog.EndIndex.Value);
                double newStartIndex = _isDecreasing ? Math.Min(sourceLogStartIndex, targetLogStartIndex) : Math.Max(sourceLogStartIndex, targetLogStartIndex);
                double newEndIndex = _isDecreasing ? Math.Max(sourceLogEndIndex, targetLogEndIndex) : Math.Min(sourceLogEndIndex, targetLogEndIndex);
                bool containsSharedInterval = _isDecreasing ? newStartIndex >= newEndIndex : newStartIndex <= newEndIndex;

                if (!containsSharedInterval) throw new ArgumentException("The logs do not have a shared index interval.");

                sourceLog.StartIndex.Value = newStartIndex.ToString(CultureInfo.InvariantCulture);
                sourceLog.EndIndex.Value = newEndIndex.ToString(CultureInfo.InvariantCulture);
                targetLog.StartIndex.Value = newStartIndex.ToString(CultureInfo.InvariantCulture);
                targetLog.EndIndex.Value = newEndIndex.ToString(CultureInfo.InvariantCulture);

                return (sourceLog, targetLog);
            }
            else
            {
                if (sourceLog.StartDateTimeIndex == null || sourceLog.EndDateTimeIndex == null) throw new ArgumentException("The source log does not contain StartDateTimeIndex or EndDateTimeIndex.");
                if (targetLog.StartDateTimeIndex == null || targetLog.EndDateTimeIndex == null) throw new ArgumentException("The target log does not contain StartDateTimeIndex or EndDateTimeIndex.");
                var sourceLogStartDateTimeIndex = StringHelpers.ToDateTime(sourceLog.StartDateTimeIndex);
                var sourceLogEndDateTimeIndex = StringHelpers.ToDateTime(sourceLog.EndDateTimeIndex);
                var targetLogStartDateTimeIndex = StringHelpers.ToDateTime(targetLog.StartDateTimeIndex);
                var targetLogEndDateTimeIndex = StringHelpers.ToDateTime(targetLog.EndDateTimeIndex);
                var newStartDateTimeIndex = sourceLogStartDateTimeIndex >= targetLogStartDateTimeIndex ? sourceLogStartDateTimeIndex : targetLogStartDateTimeIndex;
                var newEndDateTimeIndex = sourceLogEndDateTimeIndex <= targetLogEndDateTimeIndex ? sourceLogEndDateTimeIndex : targetLogEndDateTimeIndex;
                bool containsSharedInterval = newStartDateTimeIndex <= newEndDateTimeIndex;

                if (!containsSharedInterval) throw new ArgumentException("The logs do not have a shared time index interval.");

                sourceLog.StartDateTimeIndex = newStartDateTimeIndex?.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ");
                sourceLog.EndDateTimeIndex = newEndDateTimeIndex?.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ");
                targetLog.StartDateTimeIndex = newStartDateTimeIndex?.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ");
                targetLog.EndDateTimeIndex = newEndDateTimeIndex?.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ");

                return (sourceLog, targetLog);
            }
        }
    }
}
