using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
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
    /// <summary>
    /// Streams a previously uploaded LAS file from disk and writes it to a WITSML log in batches,
    /// so that memory usage is independent of the file size.
    /// </summary>
    public class ImportLasFileWorker : BaseWorker<ImportLasFileJob>, IWorker
    {
        private const int MaxUpdateAttempts = 2;
        private readonly ILogUploadService _uploadService;

        public JobType JobType => JobType.ImportLasFile;

        public ImportLasFileWorker(ILogger<ImportLasFileJob> logger, IWitsmlClientProvider witsmlClientProvider, ILogUploadService uploadService) : base(witsmlClientProvider, logger)
        {
            _uploadService = uploadService;
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(ImportLasFileJob job, CancellationToken? cancellationToken = null)
        {
            string owner = job.JobInfo?.Username;
            try
            {
                return await Import(job, owner, cancellationToken ?? CancellationToken.None);
            }
            catch (Exception ex) when (ex is LogUploadException or InvalidDataException)
            {
                Logger.LogError("Job failed: {jobDescription}. {Message}", job.Description(), ex.Message);
                return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, "Failed to import LAS file", ex.Message), null);
            }
            finally
            {
                TryDeleteUpload(job.UploadId, owner);
            }
        }

        private async Task<(WorkerResult, RefreshAction)> Import(ImportLasFileJob job, string owner, CancellationToken cancellationToken)
        {
            Uri hostname = GetTargetWitsmlClientOrThrow().GetServerHostname();
            string wellUid = job.TargetLog.WellUid;
            string wellboreUid = job.TargetLog.WellboreUid;
            string logUid = job.TargetLog.Uid;

            WitsmlLog witsmlLog = await GetLogHeader(wellUid, wellboreUid, logUid);
            if (witsmlLog == null)
            {
                string reason = $"Did not find witsml log for wellUid: {wellUid}, wellboreUid: {wellboreUid}, logUid: {logUid}";
                return (new WorkerResult(hostname, false, "Unable to find log", reason), null);
            }

            LogUploadInfo upload = _uploadService.GetUpload(job.UploadId, owner);
            using LasFileReader reader = new(_uploadService.OpenRead(job.UploadId, owner));
            reader.ReadHeader();

            bool isTimeLog = string.Equals(witsmlLog.IndexType, WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME, StringComparison.Ordinal);
            List<ImportColumn> columns = GetImportColumns(reader.Curves, witsmlLog.IndexCurve?.Value, job.Mnemonics);
            if (columns.Count < 2)
            {
                return (new WorkerResult(hostname, false, "Failed to import LAS file", "At least one curve in addition to the index curve must be imported."), null);
            }

            WitsmlLogs addMnemonicsQuery = CreateAddMnemonicsQuery(job, witsmlLog, columns);
            if (addMnemonicsQuery.Logs.First().LogCurveInfo.Count > 0)
            {
                QueryResult addMnemonicsResult = await GetTargetWitsmlClientOrThrow().UpdateInStoreAsync(addMnemonicsQuery);
                if (!addMnemonicsResult.IsSuccessful)
                {
                    Logger.LogError("Job failed: {jobDescription}. Failed to add missing mnemonics", job.Description());
                    return (new WorkerResult(hostname, false, "Failed to add missing mnemonics", addMnemonicsResult.Reason, witsmlLog.GetDescription()), null);
                }
            }

            string mnemonicList = string.Join(CommonConstants.DataSeparator, columns.Select(c => c.Mnemonic));
            string unitList = string.Join(CommonConstants.DataSeparator, columns.Select(c => c.Unit));
            int batchSize = await GetMaxBatchSize(columns.Count, CommonConstants.WitsmlFunctionType.WMLSUpdateInStore, CommonConstants.WitsmlQueryTypeName.Log);

            List<WitsmlData> batch = new(batchSize);
            long importedRows = 0;
            int batchNumber = 0;
            foreach (string[] row in reader.ReadRows())
            {
                string[] values = columns.Select(c => row[c.SourceIndex]).ToArray();
                if (string.IsNullOrEmpty(values[0]))
                {
                    continue;
                }
                if (isTimeLog)
                {
                    values[0] = ConvertDateTime(values[0], job.DateTimeFormat);
                }
                batch.Add(new WitsmlData { Data = string.Join(CommonConstants.DataSeparator, values) });

                if (batch.Count >= batchSize)
                {
                    cancellationToken.ThrowIfCancellationRequested();
                    QueryResult result = await WriteBatch(witsmlLog, batch, mnemonicList, unitList);
                    if (!result.IsSuccessful)
                    {
                        return BatchFailed(job, witsmlLog, result, importedRows, batchNumber);
                    }
                    importedRows += batch.Count;
                    batchNumber++;
                    batch = new List<WitsmlData>(batchSize);
                    ReportProgress(job, Math.Min(0.99, reader.BytesRead / (double)upload.TotalSize));
                }
            }

            if (batch.Count > 0)
            {
                cancellationToken.ThrowIfCancellationRequested();
                QueryResult result = await WriteBatch(witsmlLog, batch, mnemonicList, unitList);
                if (!result.IsSuccessful)
                {
                    return BatchFailed(job, witsmlLog, result, importedRows, batchNumber);
                }
                importedRows += batch.Count;
            }
            ReportProgress(job, 1.0);

            Logger.LogInformation("{JobType} - Job successful. Imported {Rows} rows", GetType().Name, importedRows);
            RefreshObjects refreshAction = new(hostname, wellUid, wellboreUid, EntityType.Log, logUid);
            WorkerResult workerResult = new(hostname, true, $"Imported {importedRows} rows from {upload.FileName} for mnemonics: {string.Join(", ", columns.Select(c => c.Mnemonic))}, for log: {logUid}");
            return (workerResult, refreshAction);
        }

        private async Task<QueryResult> WriteBatch(WitsmlLog witsmlLog, List<WitsmlData> batch, string mnemonicList, string unitList)
        {
            WitsmlLogs query = new()
            {
                Logs = new WitsmlLog
                {
                    Uid = witsmlLog.Uid,
                    UidWell = witsmlLog.UidWell,
                    UidWellbore = witsmlLog.UidWellbore,
                    LogData = new WitsmlLogData
                    {
                        MnemonicList = mnemonicList,
                        UnitList = unitList,
                        Data = batch
                    }
                }.AsItemInList()
            };

            QueryResult result = null;
            for (int attempt = 0; attempt < MaxUpdateAttempts; attempt++)
            {
                result = await GetTargetWitsmlClientOrThrow().UpdateInStoreAsync(query);
                if (result.IsSuccessful)
                {
                    break;
                }
            }
            return result;
        }

        private (WorkerResult, RefreshAction) BatchFailed(ImportLasFileJob job, WitsmlLog witsmlLog, QueryResult result, long importedRows, int batchNumber)
        {
            Logger.LogError("Job failed: {jobDescription}. Failed import at batch {BatchNumber} after {Attempts} attempts", job.Description(), batchNumber, MaxUpdateAttempts);
            Uri hostname = GetTargetWitsmlClientOrThrow().GetServerHostname();
            RefreshObjects refreshAction = importedRows > 0
                ? new RefreshObjects(hostname, job.TargetLog.WellUid, job.TargetLog.WellboreUid, EntityType.Log, job.TargetLog.Uid)
                : null;
            return (new WorkerResult(hostname, false, $"Failed to import curve data from row: {importedRows}", result.Reason, witsmlLog.GetDescription()), refreshAction);
        }

        private static void ReportProgress(ImportLasFileJob job, double progress)
        {
            if (job.JobInfo != null) job.JobInfo.Progress = progress;
            job.ProgressReporter?.Report(progress);
        }

        private void TryDeleteUpload(string uploadId, string owner)
        {
            try
            {
                _uploadService.DeleteUpload(uploadId, owner);
            }
            catch (Exception ex)
            {
                Logger.LogWarning("Unable to delete upload {UploadId}: {Message}", uploadId, ex.Message);
            }
        }

        private async Task<WitsmlLog> GetLogHeader(string wellUid, string wellboreUid, string logUid)
        {
            WitsmlLogs query = LogQueries.GetWitsmlLogById(wellUid, wellboreUid, logUid);
            WitsmlLogs result = await GetTargetWitsmlClientOrThrow().GetFromStoreAsync(query, new OptionsIn(ReturnElements.HeaderOnly));
            return result?.Logs.FirstOrDefault();
        }

        internal record ImportColumn(int SourceIndex, string Mnemonic, string Unit);

        /// <summary>
        /// Maps LAS curves to log mnemonics: the index curve is moved first and renamed to the log index curve,
        /// duplicate mnemonics get a "(n)" suffix (same as the browser import), and only selected mnemonics are kept.
        /// </summary>
        internal static List<ImportColumn> GetImportColumns(IList<LasCurve> curves, string logIndexCurve, ICollection<string> selectedMnemonics)
        {
            Dictionary<string, int> occurrences = new(StringComparer.Ordinal);
            List<string> names = curves.Select(c =>
            {
                int count = occurrences.TryGetValue(c.Mnemonic, out int existing) ? existing + 1 : 1;
                occurrences[c.Mnemonic] = count;
                return count == 1 ? c.Mnemonic : $"{c.Mnemonic}({count})";
            }).ToList();

            int indexPosition = string.IsNullOrEmpty(logIndexCurve)
                ? -1
                : names.FindIndex(n => string.Equals(n, logIndexCurve, StringComparison.OrdinalIgnoreCase));
            if (indexPosition < 0)
            {
                // By the LAS specification the first curve is the index.
                indexPosition = 0;
            }
            if (!string.IsNullOrEmpty(logIndexCurve))
            {
                names[indexPosition] = logIndexCurve;
            }

            HashSet<string> selected = selectedMnemonics?.Count > 0 ? new HashSet<string>(selectedMnemonics, StringComparer.Ordinal) : null;
            List<ImportColumn> columns = new() { new ImportColumn(indexPosition, names[indexPosition], curves[indexPosition].Unit) };
            for (int i = 0; i < curves.Count; i++)
            {
                if (i != indexPosition && (selected == null || selected.Contains(names[i])))
                {
                    columns.Add(new ImportColumn(i, names[i], curves[i].Unit));
                }
            }
            return columns;
        }

        internal static string ConvertDateTime(string value, string format)
        {
            DateTimeStyles styles = DateTimeStyles.AssumeUniversal | DateTimeStyles.AdjustToUniversal;
            if ((!string.IsNullOrEmpty(format) && DateTime.TryParseExact(value, format, CultureInfo.InvariantCulture, styles, out DateTime parsed))
                || DateTime.TryParse(value, CultureInfo.InvariantCulture, styles, out parsed))
            {
                return parsed.ToString("yyyy-MM-ddTHH:mm:ss.fffZ", CultureInfo.InvariantCulture);
            }
            throw new InvalidDataException($"Unable to parse date time index value '{value}'.");
        }

        private static WitsmlLogs CreateAddMnemonicsQuery(ImportLasFileJob job, WitsmlLog witsmlLog, List<ImportColumn> columns)
        {
            HashSet<string> existing = new((witsmlLog.LogCurveInfo ?? new List<WitsmlLogCurveInfo>()).Select(l => l.Mnemonic), StringComparer.Ordinal);
            return new WitsmlLogs
            {
                Logs = new WitsmlLog
                {
                    Uid = job.TargetLog.Uid,
                    UidWellbore = job.TargetLog.WellboreUid,
                    UidWell = job.TargetLog.WellUid,
                    LogCurveInfo = columns
                        .Where(c => !existing.Contains(c.Mnemonic))
                        .Select(c => new WitsmlLogCurveInfo
                        {
                            Mnemonic = c.Mnemonic,
                            Unit = string.IsNullOrEmpty(c.Unit) ? CommonConstants.Unit.Unitless : c.Unit, // Can't updateInStore with an empty unit
                            Uid = c.Mnemonic,
                            TypeLogData = WitsmlLogCurveInfo.LogDataTypeDouble
                        }).ToList()
                }.AsItemInList()
            };
        }
    }
}
