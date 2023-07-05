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

            // Get the data for the data end and start indexes
            WitsmlLogs dataQuery = LogQueries.GetLogContent(wellUid, wellboreUid, logUid, null, Enumerable.Empty<string>(), null, null);
            WitsmlLogs dataStartResult = await GetTargetWitsmlClientOrThrow().GetFromStoreNullableAsync(dataQuery, new OptionsIn(ReturnElements.Requested, MaxReturnNodes: 1));
            if (dataStartResult == null)
            {
                string reason = $"Did not find witsml log for wellUid: {wellUid}, wellboreUid: {wellboreUid}, logUid: {logUid}";
                return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, "Unable to find log", reason), null);
            }
            WitsmlLogs dataEndResult = await GetTargetWitsmlClientOrThrow().GetFromStoreNullableAsync(dataQuery, new OptionsIn(ReturnElements.Requested, RequestLatestValues: 1));
            WitsmlLog dataStartResultLog = (WitsmlLog)dataStartResult.Objects.First();
            WitsmlLog dataEndResultLog = (WitsmlLog)dataEndResult.Objects.First();
            IEnumerable<IEnumerable<string>> endResultLogData = dataEndResultLog.LogData.Data.Select(data => data.Data.Split(","));
            string[] startResultLogData = dataStartResultLog.LogData.Data.First().Data.Split(",");
            IEnumerable<string> dataStartIndexes = startResultLogData.Select(data => data == "" ? "" : startResultLogData[0]);
            IEnumerable<string> dataEndIndexes = ExtractColumnIndexes(endResultLogData);
            string[] mnemonics = dataStartResultLog.LogData.MnemonicList.Split(",");
            Dictionary<string, string> dataStartValues = dataStartIndexes.Select((value, index) => new { mnemonic = mnemonics[index], value }).ToDictionary(d => d.mnemonic, d => d.value);
            Dictionary<string, string> dataEndValues = dataEndIndexes.Select((value, index) => new { mnemonic = mnemonics[index], value }).ToDictionary(d => d.mnemonic, d => d.value);

            // Get the data for the data start indexes for the mnemonics without values in the first data point of the log
            string[] missingMnemonics = mnemonics.Where(mnemonic => dataStartValues[mnemonic] == "").ToArray();
            if (missingMnemonics.Any())
            {
                IEnumerable<WitsmlLogs> missingIndexQueries = missingMnemonics.Select(mnemonic => LogQueries.GetLogContent(wellUid, wellboreUid, logUid, null, new List<string>() { mnemonic }, null, null));
                // Request a data row for each mnemonic to get the start indexes of that mnemonic
                IEnumerable<Task<WitsmlLogs>> missingDataResults = missingIndexQueries.Select(query => GetTargetWitsmlClientOrThrow().GetFromStoreNullableAsync(query, new OptionsIn(ReturnElements.Requested, MaxReturnNodes: 1)));
                await Task.WhenAll(missingDataResults);
                IEnumerable<WitsmlLog> missingLogs = missingDataResults.Select(r => (WitsmlLog)r.Result.Objects.First());
                IEnumerable<string> missingDataIndexes = missingLogs.Select(l => l.LogData.Data.First().Data.Split(",")[0]);
                List<string> list = missingDataIndexes.ToList();
                // Insert the indexes from the missing mnemonics to the original dict.
                missingDataIndexes
                    .Select((value, index) => new { mnemonic = missingMnemonics[index], value })
                    .ToList()
                    .ForEach(item => dataStartValues[item.mnemonic] = item.value);
            }

            // Get the header indexes
            WitsmlLogs headerQuery = LogQueries.GetLogHeaderIndexes(wellUid, wellboreUid, logUid);
            WitsmlLogs headerResult = await GetTargetWitsmlClientOrThrow().GetFromStoreNullableAsync(headerQuery, new OptionsIn(ReturnElements.Requested));
            WitsmlLog headerResultLog = (WitsmlLog)headerResult.Objects.First();
            WitsmlIndex headerEndIndex = headerResultLog.EndIndex;
            WitsmlIndex headerStartIndex = headerResultLog.StartIndex;
            Dictionary<string, string> headerStartValues = headerResultLog.LogCurveInfo.ToDictionary(l => l.Mnemonic, l => l.MinIndex?.Value ?? "");
            Dictionary<string, string> headerEndValues = headerResultLog.LogCurveInfo.ToDictionary(l => l.Mnemonic, l => l.MaxIndex?.Value ?? "");

            List<CheckLogHeaderReportItem> mismatchingIndexes = new();
            string firstMnemonic = mnemonics[0];
            // Check the header indexes
            if (headerEndIndex.Value != dataEndValues[firstMnemonic] || headerStartIndex.Value != dataStartValues[firstMnemonic])
            {
                mismatchingIndexes.Add(new CheckLogHeaderReportItem()
                {
                    Mnemonic = "Header",
                    HeaderStartIndex = headerStartIndex.Value,
                    HeaderEndIndex = headerEndIndex.Value,
                    DataStartIndex = dataStartIndexes.First(),
                    DataEndIndex = dataEndIndexes.First(),
                });
            }

            // Check the header logCurveInfo indexes
            foreach (string mnemonic in dataStartValues.Keys)
            {
                if (dataStartValues[mnemonic] != headerStartValues[mnemonic] || dataEndValues[mnemonic] != headerEndValues[mnemonic])
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
                    ? $"Found {mismatchingIndexes.Count} header index mismatches:"
                    : "No mismatches were found in the header indexes.",
                LogReference = job.LogReference,
                ReportItems = mismatchingIndexes
            };
            job.JobInfo.Report = report;
            Logger.LogInformation("{JobType} - Job successful", GetType().Name);

            WorkerResult workerResult = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, $"Checked header consistency for log: {logUid}");
            return (workerResult, null);
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
