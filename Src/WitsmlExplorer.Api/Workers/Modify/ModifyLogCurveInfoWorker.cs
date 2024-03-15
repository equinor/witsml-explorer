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

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers.Modify
{
    /// <summary>
    /// Worker for modifying logCurveInfo by specific well and wellbore.
    /// </summary>
    public class ModifyLogCurveInfoWorker : BaseWorker<ModifyLogCurveInfoJob>, IWorker
    {
        public JobType JobType => JobType.ModifyLogCurveInfo;

        public ModifyLogCurveInfoWorker(ILogger<ModifyLogCurveInfoJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider, logger) { }

        /// <summary>
        /// Executes the modification of logCurveInfo based on the provided job.
        /// </summary>
        /// <param name="job">The job containing information for the modification.</param>
        /// <returns>Task of the workerResult with RefreshAction.</returns>
        public override async Task<(WorkerResult, RefreshAction)> Execute(ModifyLogCurveInfoJob job, CancellationToken? cancellationToken = null)
        {
            Verify(job);

            IWitsmlClient client = GetTargetWitsmlClientOrThrow();
            WitsmlLog logHeader = await LogWorkerTools.GetLog(client, job.LogReference, ReturnElements.HeaderOnly);
            if (logHeader == null)
            {
                var message = $"ModifyLogCurveInfoJob failed. Cannot find the witsml log for {job.Description()}";
                Logger.LogError(message);
                return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, message), null);
            }

            var originalLogCurveInfo = logHeader.LogCurveInfo.FirstOrDefault(c => c.Uid == job.LogCurveInfo.Uid);
            if (originalLogCurveInfo == null)
            {
                var message = $"ModifyLogCurveInfoJob failed. Cannot find the witsml logCurveInfo for Uid {job.LogCurveInfo.Uid} of {job.Description()}";
                Logger.LogError(message);
                return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, message), null);
            }

            var originalLogCurveInfoMnemonic = originalLogCurveInfo.Mnemonic;
            var isLogCurveInfoMnemonicUpdated = originalLogCurveInfoMnemonic != job.LogCurveInfo.Mnemonic;
            if (logHeader.IndexCurve.Value == originalLogCurveInfoMnemonic && isLogCurveInfoMnemonicUpdated)
            {
                throw new InvalidOperationException($"IndexCurve Mnemonic: {originalLogCurveInfoMnemonic} cannot be modified.");
            }

            WitsmlLogs modifyLogCurveInfoQuery = GetModifyLogCurveInfoQuery(job, originalLogCurveInfo);
            QueryResult modifyLogCurveInfoResult = await client.UpdateInStoreAsync(modifyLogCurveInfoQuery);
            if (modifyLogCurveInfoResult.IsSuccessful)
            {
                Logger.LogInformation("LogCurveInfo modified. {jobDescription}", job.Description());
            }
            else
            {
                const string errorMessage = "Failed to modify logCurveInfo object.";
                Logger.LogError("{ErrorMessage}. {jobDescription}", errorMessage, job.Description());
                return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, errorMessage, modifyLogCurveInfoResult.Reason), null);
            }

            if (isLogCurveInfoMnemonicUpdated)
            {
                var originalMnemonics = GetMnemonics(logHeader, originalLogCurveInfoMnemonic);
                var updatedMnemonics = string.Join(CommonConstants.DataSeparator, GetMnemonics(logHeader, job.LogCurveInfo.Mnemonic));
                var updatedUnits = string.Join(CommonConstants.DataSeparator, GetUnits(logHeader, job.LogCurveInfo.Unit));
                WitsmlLog modifyLogData = GetModifyLogDataQuery(job, updatedMnemonics, updatedUnits);

                await using LogDataReader logDataReader = new(client, logHeader, originalMnemonics, Logger);
                WitsmlLogData logData = await logDataReader.GetNextBatch();
                while (logData != null)
                {
                    modifyLogData.LogData.Data = logData.Data;
                    WitsmlLogs updatedLogs1 = new() { Logs = new List<WitsmlLog> { modifyLogData } };
                    QueryResult result = await client.UpdateInStoreAsync(updatedLogs1);
                    if (!result.IsSuccessful)
                    {
                        Logger.LogError("Failed to rename Mnemonic of logCurveInfo. {jobDescription}", job.Description());
                        return (
                            new WorkerResult(client.GetServerHostname(), false, $"Failed to rename Mnemonic from {originalLogCurveInfoMnemonic} to {job.LogCurveInfo.Mnemonic}",
                                result.Reason),
                            null);
                    }

                    logData = await logDataReader.GetNextBatch();
                }

                WorkerResult resultDeleteOldMnemonic =
                    await DeleteOldMnemonic(job.LogReference.WellUid, job.LogReference.WellboreUid, job.LogReference.Uid, originalLogCurveInfoMnemonic);
                if (!resultDeleteOldMnemonic.IsSuccess)
                {
                    return (resultDeleteOldMnemonic, null);
                }
            }

            Logger.LogInformation("LogCurveInfo modified. {jobDescription}", job.Description());
            return (
                new WorkerResult(client.GetServerHostname(), true, $"LogCurveInfo updated ({job.LogCurveInfo.Uid})"),
                new RefreshObjects(client.GetServerHostname(), job.LogReference.WellUid, job.LogReference.WellboreUid, EntityType.Log, job.LogReference.Uid));
        }

        private static WitsmlLog GetModifyLogDataQuery(ModifyLogCurveInfoJob job, string updatedMnemonics, string updatedUnits)
        {
            return new WitsmlLog
            {
                Uid = job.LogReference.Uid,
                UidWellbore = job.LogReference.WellboreUid,
                UidWell = job.LogReference.WellUid,
                LogData = new WitsmlLogData { MnemonicList = updatedMnemonics, UnitList = updatedUnits }
            };
        }

        private static WitsmlLogs GetModifyLogCurveInfoQuery(ModifyLogCurveInfoJob job, WitsmlLogCurveInfo originalLogCurveInfo)
        {
            if (originalLogCurveInfo.Mnemonic != job.LogCurveInfo.Mnemonic)
            {
                originalLogCurveInfo.Mnemonic = job.LogCurveInfo.Mnemonic;
                originalLogCurveInfo.Uid = job.LogCurveInfo.Mnemonic;
            }

            originalLogCurveInfo.Unit = job.LogCurveInfo.Unit;
            originalLogCurveInfo.CurveDescription = job.LogCurveInfo.CurveDescription.NullIfEmpty();

            return new()
            {
                Logs = new List<WitsmlLog>
                {
                    new()
                    {
                        UidWell = job.LogReference.WellUid,
                        UidWellbore = job.LogReference.WellboreUid,
                        Uid = job.LogReference.Uid,
                        LogCurveInfo = new List<WitsmlLogCurveInfo>() { originalLogCurveInfo }
                    }
                }
            };
        }

        private async Task<WorkerResult> DeleteOldMnemonic(string wellUid, string wellboreUid, string logUid, string mnemonic)
        {
            WitsmlLogs query = LogQueries.DeleteMnemonics(wellUid, wellboreUid, logUid, new[] { mnemonic });
            QueryResult result = await GetTargetWitsmlClientOrThrow().DeleteFromStoreAsync(query);
            if (result.IsSuccessful)
            {
                return new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, $"Successfully deleted old mnemonic");
            }

            Logger.LogError("Failed to delete old mnemonic. WellUid: {WellUid}, WellboreUid: {WellboreUid}, Uid: {LogUid}, Mnemonic: {Mnemonic}", wellUid, wellboreUid, logUid,
                mnemonic);
            return new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, $"Failed to delete old mnemonic {mnemonic} while renaming mnemonic", result.Reason);
        }

        private static void Verify(ModifyLogCurveInfoJob job)
        {
            if (string.IsNullOrEmpty(job.LogCurveInfo.Mnemonic))
            {
                throw new InvalidOperationException("An empty name is given when trying to rename a mnemonic. Make sure a valid name is given.");
            }

            if (string.IsNullOrEmpty(job.LogCurveInfo.Unit))
            {
                throw new InvalidOperationException("An empty unit is given when trying to change a unit. Make sure a valid unit is given.");
            }
        }

        private static List<string> GetUnits(WitsmlLog log, string newUnit)
        {
            var indexCurveUnit = log.LogCurveInfo.FirstOrDefault(x => x.Mnemonic == log.IndexCurve.Value)?.Unit;
            return new List<string> { indexCurveUnit, newUnit };
        }

        private static List<string> GetMnemonics(WitsmlLog log, string mnemonic)
        {
            return new List<string> { log.IndexCurve.Value, mnemonic };
        }
    }
}
