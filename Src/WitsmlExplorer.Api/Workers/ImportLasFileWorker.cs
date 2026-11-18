using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
using System.ServiceModel;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Configuration;
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
        public const long DefaultMaxRequestBytes = 1024 * 1024;
        // Approximate XML overhead of a single <data></data> element.
        private const int DataElementOverheadBytes = 16;
        private readonly ILogUploadService _uploadService;
        private readonly long _maxRequestBytes;

        public JobType JobType => JobType.ImportLasFile;

        public ImportLasFileWorker(ILogger<ImportLasFileJob> logger, IWitsmlClientProvider witsmlClientProvider, ILogUploadService uploadService, IConfiguration configuration) : base(witsmlClientProvider, logger)
        {
            _uploadService = uploadService;
            _maxRequestBytes = long.TryParse(configuration?["LogUpload:MaxRequestBytes"], out long maxBytes) && maxBytes > 0
                ? maxBytes
                : DefaultMaxRequestBytes;
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
            string unitList = GetUnitList(witsmlLog, columns);
            int batchSize = await GetMaxBatchSize(columns.Count, CommonConstants.WitsmlFunctionType.WMLSUpdateInStore, CommonConstants.WitsmlQueryTypeName.Log);
            long headerBytes = Encoding.UTF8.GetByteCount(mnemonicList) + Encoding.UTF8.GetByteCount(unitList);
            BatchLimits limits = new(Math.Max(1, batchSize), Math.Max(1, _maxRequestBytes - headerBytes));

            List<WitsmlData> batch = new();
            long batchBytes = 0;
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
                string data = string.Join(CommonConstants.DataSeparator, values);
                long rowBytes = Encoding.UTF8.GetByteCount(data) + DataElementOverheadBytes;
                if (batch.Count > 0 && (batch.Count >= limits.MaxRows || batchBytes + rowBytes > limits.MaxBytes))
                {
                    cancellationToken.ThrowIfCancellationRequested();
                    (QueryResult result, int written) = await WriteRows(witsmlLog, batch, mnemonicList, unitList, limits);
                    importedRows += written;
                    if (!result.IsSuccessful)
                    {
                        return BatchFailed(job, witsmlLog, result, importedRows, batchNumber);
                    }
                    batchNumber++;
                    batch = new List<WitsmlData>();
                    batchBytes = 0;
                    ReportProgress(job, Math.Min(0.99, reader.BytesRead / (double)upload.TotalSize));
                }
                batch.Add(new WitsmlData { Data = data });
                batchBytes += rowBytes;
            }

            if (batch.Count > 0)
            {
                cancellationToken.ThrowIfCancellationRequested();
                (QueryResult result, int written) = await WriteRows(witsmlLog, batch, mnemonicList, unitList, limits);
                importedRows += written;
                if (!result.IsSuccessful)
                {
                    return BatchFailed(job, witsmlLog, result, importedRows, batchNumber);
                }
            }
            ReportProgress(job, 1.0);

            Logger.LogInformation("{JobType} - Job successful. Imported {Rows} rows", GetType().Name, importedRows);
            RefreshObjects refreshAction = new(hostname, wellUid, wellboreUid, EntityType.Log, logUid);
            WorkerResult workerResult = new(hostname, true, $"Imported {importedRows} rows from {upload.FileName} for mnemonics: {string.Join(", ", columns.Select(c => c.Mnemonic))}, for log: {logUid}");
            return (workerResult, refreshAction);
        }

        /// <summary>
        /// Writes the rows, splitting them in halves when the server rejects the request as too large (HTTP 413).
        /// The limits are lowered so that following batches are sent with a size the server accepts.
        /// </summary>
        private async Task<(QueryResult Result, int Written)> WriteRows(WitsmlLog witsmlLog, List<WitsmlData> rows, string mnemonicList, string unitList, BatchLimits limits)
        {
            try
            {
                QueryResult result = await WriteBatch(witsmlLog, rows, mnemonicList, unitList);
                return (result, result.IsSuccessful ? rows.Count : 0);
            }
            catch (Exception ex) when (IsRequestTooLarge(ex))
            {
                if (rows.Count <= 1)
                {
                    return (new QueryResult(false, $"A single data row is too large for the WITSML server: {ex.Message}"), 0);
                }
                int half = rows.Count / 2;
                limits.MaxRows = Math.Max(1, Math.Min(limits.MaxRows, half));
                limits.MaxBytes = Math.Max(1, limits.MaxBytes / 2);
                Logger.LogWarning("WITSML server rejected {Rows} rows as too large, retrying with smaller requests", rows.Count);

                (QueryResult first, int firstWritten) = await WriteRows(witsmlLog, rows.GetRange(0, half), mnemonicList, unitList, limits);
                if (!first.IsSuccessful)
                {
                    return (first, firstWritten);
                }
                (QueryResult second, int secondWritten) = await WriteRows(witsmlLog, rows.GetRange(half, rows.Count - half), mnemonicList, unitList, limits);
                return (second, firstWritten + secondWritten);
            }
        }

        internal static bool IsRequestTooLarge(Exception ex)
        {
            for (Exception current = ex; current != null; current = current.InnerException)
            {
                if (current is WebException { Response: HttpWebResponse { StatusCode: HttpStatusCode.RequestEntityTooLarge } })
                {
                    return true;
                }
                if (current is ProtocolException or CommunicationException or WebException
                    && (current.Message.Contains("(413)", StringComparison.Ordinal) || current.Message.Contains("Request Entity Too Large", StringComparison.OrdinalIgnoreCase)))
                {
                    return true;
                }
            }
            return false;
        }

        private sealed class BatchLimits
        {
            public BatchLimits(int maxRows, long maxBytes)
            {
                MaxRows = maxRows;
                MaxBytes = maxBytes;
            }

            public int MaxRows { get; set; }
            public long MaxBytes { get; set; }
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

        // Can't updateInStore with an empty unit
        private static string NormalizeUnit(string unit) => string.IsNullOrWhiteSpace(unit) ? CommonConstants.Unit.Unitless : unit.Trim();

        /// <summary>
        /// The server requires the unitList to match the units in the log header, so existing curves keep their header unit
        /// and new curves use the (normalized) unit they were added with.
        /// </summary>
        internal static string GetUnitList(WitsmlLog witsmlLog, IList<ImportColumn> columns)
        {
            List<WitsmlLogCurveInfo> headerCurves = witsmlLog.LogCurveInfo ?? new List<WitsmlLogCurveInfo>();
            return string.Join(CommonConstants.DataSeparator, columns.Select(c =>
            {
                WitsmlLogCurveInfo existing = headerCurves.FirstOrDefault(l => string.Equals(l.Mnemonic, c.Mnemonic, StringComparison.Ordinal));
                return existing != null && !string.IsNullOrEmpty(existing.Unit) ? existing.Unit : NormalizeUnit(c.Unit);
            }));
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
                            Unit = NormalizeUnit(c.Unit),
                            Uid = c.Mnemonic,
                            TypeLogData = WitsmlLogCurveInfo.LogDataTypeDouble
                        }).ToList()
                }.AsItemInList()
            };
        }
    }
}
