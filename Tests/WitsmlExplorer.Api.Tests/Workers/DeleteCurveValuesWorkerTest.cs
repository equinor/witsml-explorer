using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Moq;

using Serilog;

using Witsml;
using Witsml.Data;
using Witsml.Data.Curves;
using Witsml.Extensions;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;
using WitsmlExplorer.Api.Workers.Delete;

using Xunit;

using Index = Witsml.Data.Curves.Index;

namespace WitsmlExplorer.Api.Tests.Workers
{
    public class DeleteCurveValuesWorkerTest
    {
        private readonly Mock<IWitsmlClient> _witsmlClient;
        private readonly DeleteCurveValuesWorker _worker;
        private const string WellUid = "wellUid";
        private const string WellboreUid = "wellboreUid";
        private const string LogUid = "logUid";
        private static readonly List<string> Mnemonics = new() { "GS_BPOS" };
        private static readonly List<IndexRange> IndexRanges = new()
        {
            new IndexRange
            {
                StartIndex = "10",
                EndIndex = "20"
            }
        };

        public DeleteCurveValuesWorkerTest()
        {
            _witsmlClient = new Mock<IWitsmlClient>();

            Mock<IWitsmlClientProvider> witsmlClientProvider = new();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_witsmlClient.Object);
            ILoggerFactory loggerFactory = new LoggerFactory();
            loggerFactory.AddSerilog(Log.Logger);
            ILogger<DeleteCurveValuesJob> logger = loggerFactory.CreateLogger<DeleteCurveValuesJob>();
            _worker = new DeleteCurveValuesWorker(logger, witsmlClientProvider.Object);
        }

        [Fact]
        public async Task JobHasNoIndexRanges_DoNothing()
        {
            SetupLog(WitsmlLog.WITSML_INDEX_TYPE_MD, new DepthIndex(10), new DepthIndex(100));
            DeleteCurveValuesJob job = CreateJobTemplate() with { IndexRanges = Array.Empty<IndexRange>() };
            (WorkerResult result, RefreshAction _) = await _worker.Execute(job);

            _witsmlClient.Verify(client => client.GetFromStoreAsync(It.IsAny<WitsmlLogs>(), It.Is<OptionsIn>((ops) => ops.ReturnElements == ReturnElements.HeaderOnly), null), Times.Once);
            _witsmlClient.Verify(client => client.DeleteFromStoreAsync(It.IsAny<WitsmlLogs>()), Times.Never);
            Assert.True(result.IsSuccess);
        }

        [Fact]
        public async Task MnemonicsNotFoundOnLogObject_DoNothing()
        {
            SetupLog(WitsmlLog.WITSML_INDEX_TYPE_MD, new DepthIndex(10), new DepthIndex(100));
            DeleteCurveValuesJob job = CreateJobTemplate() with
            {
                IndexRanges = Array.Empty<IndexRange>(),
                Mnemonics = new List<string> { "NOT_A_MNEMONIC" }
            };
            (WorkerResult result, RefreshAction _) = await _worker.Execute(job);

            _witsmlClient.Verify(client => client.GetFromStoreAsync(It.IsAny<WitsmlLogs>(), It.Is<OptionsIn>((ops) => ops.ReturnElements == ReturnElements.HeaderOnly), null), Times.Once);
            _witsmlClient.Verify(client => client.DeleteFromStoreAsync(It.IsAny<WitsmlLogs>()), Times.Never);
            Assert.True(result.IsSuccess);
        }

        [Fact]
        public async Task LogObjectNotFound_SetNoSuccess()
        {
            SetupLog(WitsmlLog.WITSML_INDEX_TYPE_MD, new DepthIndex(10), new DepthIndex(100));
            DeleteCurveValuesJob job = CreateJobTemplate() with
            {
                IndexRanges = Array.Empty<IndexRange>(),
                Mnemonics = new List<string> { "NOT_A_MNEMONIC" }
            };
            job.LogReference.Uid = "NOT_A_LOG";
            (WorkerResult result, RefreshAction _) = await _worker.Execute(job);

            _witsmlClient.Verify(client => client.GetFromStoreAsync(It.IsAny<WitsmlLogs>(), It.Is<OptionsIn>((ops) => ops.ReturnElements == ReturnElements.HeaderOnly), null), Times.Once);
            _witsmlClient.Verify(client => client.DeleteFromStoreAsync(It.IsAny<WitsmlLogs>()), Times.Never);
            Assert.False(result.IsSuccess);
        }

