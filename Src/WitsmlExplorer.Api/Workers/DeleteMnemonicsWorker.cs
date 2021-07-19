using System.Linq;
using System.Threading.Tasks;
using Serilog;
using Witsml;
using Witsml.ServiceReference;
using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers
{
    public interface IDeleteMnemonicsWorker
    {
        Task<(WorkerResult workerResult, RefreshLogObject refreshAction)> Execute(DeleteMnemonicsJob job);
    }

    public class DeleteMnemonicsWorker : IDeleteMnemonicsWorker
    {
        private readonly IWitsmlClient witsmlClient;

        public DeleteMnemonicsWorker(IWitsmlClientProvider witsmlClientProvider)
        {
            witsmlClient = witsmlClientProvider.GetClient();
        }

        public async Task<(WorkerResult workerResult, RefreshLogObject refreshAction)> Execute(DeleteMnemonicsJob job)
        {
            var wellUid = job.LogObject.WellUid;
            var wellboreUid = job.LogObject.WellboreUid;
            var logUid = job.LogObject.LogUid;
            var mnemonics = job.Mnemonics;
            var mnemonicsString = string.Join(", ", mnemonics);

            var query = LogQueries.DeleteMnemonics(wellUid, wellboreUid, logUid, mnemonics);
            var result = await witsmlClient.DeleteFromStoreAsync(query);
            if (result.IsSuccessful)
            {
                Log.Information("{JobType} - Job successful", GetType().Name);
                var refreshAction = new RefreshLogObject(witsmlClient.GetServerHostname(), wellUid, wellboreUid, logUid, RefreshType.Update);
                var workerResult = new WorkerResult(witsmlClient.GetServerHostname(), true, $"Deleted mnemonics: {mnemonicsString} for log: {logUid}");
                return (workerResult, refreshAction);
            }

            Log.Error("Failed to delete mnemonics for log object. WellUid: {WellUid}, WellboreUid: {WellboreUid}, Uid: {LogUid}, Mnemonics: {MnemonicsString}",
                wellUid,
                wellboreUid,
                logUid,
                mnemonics);

            query = LogQueries.GetWitsmlLogById(wellUid, wellboreUid, logUid);
            var queryResult = await witsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.IdOnly));

            var log = queryResult.Logs.First();
            EntityDescription description = null;
            if (log != null)
            {
                description = new EntityDescription
                {
                    WellName = log.NameWell,
                    WellboreName = log.NameWellbore,
                    ObjectName = log.Name
                };
            }

            return (new WorkerResult(witsmlClient.GetServerHostname(), false, "Failed to delete mnemonics", result.Reason, description), null);
        }
    }
}
