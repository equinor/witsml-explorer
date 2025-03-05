using System;
using System.Collections.Generic;
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
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;

using Xunit;

using Index = Witsml.Data.Curves.Index;

namespace WitsmlExplorer.Api.Tests.Workers
{
    public class TrimLogObjectWorkerTests
    {
        private readonly TrimLogObjectWorker _worker;
        private readonly Mock<IWitsmlClient> _witsmlClient;
        private const string WellUid = "WellUid";
        private const string WellboreUid = "WellboreUid";
        private const string LogUid = "LogUid";

        public TrimLogObjectWorkerTests()
        {
            Mock<IWitsmlClientProvider> witsmlClientProvider = new();
            _witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_witsmlClient.Object);
            ILoggerFactory loggerFactory = new LoggerFactory();
            loggerFactory.AddSerilog(Log.Logger);
            ILogger<TrimLogDataJob> logger = loggerFactory.CreateLogger<TrimLogDataJob>();
            _worker = new TrimLogObjectWorker(logger, witsmlClientProvider.Object);
        }

        [Fact]
        public async Task JobHasNoIndexes_DoNothing()
        {
            SetupLog(WitsmlLog.WITSML_INDEX_TYPE_MD, new DepthIndex(10), new DepthIndex(100));
            TrimLogDataJob job = CreateJobTemplate();

            await _worker.Execute(job);

            _witsmlClient.Verify(client => client.DeleteFromStoreAsync(It.IsAny<WitsmlLogs>()), Times.Never);
        }

        [Fact]
        public async Task JobHasIndexesOutOfScope_DoNothing_DepthIndexed()
        {
            SetupLog(WitsmlLog.WITSML_INDEX_TYPE_MD, new DepthIndex(10), new DepthIndex(100));

            TrimLogDataJob job = CreateJobTemplate() with { StartIndex = "8" };
            await _worker.Execute(job);

            job = CreateJobTemplate() with { EndIndex = "110" };
            await _worker.Execute(job);

            job = CreateJobTemplate() with
            {
                StartIndex = "101",
                EndIndex = "102"
            };
            await _worker.Execute(job);

            _witsmlClient.Verify(client => client.DeleteFromStoreAsync(It.IsAny<WitsmlLogs>()), Times.Never);
        }

        [Fact]
        public async Task JobHasIndexesOutOfScope_DoNothing_TimeIndexed()
        {
            DateTime logStart = new(2000, 1, 1);
            DateTime logEnd = new(2000, 1, 10);
            SetupLog(WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME, new DateTimeIndex(logStart), new DateTimeIndex(logEnd));

            TrimLogDataJob job = CreateJobTemplate() with
            {
                StartIndex = logStart.AddDays(-1).ToISODateTimeString()
            };
            await _worker.Execute(job);

            job = CreateJobTemplate() with { EndIndex = logEnd.AddDays(1).ToISODateTimeString() };
            await _worker.Execute(job);

            job = CreateJobTemplate() with
            {
                StartIndex = logEnd.AddDays(1).ToISODateTimeString(),
                EndIndex = logEnd.AddDays(2).ToISODateTimeString()
            };
            await _worker.Execute(job);

            _witsmlClient.Verify(client => client.DeleteFromStoreAsync(It.IsAny<WitsmlLogs>()), Times.Never);
        }

        [Fact]
        public async Task JobHasValidLaterStart_DeleteAllBeforeNewStartIndex_DepthIndexed()
        {
            string newStartIndex = "50";

            SetupLog(WitsmlLog.WITSML_INDEX_TYPE_MD, new DepthIndex(10), new DepthIndex(100));
            TrimLogDataJob job = CreateJobTemplate() with
            {
                StartIndex = newStartIndex,
                EndIndex = "100"
            };

            List<WitsmlLogs> deleteQueries = new();
            _witsmlClient.Setup(client => client.DeleteFromStoreAsync(It.IsAny<WitsmlLogs>()))
                .Callback<WitsmlLogs>(deleteQueries.Add)
                .ReturnsAsync(new QueryResult(true));

            await _worker.Execute(job);

            Assert.Single(deleteQueries);
            WitsmlLogs query = deleteQueries.First();
            Assert.Null(query.Logs.First().StartIndex);
            Assert.Equal(newStartIndex, query.Logs.First().EndIndex.Value);
        }

