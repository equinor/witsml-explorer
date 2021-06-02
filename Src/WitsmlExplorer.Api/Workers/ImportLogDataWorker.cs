using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Serilog;
using Witsml;
using Witsml.Data;
using Witsml.Data.Curves;
using Witsml.Query;
using Witsml.ServiceReference;
using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Extensions;

namespace WitsmlExplorer.Api.Workers
{
    public interface IImportLogDataWorker
    {
        Task<(WorkerResult workerResult, RefreshLogObject refreshAction)> Execute(ImportLogDataJob job);
    }

    public class ImportLogDataWorker : IImportLogDataWorker
    {
        private readonly IWitsmlClient witsmlClient;

        public ImportLogDataWorker(IWitsmlClientProvider witsmlClientProvider)
        {
            witsmlClient = witsmlClientProvider.GetClient();
        }

        private async Task<WitsmlLog> GetLogHeader(string wellUid, string wellboreUid, string logUid)
        {
            var query = LogQueries.QueryById(wellUid, wellboreUid, logUid);
            var result = await witsmlClient.GetFromStoreAsync(query, OptionsIn.HeaderOnly);
            return result.Logs.FirstOrDefault();
        }

        private static IEnumerable<WitsmlLogs> CreateImportQueries(WitsmlLog witsmlLog, bool filterExisting)
        {

            return new List<WitsmlLogs>
            {
                new WitsmlLogs
                {
                    Logs = new List<WitsmlLog>
                    {
                        witsmlLog
                    },
                }
            };
        }

        public async Task<(WorkerResult workerResult, RefreshLogObject refreshAction)> Execute(ImportLogDataJob job)
        {
            var wellUid = job.TargetLog.WellUid;
            var wellboreUid = job.TargetLog.WellboreUid;
            var logUid = job.TargetLog.LogUid;
            var witsmlLog = await GetLogHeader(wellUid, wellboreUid, logUid);
            var logCurveInfos = witsmlLog.LogCurveInfo.Where(logCurveInfo => job.Mnemonics.Contains(logCurveInfo.Mnemonic)).ToList();

            if (witsmlLog == null)
            {
                var reason = $"Did not find witsml log for wellUid: {wellUid}, wellboreUid: {wellboreUid}, logUid: {logUid}";
                return (new WorkerResult(witsmlClient.GetServerHostname(), false, "Unable to find log", reason), null);
            }
            //TODO: split data into batches as some servers have limitations
            witsmlLog.LogData = new WitsmlLogData
            {
                Data = job.DataRows.Select(row => new WitsmlData { Data = string.Join(',', row) }).ToList(),
                MnemonicList = string.Join(',', job.Mnemonics),
                UnitList = string.Join(',', job.Units)
            };

            var queries = CreateImportQueries(witsmlLog, true);
            foreach (var query in queries)
            {
                var result = await witsmlClient.UpdateInStoreAsync(query);
                if (result.IsSuccessful)
                {
                    Log.Information("{JobType} - Job successful.", GetType().Name);
                }
                else
                {
                    Log.Error("Failed to add mnemonics for log object. WellUid: {WellUid}, WellboreUid: {WellboreUid}, Uid: {LogUid}, Mnemonics: {MnemonicsString}",
                        wellUid,
                        wellboreUid,
                        logUid,
                        string.Join(", ", job.Mnemonics));

                    return (new WorkerResult(witsmlClient.GetServerHostname(), false, "Failed to add logdata", result.Reason, witsmlLog.GetDescription()), null);
                }
            }

            var refreshAction = new RefreshLogObject(witsmlClient.GetServerHostname(), wellUid, wellboreUid, logUid, RefreshType.Update);
            var mnemonicsOnLog = string.Join(", ", logCurveInfos.Select(logCurveInfo => logCurveInfo.Mnemonic));
            var workerResult = new WorkerResult(witsmlClient.GetServerHostname(), true, $"Imported curve info values for mnemonics: {mnemonicsOnLog}, for log: {logUid}");
            return (workerResult, refreshAction);
        }
    }
}
