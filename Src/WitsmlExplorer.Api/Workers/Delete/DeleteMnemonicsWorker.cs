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
        public JobType JobType => JobType.DeleteMnemonics;

        public DeleteMnemonicsWorker(ILogger<DeleteMnemonicsJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider, logger) { }

        public override async Task<(WorkerResult, RefreshAction)> Execute(DeleteMnemonicsJob job)
        {
            string wellUid = job.ToDelete.Parent.WellUid;
            string wellboreUid = job.ToDelete.Parent.WellboreUid;
            string logUid = job.ToDelete.Parent.Uid;
            ReadOnlyCollection<string> mnemonics = new(job.ToDelete.ComponentUids.ToList());
            string mnemonicsString = string.Join(", ", mnemonics);

            WitsmlLogs query = LogQueries.DeleteMnemonics(wellUid, wellboreUid, logUid, mnemonics);
            QueryResult result = await GetTargetWitsmlClientOrThrow().DeleteFromStoreAsync(query);
            if (result.IsSuccessful)
            {
                Logger.LogInformation("Deleted mnemonics for log object. WellUid: {WellUid}, WellboreUid: {WellboreUid}, Uid: {LogUid}, Mnemonics: {Mnemonics}",
                        wellUid,
                        wellboreUid,
                        logUid,
                        mnemonicsString);
                RefreshObjects refreshAction = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), wellUid, wellboreUid, EntityType.LogObject, logUid);
                WorkerResult workerResult = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, $"Deleted mnemonics: {mnemonicsString} for log: {logUid}");
                return (workerResult, refreshAction);
            }

            Logger.LogError("Failed to delete mnemonics for log object. WellUid: {WellUid}, WellboreUid: {WellboreUid}, Uid: {LogUid}, Mnemonics: {MnemonicsString}",
                wellUid,
                wellboreUid,
                logUid,
                mnemonics);

            query = LogQueries.GetWitsmlLogById(wellUid, wellboreUid, logUid);
            WitsmlLogs queryResult = await GetTargetWitsmlClientOrThrow().GetFromStoreAsync(query, new OptionsIn(ReturnElements.IdOnly));

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

            return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, "Failed to delete mnemonics", result.Reason, description), null);
        }
    }
}
