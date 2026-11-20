using System;
using System.Collections.Concurrent;
using System.IO;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace WitsmlExplorer.Api.Services
{
    public class LogUploadInfo
    {
        public string UploadId { get; init; }
        public string Owner { get; init; }
        public string FileName { get; init; }
        public long TotalSize { get; init; }
        public long ReceivedBytes { get; set; }
        public DateTime CreatedAtUtc { get; init; }
        public bool IsComplete => ReceivedBytes == TotalSize;
    }

    public class LogUploadException : Exception
    {
        public LogUploadException(string message, int statusCode) : base(message)
        {
            StatusCode = statusCode;
        }

        public int StatusCode { get; }
    }

    public interface ILogUploadService
    {
        LogUploadInfo CreateUpload(string owner, string fileName, long totalSize);
        Task<LogUploadInfo> AppendChunk(string uploadId, string owner, long offset, Stream content, CancellationToken cancellationToken);
        LogUploadInfo GetUpload(string uploadId, string owner);
        Stream OpenRead(string uploadId, string owner);
        void DeleteUpload(string uploadId, string owner);
        void DeleteExpiredUploads(TimeSpan maxAge);
    }

    /// <summary>
    /// Stores large files (e.g. LAS logs) on disk in chunks so that they can be uploaded in a resumable way
    /// and later processed by a background job without holding the whole file in memory.
    /// </summary>
    public class LogUploadService : ILogUploadService
    {
        public const long DefaultMaxFileSizeBytes = 2L * 1024 * 1024 * 1024;
        public const long MaxChunkSizeBytes = 16L * 1024 * 1024;
        private const string DataFileExtension = ".data";
        private const string MetadataFileExtension = ".json";

        private readonly string _directory;
        private readonly long _maxFileSizeBytes;
        private readonly ILogger<LogUploadService> _logger;
        private readonly ConcurrentDictionary<string, SemaphoreSlim> _locks = new();

        public LogUploadService(IConfiguration configuration, ILogger<LogUploadService> logger)
        {
            _logger = logger;
            string configuredDirectory = configuration["LogUpload:TempDirectory"];
            _directory = string.IsNullOrWhiteSpace(configuredDirectory)
                ? Path.Combine(Path.GetTempPath(), "witsml-explorer-uploads")
                : configuredDirectory;
            _maxFileSizeBytes = long.TryParse(configuration["LogUpload:MaxFileSizeBytes"], out long maxSize) && maxSize > 0
                ? maxSize
                : DefaultMaxFileSizeBytes;
            Directory.CreateDirectory(_directory);
        }

        public LogUploadInfo CreateUpload(string owner, string fileName, long totalSize)
        {
            if (string.IsNullOrEmpty(owner))
            {
                throw new LogUploadException("Missing user.", 401);
            }
            if (totalSize <= 0 || totalSize > _maxFileSizeBytes)
            {
                throw new LogUploadException($"File size must be between 1 and {_maxFileSizeBytes} bytes.", 400);
            }

            LogUploadInfo info = new()
            {
                UploadId = Guid.NewGuid().ToString("N"),
                Owner = owner,
                FileName = Path.GetFileName(fileName ?? string.Empty),
                TotalSize = totalSize,
                ReceivedBytes = 0,
                CreatedAtUtc = DateTime.UtcNow
            };
            File.Create(GetDataPath(info.UploadId)).Dispose();
            WriteMetadata(info);
            return info;
        }

        public async Task<LogUploadInfo> AppendChunk(string uploadId, string owner, long offset, Stream content, CancellationToken cancellationToken)
        {
            SemaphoreSlim uploadLock = _locks.GetOrAdd(ValidateUploadId(uploadId), _ => new SemaphoreSlim(1, 1));
            await uploadLock.WaitAsync(cancellationToken);
            try
            {
                LogUploadInfo info = GetUpload(uploadId, owner);
                string dataPath = GetDataPath(uploadId);
                long currentLength = new FileInfo(dataPath).Length;
                if (offset != currentLength)
                {
                    // The client must resume from the number of bytes the server actually has.
                    throw new LogUploadException($"Invalid offset {offset}. Expected offset {currentLength}.", 409);
                }

                await using (FileStream fileStream = new(dataPath, FileMode.Append, FileAccess.Write, FileShare.None, 81920, useAsync: true))
                {
                    byte[] buffer = new byte[81920];
                    long written = 0;
                    int read;
                    while ((read = await content.ReadAsync(buffer, cancellationToken)) > 0)
                    {
                        written += read;
                        if (written > MaxChunkSizeBytes || currentLength + written > info.TotalSize)
                        {
                            fileStream.SetLength(currentLength);
                            throw new LogUploadException("Chunk exceeds the allowed size.", 413);
                        }
                        await fileStream.WriteAsync(buffer.AsMemory(0, read), cancellationToken);
                    }
                    await fileStream.FlushAsync(cancellationToken);
                    info.ReceivedBytes = currentLength + written;
                }

                WriteMetadata(info);
                return info;
            }
            finally
            {
                uploadLock.Release();
            }
        }

        public LogUploadInfo GetUpload(string uploadId, string owner)
        {
            string metadataPath = GetMetadataPath(uploadId);
            if (!File.Exists(metadataPath))
            {
                throw new LogUploadException("Upload not found.", 404);
            }
            LogUploadInfo info = JsonSerializer.Deserialize<LogUploadInfo>(File.ReadAllText(metadataPath));
            if (!string.Equals(info.Owner, owner, StringComparison.Ordinal))
            {
                throw new LogUploadException("Upload not found.", 404);
            }
            info.ReceivedBytes = new FileInfo(GetDataPath(uploadId)).Length;
            return info;
        }

        public Stream OpenRead(string uploadId, string owner)
        {
            LogUploadInfo info = GetUpload(uploadId, owner);
            if (!info.IsComplete)
            {
                throw new LogUploadException($"Upload is incomplete ({info.ReceivedBytes}/{info.TotalSize} bytes).", 400);
            }
            return new FileStream(GetDataPath(uploadId), FileMode.Open, FileAccess.Read, FileShare.Read, 1024 * 1024, FileOptions.SequentialScan);
        }

        public void DeleteUpload(string uploadId, string owner)
        {
            GetUpload(uploadId, owner);
            DeleteFiles(uploadId);
        }

        public void DeleteExpiredUploads(TimeSpan maxAge)
        {
            if (!Directory.Exists(_directory))
            {
                return;
            }
            DateTime threshold = DateTime.UtcNow - maxAge;
            foreach (string metadataPath in Directory.EnumerateFiles(_directory, "*" + MetadataFileExtension))
            {
                try
                {
                    if (File.GetLastWriteTimeUtc(metadataPath) < threshold)
                    {
                        DeleteFiles(Path.GetFileNameWithoutExtension(metadataPath));
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Unable to delete expired upload {MetadataPath}", metadataPath);
                }
            }
        }

        private void DeleteFiles(string uploadId)
        {
            File.Delete(GetDataPath(uploadId));
            File.Delete(GetMetadataPath(uploadId));
            _locks.TryRemove(uploadId, out _);
        }

        private void WriteMetadata(LogUploadInfo info)
        {
            File.WriteAllText(GetMetadataPath(info.UploadId), JsonSerializer.Serialize(info));
        }

        private string GetDataPath(string uploadId) => Path.Combine(_directory, ValidateUploadId(uploadId) + DataFileExtension);

        private string GetMetadataPath(string uploadId) => Path.Combine(_directory, ValidateUploadId(uploadId) + MetadataFileExtension);

        private static string ValidateUploadId(string uploadId)
        {
            if (!Guid.TryParseExact(uploadId, "N", out _))
            {
                throw new LogUploadException("Invalid upload id.", 400);
            }
            return uploadId;
        }
    }
}
