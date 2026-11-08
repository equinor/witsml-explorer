using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.Data;
using Witsml.Data.Curves;
using Witsml.Extensions;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Models.Reports;
using WitsmlExplorer.Api.Repositories;
using WitsmlExplorer.Api.Services;

using CurveIndex = Witsml.Data.Curves.Index;

namespace WitsmlExplorer.Api.Workers
{
    public interface ICompareLogDataWorker
    {
        Task<(WorkerResult, RefreshAction)> Execute(CompareLogDataJob job,
            CancellationToken? cancellationToken = null);
    }
    public class CompareLogDataWorker : BaseWorker<CompareLogDataJob>, IWorker, ICompareLogDataWorker
    {
        private readonly IDocumentRepository<Server, Guid> _witsmlServerRepository;
        public JobType JobType => JobType.CompareLogData;
        private List<ICompareLogDataItem> _compareLogDataReportItems;
        private Dictionary<string, int> _mnemonicsMismatchCount;
        private Dictionary<string, string> _unsharedMnemonics;
        private string _sourceServerName;
        private string _targetServerName;
        private const int MaxMismatchesLimit = 500;
        private int _maxMismatchesLimit = MaxMismatchesLimit;
        private int _sourceDepthLogDecimals;
        private int _targetDepthLogDecimals;
        private int _smallestDepthLogDecimals;
        private int? _customDecimalPlaces;
        private bool _isEqualNumOfDecimals;
        private bool _isRawDecimals;
        private bool _isDecreasing;
        private bool _isDepthLog;
        private bool _includeIndexDuplicates;
        private bool _compareAllIndexes;
        private double? _samplingInterval;

