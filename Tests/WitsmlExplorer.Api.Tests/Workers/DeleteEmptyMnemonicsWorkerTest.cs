using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
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
        private readonly Mock<IWellboreService> _wellboreService;
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

            _wellboreService = new();
            _wellboreService
                .Setup(ws => ws.GetWellbores(It.IsAny<string>()))
                .Returns(Task.Run(() => new List<Wellbore>().AsEnumerable()));

            _logObjectService = new();

            _mnemonicService = new();
            _mnemonicService
                .Setup(ms => ms.DeleteMnemonic(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<LogCurveInfo>()))
                .Returns(Task.Run(() => new QueryResult(true)));

            _worker = new DeleteEmptyMnemonicsWorker(logger, witsmlClientProvider.Object, _wellboreService.Object, _logObjectService.Object, _mnemonicService.Object);
        }

        [Fact]
        public async Task DeleteZeroMnemonics()
        {
            SetupDateTimeLogObject();

            var job = CreateJob(10, new DateTime(2023, 8, 20, 12, 0, 0));

            (WorkerResult result, RefreshAction _) = await _worker.Execute(job);

            _wellboreService.Verify(s => s.GetWellbores(It.IsAny<string>()), Times.Never);

            _mnemonicService.Verify(s => s.DeleteMnemonic(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<LogCurveInfo>()),
                Times.Never);

            Assert.True(result.IsSuccess);

            Assert.NotNull(job.JobInfo?.Report);
            Assert.Empty(job.JobInfo.Report.ReportItems);
            Assert.Equal("3 mnemonics were checked for NullDepthValue: \"10\" and NullTimeValue: \"2023-08-20T10:00:00.000Z\". No empty mnemonics were found and deleted.",
                job.JobInfo.Report.Summary);
        }

        [Fact]
        public async Task DeleteOneMnemonic()
        {
            SetupDepthLogObject();

            var job = CreateJob(0, new DateTime(2023, 8, 20, 12, 0, 0));

            (WorkerResult result, RefreshAction _) = await _worker.Execute(job);

            _wellboreService.Verify(s => s.GetWellbores(It.IsAny<string>()), Times.Never);

            _mnemonicService.Verify(s => s.DeleteMnemonic(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<LogCurveInfo>()),
                Times.Once);

            Assert.True(result.IsSuccess);

            Assert.NotNull(job.JobInfo?.Report);
            Assert.Single(job.JobInfo.Report.ReportItems);
            Assert.Equal("3 mnemonics were checked for NullDepthValue: \"0\" and NullTimeValue: \"2023-08-20T10:00:00.000Z\". One empty mnemonic was found and deleted.",
                job.JobInfo.Report.Summary);
        }

        [Fact]
        public async Task DeleteTwoMnemonics()
        {
            SetupDateTimeLogObject();

            var job = CreateJob(10, new DateTime(2023, 3, 21, 12, 0, 0));

            (WorkerResult result, RefreshAction _) = await _worker.Execute(job);

            _wellboreService.Verify(s => s.GetWellbores(It.IsAny<string>()), Times.Never);

            _mnemonicService.Verify(s => s.DeleteMnemonic(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<LogCurveInfo>()),
                Times.Exactly(2));

            Assert.True(result.IsSuccess);

            Assert.NotNull(job.JobInfo?.Report);
            Assert.Equal(2, job.JobInfo.Report.ReportItems.Count());
            Assert.Equal("3 mnemonics were checked for NullDepthValue: \"10\" and NullTimeValue: \"2023-03-21T11:00:00.000Z\". 2 empty mnemonics were found and deleted.",
                job.JobInfo.Report.Summary);
        }

        private void SetupDateTimeLogObject()
        {
            _logObjectService
                .Setup(los => los.GetLogs(It.IsAny<string>(), It.IsAny<string>()))
                .Returns(Task.Run(() => new List<LogObject> { new LogObject() { Uid = "123", IndexType = WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME } }.AsEnumerable()));

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
                .Returns(Task.Run(() => lcis.AsEnumerable()));
        }

        private void SetupDepthLogObject()
        {
            _logObjectService
                .Setup(los => los.GetLogs(It.IsAny<string>(), It.IsAny<string>()))
                .Returns(Task.Run(() => new List<LogObject> { new LogObject() { Uid = "123", IndexType = WitsmlLog.WITSML_INDEX_TYPE_MD } }.AsEnumerable()));

            var lcis = new List<LogCurveInfo>();

            var lci = new LogCurveInfo
            {
                MinDepthIndex = "0",
                MaxDepthIndex = "0"
            };
            lcis.Add(lci);

            lci = new LogCurveInfo
            {
                MinDepthIndex = "1",
                MaxDepthIndex = "1"
            };
            lcis.Add(lci);

            lci = new LogCurveInfo
            {
                MinDepthIndex = "0",
                MaxDepthIndex = "1"
            };
            lcis.Add(lci);

            _logObjectService
                .Setup(los => los.GetLogCurveInfo(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
                .Returns(Task.Run(() => lcis.AsEnumerable()));
        }

        private DeleteEmptyMnemonicsJob CreateJob(double nullDepthValue, DateTime nullTimeValue)
        {
            return new DeleteEmptyMnemonicsJob()
            {
                NullDepthValue = nullDepthValue,
                NullTimeValue = nullTimeValue,
                Wells = new List<WellReference>(),
                Wellbores = new List<WellboreReference> { new WellboreReference() { WellUid = "111", WellName = "Well111", WellboreUid = "112", WellboreName = "Wellbore112" } },
                JobInfo = new JobInfo()
            };
        }
    }
}
