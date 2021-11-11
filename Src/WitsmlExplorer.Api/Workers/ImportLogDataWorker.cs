using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Serilog;
using Witsml;
using Witsml.Data;
using Witsml.ServiceReference;
using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Extensions;
using WitsmlExplorer.Api.Query;

namespace WitsmlExplorer.Api.Workers
{
    public class ImportLogDataWorker : BaseWorker<ImportLogDataJob>, IWorker
    {
        private readonly IWitsmlClient witsmlClient;
        public JobType JobType => JobType.ImportLogData;

        public ImportLogDataWorker(IWitsmlClientProvider witsmlClientProvider)
        {
            witsmlClient = witsmlClientProvider.GetClient();
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(ImportLogDataJob job)
        {
            var chunkSize = 1000;
            var wellUid = job.TargetLog.WellUid;
            var wellboreUid = job.TargetLog.WellboreUid;
            var logUid = job.TargetLog.LogUid;
            var witsmlLog = await GetLogHeader(wellUid, wellboreUid, logUid);

            if (witsmlLog == null)
            {
                var reason = $"Did not find witsml log for wellUid: {wellUid}, wellboreUid: {wellboreUid}, logUid: {logUid}";
                return (new WorkerResult(witsmlClient.GetServerHostname(), false, "Unable to find log", reason), null);
            }

            var logCurveInfos = witsmlLog.LogCurveInfo.Where(logCurveInfo => job.Mnemonics.Contains(logCurveInfo.Mnemonic)).ToList();

            //Todo: find a way to determine the maximum amount of rows that can be sent to the WITSML server then pass that amount to the CreateImportQueries method
            var queries = CreateImportQueries(job, chunkSize).ToArray();

            //Todo: update import progress for the user using websockets
            for (var i = 0; i < queries.Length; i++)
            {
                var result = await witsmlClient.UpdateInStoreAsync(queries[i]);
                if (result.IsSuccessful)
                {
                    Log.Information("{JobType} - Query {QueryCount}/{CurrentQuery} successful", GetType().Name, queries.Length, i + 1);
                }
                else
                {
                    Log.Error("Failed to import curve data for log object. WellUid: {WellUid}, WellboreUid: {WellboreUid}, Uid: {LogUid}, Mnemonics: {MnemonicsString}. Failed import at query:{QueryNumber} with the chunkSize of {ChunkSize} and total number of queries:{QueriesLength}",
                        wellUid,
                        wellboreUid,
                        logUid,
                        string.Join(", ", job.Mnemonics),
                        i,
                        chunkSize,
                        queries.Length);

                    return (new WorkerResult(witsmlClient.GetServerHostname(), result.IsSuccessful, $"Failed to import curve data from row: {i * chunkSize}", result.Reason, witsmlLog.GetDescription()), null);
                }
            }

            Log.Information("{JobType} - Job successful", GetType().Name);

            var refreshAction = new RefreshLogObject(witsmlClient.GetServerHostname(), wellUid, wellboreUid, logUid, RefreshType.Update);
            var mnemonicsOnLog = string.Join(", ", logCurveInfos.Select(logCurveInfo => logCurveInfo.Mnemonic));
            var workerResult = new WorkerResult(witsmlClient.GetServerHostname(), true, $"Imported curve info values for mnemonics: {mnemonicsOnLog}, for log: {logUid}");
            return (workerResult, refreshAction);
        }

        private async Task<WitsmlLog> GetLogHeader(string wellUid, string wellboreUid, string logUid)
        {
            var query = LogQueries.GetWitsmlLogById(wellUid, wellboreUid, logUid);
            var result = await witsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.HeaderOnly));
            return result?.Logs.FirstOrDefault();
        }

        private static IEnumerable<WitsmlLogs> CreateImportQueries(ImportLogDataJob job, int chunkSize)
        {
            return job.DataRows
                .Select(row => new WitsmlData { Data = string.Join(',', row) })
                .Chunked(chunkSize)
                .Select(logData => new WitsmlLogs
                {
                    Logs = new List<WitsmlLog>
                    {
                        new WitsmlLog
                        {
                            Uid = job.TargetLog.LogUid,
                            UidWellbore = job.TargetLog.WellboreUid,
                            UidWell = job.TargetLog.WellUid,
                            LogData = new WitsmlLogData
                            {
                                Data = logData.ToList(),
                                MnemonicList = string.Join(',', job.Mnemonics),
                                UnitList = string.Join(',', job.Units)
                            }
                        }
                    },
                });
        }
    }
}
