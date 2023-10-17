using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.Data;
using Witsml.Data.Curves;
using Witsml.Extensions;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Middleware;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Models.Reports;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers
{
    public class CompareLogDataWorker : BaseWorker<CompareLogDataJob>, IWorker
    {
        public JobType JobType => JobType.CompareLogData;
        private List<CompareLogDataItem> _compareLogDataReportItems;
        private bool _isDecreasing;
        private bool _isDepthLog;

        public CompareLogDataWorker(ILogger<CompareLogDataJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider, logger) { }
        public override async Task<(WorkerResult, RefreshAction)> Execute(CompareLogDataJob job)
        {
            // // Set up log report list
            _compareLogDataReportItems = new();

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
            WitsmlLogData sourceLogData = await ReadMnemonicData(GetSourceWitsmlClientOrThrow(), sourceLog, mnemonic);
            WitsmlLogData targetLogData = await ReadMnemonicData(GetTargetWitsmlClientOrThrow(), targetLog, mnemonic);
            Dictionary<string, string> sourceData = WitsmlLogDataToDictionary(sourceLogData);
            Dictionary<string, string> targetData = WitsmlLogDataToDictionary(targetLogData);
            List<string> indexes = sourceData.Keys.Union(targetData.Keys).ToList();
            indexes = SortIndexes(indexes);

            foreach (string index in indexes)
            {
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
            WitsmlLogData mnemonicData = await ReadMnemonicData(witsmlClient, log, mnemonic);

            foreach (string dataRow in mnemonicData.Data.Select(row => row.Data))
            {
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

        private async Task<WitsmlLogData> ReadMnemonicData(IWitsmlClient witsmlClient, WitsmlLog log, string mnemonic)
        {
            await using LogDataReader logDataReader = new(witsmlClient, log, mnemonic.AsSingletonList(), Logger);
            WitsmlLogData mnemonicData = await logDataReader.GetNextBatch();
            var mnemonicList = mnemonicData?.MnemonicList;
            var unitList = mnemonicData?.UnitList;

            List<WitsmlData> data = new();
            while (mnemonicData != null)
            {
                data.AddRange(mnemonicData.Data);
                mnemonicData = await logDataReader.GetNextBatch();
            }

            return new WitsmlLogData
            {
                MnemonicList = mnemonicList,
                UnitList = unitList,
                Data = data
            };
        }

        private BaseReport GenerateReport(WitsmlLog sourceLog, WitsmlLog targetLog)
        {
            return new BaseReport
            {
                Title = $"Compare Log Data",
                Summary = _compareLogDataReportItems.Count > 0
                    ? $"There are {_compareLogDataReportItems.Count} mismatches in the data indexes of the {(_isDepthLog ? "depth" : "time")} logs '{sourceLog.Name}' and '{targetLog.Name}':"
                    : $"No mismatches were found in the data indexes of the {(_isDepthLog ? "depth" : "time")} logs '{sourceLog.Name}' and '{targetLog.Name}'.",
                ReportItems = _compareLogDataReportItems
            };
        }


        private List<string> GetLogMnemonics(WitsmlLog log)
        {
            return log.LogCurveInfo.Select(logCurveInfo => logCurveInfo.Mnemonic).Skip(1).ToList();
        }

        private void AddReportItem(string mnemonic, string index, string sourceValue, string targetValue)
        {
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
                return _isDepthLog ? indexes.OrderByDescending(double.Parse).ToList() : indexes.OrderByDescending(DateTime.Parse).ToList();
            }
            else
            {
                return _isDepthLog ? indexes.OrderBy(double.Parse).ToList() : indexes.OrderBy(DateTime.Parse).ToList();
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
