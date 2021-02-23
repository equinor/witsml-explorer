using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using Moq;
using Witsml;
using Witsml.Data;
using Witsml.Data.Curves;
using Witsml.Extensions;
using Witsml.ServiceReference;
using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;
using Xunit;
using Index = Witsml.Data.Curves.Index;

namespace WitsmlExplorer.Api.Tests.Workers
{
    public class DeleteCurveValuesWorkerTest
    {
        private readonly Mock<IWitsmlClient> witsmlClient;
        private readonly DeleteCurveValuesWorker worker;
        private const string WellUid = "wellUid";
        private const string WellboreUid = "wellboreUid";
        private const string LogUid = "logUid";
        private static readonly List<string> Mnemonics = new List<string> {"GS_BPOS"};
        private static readonly List<IndexRange> IndexRanges = new List<IndexRange>
        {
            new IndexRange
            {
                StartIndex = "10",
                EndIndex = "20"
            }
        };


        public DeleteCurveValuesWorkerTest()
        {
            witsmlClient = new Mock<IWitsmlClient>();

            var witsmlClientProvider = new Mock<IWitsmlClientProvider>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(witsmlClient.Object);
            worker = new DeleteCurveValuesWorker(witsmlClientProvider.Object);
        }

        [Fact]
        public async Task JobHasNoIndexRanges_DoNothing()
        {
            SetupLog(WitsmlLog.WITSML_INDEX_TYPE_MD, new DepthIndex(10), new DepthIndex(100));
            var job = CreateJobTemplate();
            job.IndexRanges = new IndexRange[] { };
            var result = await worker.Execute(job);

            witsmlClient.Verify(client => client.GetFromStoreAsync(It.IsAny<WitsmlLogs>(), OptionsIn.HeaderOnly), Times.Once);
            witsmlClient.Verify(client => client.DeleteFromStoreAsync(It.IsAny<WitsmlLogs>()), Times.Never);
            Assert.True(result.workerResult.IsSuccess);
        }

        [Fact]
        public async Task MnemonicsNotFoundOnLogObject_DoNothing()
        {
            SetupLog(WitsmlLog.WITSML_INDEX_TYPE_MD, new DepthIndex(10), new DepthIndex(100));
            var job = CreateJobTemplate();
            job.IndexRanges = new IndexRange[] { };
            job.Mnemonics = new List<string>() { "NOT_A_MNEMONIC" };
            var result = await worker.Execute(job);

            witsmlClient.Verify(client => client.GetFromStoreAsync(It.IsAny<WitsmlLogs>(), OptionsIn.HeaderOnly), Times.Once);
            witsmlClient.Verify(client => client.DeleteFromStoreAsync(It.IsAny<WitsmlLogs>()), Times.Never);
            Assert.True(result.workerResult.IsSuccess);
        }

        [Fact]
        public async Task LogObjectNotFound_SetNoSuccess()
        {
            SetupLog(WitsmlLog.WITSML_INDEX_TYPE_MD, new DepthIndex(10), new DepthIndex(100));
            var job = CreateJobTemplate();
            job.IndexRanges = new IndexRange[] { };
            job.Mnemonics = new List<string>() { "NOT_A_MNEMONIC" };
            job.LogReference.LogUid = "NOT_A_LOG";
            var result = await worker.Execute(job);

            witsmlClient.Verify(client => client.GetFromStoreAsync(It.IsAny<WitsmlLogs>(), OptionsIn.HeaderOnly), Times.Once);
            witsmlClient.Verify(client => client.DeleteFromStoreAsync(It.IsAny<WitsmlLogs>()), Times.Never);
            Assert.False(result.workerResult.IsSuccess);
        }

        [Fact]
        public async Task SingleIndexRange_ShouldRunSingleDeleteQuery()
        {
            SetupLog(WitsmlLog.WITSML_INDEX_TYPE_MD, new DepthIndex(10), new DepthIndex(100));
            var job = CreateJobTemplate();
            var result = await worker.Execute(job);

            witsmlClient.Verify(client => client.GetFromStoreAsync(It.IsAny<WitsmlLogs>(), OptionsIn.HeaderOnly), Times.Once);
            witsmlClient.Verify(client => client.DeleteFromStoreAsync(It.IsAny<WitsmlLogs>()), Times.Once());
            Assert.True(result.workerResult.IsSuccess);
        }

        [Fact]
        public async Task TwoIndexRanges_ShouldRunTwoDeleteQueries_DepthIndexed()
        {
            SetupLog(WitsmlLog.WITSML_INDEX_TYPE_MD, new DepthIndex(10), new DepthIndex(100));
            var job = CreateJobTemplate();
            job.IndexRanges = new List<IndexRange>
            {
                new IndexRange {StartIndex = "10", EndIndex = "20"},
                new IndexRange {StartIndex = "40", EndIndex = "50"}
            };

            var result = await worker.Execute(job);

            witsmlClient.Verify(client => client.GetFromStoreAsync(It.IsAny<WitsmlLogs>(), OptionsIn.HeaderOnly), Times.Once);
            witsmlClient.Verify(client => client.DeleteFromStoreAsync(It.IsAny<WitsmlLogs>()), Times.Exactly(2));
            Assert.True(result.workerResult.IsSuccess);
        }

