using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;

using Witsml;
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
        public override async Task<(WorkerResult, RefreshAction)> Execute(CheckLogHeaderJob job, CancellationToken? cancellationToken = null)
        {
            string wellUid = job.LogReference.WellUid;
            string wellboreUid = job.LogReference.WellboreUid;
            string logUid = job.LogReference.Uid;
            string indexType = job.LogReference.IndexType;
            string jobId = job.JobInfo.Id;
            bool isDepthLog = indexType == WitsmlLog.WITSML_INDEX_TYPE_MD;
            string indexCurve;
            // Dictionaries that maps from a mnemonic to the mnemonics start or end index
            Dictionary<string, string> headerStartValues;
            Dictionary<string, string> headerEndValues;
            Dictionary<string, string> dataStartValues;
            Dictionary<string, string> dataEndValues;
            // These indexes are used to check the global start and end indexes for a log (not the ones found in logCurveInfo)
            string headerStartIndex;
            string headerEndIndex;
            string dataStartIndex;
            string dataEndIndex;

            // Get the header indexes
            (Dictionary<string, string>, Dictionary<string, string>, string, string, string)? headerResult = await GetHeaderValues(wellUid, wellboreUid, logUid, isDepthLog);
            if (headerResult == null)
            {
                string reason = $"Did not find witsml log for wellUid: {wellUid}, wellboreUid: {wellboreUid}, logUid: {logUid}";
                return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, "Unable to find log", reason, jobId: jobId), null);
            }
            (headerStartValues, headerEndValues, headerStartIndex, headerEndIndex, indexCurve) = headerResult.Value;

            // Get the data indexes
            (Dictionary<string, string>, Dictionary<string, string>, string, string)? dataResult = await GetDataValues(wellUid, wellboreUid, logUid, indexType, indexCurve);
            if (dataResult == null)
            {
                string reason = $"The log with wellUid: {wellUid}, wellboreUid: {wellboreUid}, logUid: {logUid} does not contain any data";
                return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, "No log data", reason, jobId: jobId), null);
            }
            (dataStartValues, dataEndValues, dataStartIndex, dataEndIndex) = dataResult.Value;

            List<CheckLogHeaderReportItem> mismatchingIndexes = GetMismatchingIndexes(headerStartValues, headerEndValues, dataStartValues, dataEndValues, headerStartIndex, headerEndIndex, dataStartIndex, dataEndIndex, isDepthLog);

            CheckLogHeaderReport report = GetReport(mismatchingIndexes, job.LogReference, isDepthLog);
            job.JobInfo.Report = report;

            Logger.LogInformation("{JobType} - Job successful", GetType().Name);

            WorkerResult workerResult = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, $"Checked header consistency for log: {logUid}", jobId: jobId);
            return (workerResult, null);
        }

        public async Task<(Dictionary<string, string>, Dictionary<string, string>, string, string, string)?> GetHeaderValues(string wellUid, string wellboreUid, string logUid, bool isDepthLog)
        {
            WitsmlLogs headerQuery = LogQueries.GetLogHeaderIndexes(wellUid, wellboreUid, logUid);
            WitsmlLogs headerResult = await GetTargetWitsmlClientOrThrow().GetFromStoreNullableAsync(headerQuery, new OptionsIn(ReturnElements.Requested));
            if (headerResult == null || headerResult.Objects.IsNullOrEmpty())
            {
                return null;
            }
            WitsmlLog headerResultLog = (WitsmlLog)headerResult.Objects.First();
            string headerEndIndex = isDepthLog ? headerResultLog.EndIndex.Value : headerResultLog.EndDateTimeIndex;
            string headerStartIndex = isDepthLog ? headerResultLog.StartIndex.Value : headerResultLog.StartDateTimeIndex;
            Dictionary<string, string> headerStartValues = headerResultLog.LogCurveInfo.ToDictionary(l => l.Mnemonic, l => (isDepthLog ? l.MinIndex?.Value : l.MinDateTimeIndex) ?? string.Empty);
            Dictionary<string, string> headerEndValues = headerResultLog.LogCurveInfo.ToDictionary(l => l.Mnemonic, l => (isDepthLog ? l.MaxIndex?.Value : l.MaxDateTimeIndex) ?? string.Empty);
            return (headerStartValues, headerEndValues, headerStartIndex, headerEndIndex, headerResultLog.IndexCurve.Value);
        }

        public async Task<(Dictionary<string, string>, Dictionary<string, string>, string, string)?> GetDataValues(string wellUid, string wellboreUid, string logUid, string indexType, string indexCurve)
        {
            WitsmlLogs dataQuery = LogQueries.GetLogContent(wellUid, wellboreUid, logUid, indexType, Enumerable.Empty<string>(), null, null);
            WitsmlLogs dataStartResult = await GetTargetWitsmlClientOrThrow().GetFromStoreNullableAsync(dataQuery, new OptionsIn(ReturnElements.DataOnly, MaxReturnNodes: 1));
            WitsmlLogs dataEndResult = await GetTargetWitsmlClientOrThrow().GetFromStoreNullableAsync(dataQuery, new OptionsIn(ReturnElements.DataOnly, RequestLatestValues: 1));
            if (dataStartResult.Objects.IsNullOrEmpty() || dataEndResult.Objects.IsNullOrEmpty())
            {
                return null;
            }
            WitsmlLog dataStartResultLog = (WitsmlLog)dataStartResult.Objects.First();
            WitsmlLog dataEndResultLog = (WitsmlLog)dataEndResult.Objects.First();
            if (dataStartResultLog.LogData == null || dataEndResultLog.LogData == null)
            {
                return null;
            }
            var endResultLogData = dataEndResultLog.LogData.Data?.Select(data => data.Data.Split(CommonConstants.DataSeparator)).ToList();
            string[] startResultLogData = dataStartResultLog.LogData.Data?.FirstOrDefault()?.Data.Split(CommonConstants.DataSeparator);
            if (startResultLogData.IsNullOrEmpty() || endResultLogData.IsNullOrEmpty())
            {
                return null;
            }
            IEnumerable<string> dataStartIndexes = startResultLogData.Select(data => data == String.Empty ? String.Empty : startResultLogData[0]);
            IEnumerable<string> dataEndIndexes = ExtractColumnIndexes(endResultLogData);
            string[] startMnemonics = dataStartResultLog.LogData.MnemonicList?.Split(CommonConstants.DataSeparator);
            string[] endMnemonics = dataEndResultLog.LogData.MnemonicList?.Split(CommonConstants.DataSeparator);
            if (startMnemonics == null || endMnemonics == null)
            {
                return null;
            }
            Dictionary<string, string> dataStartValues = dataStartIndexes.Select((value, index) => new { mnemonic = startMnemonics[index], value }).ToDictionary(d => d.mnemonic, d => d.value);
            Dictionary<string, string> dataEndValues = dataEndIndexes.Where(value => !string.IsNullOrEmpty(value)).Select((value, index) => new { mnemonic = endMnemonics[index], value }).ToDictionary(d => d.mnemonic, d => d.value);

            // Only the first data row is fetched for the start indexes. The mnemonics that don't have a value at the start index need to fetch their start index individually.
            dataStartValues = await AddStartIndexForMissingMnemonics(wellUid, wellboreUid, logUid, dataStartValues, startMnemonics, endMnemonics, indexCurve);

            return (dataStartValues, dataEndValues, dataStartIndexes.First(), dataEndIndexes.First());
        }

        private async Task<Dictionary<string, string>> AddStartIndexForMissingMnemonics(string wellUid, string wellboreUid, string logUid, Dictionary<string, string> dataStartValues, string[] startMnemonics, string[] endMnemonics, string indexCurve)
        {
            string[] missingMnemonics = endMnemonics.Where(mnemonic => !startMnemonics.Contains(mnemonic))
                .Concat(dataStartValues.Where((entry) => entry.Value == string.Empty).Select((entry) => entry.Key)).Distinct().ToArray();
            if (missingMnemonics.Any())
            {
                IEnumerable<WitsmlLogs> missingIndexQueries = missingMnemonics.Select(mnemonic => LogQueries.GetLogContent(wellUid, wellboreUid, logUid, null, new List<string>() { indexCurve, mnemonic }, null, null));
                // Request a data row for each mnemonic to get the start indexes of that mnemonic
                List<Task<WitsmlLogs>> missingDataResults = missingIndexQueries.Select(query => GetTargetWitsmlClientOrThrow().GetFromStoreNullableAsync(query, new OptionsIn(ReturnElements.DataOnly, MaxReturnNodes: 1))).ToList();
                await Task.WhenAll(missingDataResults);
                IEnumerable<WitsmlLog> missingLogs = missingDataResults.Select(r => (WitsmlLog)r.Result.Objects.First());
                IEnumerable<string> missingDataIndexes = missingLogs.Select(l => l.LogData?.Data?.FirstOrDefault()?.Data?.Split(CommonConstants.DataSeparator)?[0] ?? string.Empty);
                // Insert the indexes from the missing mnemonics to the original dict.
                missingDataIndexes
                    .Select((value, index) => new { mnemonic = missingMnemonics[index], value })
                    .ToList()
                    .ForEach(item => dataStartValues[item.mnemonic] = item.value);
            }
            return dataStartValues;
        }

        public static List<CheckLogHeaderReportItem> GetMismatchingIndexes(Dictionary<string, string> headerStartValues, Dictionary<string, string> headerEndValues, Dictionary<string, string> dataStartValues, Dictionary<string, string> dataEndValues, string headerStartIndex, string headerEndIndex, string dataStartIndex, string dataEndIndex, bool isDepthLog)
        {
            List<CheckLogHeaderReportItem> mismatchingIndexes = new();
            // Check the header indexes
            if (HasMismatch(isDepthLog, headerStartIndex, dataStartIndex, headerEndIndex, dataEndIndex))
            {
                mismatchingIndexes.Add(new CheckLogHeaderReportItem()
                {
                    Mnemonic = "Log Header",
                    HeaderStartIndex = headerStartIndex,
                    HeaderEndIndex = headerEndIndex,
                    DataStartIndex = dataStartIndex,
                    DataEndIndex = dataEndIndex,
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

            return mismatchingIndexes;
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

        private static CheckLogHeaderReport GetReport(List<CheckLogHeaderReportItem> mismatchingIndexes, LogObject logReference, bool isDepthLog)
        {
            return new CheckLogHeaderReport
            {
                Title = $"Check Log Header Index Report - {logReference.Name}",
                Summary = mismatchingIndexes.Count > 0
                    ? $"Found {mismatchingIndexes.Count} header index mismatches for {(isDepthLog ? "depth" : "time")} log '{logReference.Name}':"
                    : "No mismatches were found in the header indexes.",
                LogReference = logReference,
                ReportItems = mismatchingIndexes
            };
        }

        private static List<string> ExtractColumnIndexes(List<string[]> data, int indexColumn = 0)
        {
            List<string> result = Enumerable.Repeat(string.Empty, data.First().Length).ToList();
            foreach (var row in data)
            {
                for (int col = 0; col < row.Length; col++)
                {
                    if (!string.IsNullOrEmpty(row[col]))
                    {
                        result[col] = row[indexColumn];
                    }
                }
            }
            return result;
        }

        private static IEnumerable<string> ExtractColumnIndexes2(IEnumerable<IEnumerable<string>> data, int indexColumn = 0)
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
