using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;

using WitsmlExplorer.Api.Services;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Services
{
    public sealed class LogUploadServiceTests : IDisposable
    {
        private const string Owner = "owner";
        private readonly string _directory;
        private readonly LogUploadService _service;

        public LogUploadServiceTests()
        {
            _directory = Path.Combine(Path.GetTempPath(), "witsml-explorer-upload-tests", Guid.NewGuid().ToString("N"));
            IConfiguration configuration = new ConfigurationBuilder()
                .AddInMemoryCollection(new Dictionary<string, string>
                {
                    ["LogUpload:TempDirectory"] = _directory,
                    ["LogUpload:MaxFileSizeBytes"] = "100"
                })
                .Build();
            _service = new LogUploadService(configuration, NullLogger<LogUploadService>.Instance);
        }

        public void Dispose()
        {
            if (Directory.Exists(_directory))
            {
                Directory.Delete(_directory, true);
            }
        }

        private static MemoryStream ToStream(string value) => new(Encoding.UTF8.GetBytes(value));

        [Fact]
        public async Task AppendChunk_AllChunks_FileCanBeRead()
        {
            LogUploadInfo upload = _service.CreateUpload(Owner, "test.las", 10);

            await _service.AppendChunk(upload.UploadId, Owner, 0, ToStream("01234"), CancellationToken.None);
            LogUploadInfo result = await _service.AppendChunk(upload.UploadId, Owner, 5, ToStream("56789"), CancellationToken.None);

            Assert.True(result.IsComplete);
            using StreamReader reader = new(_service.OpenRead(upload.UploadId, Owner));
            Assert.Equal("0123456789", reader.ReadToEnd());
        }

        [Fact]
        public async Task AppendChunk_WrongOffset_ReturnsConflict()
        {
            LogUploadInfo upload = _service.CreateUpload(Owner, "test.las", 10);
            await _service.AppendChunk(upload.UploadId, Owner, 0, ToStream("01234"), CancellationToken.None);

            LogUploadException ex = await Assert.ThrowsAsync<LogUploadException>(() =>
                _service.AppendChunk(upload.UploadId, Owner, 0, ToStream("01234"), CancellationToken.None));

            Assert.Equal(409, ex.StatusCode);
        }

        [Fact]
        public async Task AppendChunk_ExceedsTotalSize_IsRejectedAndTruncated()
        {
            LogUploadInfo upload = _service.CreateUpload(Owner, "test.las", 4);

            LogUploadException ex = await Assert.ThrowsAsync<LogUploadException>(() =>
                _service.AppendChunk(upload.UploadId, Owner, 0, ToStream("01234"), CancellationToken.None));

            Assert.Equal(413, ex.StatusCode);
            Assert.Equal(0, _service.GetUpload(upload.UploadId, Owner).ReceivedBytes);
        }

        [Fact]
        public void GetUpload_OtherOwner_ReturnsNotFound()
        {
            LogUploadInfo upload = _service.CreateUpload(Owner, "test.las", 10);

            LogUploadException ex = Assert.Throws<LogUploadException>(() => _service.GetUpload(upload.UploadId, "other"));

            Assert.Equal(404, ex.StatusCode);
        }

        [Theory]
        [InlineData("..\\..\\secret")]
        [InlineData("not-a-guid")]
        public void GetUpload_InvalidId_ReturnsBadRequest(string uploadId)
        {
            LogUploadException ex = Assert.Throws<LogUploadException>(() => _service.GetUpload(uploadId, Owner));

            Assert.Equal(400, ex.StatusCode);
        }

        [Fact]
        public void CreateUpload_TooLarge_ReturnsBadRequest()
        {
            LogUploadException ex = Assert.Throws<LogUploadException>(() => _service.CreateUpload(Owner, "test.las", 101));

            Assert.Equal(400, ex.StatusCode);
        }

        [Fact]
        public void OpenRead_IncompleteUpload_Throws()
        {
            LogUploadInfo upload = _service.CreateUpload(Owner, "test.las", 10);

            Assert.Throws<LogUploadException>(() => _service.OpenRead(upload.UploadId, Owner));
        }

        [Fact]
        public void DeleteUpload_RemovesFiles()
        {
            LogUploadInfo upload = _service.CreateUpload(Owner, "test.las", 10);

            _service.DeleteUpload(upload.UploadId, Owner);

            Assert.Empty(Directory.GetFiles(_directory));
        }
    }
}
