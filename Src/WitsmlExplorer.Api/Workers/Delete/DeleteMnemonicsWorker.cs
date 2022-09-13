using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.Data;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers.Delete
{
    public interface IDeleteMnemonicsWorker
    {
        Task<(WorkerResult, RefreshAction)> Execute(DeleteMnemonicsJob job);
    }

    public class DeleteMnemonicsWorker : BaseWorker<DeleteMnemonicsJob>, IWorker, IDeleteMnemonicsWorker
    {
        private readonly IWitsmlClient _witsmlClient;
        public JobType JobType => JobType.DeleteMnemonics;

        public DeleteMnemonicsWorker(ILogger<DeleteMnemonicsJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(logger)
        {
            _witsmlClient = witsmlClientProvider.GetClient();
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(DeleteMnemonicsJob job)
        {
            string wellUid = job.ToDelete.LogReference.WellUid;
            string wellboreUid = job.ToDelete.LogReference.WellboreUid;
            string logUid = job.ToDelete.LogReference.LogUid;
            ReadOnlyCollection<string> mnemonics = new(job.ToDelete.Mnemonics.ToList());
            string mnemonicsString = string.Join(", ", mnemonics);

            WitsmlLogs query = LogQueries.DeleteMnemonics(wellUid, wellboreUid, logUid, mnemonics);
            QueryResult result = await _witsmlClient.DeleteFromStoreAsync(query);
            if (result.IsSuccessful)
            {
                Logger.LogInformation("Deleted mnemonics for log object. WellUid: {WellUid}, WellboreUid: {WellboreUid}, Uid: {LogUid}, Mnemonics: {Mnemonics}",
                        wellUid,
                        wellboreUid,
                        logUid,
                        mnemonicsString);
                RefreshLogObject refreshAction = new(_witsmlClient.GetServerHostname(), wellUid, wellboreUid, logUid, RefreshType.Update);
                WorkerResult workerResult = new(_witsmlClient.GetServerHostname(), true, $"Deleted mnemonics: {mnemonicsString} for log: {logUid}");
                return (workerResult, refreshAction);
            }

            Logger.LogError("Failed to delete mnemonics for log object. WellUid: {WellUid}, WellboreUid: {WellboreUid}, Uid: {LogUid}, Mnemonics: {MnemonicsString}",
                wellUid,
                wellboreUid,
                logUid,
                mnemonics);

            query = LogQueries.GetWitsmlLogById(wellUid, wellboreUid, logUid);
            WitsmlLogs queryResult = await _witsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.IdOnly));

            WitsmlLog log = queryResult.Logs.First();
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

            return (new WorkerResult(_witsmlClient.GetServerHostname(), false, "Failed to delete mnemonics", result.Reason, description), null);
        }
    }
}
