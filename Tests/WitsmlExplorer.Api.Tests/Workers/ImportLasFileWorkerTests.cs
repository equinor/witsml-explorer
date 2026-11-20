using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Moq;

using Serilog;

using Witsml;
using Witsml.Data;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Workers
{
    public class ImportLasFileWorkerTests
    {
        private const string WellUid = "wellUid";
        private const string WellboreUid = "wellboreUid";
        private const string LogUid = "logUid";
        private const string UploadId = "0123456789abcdef0123456789abcdef";
        private const string LasContent = @"~V
 VERS. 2.0 :
 WRAP. NO :
~W
 NULL. -999.25 :
~C
 DEPT.M :
 GR  .GAPI :
 GR  .API :
~A
100.0 1 -999.25
100.5 2 3
";

        private readonly Mock<IWitsmlClient> _witsmlClient;
        private readonly Mock<ILogUploadService> _uploadService;
        private readonly ImportLasFileWorker _worker;

        public ImportLasFileWorkerTests()
        {
            Mock<IWitsmlClientProvider> witsmlClientProvider = new();
            _witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_witsmlClient.Object);
            LogUtils.SetUpGetServerCapabilites(_witsmlClient);
            ILoggerFactory loggerFactory = new LoggerFactory();
            loggerFactory.AddSerilog(Log.Logger);
            _uploadService = new Mock<ILogUploadService>();
            _worker = new ImportLasFileWorker(loggerFactory.CreateLogger<ImportLasFileJob>(), witsmlClientProvider.Object, _uploadService.Object);
        }

        [Fact]
        public void GetImportColumns_RenamesIndexAndDuplicates()
        {
            List<LasCurve> curves = new()
            {
                new LasCurve { Mnemonic = "DEPT", Unit = "M" },
                new LasCurve { Mnemonic = "GR", Unit = "GAPI" },
                new LasCurve { Mnemonic = "GR", Unit = "API" }
            };

            List<ImportLasFileWorker.ImportColumn> columns = ImportLasFileWorker.GetImportColumns(curves, "Depth", null);

            Assert.Equal(new[] { "Depth", "GR", "GR(2)" }, columns.Select(c => c.Mnemonic));
            Assert.Equal(new[] { 0, 1, 2 }, columns.Select(c => c.SourceIndex));
        }

        [Fact]
        public void GetImportColumns_FiltersSelectedMnemonics()
        {
            List<LasCurve> curves = new()
            {
                new LasCurve { Mnemonic = "GR", Unit = "API" },
                new LasCurve { Mnemonic = "DEPT", Unit = "M" },
                new LasCurve { Mnemonic = "RES", Unit = "OHMM" }
            };

            List<ImportLasFileWorker.ImportColumn> columns = ImportLasFileWorker.GetImportColumns(curves, "DEPT", new[] { "RES" });

            Assert.Equal(new[] { "DEPT", "RES" }, columns.Select(c => c.Mnemonic));
            Assert.Equal(new[] { 1, 2 }, columns.Select(c => c.SourceIndex));
        }

        [Theory]
        [InlineData("12:30:15/01-Feb-2024", "HH:mm:ss/dd-MMM-yyyy", "2024-02-01T12:30:15.000Z")]
        [InlineData("2024-02-01T12:30:15Z", "", "2024-02-01T12:30:15.000Z")]
        public void ConvertDateTime_ReturnsIsoString(string value, string format, string expected)
        {
            Assert.Equal(expected, ImportLasFileWorker.ConvertDateTime(value, format));
        }

        [Fact]
        public void ConvertDateTime_InvalidValue_Throws()
        {
            Assert.Throws<InvalidDataException>(() => ImportLasFileWorker.ConvertDateTime("not a date", null));
        }

        [Fact]
        public async Task Execute_ImportsRowsAndDeletesUpload()
        {
            SetUpUpload();
            SetUpLogHeader();
            List<WitsmlLogs> updates = new();
            _witsmlClient.Setup(client => client.UpdateInStoreAsync(It.IsAny<WitsmlLogs>()))
                .Callback<WitsmlLogs>(updates.Add)
                .ReturnsAsync(new QueryResult(true));

            (WorkerResult result, RefreshAction _) = await _worker.Execute(CreateJob());

            Assert.True(result.IsSuccess);
            WitsmlLogData data = updates.Last().Logs.First().LogData;
            Assert.Equal("Depth,GR,GR(2)", data.MnemonicList);
            Assert.Equal(new[] { "100.0,1,", "100.5,2,3" }, data.Data.Select(d => d.Data));
            _uploadService.Verify(s => s.DeleteUpload(UploadId, It.IsAny<string>()), Times.Once);
        }

        [Fact]
        public async Task Execute_UpdateFails_ReturnsFailureAndDeletesUpload()
        {
            SetUpUpload();
            SetUpLogHeader();
            _witsmlClient.Setup(client => client.UpdateInStoreAsync(It.IsAny<WitsmlLogs>()))
                .ReturnsAsync(new QueryResult(false, "error"));

            (WorkerResult result, RefreshAction _) = await _worker.Execute(CreateJob());

            Assert.False(result.IsSuccess);
            _uploadService.Verify(s => s.DeleteUpload(UploadId, It.IsAny<string>()), Times.Once);
        }

        private void SetUpUpload()
        {
            byte[] bytes = Encoding.UTF8.GetBytes(LasContent);
            _uploadService.Setup(s => s.GetUpload(UploadId, It.IsAny<string>()))
                .Returns(new LogUploadInfo { UploadId = UploadId, FileName = "test.las", TotalSize = bytes.Length, ReceivedBytes = bytes.Length });
            _uploadService.Setup(s => s.OpenRead(UploadId, It.IsAny<string>())).Returns(() => new MemoryStream(bytes));
        }

        private void SetUpLogHeader()
        {
            WitsmlLogs log = new()
            {
                Logs = new List<WitsmlLog>
                {
                    new()
                    {
                        UidWell = WellUid,
                        UidWellbore = WellboreUid,
                        Uid = LogUid,
                        IndexType = WitsmlLog.WITSML_INDEX_TYPE_MD,
                        IndexCurve = new WitsmlIndexCurve { Value = "Depth" },
                        LogCurveInfo = new List<WitsmlLogCurveInfo>
                        {
                            new() { Mnemonic = "Depth", Unit = CommonConstants.Unit.Meter }
                        }
                    }
                }
            };
            _witsmlClient.Setup(client => client.GetFromStoreAsync(It.IsAny<WitsmlLogs>(), It.Is<OptionsIn>(o => o.ReturnElements == ReturnElements.HeaderOnly), null))
                .ReturnsAsync(log);
        }

        private static ImportLasFileJob CreateJob()
        {
            return new ImportLasFileJob
            {
                TargetLog = new ObjectReference { WellUid = WellUid, WellboreUid = WellboreUid, Uid = LogUid },
                UploadId = UploadId
            };
        }
    }
}