        [Fact]
        public async Task TwoIndexRanges_ShouldRunTwoDeleteQueries_TimeIndexed()
        {
            var logStart = new DateTime(2000, 1, 1);
            var logEnd = new DateTime(2000, 1, 10);
            SetupLog(WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME, new DateTimeIndex(logStart), new DateTimeIndex(logEnd));

            var job = CreateJobTemplate();
            job.IndexRanges = new List<IndexRange>
            {
                new IndexRange
                {
                    StartIndex = new DateTime(2000, 1, 2).ToISODateTimeString(),
                    EndIndex = new DateTime(2000, 1, 3).ToISODateTimeString()
                },
                new IndexRange
                {
                    StartIndex = new DateTime(2000, 1, 5).ToISODateTimeString(),
                    EndIndex = new DateTime(2000, 1, 6).ToISODateTimeString()
                }
            };

            var result = await worker.Execute(job);

            witsmlClient.Verify(client => client.GetFromStoreAsync(It.IsAny<WitsmlLogs>(), OptionsIn.HeaderOnly), Times.Once);
            witsmlClient.Verify(client => client.DeleteFromStoreAsync(It.IsAny<WitsmlLogs>()), Times.Exactly(2));
            Assert.True(result.workerResult.IsSuccess);
        }

        [Fact]
        public async Task IndexRangeOutsideLogIndex_ShouldNotRunAnyDeleteQueries_DepthIndex()
        {
            SetupLog(WitsmlLog.WITSML_INDEX_TYPE_MD, new DepthIndex(10), new DepthIndex(100));
            var job = CreateJobTemplate();
            job.IndexRanges = new List<IndexRange>()
            {
                new IndexRange
                {
                    StartIndex = "1",
                    EndIndex = "5"
                }
            };

            var result = await worker.Execute(job);

            witsmlClient.Verify(client => client.GetFromStoreAsync(It.IsAny<WitsmlLogs>(), OptionsIn.HeaderOnly), Times.Once);
            witsmlClient.Verify(client => client.DeleteFromStoreAsync(It.IsAny<WitsmlLogs>()), Times.Never);
            Assert.True(result.workerResult.IsSuccess);
        }

        [Fact]
        public async Task IndexRangeOutsideLogIndex_ShouldNotRunAnyDeleteQueries_TimeIndex()
        {
            var logStart = new DateTime(2000, 1, 1);
            var logEnd = new DateTime(2000, 1, 10);
            SetupLog(WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME, new DateTimeIndex(logStart), new DateTimeIndex(logEnd));

            var job = CreateJobTemplate();
            job.IndexRanges = new List<IndexRange>
            {
                new IndexRange
                {
                    StartIndex = new DateTime(1900, 1, 2).ToString(CultureInfo.InvariantCulture),
                    EndIndex = new DateTime(1900, 1, 3).ToString(CultureInfo.InvariantCulture)
                }
            };

            var result = await worker.Execute(job);

            witsmlClient.Verify(client => client.GetFromStoreAsync(It.IsAny<WitsmlLogs>(), OptionsIn.HeaderOnly), Times.Once);
            witsmlClient.Verify(client => client.DeleteFromStoreAsync(It.IsAny<WitsmlLogs>()), Times.Never);
            Assert.True(result.workerResult.IsSuccess);
        }


        private void SetupLog(string indexType, Index startIndex, Index endIndex)
        {
            witsmlClient.Setup(client =>
                    client.GetFromStoreAsync(It.Is<WitsmlLogs>(witsmlLogs => witsmlLogs.Logs.First().Uid == LogUid), OptionsIn.HeaderOnly))
                .ReturnsAsync(GetLogs(indexType, startIndex, endIndex));

            witsmlClient.Setup(client =>
                    client.GetFromStoreAsync(It.Is<WitsmlLogs>(witsmlLogs => witsmlLogs.Logs.First().Uid != LogUid), OptionsIn.HeaderOnly))
                .ReturnsAsync(new WitsmlLogs());

            witsmlClient.Setup(client =>
                    client.DeleteFromStoreAsync(It.Is<WitsmlLogs>(witsmlLogs => witsmlLogs.Logs.First().Uid == LogUid)))
                .ReturnsAsync(new QueryResult(true, null));
        }

        private WitsmlLogs GetLogs(string indexType, Index startIndex, Index endIndex)
        {
            var witsmlLog = new WitsmlLog
            {
                UidWell = WellUid,
                UidWellbore = WellboreUid,
                Uid = LogUid,
                IndexType = indexType,
                LogCurveInfo = new List<WitsmlLogCurveInfo>
                {
                    new WitsmlLogCurveInfo {Mnemonic = "DEPTH"},
                    new WitsmlLogCurveInfo {Mnemonic = "GS_BPOS"},
                    new WitsmlLogCurveInfo {Mnemonic = "OTHER"}
                }
            };
            switch (indexType)
            {
                case WitsmlLog.WITSML_INDEX_TYPE_MD:
                    witsmlLog.StartIndex = new WitsmlIndex((DepthIndex) startIndex);
                    witsmlLog.EndIndex = new WitsmlIndex((DepthIndex) endIndex);
                    break;
                case WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME:
                    witsmlLog.StartDateTimeIndex = startIndex.GetValueAsString();
                    witsmlLog.EndDateTimeIndex = endIndex.GetValueAsString();
                    break;
            }

            return new WitsmlLogs
            {
                Logs = new List<WitsmlLog> {witsmlLog}
            };
        }

        private DeleteCurveValuesJob CreateJobTemplate()
        {
            return new DeleteCurveValuesJob
            {
                LogReference = new LogReference
                {
                    WellUid = WellUid,
                    WellboreUid = WellboreUid,
                    LogUid = LogUid
                },
                Mnemonics = Mnemonics,
                IndexRanges = IndexRanges
            };
        }
    }
}
