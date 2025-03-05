using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Moq;

using Serilog;

using Witsml;
using Witsml.Data;
using Witsml.Extensions;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;
using WitsmlExplorer.Api.Workers.Delete;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Workers
{
    public class DeleteEmptyMnemonicsWorkerTest
    {
        private readonly Mock<IWitsmlClient> _witsmlClient;
        private readonly DeleteEmptyMnemonicsWorker _worker;
        private readonly Mock<ILogObjectService> _logObjectService;
        private readonly Mock<IMnemonicService> _mnemonicService;

        public DeleteEmptyMnemonicsWorkerTest()
        {
            ILoggerFactory loggerFactory = new LoggerFactory();
            loggerFactory.AddSerilog(Log.Logger);
            ILogger<DeleteEmptyMnemonicsJob> logger = loggerFactory.CreateLogger<DeleteEmptyMnemonicsJob>();

            Mock<IWitsmlClientProvider> witsmlClientProvider = new();
            _witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(wcp => wcp.GetClient()).Returns(_witsmlClient.Object);

            _logObjectService = new();

            _mnemonicService = new();
            _mnemonicService
                .Setup(ms => ms.DeleteMnemonic(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<LogCurveInfo>()))
                .Returns(Task.Run(() => new QueryResult(true)));

            _worker = new DeleteEmptyMnemonicsWorker(logger, witsmlClientProvider.Object, _logObjectService.Object, _mnemonicService.Object);
        }

        [Fact]
        public async Task DeleteZeroMnemonics()
        {
            SetupDateTimeLogObject();

            var dateTime = new DateTime(2023, 8, 20, 12, 0, 0);

            var job = CreateJob(10, dateTime, testWellbores: true);

            (WorkerResult result, RefreshAction _) = await _worker.Execute(job);

            _mnemonicService.Verify(s => s.DeleteMnemonic(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<LogCurveInfo>()),
                Times.Never);

            Assert.True(result.IsSuccess);

            Assert.NotNull(job.JobInfo?.Report);
            Assert.Empty(job.JobInfo.Report.ReportItems);
            Assert.Equal("3 mnemonics were checked for NullDepthValue: \"10\" and NullTimeValue: \"" + dateTime.ToISODateTimeString() + "\". No empty mnemonics were found and deleted.",
                job.JobInfo.Report.Summary);

            Assert.Equal("DeleteEmptyMnemonicsJob - WellUids: 111; WellboreUids: 112; LogUids: ;", job.JobInfo.Description);
            Assert.Equal("Well111", job.JobInfo.WellName);
            Assert.Equal("Wellbore112", job.JobInfo.WellboreName);
            Assert.Equal("", job.JobInfo.ObjectName);
        }

        [Fact]
        public async Task DeleteOneMnemonic()
        {
            SetupDepthLogObject();

            var dateTime = new DateTime(2023, 8, 20, 12, 0, 0);

            var job = CreateJob(0, dateTime, testWellbores: true);

            (WorkerResult result, RefreshAction _) = await _worker.Execute(job);

            _mnemonicService.Verify(s => s.DeleteMnemonic(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<LogCurveInfo>()),
                Times.Once);

            Assert.True(result.IsSuccess);

            Assert.NotNull(job.JobInfo?.Report);
            Assert.Single(job.JobInfo.Report.ReportItems);
            Assert.Equal("4 mnemonics were checked for NullDepthValue: \"0\" and NullTimeValue: \"" + dateTime.ToISODateTimeString() + "\". One empty mnemonic was found and deleted.",
                job.JobInfo.Report.Summary);

            Assert.Equal("DeleteEmptyMnemonicsJob - WellUids: 111; WellboreUids: 112; LogUids: ;", job.JobInfo.Description);
            Assert.Equal("Well111", job.JobInfo.WellName);
            Assert.Equal("Wellbore112", job.JobInfo.WellboreName);
            Assert.Equal("", job.JobInfo.ObjectName);
        }

        [Fact]
        public async Task DeleteNullIndexMnemonic()
        {
            SetupDepthLogObject();

            var dateTime = new DateTime(2023, 8, 20, 12, 0, 0);

            var job = CreateJob(999, dateTime, testWellbores: true, deleteNullIndex: true);

            (WorkerResult result, RefreshAction _) = await _worker.Execute(job);

            _mnemonicService.Verify(s => s.DeleteMnemonic(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<LogCurveInfo>()),
                Times.Once);

            Assert.True(result.IsSuccess);

            Assert.NotNull(job.JobInfo?.Report);
            Assert.Single(job.JobInfo.Report.ReportItems);
            Assert.Equal("4 mnemonics were checked for NullDepthValue: \"999\" and NullTimeValue: \"" + dateTime.ToISODateTimeString() + "\". One empty mnemonic was found and deleted.",
                job.JobInfo.Report.Summary);

            Assert.Equal("DeleteEmptyMnemonicsJob - WellUids: 111; WellboreUids: 112; LogUids: ;", job.JobInfo.Description);
            Assert.Equal("Well111", job.JobInfo.WellName);
            Assert.Equal("Wellbore112", job.JobInfo.WellboreName);
            Assert.Equal("", job.JobInfo.ObjectName);
        }

        [Fact]
        public async Task DeleteTwoMnemonics()
        {
            SetupDateTimeLogObject();

            var dateTime = new DateTime(2023, 3, 21, 12, 0, 0);

            var job = CreateJob(10, dateTime, testWellbores: true);

            (WorkerResult result, RefreshAction _) = await _worker.Execute(job);

            _mnemonicService.Verify(s => s.DeleteMnemonic(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<LogCurveInfo>()),
                Times.Exactly(2));

            Assert.True(result.IsSuccess);

            Assert.NotNull(job.JobInfo?.Report);
            Assert.Equal(2, job.JobInfo.Report.ReportItems.Count());
            Assert.Equal("3 mnemonics were checked for NullDepthValue: \"10\" and NullTimeValue: \"" + dateTime.ToISODateTimeString() + "\". 2 empty mnemonics were found and deleted.",
                job.JobInfo.Report.Summary);

            Assert.Equal("DeleteEmptyMnemonicsJob - WellUids: 111; WellboreUids: 112; LogUids: ;", job.JobInfo.Description);
            Assert.Equal("Well111", job.JobInfo.WellName);
            Assert.Equal("Wellbore112", job.JobInfo.WellboreName);
            Assert.Equal("", job.JobInfo.ObjectName);
        }

        [Fact]
        public async Task DeleteWellMnemonics()
        {
            SetupDepthLogObject();

            var dateTime = new DateTime(2023, 8, 20, 12, 0, 0);

            var job = CreateJob(0, dateTime, testWells: true);

            (WorkerResult result, RefreshAction _) = await _worker.Execute(job);

            _mnemonicService.Verify(s => s.DeleteMnemonic(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<LogCurveInfo>()),
                Times.Once);

            Assert.True(result.IsSuccess);

            Assert.NotNull(job.JobInfo?.Report);
            Assert.Single(job.JobInfo.Report.ReportItems);
            Assert.Equal("4 mnemonics were checked for NullDepthValue: \"0\" and NullTimeValue: \"" + dateTime.ToISODateTimeString() + "\". One empty mnemonic was found and deleted.",
                job.JobInfo.Report.Summary);

            Assert.Equal("DeleteEmptyMnemonicsJob - WellUids: 111; WellboreUids: ; LogUids: ;", job.JobInfo.Description);
            Assert.Equal("Well111", job.JobInfo.WellName);
            Assert.Equal("", job.JobInfo.WellboreName);
            Assert.Equal("", job.JobInfo.ObjectName);
        }

        [Fact]
        public async Task DeleteLogMnemonics()
        {
            SetupDepthLogObject();

            var dateTime = new DateTime(2023, 8, 20, 12, 0, 0);

            var job = CreateJob(0, dateTime, testLogs: true);

            (WorkerResult result, RefreshAction _) = await _worker.Execute(job);

            _mnemonicService.Verify(s => s.DeleteMnemonic(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<LogCurveInfo>()),
                Times.Once);

            Assert.True(result.IsSuccess);

            Assert.NotNull(job.JobInfo?.Report);
            Assert.Single(job.JobInfo.Report.ReportItems);
            Assert.Equal("4 mnemonics were checked for NullDepthValue: \"0\" and NullTimeValue: \"" + dateTime.ToISODateTimeString() + "\". One empty mnemonic was found and deleted.",
                job.JobInfo.Report.Summary);

            Assert.Equal("DeleteEmptyMnemonicsJob - WellUids: 111; WellboreUids: 112; LogUids: 123;", job.JobInfo.Description);
            Assert.Equal("Well111", job.JobInfo.WellName);
            Assert.Equal("Wellbore112", job.JobInfo.WellboreName);
            Assert.Equal("Log123", job.JobInfo.ObjectName);
        }

        private void SetupDateTimeLogObject()
        {
            _logObjectService
                .Setup(los => los.GetLogs(It.IsAny<string>(), It.IsAny<string>()))
                .Returns(Task.Run(() => new List<LogObject> { new LogObject() { Uid = "123", IndexType = WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME } }.AsCollection()));

            _logObjectService
                .Setup(los => los.GetLog(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), null))
                .Returns(Task.Run(() => new LogObject() { Uid = "123", IndexType = WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME }));

            var lcis = new List<LogCurveInfo>();

            var lci = new LogCurveInfo
            {
                MinDateTimeIndex = new DateTime(2023, 1, 20, 12, 0, 0).ToISODateTimeString(),
                MaxDateTimeIndex = new DateTime(2023, 2, 21, 12, 0, 0).ToISODateTimeString()
            };
            lcis.Add(lci);

            lci = new LogCurveInfo
            {
                MinDateTimeIndex = new DateTime(2023, 3, 21, 12, 0, 0).ToISODateTimeString(),
                MaxDateTimeIndex = new DateTime(2023, 3, 21, 12, 0, 0).ToISODateTimeString()
            };
            lcis.Add(lci);

            lci = new LogCurveInfo
            {
                MinDateTimeIndex = new DateTime(2023, 3, 21, 12, 0, 0).ToISODateTimeString(),
                MaxDateTimeIndex = new DateTime(2023, 3, 21, 12, 0, 0).ToISODateTimeString()
            };
            lcis.Add(lci);

            _logObjectService
                .Setup(los => los.GetLogCurveInfo(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
                .Returns(Task.Run(() => lcis.AsCollection()));
        }

        private void SetupDepthLogObject()
        {
            _logObjectService
                .Setup(los => los.GetLogs(It.IsAny<string>(), It.IsAny<string>()))
                .Returns(Task.Run(() => new List<LogObject> { new LogObject() { Uid = "123", IndexType = WitsmlLog.WITSML_INDEX_TYPE_MD } }.AsCollection()));

            _logObjectService
                .Setup(los => los.GetLog(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), null))
                .Returns(Task.Run(() => new LogObject() { Uid = "123", IndexType = WitsmlLog.WITSML_INDEX_TYPE_MD }));

            var lcis = new List<LogCurveInfo>
            {
                new()
                {
                    MinDepthIndex = "0",
                    MaxDepthIndex = "0"
                },
                new()
                {
                    MinDepthIndex = "1",
                    MaxDepthIndex = "1"
                },
                new()
                {
                    MinDepthIndex = "0",
                    MaxDepthIndex = "1"
                },
                new()
                {
                    MinDepthIndex = null,
                    MaxDepthIndex = null
                }
            };

            _logObjectService
                .Setup(los => los.GetLogCurveInfo(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
                .Returns(Task.Run(() => lcis.AsCollection()));
        }

        private DeleteEmptyMnemonicsJob CreateJob(double nullDepthValue, DateTime nullTimeValue, bool testWells = false, bool testWellbores = false, bool testLogs = false, bool deleteNullIndex = false)
        {
            return new DeleteEmptyMnemonicsJob()
            {
                NullDepthValue = nullDepthValue,
                NullTimeValue = nullTimeValue,
                DeleteNullIndex = deleteNullIndex,
                Wells = testWells ? new List<WellReference> { new WellReference() { WellUid = "111", WellName = "Well111" } } : new List<WellReference>(),
                Wellbores = testWellbores ? new List<WellboreReference> { new WellboreReference() { WellUid = "111", WellName = "Well111", WellboreUid = "112", WellboreName = "Wellbore112" } } : new List<WellboreReference>(),
                Logs = testLogs ? new List<ObjectReference> { new ObjectReference() { WellUid = "111", WellName = "Well111", WellboreUid = "112", WellboreName = "Wellbore112", Uid = "123", Name = "Log123" } } : new List<ObjectReference>(),
                JobInfo = new JobInfo()
            };
        }
    }
}
