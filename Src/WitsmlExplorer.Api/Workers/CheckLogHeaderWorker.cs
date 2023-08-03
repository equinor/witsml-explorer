using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml.Data;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Models.Reports;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers
{
    public class CheckLogHeaderWorker : BaseWorker<CheckLogHeaderJob>, IWorker
    {
        public JobType JobType => JobType.CheckLogHeader;

        public CheckLogHeaderWorker(ILogger<CheckLogHeaderJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider, logger) { }
        public override async Task<(WorkerResult, RefreshAction)> Execute(CheckLogHeaderJob job)
        {
            string wellUid = job.LogReference.WellUid;
            string wellboreUid = job.LogReference.WellboreUid;
            string logUid = job.LogReference.Uid;
            string indexType = job.LogReference.IndexType;
            bool isDepthLog = indexType == WitsmlLog.WITSML_INDEX_TYPE_MD;

            // Get the header indexes
            WitsmlLogs headerQuery = LogQueries.GetLogHeaderIndexes(wellUid, wellboreUid, logUid);
            WitsmlLogs headerResult = await GetTargetWitsmlClientOrThrow().GetFromStoreNullableAsync(headerQuery, new OptionsIn(ReturnElements.Requested));
            if (headerResult == null)
            {
                string reason = $"Did not find witsml log for wellUid: {wellUid}, wellboreUid: {wellboreUid}, logUid: {logUid}";
                return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, "Unable to find log", reason, jobId: job.JobInfo.Id), null);
            }
            WitsmlLog headerResultLog = (WitsmlLog)headerResult.Objects.First();
            string headerEndIndex = isDepthLog ? headerResultLog.EndIndex.Value : headerResultLog.EndDateTimeIndex;
            string headerStartIndex = isDepthLog ? headerResultLog.StartIndex.Value : headerResultLog.StartDateTimeIndex;
            Dictionary<string, string> headerStartValues = headerResultLog.LogCurveInfo.ToDictionary(l => l.Mnemonic, l => (isDepthLog ? l.MinIndex?.Value : l.MinDateTimeIndex) ?? "");
            Dictionary<string, string> headerEndValues = headerResultLog.LogCurveInfo.ToDictionary(l => l.Mnemonic, l => (isDepthLog ? l.MaxIndex?.Value : l.MaxDateTimeIndex) ?? "");

            // Get the data for the data end and start indexes
            WitsmlLogs dataQuery = LogQueries.GetLogContent(wellUid, wellboreUid, logUid, indexType, Enumerable.Empty<string>(), null, null);
            WitsmlLogs dataStartResult = await GetTargetWitsmlClientOrThrow().GetFromStoreNullableAsync(dataQuery, new OptionsIn(ReturnElements.DataOnly, MaxReturnNodes: 1));
            WitsmlLogs dataEndResult = await GetTargetWitsmlClientOrThrow().GetFromStoreNullableAsync(dataQuery, new OptionsIn(ReturnElements.DataOnly, RequestLatestValues: 1));
            WitsmlLog dataStartResultLog = (WitsmlLog)dataStartResult.Objects.First();
            WitsmlLog dataEndResultLog = (WitsmlLog)dataEndResult.Objects.First();
            if (dataStartResultLog.LogData == null || dataEndResultLog.LogData == null)
            {
                string reason = $"The log with wellUid: {wellUid}, wellboreUid: {wellboreUid}, logUid: {logUid} does not contain any data";
                return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, "No log data", reason, jobId: job.JobInfo.Id), null);
            }
            IEnumerable<IEnumerable<string>> endResultLogData = dataEndResultLog.LogData.Data.Select(data => data.Data.Split(","));
            string[] startResultLogData = dataStartResultLog.LogData.Data.First().Data.Split(",");
            IEnumerable<string> dataStartIndexes = startResultLogData.Select(data => data == "" ? "" : startResultLogData[0]);
            IEnumerable<string> dataEndIndexes = ExtractColumnIndexes(endResultLogData);
            string[] startMnemonics = dataStartResultLog.LogData.MnemonicList.Split(",");
            string[] endMnemonics = dataEndResultLog.LogData.MnemonicList.Split(",");
            Dictionary<string, string> dataStartValues = dataStartIndexes.Select((value, index) => new { mnemonic = startMnemonics[index], value }).ToDictionary(d => d.mnemonic, d => d.value);
            Dictionary<string, string> dataEndValues = dataEndIndexes.Where(value => !string.IsNullOrEmpty(value)).Select((value, index) => new { mnemonic = endMnemonics[index], value }).ToDictionary(d => d.mnemonic, d => d.value);

            // Get the data for the data start indexes for the mnemonics without values in the first data point of the log
            string[] missingMnemonics = endMnemonics.Where(mnemonic => !startMnemonics.Contains(mnemonic)).ToArray();
            if (missingMnemonics.Any())
            {
                IEnumerable<WitsmlLogs> missingIndexQueries = missingMnemonics.Select(mnemonic => LogQueries.GetLogContent(wellUid, wellboreUid, logUid, null, new List<string>() { mnemonic }, null, null));
                // Request a data row for each mnemonic to get the start indexes of that mnemonic
                List<Task<WitsmlLogs>> missingDataResults = missingIndexQueries.Select(query => GetTargetWitsmlClientOrThrow().GetFromStoreNullableAsync(query, new OptionsIn(ReturnElements.DataOnly, MaxReturnNodes: 1))).ToList();
                await Task.WhenAll(missingDataResults);
                IEnumerable<WitsmlLog> missingLogs = missingDataResults.Select(r => (WitsmlLog)r.Result.Objects.First());
                IEnumerable<string> missingDataIndexes = missingLogs.Select(l => l.LogData.Data?.FirstOrDefault()?.Data?.Split(",")?[0] ?? "");
                List<string> list = missingDataIndexes.ToList();
                // Insert the indexes from the missing mnemonics to the original dict.
                missingDataIndexes
                    .Select((value, index) => new { mnemonic = missingMnemonics[index], value })
                    .ToList()
                    .ForEach(item => dataStartValues[item.mnemonic] = item.value);
            }



            // Check for mismatches
            List<CheckLogHeaderReportItem> mismatchingIndexes = new();
            string firstMnemonic = endMnemonics[0];
            // Check the header indexes
            if (HasMismatch(isDepthLog, headerStartIndex, dataStartValues[firstMnemonic], headerEndIndex, dataEndValues[firstMnemonic]))
            {
                mismatchingIndexes.Add(new CheckLogHeaderReportItem()
                {
                    Mnemonic = "Log Header",
                    HeaderStartIndex = headerStartIndex,
                    HeaderEndIndex = headerEndIndex,
                    DataStartIndex = dataStartIndexes.First(),
                    DataEndIndex = dataEndIndexes.First(),
                });
            }

            // Check the header logCurveInfo indexes
            foreach (string mnemonic in dataStartValues.Keys)
            {
                if (HasMismatch(isDepthLog, headerStartValues[mnemonic], dataStartValues[mnemonic], headerEndValues[mnemonic], dataEndValues[mnemonic]))
                {
                    mismatchingIndexes.Add(new CheckLogHeaderReportItem()
                    {
                        Mnemonic = mnemonic,
                        HeaderStartIndex = headerStartValues[mnemonic],
                        HeaderEndIndex = headerEndValues[mnemonic],
                        DataStartIndex = dataStartValues[mnemonic],
                        DataEndIndex = dataEndValues[mnemonic],
                    });
                }
            }

            CheckLogHeaderReport report = new()
            {
                Title = $"Check Log Header Index Report - {job.LogReference.Name}",
                Summary = mismatchingIndexes.Count > 0
                    ? $"Found {mismatchingIndexes.Count} header index mismatches for {(isDepthLog ? "depth" : "time")} log '{job.LogReference.Name}':"
                    : "No mismatches were found in the header indexes.",
                LogReference = job.LogReference,
                ReportItems = mismatchingIndexes
            };
            job.JobInfo.Report = report;
            Logger.LogInformation("{JobType} - Job successful", GetType().Name);

            WorkerResult workerResult = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, $"Checked header consistency for log: {logUid}", jobId: job.JobInfo.Id);
            return (workerResult, null);
        }

        private static bool HasMismatch(bool isDepthLog, string startIndex1, string startIndex2, string endIndex1, string endIndex2)
        {
            if (isDepthLog || string.IsNullOrEmpty(startIndex1) || string.IsNullOrEmpty(endIndex1) || string.IsNullOrEmpty(startIndex2) || string.IsNullOrEmpty(endIndex2))
            {
                return startIndex1 != startIndex2 || endIndex1 != endIndex2;
            }
            else
            {
                return DateTime.Parse(startIndex1) != DateTime.Parse(startIndex2) || DateTime.Parse(endIndex1) != DateTime.Parse(endIndex2);
            }
        }

        private static IEnumerable<string> ExtractColumnIndexes(IEnumerable<IEnumerable<string>> data, int indexColumn = 0)
        {
            List<string> result = Enumerable.Repeat(string.Empty, data.First().Count()).ToList();
            List<IEnumerable<string>> list = data.ToList();

            int rows = list.Count;

            for (int row = 0; row < rows; row++)
            {
                List<string> rowList = list[row].ToList();
                for (int col = 0; col < rowList.Count; col++)
                {
                    if (!string.IsNullOrEmpty(rowList[col]))
                    {
                        result[col] = rowList[indexColumn];
                    }
                }
            }
            return result;
        }
    }
}
