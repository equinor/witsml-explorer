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

        public CompareLogDataWorker(ILogger<CompareLogDataJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider, logger) { }
        public override async Task<(WorkerResult, RefreshAction)> Execute(CompareLogDataJob job)
        {
            string jobId = job.JobInfo.Id;
            // // Set up log report list
            _compareLogDataReportItems = new();

            // Get log queries
            WitsmlLogs sourceLogQuery = LogQueries.GetWitsmlLogById(job.SelectedLog.WellUid, job.SelectedLog.WellboreUid, job.SelectedLog.Uid);
            WitsmlLogs targetLogQuery = LogQueries.GetWitsmlLogById(job.TargetLog.WellUid, job.TargetLog.WellboreUid, job.TargetLog.Uid);

            // Get log header responses
            WitsmlLogs selectedLogHeaderResponse = await GetSourceWitsmlClientOrThrow().GetFromStoreAsync(sourceLogQuery, new OptionsIn(ReturnElements.HeaderOnly));
            WitsmlLogs targetLogHeaderResponse = await GetTargetWitsmlClientOrThrow().GetFromStoreAsync(targetLogQuery, new OptionsIn(ReturnElements.HeaderOnly));

            // Get log headers
            WitsmlLog selectedLogHeader = selectedLogHeaderResponse.Logs.FirstOrDefault();
            WitsmlLog targetLogHeader = targetLogHeaderResponse.Logs.FirstOrDefault();

            bool isTimeLog = selectedLogHeader.IndexType == WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME;

            // Get log mnemonics
            List<string> selectedLogMnemonics = selectedLogHeader.LogCurveInfo.Select(logCurveInfo => logCurveInfo.Mnemonic).Skip(1).ToList();
            List<string> targetLogMnemonics = targetLogHeader.LogCurveInfo.Select(logCurveInfo => logCurveInfo.Mnemonic).Skip(1).ToList();

            // Get all mnemonics in selected and target log
            List<string> allMnemonics = selectedLogMnemonics.Union(targetLogMnemonics).ToList();

            // Get shared mnemonics in selected and target log
            List<string> sharedMnemonics = selectedLogMnemonics.Intersect(targetLogMnemonics).ToList();

            foreach (string mnemonic in allMnemonics)
            {
                if (sharedMnemonics.Contains(mnemonic))
                {
                    Console.WriteLine($"mnemonic is intersecting: {mnemonic}");
                    await AddSharedMnemonicData(selectedLogHeader, targetLogHeader, mnemonic, isTimeLog);
                }
                else if (selectedLogMnemonics.Contains(mnemonic))
                {
                    Console.WriteLine($"mnemonic={mnemonic} is in selected log.");
                    await AddUnsharedMnemonicData(ServerType.Source, GetSourceWitsmlClientOrThrow(), selectedLogHeader, mnemonic);

                }
                else if (targetLogMnemonics.Contains(mnemonic))
                {
                    Console.WriteLine($"mnemonic={mnemonic} is in target log.");
                    await AddUnsharedMnemonicData(ServerType.Target, GetTargetWitsmlClientOrThrow(), targetLogHeader, mnemonic);

                }
            }

            BaseReport report = GenerateReport(selectedLogHeader, targetLogHeader, isTimeLog);
            job.JobInfo.Report = report;

            Logger.LogInformation("{JobType} - Job successful", GetType().Name);

            WorkerResult workerResult = new(GetSourceWitsmlClientOrThrow().GetServerHostname(), true, $"Compared log data for log: {selectedLogHeader.Name} and {targetLogHeader.Name}", jobId: jobId);
            return (workerResult, null);
        }

        private BaseReport GenerateReport(WitsmlLog selectedLogHeader, WitsmlLog targetLogHeader, bool isTimeLog)
        {
            return new BaseReport
            {
                Title = $"Compare Log Data",
                Summary = _compareLogDataReportItems.Count > 0
                    ? $"There are {_compareLogDataReportItems.Count} mismatches in the data indexes of the {(isTimeLog ? "time" : "depth")} logs '{selectedLogHeader.Name}' and '{targetLogHeader.Name}':"
                    : $"No mismatches were found in the data indexes of the {(isTimeLog ? "time" : "depth")} logs '{selectedLogHeader.Name}' and '{targetLogHeader.Name}'.",
                ReportItems = _compareLogDataReportItems
            };
        }

        private async Task<WitsmlLogData> ReadMnemonicData(IWitsmlClient witsmlClient, WitsmlLog logHeader, string mnemonic)
        {
            await using LogDataReader logDataReader = new(witsmlClient, logHeader, mnemonic.AsSingletonList(), Logger);
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

        private async Task AddSharedMnemonicData(WitsmlLog sourceLogHeader, WitsmlLog targetLogHeader, string mnemonic, bool isTimeLog)
        {
            WitsmlLogData sourceLogData = await ReadMnemonicData(GetSourceWitsmlClientOrThrow(), sourceLogHeader, mnemonic);
            WitsmlLogData targetLogData = await ReadMnemonicData(GetTargetWitsmlClientOrThrow(), targetLogHeader, mnemonic);
            Dictionary<string, string> sourceData = sourceLogData.Data?.ToDictionary(row => row.Data.Split(',').First(), row => row.Data.Split(',').Last());
            Dictionary<string, string> targetData = targetLogData.Data?.ToDictionary(row => row.Data.Split(',').First(), row => row.Data.Split(',').Last());
            List<string> sourceIndexes = new List<string>(sourceData.Keys);
            List<string> targetIndexes = new List<string>(targetData.Keys);
            List<string> indexes = sourceIndexes.Union(targetIndexes).ToList();



            if (isTimeLog)
            {
                // indexes = indexes.OrderBy(DateTime.Parse)
                //                         .Select(x => x)
                //                         .ToList();
                Console.WriteLine("Is time log");
            }
            else
            {
                indexes = indexes.OrderBy(double.Parse)
                                        .Select(x => x)
                                        .ToList();
            }
            Console.WriteLine(string.Join(",", sourceIndexes));
            Console.WriteLine(string.Join(",", targetIndexes));
            Console.WriteLine(string.Join(",", indexes));

            foreach (string index in indexes)
            {
                if (sourceData.ContainsKey(index) && targetData.ContainsKey(index))
                {
                    Console.WriteLine($"both logs contains index={index}");
                    string sourceValue = sourceData[index];
                    string targetValue = targetData[index];
                    if (sourceValue != targetValue)
                    {
                        AddReportItem(mnemonic, index, sourceValue, targetValue);
                    }
                }
                else if (sourceData.ContainsKey(index))
                {
                    Console.WriteLine($"source log contains index={index}");
                    string sourceValue = sourceData[index];
                    AddReportItem(mnemonic, index, sourceValue, "");
                }
                else if (targetData.ContainsKey(index))
                {
                    Console.WriteLine($"target log contains index={index}");
                    string targetValue = targetData[index];
                    AddReportItem(mnemonic, index, "", targetValue);
                }
            }
        }

        private async Task AddUnsharedMnemonicData(ServerType serverType, IWitsmlClient witsmlClient, WitsmlLog logHeader, string mnemonic)
        {
            // TODO: check server type from witsmlClient instead of explicitly setting it with serverType
            WitsmlLogData mnemonicData = await ReadMnemonicData(witsmlClient, logHeader, mnemonic);

            foreach (string dataRow in mnemonicData.Data.Select(row => row.Data))
            {
                var data = dataRow.Split(',');
                var index = data.First();
                var value = data.Last();
                if (serverType == ServerType.Source)
                {
                    AddReportItem(mnemonic, index, value, "");
                }
                else if (serverType == ServerType.Target)
                {
                    AddReportItem(mnemonic, index, "", value);
                }
                else
                {
                    throw new ArgumentException($"serverType={serverType} not supported.");
                }
            }
        }

    }
}
