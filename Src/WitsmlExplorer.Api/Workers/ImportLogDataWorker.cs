using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.Data;
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
        private readonly IWitsmlClient _witsmlClient;
        public JobType JobType => JobType.ImportLogData;

        public ImportLogDataWorker(ILogger<ImportLogDataJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(logger)
        {
            _witsmlClient = witsmlClientProvider.GetClient();
        }
        public override async Task<(WorkerResult, RefreshAction)> Execute(ImportLogDataJob job)
        {
            int chunkSize = 1000;
            string wellUid = job.TargetLog.WellUid;
            string wellboreUid = job.TargetLog.WellboreUid;
            string logUid = job.TargetLog.Uid;
            WitsmlLog witsmlLog = await GetLogHeader(wellUid, wellboreUid, logUid);

            if (witsmlLog == null)
            {
                string reason = $"Did not find witsml log for wellUid: {wellUid}, wellboreUid: {wellboreUid}, logUid: {logUid}";
                return (new WorkerResult(_witsmlClient.GetServerHostname(), false, "Unable to find log", reason), null);
            }

            List<WitsmlLogCurveInfo> logCurveInfos = witsmlLog.LogCurveInfo.Where(logCurveInfo => job.Mnemonics.Contains(logCurveInfo.Mnemonic)).ToList();

            //Todo: find a way to determine the maximum amount of rows that can be sent to the WITSML server then pass that amount to the CreateImportQueries method
            WitsmlLogs[] queries = CreateImportQueries(job, chunkSize).ToArray();

            //Todo: update import progress for the user using websockets
            for (int i = 0; i < queries.Length; i++)
            {
                QueryResult result = await _witsmlClient.UpdateInStoreAsync(queries[i]);
                if (result.IsSuccessful)
                {
                    Logger.LogInformation("{JobType} - Query {QueryCount}/{CurrentQuery} successful", GetType().Name, queries.Length, i + 1);
                }
                else
                {
                    Logger.LogError("Job failed: {jobDescription}. Failed import at query:{QueryNumber} with the chunkSize of {ChunkSize} and total number of queries:{QueriesLength}",
                        job.Description(),
                        i,
                        chunkSize,
                        queries.Length);

                    return (new WorkerResult(_witsmlClient.GetServerHostname(), result.IsSuccessful, $"Failed to import curve data from row: {i * chunkSize}", result.Reason, witsmlLog.GetDescription()), null);
                }
            }

            Logger.LogInformation("{JobType} - Job successful", GetType().Name);

            RefreshLogObject refreshAction = new(_witsmlClient.GetServerHostname(), wellUid, wellboreUid, logUid, RefreshType.Update);
            string mnemonicsOnLog = string.Join(", ", logCurveInfos.Select(logCurveInfo => logCurveInfo.Mnemonic));
            WorkerResult workerResult = new(_witsmlClient.GetServerHostname(), true, $"Imported curve info values for mnemonics: {mnemonicsOnLog}, for log: {logUid}");
            return (workerResult, refreshAction);
        }

        private async Task<WitsmlLog> GetLogHeader(string wellUid, string wellboreUid, string logUid)
        {
            WitsmlLogs query = LogQueries.GetWitsmlLogById(wellUid, wellboreUid, logUid);
            WitsmlLogs result = await _witsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.HeaderOnly));
            return result?.Logs.FirstOrDefault();
        }

        private static IEnumerable<WitsmlLogs> CreateImportQueries(ImportLogDataJob job, int chunkSize)
        {
            return job.DataRows
                .Where(d => d.Count() > 1)
                .Select(row => new WitsmlData { Data = string.Join(',', row) })
                .Chunk(chunkSize)
                .Select(logData => new WitsmlLogs
                {
                    Logs = new List<WitsmlLog>
                    {
                        new WitsmlLog
                        {
                            Uid = job.TargetLog.Uid,
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
