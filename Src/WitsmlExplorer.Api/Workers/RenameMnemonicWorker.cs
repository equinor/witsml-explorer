using System;
using System.Collections.Generic;
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

namespace WitsmlExplorer.Api.Workers
{
    public class RenameMnemonicWorker : BaseWorker<RenameMnemonicJob>, IWorker
    {
        public JobType JobType => JobType.RenameMnemonic;

        public RenameMnemonicWorker(ILogger<RenameMnemonicJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider, logger) { }

        public override async Task<(WorkerResult, RefreshAction)> Execute(RenameMnemonicJob job)
        {
            Verify(job);
            IWitsmlClient client = GetTargetWitsmlClientOrThrow();

            WitsmlLog logHeader = await WorkerTools.GetLog(client, job.LogReference, ReturnElements.HeaderOnly);

            List<string> mnemonics = GetMnemonics(logHeader, job.Mnemonic);
            WitsmlLog updatedLog = new()
            {
                UidWell = logHeader.UidWell,
                UidWellbore = logHeader.UidWellbore,
                Uid = logHeader.Uid,
                LogCurveInfo = logHeader.LogCurveInfo.Where(lci => mnemonics.Contains(lci.Mnemonic, StringComparer.OrdinalIgnoreCase)).ToList(),
            };
            updatedLog.LogCurveInfo.Find(c => c.Mnemonic == job.Mnemonic)!.Mnemonic = job.NewMnemonic;
            WitsmlLogs updatedLogs = new() { Logs = new() { updatedLog } };

            await using LogDataReader logDataReader = new(client, logHeader, mnemonics, Logger);
            WitsmlLogData logData = await logDataReader.GetNextBatch();
            while (logData != null)
            {
                logData.MnemonicList = string.Join(",", GetMnemonics(logHeader, job.NewMnemonic));
                updatedLog.LogData = logData;
                QueryResult result = await client.UpdateInStoreAsync(updatedLogs);
                if (!result.IsSuccessful)
                {
                    Logger.LogError("Failed to rename mnemonic. {jobDescription}", job.Description());
                    return (new WorkerResult(client.GetServerHostname(), false, $"Failed to rename Mnemonic from {job.Mnemonic} to {job.NewMnemonic}", result.Reason), null);
                }
                logData = await logDataReader.GetNextBatch();
            }

            WorkerResult resultDeleteOldMnemonic = await DeleteOldMnemonic(job.LogReference.WellUid, job.LogReference.WellboreUid, job.LogReference.Uid, job.Mnemonic);
            if (!resultDeleteOldMnemonic.IsSuccess)
            {
                return (resultDeleteOldMnemonic, null);
            }

            Logger.LogInformation("{JobType} - Job successful. Mnemonic renamed from {Mnemonic} to {NewMnemonic}", GetType().Name, job.Mnemonic, job.NewMnemonic);
            return (
                new WorkerResult(client.GetServerHostname(), true, $"Mnemonic renamed from {job.Mnemonic} to {job.NewMnemonic}"),
                new RefreshObjects(client.GetServerHostname(), job.LogReference.WellUid, job.LogReference.WellboreUid, EntityType.Log, job.LogReference.Uid));
        }

        private async Task<WorkerResult> DeleteOldMnemonic(string wellUid, string wellboreUid, string logUid, string mnemonic)
        {
            WitsmlLogs query = LogQueries.DeleteMnemonics(wellUid, wellboreUid, logUid, new[] { mnemonic });
            QueryResult result = await GetTargetWitsmlClientOrThrow().DeleteFromStoreAsync(query);
            if (result.IsSuccessful)
            {
                return new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, $"Successfully deleted old mnemonic");
            }

            Logger.LogError("Failed to delete old mnemonic. WellUid: {WellUid}, WellboreUid: {WellboreUid}, Uid: {LogUid}, Mnemonic: {Mnemonic}", wellUid, wellboreUid, logUid, mnemonic);
            return new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, $"Failed to delete old mnemonic {mnemonic} while renaming mnemonic", result.Reason);
        }

        private static void Verify(RenameMnemonicJob job)
        {
            if (string.IsNullOrEmpty(job.Mnemonic) || string.IsNullOrEmpty(job.NewMnemonic))
            {
                throw new InvalidOperationException("Empty name given when trying to rename a mnemonic. Make sure valid names are given");
            }
            else if (job.Mnemonic.Equals(job.NewMnemonic, StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("Cannot rename a mnemonic to the same name it already has. Make sure new mnemonic is a unique name");
            }
        }

        private static List<string> GetMnemonics(WitsmlLog log, string mnemonic)
        {
            return new List<string>
            {
                log.IndexCurve.Value,
                mnemonic
            };
        }
    }
}

