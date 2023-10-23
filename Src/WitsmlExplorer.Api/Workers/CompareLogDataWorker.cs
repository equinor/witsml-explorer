using System;
using System.Collections.Generic;
using System.Linq;
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
        private List<CompareLogDataItem> _compareLogDataReportItems;
        private Dictionary<string, int> _mnemonicsMismatchCount;
        private const int MaxMismatchesLimit = 10000;
        private bool _isDecreasing;
        private bool _isDepthLog;

        public CompareLogDataWorker(ILogger<CompareLogDataJob> logger, IWitsmlClientProvider witsmlClientProvider, IDocumentRepository<Server, Guid> witsmlServerRepository = null) : base(witsmlClientProvider, logger)
        {
            _witsmlServerRepository = witsmlServerRepository;
        }
        public override async Task<(WorkerResult, RefreshAction)> Execute(CompareLogDataJob job)
        {
            Uri sourceHostname = GetSourceWitsmlClientOrThrow().GetServerHostname();
            Uri targetHostname = GetTargetWitsmlClientOrThrow().GetServerHostname();
            IEnumerable<Server> servers = _witsmlServerRepository == null ? new List<Server>() : await _witsmlServerRepository.GetDocumentsAsync();
            int sourceDepthLogDecimals = servers.FirstOrDefault((server) => server.Url.EqualsIgnoreCase(sourceHostname))?.DepthLogDecimals ?? 0;
            int targetDepthLogDecimals = servers.FirstOrDefault((server) => server.Url.EqualsIgnoreCase(targetHostname))?.DepthLogDecimals ?? 0;

            // Check if the number of decimals for both servers is equal. Throw an error if not.
            if (sourceDepthLogDecimals != targetDepthLogDecimals)
            {
                string message = $"CompareLogDataJob failed. Cases where servers have different numbers of decimals are not currently supported.";
                Logger.LogError(message);
                return (new WorkerResult(GetSourceWitsmlClientOrThrow().GetServerHostname(), false, message), null);
            }

            // Set up log report list
            _compareLogDataReportItems = new();

            // Set up mnemonics mismatch count dictionary
            _mnemonicsMismatchCount = new Dictionary<string, int>();

            // Get logs
            WitsmlLog sourceLog = await WorkerTools.GetLog(GetSourceWitsmlClientOrThrow(), job.SourceLog, ReturnElements.HeaderOnly);
            WitsmlLog targetLog = await WorkerTools.GetLog(GetTargetWitsmlClientOrThrow(), job.TargetLog, ReturnElements.HeaderOnly);

            try
            {
                VerifyLogs(sourceLog, targetLog);

                // Check log type
                _isDecreasing = sourceLog.Direction == WitsmlLog.WITSML_DIRECTION_DECREASING;
                _isDepthLog = sourceLog.IndexType == WitsmlLog.WITSML_INDEX_TYPE_MD;

                List<string> sourceLogMnemonics = GetLogMnemonics(sourceLog);
                List<string> targetLogMnemonics = GetLogMnemonics(targetLog);

                // Get all mnemonics in source and target log
                List<string> allMnemonics = sourceLogMnemonics.Union(targetLogMnemonics).ToList();

                // Get shared mnemonics in source and target log
                List<string> sharedMnemonics = sourceLogMnemonics.Intersect(targetLogMnemonics).ToList();

                foreach (string mnemonic in allMnemonics)
                {

                    _mnemonicsMismatchCount[mnemonic] = 0;
                    if (_compareLogDataReportItems.Count >= MaxMismatchesLimit) break;
                    if (sharedMnemonics.Contains(mnemonic))
                    {
                        await AddSharedMnemonicData(sourceLog, targetLog, mnemonic);
                    }
                    else if (sourceLogMnemonics.Contains(mnemonic))
                    {
                        await AddUnsharedMnemonicData(ServerType.Source, GetSourceWitsmlClientOrThrow(), sourceLog, mnemonic);

                    }
                    else if (targetLogMnemonics.Contains(mnemonic))
                    {
                        await AddUnsharedMnemonicData(ServerType.Target, GetTargetWitsmlClientOrThrow(), targetLog, mnemonic);
                    }
                    else
                    {
                        throw new ArgumentException($"mnemonic={mnemonic} does not exist in source log or target log.");
                    }
                }

                BaseReport report = GenerateReport(sourceLog, targetLog);
                job.JobInfo.Report = report;
            }
            catch (ArgumentException e)
            {
                string message = $"CompareLogDataJob failed. Description: {job.Description()}. Error: {e.Message}";
                Logger.LogError(message);
                return (new WorkerResult(GetSourceWitsmlClientOrThrow().GetServerHostname(), false, message), null);
            }

            Logger.LogInformation("{JobType} - Job successful", GetType().Name);
            WorkerResult workerResult = new(GetSourceWitsmlClientOrThrow().GetServerHostname(), true, $"Compared log data for log: '{sourceLog.Name}' and '{targetLog.Name}'", jobId: job.JobInfo.Id);
            return (workerResult, null);
        }

        private async Task AddSharedMnemonicData(WitsmlLog sourceLog, WitsmlLog targetLog, string mnemonic)
        {
            WitsmlLogData sourceLogData = await WorkerTools.GetLogDataForCurve(GetSourceWitsmlClientOrThrow(), sourceLog, mnemonic, Logger);
            WitsmlLogData targetLogData = await WorkerTools.GetLogDataForCurve(GetTargetWitsmlClientOrThrow(), targetLog, mnemonic, Logger);
            Dictionary<string, string> sourceData = WitsmlLogDataToDictionary(sourceLogData);
            Dictionary<string, string> targetData = WitsmlLogDataToDictionary(targetLogData);
            List<string> indexes = sourceData.Keys.Union(targetData.Keys).ToList();
            indexes = SortIndexes(indexes);

            foreach (string index in indexes)
            {
                if (_compareLogDataReportItems.Count >= MaxMismatchesLimit) break;
                if (sourceData.ContainsKey(index) && targetData.ContainsKey(index))
                {
                    string sourceValue = sourceData[index];
                    string targetValue = targetData[index];
                    if (!String.Equals(sourceValue, targetValue))
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

        private async Task AddUnsharedMnemonicData(ServerType serverType, IWitsmlClient witsmlClient, WitsmlLog log, string mnemonic)
        {
            WitsmlLogData mnemonicData = await WorkerTools.GetLogDataForCurve(witsmlClient, log, mnemonic, Logger);

            foreach (string dataRow in mnemonicData.Data.Select(row => row.Data))
            {
                if (_compareLogDataReportItems.Count >= MaxMismatchesLimit) break;

                var data = dataRow.Split(',');
                var index = data.First();
                var value = data.Last();

                if (serverType == ServerType.Source)
                {
                    AddReportItem(mnemonic, index, value, null);
                }
                else if (serverType == ServerType.Target)
                {
                    AddReportItem(mnemonic, index, null, value);
                }
                else
                {
                    throw new ArgumentException($"serverType={serverType} not supported.");
                }
            }
        }

        private BaseReport GenerateReport(WitsmlLog sourceLog, WitsmlLog targetLog)
        {
            var sortedMnemonicsMismatchCount = _mnemonicsMismatchCount.OrderByDescending(x => x.Value);
            string mnemonicsMismatchCountResult = "\nNumber of mismatches for each mnemonic:";
            foreach (KeyValuePair<string, int> keyValues in sortedMnemonicsMismatchCount)
            {
                mnemonicsMismatchCountResult += $"\n{keyValues.Key}: {keyValues.Value:n0}";
            }

            return new BaseReport
            {
                Title = $"Log data comparison",
                Summary = _compareLogDataReportItems.Count > 0
                ? $"Found {_compareLogDataReportItems.Count:n0} mismatches in the {(_isDepthLog ? "depth" : "time")} logs '{sourceLog.Name}' and '{targetLog.Name}':" + mnemonicsMismatchCountResult
                : $"No mismatches were found in the data indexes of the {(_isDepthLog ? "depth" : "time")} logs '{sourceLog.Name}' and '{targetLog.Name}'.",
                ReportItems = _compareLogDataReportItems,
                WarningMessage = _compareLogDataReportItems.Count >= MaxMismatchesLimit ? $"After finding {MaxMismatchesLimit:n0} mismatches in the data indexes, we stopped comparing logs since this is the maximum limit for mismatches during the search. Something is likely wrong with the compare log setup. However, the report for the comparison so far can be found below." : null,
            };
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
            return logData.Data?.ToDictionary(row => row.Data.Split(',').First(), row => row.Data.Split(',').Last());
        }

        private void VerifyLogs(WitsmlLog sourceLog, WitsmlLog targetLog)
        {
            if (sourceLog == null) throw new ArgumentException("Source log could not be fetched.");
            if (targetLog == null) throw new ArgumentException("Target log could not be fetched.");
            if (sourceLog.IndexType != targetLog.IndexType) throw new ArgumentException($"SourceLog.IndexType={sourceLog.IndexType} should match TargetLog.IndexType={targetLog.IndexType}");
            if (sourceLog.Direction != targetLog.Direction) throw new ArgumentException($"SourceLog.Direction={sourceLog.Direction} should match TargetLog.Direction={targetLog.Direction}");
        }
    }
}