        [Fact]
        public async Task SingleIndexRange_ShouldRunSingleDeleteQuery()
        {
            SetupLog(WitsmlLog.WITSML_INDEX_TYPE_MD, new DepthIndex(10), new DepthIndex(100));
            DeleteCurveValuesJob job = CreateJobTemplate();
            (WorkerResult result, RefreshAction _) = await _worker.Execute(job);

            _witsmlClient.Verify(client => client.GetFromStoreAsync(It.IsAny<WitsmlLogs>(), It.Is<OptionsIn>((ops) => ops.ReturnElements == ReturnElements.HeaderOnly), null), Times.Once);
            _witsmlClient.Verify(client => client.DeleteFromStoreAsync(It.IsAny<WitsmlLogs>()), Times.Once());
            Assert.True(result.IsSuccess);
        }

        [Fact]
        public async Task SingleIndexRangeDecreasing_ShouldRunSingleDeleteQuery()
        {
            SetupLog(WitsmlLog.WITSML_INDEX_TYPE_MD, new DepthIndex(100), new DepthIndex(10), WitsmlLog.WITSML_DIRECTION_DECREASING);
            DeleteCurveValuesJob job = CreateJobTemplate() with
            {
                IndexRanges = new List<IndexRange>
                {
                    new() {StartIndex = "20", EndIndex = "10"},
                }
            };
            (WorkerResult result, RefreshAction _) = await _worker.Execute(job);

            _witsmlClient.Verify(client => client.GetFromStoreAsync(It.IsAny<WitsmlLogs>(), It.Is<OptionsIn>((ops) => ops.ReturnElements == ReturnElements.HeaderOnly), null), Times.Once);
            _witsmlClient.Verify(client => client.DeleteFromStoreAsync(It.Is<WitsmlLogs>(logs => logs.Logs.First().StartIndex.Value == "20" && logs.Logs.First().EndIndex.Value == "10")), Times.Once());
            Assert.True(result.IsSuccess);
        }

        [Fact]
        public async Task TwoIndexRanges_ShouldRunTwoDeleteQueries_DepthIndexed()
        {
            SetupLog(WitsmlLog.WITSML_INDEX_TYPE_MD, new DepthIndex(10), new DepthIndex(100));
            DeleteCurveValuesJob job = CreateJobTemplate() with
            {
                IndexRanges = new List<IndexRange>
                {
                    new() {StartIndex = "10", EndIndex = "20"},
                    new() {StartIndex = "40", EndIndex = "50"}
                }
            };

            (WorkerResult result, RefreshAction _) = await _worker.Execute(job);

            _witsmlClient.Verify(client => client.GetFromStoreAsync(It.IsAny<WitsmlLogs>(), It.Is<OptionsIn>((ops) => ops.ReturnElements == ReturnElements.HeaderOnly), null), Times.Once);
            _witsmlClient.Verify(client => client.DeleteFromStoreAsync(It.IsAny<WitsmlLogs>()), Times.Exactly(2));
            Assert.True(result.IsSuccess);
        }

        [Fact]
        public async Task TwoIndexRanges_ShouldRunTwoDeleteQueries_TimeIndexed()
        {
            DateTime logStart = new(2000, 1, 1);
            DateTime logEnd = new(2000, 1, 10);
            SetupLog(WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME, new DateTimeIndex(logStart), new DateTimeIndex(logEnd));

            DeleteCurveValuesJob job = CreateJobTemplate() with
            {
                IndexRanges = new List<IndexRange>
                {
                    new()
                    {
                        StartIndex = new DateTime(2000, 1, 2).ToISODateTimeString(),
                        EndIndex = new DateTime(2000, 1, 3).ToISODateTimeString()
                    },
                    new()
                    {
                        StartIndex = new DateTime(2000, 1, 5).ToISODateTimeString(),
                        EndIndex = new DateTime(2000, 1, 6).ToISODateTimeString()
                    }
                }
            };

            (WorkerResult result, RefreshAction _) = await _worker.Execute(job);

            _witsmlClient.Verify(client => client.GetFromStoreAsync(It.IsAny<WitsmlLogs>(), It.Is<OptionsIn>((ops) => ops.ReturnElements == ReturnElements.HeaderOnly), null), Times.Once);
            _witsmlClient.Verify(client => client.DeleteFromStoreAsync(It.IsAny<WitsmlLogs>()), Times.Exactly(2));
            Assert.True(result.IsSuccess);
        }