        [Fact]
        public async Task JobHasValidLaterStart_DeleteAllBeforeNewStartIndex_TimeIndexed()
        {
            DateTime logStart = new(2000, 1, 1);
            DateTime logEnd = new(2000, 1, 10);
            string newLogStart = new DateTime(2000, 1, 5).ToISODateTimeString();

            SetupLog(WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME, new DateTimeIndex(logStart), new DateTimeIndex(logEnd));
            TrimLogDataJob job = CreateJobTemplate() with
            {
                StartIndex = newLogStart,
                EndIndex = logEnd.ToISODateTimeString()
            };

            List<WitsmlLogs> deleteQueries = new();
            _witsmlClient.Setup(client => client.DeleteFromStoreAsync(It.IsAny<WitsmlLogs>()))
                .Callback<WitsmlLogs>(deleteQueries.Add)
                .ReturnsAsync(new QueryResult(true));

            await _worker.Execute(job);

            Assert.Single(deleteQueries);
            WitsmlLogs query = deleteQueries.First();
            Assert.Null(query.Logs.First().StartDateTimeIndex);
            Assert.Equal(newLogStart, query.Logs.First().EndDateTimeIndex);
        }

        [Fact]
        public async Task JobHasValidEarlierEnd_DeleteAllAfterNewEndIndex_DepthIndexed()
        {
            string newEndIndex = "90";

            SetupLog(WitsmlLog.WITSML_INDEX_TYPE_MD, new DepthIndex(10), new DepthIndex(100));
            TrimLogDataJob job = CreateJobTemplate() with
            {
                StartIndex = "10",
                EndIndex = newEndIndex
            };

            List<WitsmlLogs> deleteQueries = new();
            _witsmlClient.Setup(client => client.DeleteFromStoreAsync(It.IsAny<WitsmlLogs>()))
                .Callback<WitsmlLogs>(deleteQueries.Add)
                .ReturnsAsync(new QueryResult(true));

            await _worker.Execute(job);

            Assert.Single(deleteQueries);
            WitsmlLogs query = deleteQueries.First();
            Assert.Equal(newEndIndex, query.Logs.First().StartIndex.Value);
            Assert.Null(query.Logs.First().EndIndex);
        }

        [Fact]
        public async Task JobHasValidEarlierEnd_DeleteAllAfterNewEndIndex_TimeIndexed()
        {
            DateTime logStart = new(2000, 1, 1);
            DateTime logEnd = new(2000, 1, 10);
            string newLogEnd = new DateTime(2000, 1, 5).ToISODateTimeString();

            SetupLog(WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME, new DateTimeIndex(logStart), new DateTimeIndex(logEnd));
            TrimLogDataJob job = CreateJobTemplate() with
            {
                StartIndex = logStart.ToISODateTimeString(),
                EndIndex = newLogEnd
            };

            List<WitsmlLogs> deleteQueries = new();
            _witsmlClient.Setup(client => client.DeleteFromStoreAsync(It.IsAny<WitsmlLogs>()))
                .Callback<WitsmlLogs>(deleteQueries.Add)
                .ReturnsAsync(new QueryResult(true));

            await _worker.Execute(job);

            Assert.Single(deleteQueries);
            WitsmlLogs query = deleteQueries.First();
            Assert.Equal(newLogEnd, query.Logs.First().StartDateTimeIndex);
            Assert.Null(query.Logs.First().EndDateTimeIndex);
        }

        [Fact]
        public async Task JobHasValidLaterStartAndEarlierEnd_DeletesAllBeforeNewStart_DeleteAllAfterNewEndIndex_DepthIndexed()
        {
            string newLogStart = "20";
            string newLogEnd = "90";

            SetupLog(WitsmlLog.WITSML_INDEX_TYPE_MD, new DepthIndex(10), new DepthIndex(100));
            TrimLogDataJob job = CreateJobTemplate() with
            {
                StartIndex = newLogStart,
                EndIndex = newLogEnd
            };

            List<WitsmlLogs> deleteQueries = new();
            _witsmlClient.Setup(client => client.DeleteFromStoreAsync(It.IsAny<WitsmlLogs>()))
                .Callback<WitsmlLogs>(deleteQueries.Add)
                .ReturnsAsync(new QueryResult(true));

            await _worker.Execute(job);

            Assert.Equal(2, deleteQueries.Count);

            WitsmlLogs trimStartQuery = deleteQueries.First();
            Assert.Null(trimStartQuery.Logs.First().StartIndex);
            Assert.Equal(newLogStart, trimStartQuery.Logs.First().EndIndex.Value);

            WitsmlLogs trimEndQuery = deleteQueries.Last();
            Assert.Equal(newLogEnd, trimEndQuery.Logs.First().StartIndex.Value);
            Assert.Null(trimEndQuery.Logs.First().EndIndex);
        }