        public CompareLogDataWorker(ILogger<CompareLogDataJob> logger, IWitsmlClientProvider witsmlClientProvider, IDocumentRepository<Server, Guid> witsmlServerRepository = null) : base(witsmlClientProvider, logger)
        {
            _witsmlServerRepository = witsmlServerRepository;
        }
        public override async Task<(WorkerResult, RefreshAction)> Execute(CompareLogDataJob job, CancellationToken? cancellationToken = null)
        {
            Uri sourceHostname = GetSourceWitsmlClientOrThrow().GetServerHostname();
            Uri targetHostname = GetTargetWitsmlClientOrThrow().GetServerHostname();
            IEnumerable<Server> servers = _witsmlServerRepository == null ? new List<Server>() : await _witsmlServerRepository.GetDocumentsAsync();
            _customDecimalPlaces = job.CustomDecimalPlaces;
            if (job.DecimalMode == DecimalComparisonMode.Raw)
            {
                _isRawDecimals = true;
                _isEqualNumOfDecimals = true;
                _smallestDepthLogDecimals = 0;
                _customDecimalPlaces = null;
            }
            else if (job.CustomDecimalPlaces.HasValue)
            {
                _isRawDecimals = false;
                _sourceDepthLogDecimals = job.CustomDecimalPlaces.Value;
                _targetDepthLogDecimals = job.CustomDecimalPlaces.Value;
                _smallestDepthLogDecimals = job.CustomDecimalPlaces.Value;
                _isEqualNumOfDecimals = true;
            }
            else
            {
                _isRawDecimals = false;
                _sourceDepthLogDecimals = servers.FirstOrDefault((server) => server.Url.EqualsIgnoreCase(sourceHostname))?.DepthLogDecimals ?? 0;
                _targetDepthLogDecimals = servers.FirstOrDefault((server) => server.Url.EqualsIgnoreCase(targetHostname))?.DepthLogDecimals ?? 0;
                _smallestDepthLogDecimals = Math.Min(_sourceDepthLogDecimals, _targetDepthLogDecimals);
                _isEqualNumOfDecimals = _sourceDepthLogDecimals == _targetDepthLogDecimals;
            }
            _maxMismatchesLimit = job.ReportAllMismatches ? int.MaxValue : MaxMismatchesLimit;
            _sourceServerName = servers.FirstOrDefault((server) => server.Url.EqualsIgnoreCase(sourceHostname))?.Name;
            _targetServerName = servers.FirstOrDefault((server) => server.Url.EqualsIgnoreCase(targetHostname))?.Name;

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
            _samplingInterval = job.SamplingInterval;

            try
            {
                if (job.JobInfo == null)
                {
                    job.JobInfo = new JobInfo();
                }
                VerifyLogs(sourceLog, targetLog);

                // Check log type
                _isDecreasing = sourceLog.Direction == WitsmlLog.WITSML_DIRECTION_DECREASING;
                _isDepthLog = sourceLog.IndexType == WitsmlLog.WITSML_INDEX_TYPE_MD;

                // Set the logs shared index interval
                if (!_compareAllIndexes)
                {
                    (sourceLog, targetLog) = SetSharedIndexInterval(sourceLog, targetLog);
                }
                ApplyCustomIndexInterval(sourceLog, targetLog, job.StartIndex, job.EndIndex);

                List<string> sourceLogMnemonics = GetLogMnemonics(sourceLog);
                List<string> targetLogMnemonics = GetLogMnemonics(targetLog);
                if (job.Mnemonics != null && job.Mnemonics.Any())
                {
                    sourceLogMnemonics = sourceLogMnemonics.Where(m => job.Mnemonics.Any(req => string.Equals(req, m, StringComparison.OrdinalIgnoreCase))).ToList();
                    targetLogMnemonics = targetLogMnemonics.Where(m => job.Mnemonics.Any(req => string.Equals(req, m, StringComparison.OrdinalIgnoreCase))).ToList();
                }

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
                        await AddSharedMnemonicData(job, sourceLog, targetLog, mnemonic, i, allMnemonics.Count);
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
                    ReportProgressWithDetails(job, (double)(i + 1) / allMnemonics.Count, "Curve comparison completed", sourceLog.Name, mnemonic);
                }
                BaseReport report = GenerateReport(sourceLog, targetLog);
                job.JobInfo.Report = report;
            }
            catch (ArgumentException e)
            {
                string message = $"Compared log data for log: '{sourceLog.Name}' and '{targetLog.Name}': {e.Message}";
                Logger.LogError(message);
                return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, message, e.Message, jobId: job.JobInfo.Id, sourceServerUrl: GetSourceWitsmlClientOrThrow().GetServerHostname()), null);
            }

            Logger.LogInformation("{JobType} - Job successful", GetType().Name);
            WorkerResult workerResult = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, $"Compared log data for log: '{sourceLog.Name}' and '{targetLog.Name}'", jobId: job.JobInfo.Id, sourceServerUrl: GetSourceWitsmlClientOrThrow().GetServerHostname());
            return (workerResult, null);
        }

        private static void ReportProgress(CompareLogDataJob job, double progress)
        {
            ReportProgressWithDetails(job, progress);
        }

        private static void ReportProgressWithDetails(CompareLogDataJob job, double progress, string stage = null, string objName = null, string mnemonic = null, string currentIndex = null, string indexRange = null)
        {
            if (job.JobInfo != null) job.JobInfo.Progress = progress;
            if (job.ProgressUpdateReporter != null)
            {
                job.ProgressUpdateReporter.Report(new JobProgressUpdate(progress, stage, objName, mnemonic, currentIndex, indexRange));
            }
            else
            {
                job.ProgressReporter?.Report(progress);
            }
        }

        private static double CalculateIndexProgress(string currentIndexStr, CurveIndex start, CurveIndex end, bool isDecreasing)
        {
            if (string.IsNullOrEmpty(currentIndexStr) || start == null || end == null) return 0.0;
            try
            {
                if (double.TryParse(currentIndexStr, NumberStyles.Any, CultureInfo.InvariantCulture, out double current) &&
                    double.TryParse(start.GetValueAsString(), NumberStyles.Any, CultureInfo.InvariantCulture, out double s) &&
                    double.TryParse(end.GetValueAsString(), NumberStyles.Any, CultureInfo.InvariantCulture, out double e))
                {
                    double span = isDecreasing ? (s - e) : (e - s);
                    if (Math.Abs(span) < 1e-6) return 1.0;
                    double progress = isDecreasing ? (s - current) / span : (current - s) / span;
                    return Math.Clamp(progress, 0.0, 1.0);
                }
                if (DateTime.TryParse(currentIndexStr, CultureInfo.InvariantCulture, DateTimeStyles.AdjustToUniversal, out DateTime currentDt) &&
                    DateTime.TryParse(start.GetValueAsString(), CultureInfo.InvariantCulture, DateTimeStyles.AdjustToUniversal, out DateTime sDt) &&
                    DateTime.TryParse(end.GetValueAsString(), CultureInfo.InvariantCulture, DateTimeStyles.AdjustToUniversal, out DateTime eDt))
                {
                    double span = (eDt - sDt).TotalMilliseconds;
                    if (Math.Abs(span) < 1.0) return 1.0;
                    double progress = (currentDt - sDt).TotalMilliseconds / span;
                    return Math.Clamp(progress, 0.0, 1.0);
                }
            }
            catch
            {
                // ignored
            }
            return 0.0;
        }

        private (CurveIndex Start, CurveIndex End) GetCurveInterval(WitsmlLog log, string mnemonic, CurveIndex fallbackStart, CurveIndex fallbackEnd)
        {
            var curveInfo = log.LogCurveInfo?.FirstOrDefault(c => string.Equals(c.Mnemonic, mnemonic, StringComparison.OrdinalIgnoreCase));
            if (curveInfo == null) return (fallbackStart, fallbackEnd);

            try
            {
                CurveIndex curveMin = CurveIndex.Min(log.IndexType, curveInfo);
                CurveIndex curveMax = CurveIndex.Max(log.IndexType, curveInfo);

                CurveIndex start = fallbackStart;
                CurveIndex end = fallbackEnd;

                if (curveMin != null && start != null)
                {
                    if (_isDecreasing ? curveMin < start : curveMin > start)
                    {
                        start = curveMin;
                    }
                }

                if (curveMax != null && end != null)
                {
                    if (_isDecreasing ? curveMax > end : curveMax < end)
                    {
                        end = curveMax;
                    }
                }

                return (start ?? fallbackStart, end ?? fallbackEnd);
            }
            catch
            {
                return (fallbackStart, fallbackEnd);
            }
        }

        private async Task AddSharedMnemonicData(CompareLogDataJob job, WitsmlLog sourceLog, WitsmlLog targetLog, string mnemonic, int mnemonicIndex, int totalMnemonics)
        {
            (CurveIndex sourceStartIndex, CurveIndex sourceEndIndex) = GetCurveInterval(sourceLog, mnemonic, CurveIndex.Start(sourceLog), CurveIndex.End(sourceLog));
            (CurveIndex targetStartIndex, CurveIndex targetEndIndex) = GetCurveInterval(targetLog, mnemonic, CurveIndex.Start(targetLog), CurveIndex.End(targetLog));

            string rangeStr = _isDepthLog
                ? $"{sourceStartIndex?.GetValueAsString() ?? "start"}m - {sourceEndIndex?.GetValueAsString() ?? "end"}m"
                : $"{sourceStartIndex?.GetValueAsString() ?? "start"} - {sourceEndIndex?.GetValueAsString() ?? "end"}";

            double baseProgress = (double)mnemonicIndex / totalMnemonics;
            double curveWeight = 1.0 / totalMnemonics;

            ReportProgressWithDetails(job, baseProgress, $"Querying Source: {_sourceServerName ?? "Server A"}", sourceLog.Name, mnemonic, null, rangeStr);

            WitsmlLogData sourceLogData = await LogWorkerTools.GetLogDataForCurve(
                GetSourceWitsmlClientOrThrow(), sourceLog, mnemonic, Logger, sourceStartIndex, sourceEndIndex,
                (batchIdx, count) =>
                {
                    double batchFrac = CalculateIndexProgress(batchIdx, sourceStartIndex, sourceEndIndex, _isDecreasing);
                    double progress = baseProgress + ((0.05 + 0.40 * batchFrac) * curveWeight);
                    string indexWithCount = count > 0 ? $"{batchIdx} ({count:n0} pts)" : batchIdx;
                    ReportProgressWithDetails(job, progress, $"Querying Source: {_sourceServerName ?? "Server A"}", sourceLog.Name, mnemonic, indexWithCount, rangeStr);
                });

            ReportProgressWithDetails(job, baseProgress + (0.45 * curveWeight), $"Querying Target: {_targetServerName ?? "Server B"}", targetLog.Name, mnemonic, null, rangeStr);

            WitsmlLogData targetLogData = await LogWorkerTools.GetLogDataForCurve(
                GetTargetWitsmlClientOrThrow(), targetLog, mnemonic, Logger, targetStartIndex, targetEndIndex,
                (batchIdx, count) =>
                {
                    double batchFrac = CalculateIndexProgress(batchIdx, targetStartIndex, targetEndIndex, _isDecreasing);
                    double progress = baseProgress + ((0.45 + 0.45 * batchFrac) * curveWeight);
                    string indexWithCount = count > 0 ? $"{batchIdx} ({count:n0} pts)" : batchIdx;
                    ReportProgressWithDetails(job, progress, $"Querying Target: {_targetServerName ?? "Server B"}", targetLog.Name, mnemonic, indexWithCount, rangeStr);
                });

            ReportProgressWithDetails(job, baseProgress + (0.92 * curveWeight), "Comparing values", sourceLog.Name, mnemonic, null, rangeStr);

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
            Dictionary<string, string> effectiveSourceData = sourceData;
            Dictionary<string, string> effectiveTargetData = targetData;

            if (_isDepthLog && !_isRawDecimals && _smallestDepthLogDecimals > 0)
            {
                effectiveSourceData = NormalizeDepthData(sourceData);
                effectiveTargetData = NormalizeDepthData(targetData);
            }

            List<string> indexes = effectiveSourceData.Keys.Union(effectiveTargetData.Keys).ToList();
            indexes = SortIndexes(indexes);
            if (_samplingInterval.HasValue && _samplingInterval.Value > 0)
            {
                indexes = FilterIndexesBySamplingInterval(indexes, _samplingInterval.Value);
            }

            int srcPoints = (_samplingInterval.HasValue && _samplingInterval.Value > 0)
                ? indexes.Count(i => effectiveSourceData.ContainsKey(i))
                : sourceData.Count;
            int tgtPoints = (_samplingInterval.HasValue && _samplingInterval.Value > 0)
                ? indexes.Count(i => effectiveTargetData.ContainsKey(i))
                : targetData.Count;
            string srcPointsStr = srcPoints.ToString();
            string tgtPointsStr = tgtPoints.ToString();

            foreach (string index in indexes)
            {
                if (_mnemonicsMismatchCount[mnemonic] >= _maxMismatchesLimit) break;

                if (effectiveSourceData.ContainsKey(index) && effectiveTargetData.ContainsKey(index))
                {
                    string sourceValue = effectiveSourceData[index];
                    string targetValue = effectiveTargetData[index];
                    if (!IsMnemonicDataEqual(sourceValue, targetValue))
                    {
                        AddReportItem(mnemonic, index, sourceValue, targetValue, srcPointsStr, tgtPointsStr);
                    }
                }
                else if (effectiveSourceData.ContainsKey(index))
                {
                    AddReportItem(mnemonic, index, effectiveSourceData[index], null, srcPointsStr, tgtPointsStr);
                }
                else if (effectiveTargetData.ContainsKey(index))
                {
                    AddReportItem(mnemonic, index, null, effectiveTargetData[index], srcPointsStr, tgtPointsStr);
                }
                else
                {
                    throw new ArgumentException($"index={index} does not exist in source log or target log.");
                }
            }
        }

        private Dictionary<string, string> NormalizeDepthData(Dictionary<string, string> data)
        {
            if (_isRawDecimals || _smallestDepthLogDecimals <= 0)
            {
                return data;
            }
            Dictionary<string, string> normalized = new();
            foreach (var kvp in data)
            {
                string roundedKey = RoundStringDouble(kvp.Key, _smallestDepthLogDecimals);
                if (!normalized.ContainsKey(roundedKey))
                {
                    normalized[roundedKey] = kvp.Value;
                }
            }
            return normalized;
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
            if (_samplingInterval.HasValue && _samplingInterval.Value > 0)
            {
                allIndexes = FilterIndexesBySamplingInterval(allIndexes, _samplingInterval.Value);
            }

            int lessPoints = (_samplingInterval.HasValue && _samplingInterval.Value > 0)
                ? allIndexes.Count(i => lessDecimalsIndexes.Contains(i) || lessDecimalsIndexes.Contains(RoundStringDouble(i, _smallestDepthLogDecimals)))
                : Logs.LessDecimals.Count;
            int morePoints = (_samplingInterval.HasValue && _samplingInterval.Value > 0)
                ? allIndexes.Count(i => moreDecimalsIndexes.Contains(i))
                : Logs.MoreDecimals.Count;
            int srcPoints = _sourceDepthLogDecimals < _targetDepthLogDecimals ? lessPoints : morePoints;
            int tgtPoints = _targetDepthLogDecimals < _sourceDepthLogDecimals ? lessPoints : morePoints;
            string srcPointsStr = srcPoints.ToString();
            string tgtPointsStr = tgtPoints.ToString();

            List<string> moreDecimalsRoundedIndexes = moreDecimalsIndexes.Select(x => RoundStringDouble(x, _smallestDepthLogDecimals)).ToList();
            List<string> moreDecimalsRoundedIndexesDuplicates = GetIndexDuplicates(moreDecimalsRoundedIndexes);

            foreach (string index in allIndexes)
            {
                if (_mnemonicsMismatchCount[mnemonic] >= _maxMismatchesLimit) break;

                string roundedIndex = RoundStringDouble(index, _smallestDepthLogDecimals);

                if (lessDecimalsIndexes.Contains(roundedIndex) && moreDecimalsIndexes.Contains(index))
                {
                    string lessDecimalsValue = Logs.LessDecimals[roundedIndex];
                    string moreDecimalsValue = Logs.MoreDecimals[index];
                    if (moreDecimalsRoundedIndexesDuplicates.Contains(roundedIndex))
                    {
                        AddUnequalServerDecimalsReportItem(mnemonic, roundedIndex, index, lessDecimalsValue, moreDecimalsValue, true, srcPointsStr, tgtPointsStr);
                    }
                    else if (!IsMnemonicDataEqual(lessDecimalsValue, moreDecimalsValue))
                    {
                        AddUnequalServerDecimalsReportItem(mnemonic, roundedIndex, index, lessDecimalsValue, moreDecimalsValue, false, srcPointsStr, tgtPointsStr);
                    }
                }
                else if (lessDecimalsIndexes.Contains(index) && !moreDecimalsRoundedIndexes.Contains(index))
                {
                    string lessDecimalsValue = Logs.LessDecimals[index];
                    AddUnequalServerDecimalsReportItem(mnemonic, index, null, lessDecimalsValue, null, false, srcPointsStr, tgtPointsStr);
                }
                else if (moreDecimalsIndexes.Contains(index) && !lessDecimalsIndexes.Contains(index))
                {
                    string moreDecimalsValue = Logs.MoreDecimals[index];
                    AddUnequalServerDecimalsReportItem(mnemonic, null, index, null, moreDecimalsValue, false, srcPointsStr, tgtPointsStr);
                }
            }
        }

        private bool IsMnemonicDataEqual(string sourceValue, string targetValue)
        {
            if (string.Equals(sourceValue, targetValue, StringComparison.Ordinal)) return true;
            if (double.TryParse(sourceValue, NumberStyles.Float, CultureInfo.InvariantCulture, out double sNum) &&
                double.TryParse(targetValue, NumberStyles.Float, CultureInfo.InvariantCulture, out double tNum))
            {
                if (_isRawDecimals || !_customDecimalPlaces.HasValue)
                {
                    return sNum == tNum;
                }
                int decimals = _customDecimalPlaces.Value;
                return Math.Round(sNum, decimals, MidpointRounding.AwayFromZero) == Math.Round(tNum, decimals, MidpointRounding.AwayFromZero);
            }
            return false;
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
                ReportItemColumns = CreateReportItemColumns(_isDepthLog),
                WarningMessage = _compareLogDataReportItems.Count >= MaxMismatchesLimit ? $"When finding {MaxMismatchesLimit:n0} mismatches while searching through data indexes for any mnemonic, we stop comparing the log data for that particular mnemonic. This is because {MaxMismatchesLimit:n0} is the maximum limit for mismatches during the search for each mnemonic. It indicates that there might be an issue with the compare log setup. However, you can still access the report for the comparison performed below." : null,
                JobDetails = $"SourceServer::{_sourceServerName}|TargetServer::{_targetServerName}|SourceLog::{sourceLog.Name}|TargetLog::{targetLog.Name}|Number of mismatches for shared mnemonics::{_compareLogDataReportItems.Count:n0}|Number of unshared mnemonics::{_unsharedMnemonics.Count:n0}"
            };
        }

        private ICollection<ReportItemColumn> CreateReportItemColumns(bool isDepthLog)
        {
            var reportItemColumns = new List<ReportItemColumn>();

            if (isDepthLog)
            {
                reportItemColumns.Add(new() { Name = "index", Type = ReportItemType.MEASURE });
            }
            else
            {
                reportItemColumns.Add(new() { Name = "index", Type = ReportItemType.DATE_TIME });
            }

            return reportItemColumns;
        }

        private string GetSharedIntervalReportFormat(WitsmlLog sourceLog, WitsmlLog targetLog)
        {
            return _isDepthLog ? $"\nIndex interval: {sourceLog.StartIndex.Value} - {sourceLog.EndIndex.Value}" : $"\nIndex interval: {sourceLog.StartDateTimeIndex} - {sourceLog.EndDateTimeIndex}";
        }

        private List<string> GetLogMnemonics(WitsmlLog log)
        {
            return log.LogCurveInfo.Select(logCurveInfo => logCurveInfo.Mnemonic).Skip(1).ToList();
        }

        private void AddReportItem(string mnemonic, string index, string sourceValue, string targetValue, string sourceDataPoints = null, string targetDataPoints = null)
        {
            _mnemonicsMismatchCount[mnemonic]++;
            _compareLogDataReportItems.Add(new CompareLogDataItem
            {
                Mnemonic = mnemonic,
                Index = index,
                SourceValue = sourceValue,
                TargetValue = targetValue,
                Delta = DeepComparison.DeepObjectComparer.CalculateDelta(sourceValue, targetValue, mnemonic),
                SourceDataPoints = sourceDataPoints,
                TargetDataPoints = targetDataPoints
            });
        }

        private void AddUnequalServerDecimalsReportItem(string mnemonic, string lessDecimalsIndex, string moreDecimalsIndex, string lessDecimalsValue, string moreDecimalsValue, bool isDuplicate = false, string sourceDataPoints = null, string targetDataPoints = null)
        {
            _mnemonicsMismatchCount[mnemonic]++;
            string srcVal = _sourceDepthLogDecimals < _targetDepthLogDecimals ? lessDecimalsValue : moreDecimalsValue;
            string tgtVal = _targetDepthLogDecimals < _sourceDepthLogDecimals ? lessDecimalsValue : moreDecimalsValue;
            string delta = DeepComparison.DeepObjectComparer.CalculateDelta(srcVal, tgtVal, mnemonic);
            if (_includeIndexDuplicates)
            {
                _compareLogDataReportItems.Add(new CompareLogDataUnequalServerDecimalsIndexDuplicateItem
                {
                    Mnemonic = mnemonic,
                    SourceIndex = _sourceDepthLogDecimals < _targetDepthLogDecimals ? lessDecimalsIndex : moreDecimalsIndex,
                    TargetIndex = _targetDepthLogDecimals < _sourceDepthLogDecimals ? lessDecimalsIndex : moreDecimalsIndex,
                    SourceValue = srcVal,
                    TargetValue = tgtVal,
                    Delta = delta,
                    IndexDuplicate = isDuplicate ? "X" : null,
                    SourceDataPoints = sourceDataPoints,
                    TargetDataPoints = targetDataPoints
                });
            }
            else
            {
                _compareLogDataReportItems.Add(new CompareLogDataUnequalServerDecimalsItem
                {
                    Mnemonic = mnemonic,
                    SourceIndex = _sourceDepthLogDecimals < _targetDepthLogDecimals ? lessDecimalsIndex : moreDecimalsIndex,
                    TargetIndex = _targetDepthLogDecimals < _sourceDepthLogDecimals ? lessDecimalsIndex : moreDecimalsIndex,
                    SourceValue = srcVal,
                    TargetValue = tgtVal,
                    Delta = delta,
                    SourceDataPoints = sourceDataPoints,
                    TargetDataPoints = targetDataPoints
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
            Dictionary<string, string> dict = new();
            if (logData?.Data != null)
            {
                foreach (var row in logData.Data)
                {
                    var parts = row.Data?.Split(CommonConstants.DataSeparator);
                    if (parts != null && parts.Length >= 2)
                    {
                        var key = parts[0];
                        if (!dict.ContainsKey(key))
                        {
                            dict[key] = parts[1];
                        }
                    }
                }
            }
            return dict;
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
            if (double.TryParse(value, NumberStyles.Float, CultureInfo.InvariantCulture, out double d))
            {
                return Math.Round(d, digits, MidpointRounding.AwayFromZero).ToString(CultureInfo.InvariantCulture);
            }
            return value;
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
            List<string> newIndexes = new();
            List<string> roundedIndexes = new();
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

        private List<string> FilterIndexesBySamplingInterval(List<string> sortedIndexes, double interval)
        {
            if (interval <= 0 || sortedIndexes.Count <= 1) return sortedIndexes;

            List<string> filtered = new();
            if (_isDepthLog)
            {
                double? lastVal = null;
                foreach (var idx in sortedIndexes)
                {
                    if (double.TryParse(idx, NumberStyles.Float, CultureInfo.InvariantCulture, out double currentVal))
                    {
                        if (!lastVal.HasValue || Math.Abs(currentVal - lastVal.Value) >= interval - 1e-6)
                        {
                            filtered.Add(idx);
                            lastVal = currentVal;
                        }
                    }
                    else
                    {
                        filtered.Add(idx);
                    }
                }
            }
            else
            {
                DateTime? lastVal = null;
                foreach (var idx in sortedIndexes)
                {
                    if (DateTime.TryParse(idx, CultureInfo.InvariantCulture, DateTimeStyles.AdjustToUniversal, out DateTime currentVal))
                    {
                        if (!lastVal.HasValue || Math.Abs((currentVal - lastVal.Value).TotalSeconds) >= interval - 1e-3)
                        {
                            filtered.Add(idx);
                            lastVal = currentVal;
                        }
                    }
                    else
                    {
                        filtered.Add(idx);
                    }
                }
            }
            return filtered;
        }

        private void ApplyCustomIndexInterval(WitsmlLog sourceLog, WitsmlLog targetLog, string startIndexStr, string endIndexStr)
        {
            if (string.IsNullOrWhiteSpace(startIndexStr) && string.IsNullOrWhiteSpace(endIndexStr)) return;

            if (_isDepthLog)
            {
                if (double.TryParse(startIndexStr, NumberStyles.Float, CultureInfo.InvariantCulture, out double userStart))
                {
                    if (sourceLog.StartIndex == null) sourceLog.StartIndex = new WitsmlIndex { Value = userStart.ToString(CultureInfo.InvariantCulture), Uom = CommonConstants.DepthIndex.DefaultUnit };
                    else
                    {
                        double s = StringHelpers.ToDouble(sourceLog.StartIndex.Value);
                        sourceLog.StartIndex.Value = (_isDecreasing ? Math.Min(s, userStart) : Math.Max(s, userStart)).ToString(CultureInfo.InvariantCulture);
                    }

                    if (targetLog.StartIndex == null) targetLog.StartIndex = new WitsmlIndex { Value = userStart.ToString(CultureInfo.InvariantCulture), Uom = CommonConstants.DepthIndex.DefaultUnit };
                    else
                    {
                        double t = StringHelpers.ToDouble(targetLog.StartIndex.Value);
                        targetLog.StartIndex.Value = (_isDecreasing ? Math.Min(t, userStart) : Math.Max(t, userStart)).ToString(CultureInfo.InvariantCulture);
                    }
                }
                if (double.TryParse(endIndexStr, NumberStyles.Float, CultureInfo.InvariantCulture, out double userEnd))
                {
                    if (sourceLog.EndIndex == null) sourceLog.EndIndex = new WitsmlIndex { Value = userEnd.ToString(CultureInfo.InvariantCulture), Uom = CommonConstants.DepthIndex.DefaultUnit };
                    else
                    {
                        double s = StringHelpers.ToDouble(sourceLog.EndIndex.Value);
                        sourceLog.EndIndex.Value = (_isDecreasing ? Math.Max(s, userEnd) : Math.Min(s, userEnd)).ToString(CultureInfo.InvariantCulture);
                    }

                    if (targetLog.EndIndex == null) targetLog.EndIndex = new WitsmlIndex { Value = userEnd.ToString(CultureInfo.InvariantCulture), Uom = CommonConstants.DepthIndex.DefaultUnit };
                    else
                    {
                        double t = StringHelpers.ToDouble(targetLog.EndIndex.Value);
                        targetLog.EndIndex.Value = (_isDecreasing ? Math.Max(t, userEnd) : Math.Min(t, userEnd)).ToString(CultureInfo.InvariantCulture);
                    }
                }
            }
            else
            {
                if (DateTime.TryParse(startIndexStr, CultureInfo.InvariantCulture, DateTimeStyles.AdjustToUniversal, out DateTime userStartTime))
                {
                    var userIso = userStartTime.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ");
                    if (string.IsNullOrEmpty(sourceLog.StartDateTimeIndex)) sourceLog.StartDateTimeIndex = userIso;
                    else
                    {
                        var s = DateTime.Parse(sourceLog.StartDateTimeIndex, CultureInfo.InvariantCulture);
                        sourceLog.StartDateTimeIndex = (s > userStartTime ? s : userStartTime).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ");
                    }

                    if (string.IsNullOrEmpty(targetLog.StartDateTimeIndex)) targetLog.StartDateTimeIndex = userIso;
                    else
                    {
                        var t = DateTime.Parse(targetLog.StartDateTimeIndex, CultureInfo.InvariantCulture);
                        targetLog.StartDateTimeIndex = (t > userStartTime ? t : userStartTime).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ");
                    }
                }
                if (DateTime.TryParse(endIndexStr, CultureInfo.InvariantCulture, DateTimeStyles.AdjustToUniversal, out DateTime userEndTime))
                {
                    var userIso = userEndTime.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ");
                    if (string.IsNullOrEmpty(sourceLog.EndDateTimeIndex)) sourceLog.EndDateTimeIndex = userIso;
                    else
                    {
                        var s = DateTime.Parse(sourceLog.EndDateTimeIndex, CultureInfo.InvariantCulture);
                        sourceLog.EndDateTimeIndex = (s < userEndTime ? s : userEndTime).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ");
                    }

                    if (string.IsNullOrEmpty(targetLog.EndDateTimeIndex)) targetLog.EndDateTimeIndex = userIso;
                    else
                    {
                        var t = DateTime.Parse(targetLog.EndDateTimeIndex, CultureInfo.InvariantCulture);
                        targetLog.EndDateTimeIndex = (t < userEndTime ? t : userEndTime).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ");
                    }
                }
            }
        }
    }
}