        [Fact]
        public async Task IndexRangeOutsideLogIndex_ShouldNotRunAnyDeleteQueries_DepthIndex()
        {
            SetupLog(WitsmlLog.WITSML_INDEX_TYPE_MD, new DepthIndex(10), new DepthIndex(100));
            DeleteCurveValuesJob job = CreateJobTemplate() with
            {
                IndexRanges = new List<IndexRange>
                {
                    new()
                    {
                        StartIndex = "1",
                        EndIndex = "5"
                    }
                }
            };

            (WorkerResult result, RefreshAction _) = await _worker.Execute(job);

            _witsmlClient.Verify(client => client.GetFromStoreAsync(It.IsAny<WitsmlLogs>(), It.Is<OptionsIn>((ops) => ops.ReturnElements == ReturnElements.HeaderOnly), null), Times.Once);
            _witsmlClient.Verify(client => client.DeleteFromStoreAsync(It.IsAny<WitsmlLogs>()), Times.Never);
            Assert.True(result.IsSuccess);
        }

        [Fact]
        public async Task IndexRangeOutsideLogIndex_ShouldNotRunAnyDeleteQueries_TimeIndex()
        {
            DateTime logStart = new(2000, 1, 1);
            DateTime logEnd = new(2000, 1, 10);
            SetupLog(WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME, new DateTimeIndex(logStart), new DateTimeIndex(logEnd));

            DeleteCurveValuesJob job = CreateJobTemplate() with
            {
                IndexRanges = new List<IndexRange>
                {
                    new()
                    {
                        StartIndex = new DateTime(1900, 1, 2).ToString(CultureInfo.InvariantCulture),
                        EndIndex = new DateTime(1900, 1, 3).ToString(CultureInfo.InvariantCulture)
                    }
                }
            };

            (WorkerResult result, RefreshAction _) = await _worker.Execute(job);

            _witsmlClient.Verify(client => client.GetFromStoreAsync(It.IsAny<WitsmlLogs>(), It.Is<OptionsIn>((ops) => ops.ReturnElements == ReturnElements.HeaderOnly), null), Times.Once);
            _witsmlClient.Verify(client => client.DeleteFromStoreAsync(It.IsAny<WitsmlLogs>()), Times.Never);
            Assert.True(result.IsSuccess);
        }


        private void SetupLog(string indexType, Index startIndex, Index endIndex, string direction = null)
        {
            _witsmlClient.Setup(client =>
                    client.GetFromStoreAsync(It.Is<WitsmlLogs>(witsmlLogs => witsmlLogs.Logs.First().Uid == LogUid), It.Is<OptionsIn>((ops) => ops.ReturnElements == ReturnElements.HeaderOnly), null))
                .ReturnsAsync(GetLogs(indexType, startIndex, endIndex, direction));

            _witsmlClient.Setup(client =>
                    client.GetFromStoreAsync(It.Is<WitsmlLogs>(witsmlLogs => witsmlLogs.Logs.First().Uid != LogUid), It.Is<OptionsIn>((ops) => ops.ReturnElements == ReturnElements.HeaderOnly), null))
                .ReturnsAsync(new WitsmlLogs());

            _witsmlClient.Setup(client =>
                    client.DeleteFromStoreAsync(It.Is<WitsmlLogs>(witsmlLogs => witsmlLogs.Logs.First().Uid == LogUid)))
                .ReturnsAsync(new QueryResult(true));
        }

        private static WitsmlLogs GetLogs(string indexType, Index startIndex, Index endIndex, string direction)
        {
            WitsmlLog witsmlLog = new()
            {
                UidWell = WellUid,
                UidWellbore = WellboreUid,
                Uid = LogUid,
                IndexType = indexType,
                Direction = direction,
                LogCurveInfo = new List<WitsmlLogCurveInfo>
                {
                    new() {Mnemonic = "DEPTH"},
                    new() {Mnemonic = "GS_BPOS"},
                    new() {Mnemonic = "OTHER"}
                }
            };
            switch (indexType)
            {
                case WitsmlLog.WITSML_INDEX_TYPE_MD:
                    witsmlLog.StartIndex = new WitsmlIndex((DepthIndex)startIndex);
                    witsmlLog.EndIndex = new WitsmlIndex((DepthIndex)endIndex);
                    break;
                case WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME:
                    witsmlLog.StartDateTimeIndex = startIndex.GetValueAsString();
                    witsmlLog.EndDateTimeIndex = endIndex.GetValueAsString();
                    break;
                default:
                    break;
            }

            return new WitsmlLogs
            {
                Logs = new List<WitsmlLog> { witsmlLog }
            };
        }

        private static DeleteCurveValuesJob CreateJobTemplate()
        {
            return new DeleteCurveValuesJob
            {
                LogReference = new ObjectReference
                {
                    WellUid = WellUid,
                    WellboreUid = WellboreUid,
                    Uid = LogUid
                },
                Mnemonics = Mnemonics,
                IndexRanges = IndexRanges
            };
        }
    }
}