        [Fact]
        public async Task JobHasValidLaterStandAndEarlierEnd_DeletesAllBeforeNewStart_DeleteAllAfterNewEndIndex_TimeIndexed()
        {
            DateTime logStart = new(2000, 1, 1);
            DateTime logEnd = new(2000, 1, 10);
            string newLogStart = logStart.AddDays(1).ToISODateTimeString();
            string newLogEnd = logEnd.AddDays(-1).ToISODateTimeString();

            SetupLog(WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME, new DateTimeIndex(logStart), new DateTimeIndex(logEnd));
            TrimLogDataJob job = CreateJobTemplate() with
            {
                StartIndex = newLogStart,
                EndIndex = newLogEnd
            };

            List<WitsmlLogs> deleteQueries = new();
            _witsmlClient.Setup(client => client.DeleteFromStoreAsync(It.IsAny<WitsmlLogs>()))
                .Callback<WitsmlLogs>(deleteQueries.Add)
                .ReturnsAsync(new QueryResult(true));

            await _worker.Execute(job);

            Assert.Equal(2, deleteQueries.Count);

            WitsmlLogs trimStartQuery = deleteQueries.First();
            Assert.Null(trimStartQuery.Logs.First().StartDateTimeIndex);
            Assert.Equal(newLogStart, trimStartQuery.Logs.First().EndDateTimeIndex);

            WitsmlLogs trimEndQuery = deleteQueries.Last();
            Assert.Equal(newLogEnd, trimEndQuery.Logs.First().StartDateTimeIndex);
            Assert.Null(trimEndQuery.Logs.First().EndDateTimeIndex);
        }

        [Fact]
        public async Task JobWithNonUtcDateTimeString_Execute_TimeParsedCorrectly()
        {
            DateTime logStart = new(2000, 1, 1);
            DateTime logEnd = new(2000, 1, 10);
            string newLogStart = "2000-01-02T12:00:00.000+02:00";
            string newLogEnd = "2000-01-09T12:00:00.000+02:00";

            SetupLog(WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME, new DateTimeIndex(logStart), new DateTimeIndex(logEnd));
            TrimLogDataJob job = CreateJobTemplate() with
            {
                StartIndex = newLogStart,
                EndIndex = newLogEnd
            };

            List<WitsmlLogs> deleteQueries = new();
            _witsmlClient.Setup(client => client.DeleteFromStoreAsync(It.IsAny<WitsmlLogs>()))
                .Callback<WitsmlLogs>(deleteQueries.Add)
                .ReturnsAsync(new QueryResult(true));

            await _worker.Execute(job);

            Assert.Equal(2, deleteQueries.Count);

            WitsmlLogs trimStartQuery = deleteQueries.First();
            Assert.Null(trimStartQuery.Logs.First().StartDateTimeIndex);
            Assert.Equal("2000-01-02T10:00:00.000Z", trimStartQuery.Logs.First().EndDateTimeIndex);

            WitsmlLogs trimEndQuery = deleteQueries.Last();
            Assert.Null(trimEndQuery.Logs.First().EndDateTimeIndex);
            Assert.Equal("2000-01-09T10:00:00.000Z", trimEndQuery.Logs.First().StartDateTimeIndex);
        }

        private void SetupLog(string indexType, Index startIndex, Index endIndex)
        {
            _witsmlClient.Setup(client =>
                    client.GetFromStoreAsync(It.Is<WitsmlLogs>(witsmlLogs => witsmlLogs.Logs.First().Uid == LogUid), It.Is<OptionsIn>((ops) => ops.ReturnElements == ReturnElements.HeaderOnly), null))
                .ReturnsAsync(GetLogs(indexType, startIndex, endIndex));
        }

        private static WitsmlLogs GetLogs(string indexType, Index startIndex, Index endIndex)
        {
            WitsmlLog witsmlLog = new()
            {
                UidWell = WellUid,
                UidWellbore = WellboreUid,
                Uid = LogUid,
                IndexType = indexType
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

        private static TrimLogDataJob CreateJobTemplate()
        {
            return new TrimLogDataJob
            {
                LogObject = new ObjectReference
                {
                    WellUid = WellUid,
                    WellboreUid = WellboreUid,
                    Uid = LogUid
                }
            };
        }
    }
}
