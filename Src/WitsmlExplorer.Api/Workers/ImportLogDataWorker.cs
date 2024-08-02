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

using WitsmlExplorer.Api.Extensions;
using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers
{
    public class ImportLogDataWorker : BaseWorker<ImportLogDataJob>, IWorker
    {
        public JobType JobType => JobType.ImportLogData;

        public ImportLogDataWorker(ILogger<ImportLogDataJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider, logger) { }
        public override async Task<(WorkerResult, RefreshAction)> Execute(ImportLogDataJob job, CancellationToken? cancellationToken = null)
        {
            int maxUpdateAttempts = 2;
            string wellUid = job.TargetLog.WellUid;
            string wellboreUid = job.TargetLog.WellboreUid;
            string logUid = job.TargetLog.Uid;
            WitsmlLog witsmlLog = await GetLogHeader(wellUid, wellboreUid, logUid);

            if (witsmlLog == null)
            {
                string reason = $"Did not find witsml log for wellUid: {wellUid}, wellboreUid: {wellboreUid}, logUid: {logUid}";
                return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, "Unable to find log", reason), null);
            }

            WitsmlLogs addMnemonicsQuery = CreateAddMnemonicsQuery(job, witsmlLog);
            if (addMnemonicsQuery.Logs.FirstOrDefault().LogCurveInfo?.Count > 0)
            {
                QueryResult addMnemonicsResult = await GetTargetWitsmlClientOrThrow().UpdateInStoreAsync(addMnemonicsQuery);
                if (addMnemonicsResult.IsSuccessful)
                {
                    Logger.LogInformation("{JobType} - Successfully added missing mnemonics", GetType().Name);
                }
                else
                {
                    Logger.LogError("Job failed: {jobDescription}. Failed to add missing mnemonics", job.Description());
                    return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), addMnemonicsResult.IsSuccessful, $"Failed to add missing mnemonics", addMnemonicsResult.Reason, witsmlLog.GetDescription()), null);
                }
            }

            var dataRows = job.DataRows
                .Where(d => d.Count() > 1)
                .Select(row => new WitsmlData
                {
                    Data = string.Join(CommonConstants.DataSeparator, row)
                });

            var logData = new WitsmlLogData()
            {
                Data = dataRows.ToList(),
                UnitList = string.Join(CommonConstants.DataSeparator, job.Units)
            };
            var mnemonicList =
                string.Join(CommonConstants.DataSeparator, job.Mnemonics);

            var chunkMaxSize = await GetMaxBatchSize(job.Mnemonics.Count, CommonConstants.WitsmlFunctionType.WMLSUpdateInStore, CommonConstants.WitsmlQueryTypeName.Log);

            var queries = LogWorkerTools.GetUpdateLogDataQueries(witsmlLog.Uid, witsmlLog.UidWell, witsmlLog.UidWellbore, logData, chunkMaxSize, mnemonicList).ToArray();

            for (int i = 0; i < queries.Length; i++)
            {
                for (int attempt = 0; attempt < maxUpdateAttempts; attempt++)
                {
                    QueryResult result = await GetTargetWitsmlClientOrThrow().UpdateInStoreAsync(queries[i]);
                    if (result.IsSuccessful)
                    {
                        Logger.LogInformation("{JobType} - Query {CurrentQuery}/{QueryCount} successful", GetType().Name, i + 1, queries.Length);
                        break;
                    }
                    else if (attempt == maxUpdateAttempts - 1)
                    {
                        Logger.LogError("Job failed: {jobDescription}. Failed import at query:{QueryNumber} after {Attempts} attempts with the chunkSize of {ChunkSize} and total number of queries:{QueriesLength}",
                            job.Description(),
                            i,
                            maxUpdateAttempts,
                            chunkMaxSize,
                            queries.Length);

                        return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), result.IsSuccessful, $"Failed to import curve data from row: {i * chunkMaxSize}", result.Reason, witsmlLog.GetDescription()), null);
                    }
                }
                double progress = (i + 1) / (double)queries.Length;
                if (job.JobInfo != null) job.JobInfo.Progress = progress;
                job.ProgressReporter?.Report(progress);
            }

            Logger.LogInformation("{JobType} - Job successful", GetType().Name);

            RefreshObjects refreshAction = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), wellUid, wellboreUid, EntityType.Log, logUid);
            string mnemonicsString = string.Join(", ", job.Mnemonics);
            WorkerResult workerResult = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, $"Imported curve info values for mnemonics: {mnemonicsString}, for log: {logUid}");
            return (workerResult, refreshAction);
        }

        private async Task<WitsmlLog> GetLogHeader(string wellUid, string wellboreUid, string logUid)
        {
            WitsmlLogs query = LogQueries.GetWitsmlLogById(wellUid, wellboreUid, logUid);
            WitsmlLogs result = await GetTargetWitsmlClientOrThrow().GetFromStoreAsync(query, new OptionsIn(ReturnElements.HeaderOnly));
            return result?.Logs.FirstOrDefault();
        }

        private static WitsmlLogs CreateAddMnemonicsQuery(ImportLogDataJob job, WitsmlLog witsmlLog)
        {
            return new WitsmlLogs
            {
                Logs = new WitsmlLog
                {
                    Uid = job.TargetLog.Uid,
                    UidWellbore = job.TargetLog.WellboreUid,
                    UidWell = job.TargetLog.WellUid,
                    LogCurveInfo = Enumerable.Range(0, job.Mnemonics.Count())
                                .Where(i => !witsmlLog.LogCurveInfo.Select(l => l.Mnemonic).Contains(job.Mnemonics.ElementAt(i)))
                                .Select(i => new WitsmlLogCurveInfo
                                {
                                    Mnemonic = job.Mnemonics.ElementAt(i),
                                    Unit = string.IsNullOrEmpty(job.Units.ElementAt(i)) ? CommonConstants.Unit.Unitless : job.Units.ElementAt(i), // Can't updateInStore with an empty unit
                                    Uid = job.Mnemonics.ElementAt(i),
                                    TypeLogData = WitsmlLogCurveInfo.LogDataTypeDouble
                                }).ToList(),
                }.AsItemInList()
            };
        }
    }
}
