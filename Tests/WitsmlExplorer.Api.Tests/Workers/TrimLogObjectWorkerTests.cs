using System;
using System.Collections.Generic;
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
    public class TrimLogObjectWorkerTests
    {
        private readonly TrimLogObjectWorker worker;
        private readonly Mock<IWitsmlClient> witsmlClient;
        private const string WellUid = "WellUid";
        private const string WellboreUid = "WellboreUid";
        private const string LogUid = "LogUid";

        public TrimLogObjectWorkerTests()
        {
            var witsmlClientProvider = new Mock<IWitsmlClientProvider>();
            witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(witsmlClient.Object);
            worker = new TrimLogObjectWorker(witsmlClientProvider.Object);
        }

        [Fact]
        public async Task JobHasNoIndexes_DoNothing()
        {
            SetupLog(WitsmlLog.WITSML_INDEX_TYPE_MD, new DepthIndex(10), new DepthIndex(100));
            var job = CreateJobTemplate();

            await worker.Execute(job);

            witsmlClient.Verify(client => client.DeleteFromStoreAsync(It.IsAny<WitsmlLogs>()), Times.Never);
        }

        [Fact]
        public async Task JobHasIndexesOutOfScope_DoNothing_DepthIndexed()
        {
            SetupLog(WitsmlLog.WITSML_INDEX_TYPE_MD, new DepthIndex(10), new DepthIndex(100));

            var job = CreateJobTemplate();
            job.StartIndex = "8";
            await worker.Execute(job);

            job = CreateJobTemplate();
            job.EndIndex = "110";
            await worker.Execute(job);

            job = CreateJobTemplate();
            job.StartIndex = "101";
            job.EndIndex = "102";
            await worker.Execute(job);

            witsmlClient.Verify(client => client.DeleteFromStoreAsync(It.IsAny<WitsmlLogs>()), Times.Never);
        }

        [Fact]
        public async Task JobHasIndexesOutOfScope_DoNothing_TimeIndexed()
        {
            var logStart = new DateTime(2000, 1, 1);
            var logEnd = new DateTime(2000, 1, 10);
            SetupLog(WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME, new DateTimeIndex(logStart), new DateTimeIndex(logEnd));

            var job = CreateJobTemplate();
            job.StartIndex = logStart.AddDays(-1).ToISODateTimeString();
            await worker.Execute(job);

            job = CreateJobTemplate();
            job.EndIndex = logEnd.AddDays(1).ToISODateTimeString();
            await worker.Execute(job);

            job = CreateJobTemplate();
            job.StartIndex = logEnd.AddDays(1).ToISODateTimeString();
            job.EndIndex = logEnd.AddDays(2).ToISODateTimeString();
            await worker.Execute(job);

            witsmlClient.Verify(client => client.DeleteFromStoreAsync(It.IsAny<WitsmlLogs>()), Times.Never);
        }

        [Fact]
        public async Task JobHasValidLaterStart_DeleteAllBeforeNewStartIndex_DepthIndexed()
        {
            var newStartIndex = "50";

            SetupLog(WitsmlLog.WITSML_INDEX_TYPE_MD, new DepthIndex(10), new DepthIndex(100));
            var job = CreateJobTemplate();
            job.StartIndex = newStartIndex;
            job.EndIndex = "100";

            var deleteQueries = new List<WitsmlLogs>();
            witsmlClient.Setup(client => client.DeleteFromStoreAsync(It.IsAny<WitsmlLogs>()))
                .Callback<WitsmlLogs>(logs => deleteQueries.Add(logs))
                .ReturnsAsync(new QueryResult(true));

            await worker.Execute(job);

            Assert.Single(deleteQueries);
            var query = deleteQueries.First();
            Assert.Null(query.Logs.First().StartIndex);
            Assert.Equal(newStartIndex, query.Logs.First().EndIndex.Value);
        }

        [Fact]
        public async Task JobHasValidLaterStart_DeleteAllBeforeNewStartIndex_TimeIndexed()
        {
            var logStart = new DateTime(2000, 1, 1);
            var logEnd = new DateTime(2000, 1, 10);
            var newLogStart = new DateTime(2000, 1, 5).ToISODateTimeString();

            SetupLog(WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME, new DateTimeIndex(logStart), new DateTimeIndex(logEnd));
            var job = CreateJobTemplate();
            job.StartIndex = newLogStart;
            job.EndIndex = logEnd.ToISODateTimeString();

            var deleteQueries = new List<WitsmlLogs>();
            witsmlClient.Setup(client => client.DeleteFromStoreAsync(It.IsAny<WitsmlLogs>()))
                .Callback<WitsmlLogs>(logs => deleteQueries.Add(logs))
                .ReturnsAsync(new QueryResult(true));

            await worker.Execute(job);

            Assert.Single(deleteQueries);
            var query = deleteQueries.First();
            Assert.Null(query.Logs.First().StartDateTimeIndex);
            Assert.Equal(newLogStart, query.Logs.First().EndDateTimeIndex);
        }

        [Fact]
        public async Task JobHasValidEarlierEnd_DeleteAllAfterNewEndIndex_DepthIndexed()
        {
            var newEndIndex = "90";

            SetupLog(WitsmlLog.WITSML_INDEX_TYPE_MD, new DepthIndex(10), new DepthIndex(100));
            var job = CreateJobTemplate();
            job.StartIndex = "10";
            job.EndIndex = newEndIndex;

            var deleteQueries = new List<WitsmlLogs>();
            witsmlClient.Setup(client => client.DeleteFromStoreAsync(It.IsAny<WitsmlLogs>()))
                .Callback<WitsmlLogs>(logs => deleteQueries.Add(logs))
                .ReturnsAsync(new QueryResult(true));

            await worker.Execute(job);

            Assert.Single(deleteQueries);
            var query = deleteQueries.First();
            Assert.Equal(newEndIndex, query.Logs.First().StartIndex.Value);
            Assert.Null(query.Logs.First().EndIndex);
        }

        [Fact]
        public async Task JobHasValidEarlierEnd_DeleteAllAfterNewEndIndex_TimeIndexed()
        {
            var logStart = new DateTime(2000, 1, 1);
            var logEnd = new DateTime(2000, 1, 10);
            var newLogEnd = new DateTime(2000, 1, 5).ToISODateTimeString();

            SetupLog(WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME, new DateTimeIndex(logStart), new DateTimeIndex(logEnd));
            var job = CreateJobTemplate();
            job.StartIndex = logStart.ToISODateTimeString();
            job.EndIndex = newLogEnd;

            var deleteQueries = new List<WitsmlLogs>();
            witsmlClient.Setup(client => client.DeleteFromStoreAsync(It.IsAny<WitsmlLogs>()))
                .Callback<WitsmlLogs>(logs => deleteQueries.Add(logs))
                .ReturnsAsync(new QueryResult(true));

            await worker.Execute(job);

            Assert.Single(deleteQueries);
            var query = deleteQueries.First();
            Assert.Equal(newLogEnd, query.Logs.First().StartDateTimeIndex);
            Assert.Null(query.Logs.First().EndDateTimeIndex);
        }

        [Fact]
        public async Task JobHasValidLaterStartAndEarlierEnd_DeletesAllBeforeNewStart_DeleteAllAfterNewEndIndex_DepthIndexed()
        {
            var newLogStart = "20";
            var newLogEnd = "90";

            SetupLog(WitsmlLog.WITSML_INDEX_TYPE_MD, new DepthIndex(10), new DepthIndex(100));
            var job = CreateJobTemplate();
            job.StartIndex = newLogStart;
            job.EndIndex = newLogEnd;

            var deleteQueries = new List<WitsmlLogs>();
            witsmlClient.Setup(client => client.DeleteFromStoreAsync(It.IsAny<WitsmlLogs>()))
                .Callback<WitsmlLogs>(logs => deleteQueries.Add(logs))
                .ReturnsAsync(new QueryResult(true));

            await worker.Execute(job);

            Assert.Equal(2, deleteQueries.Count);

            var trimStartQuery = deleteQueries.First();
            Assert.Null(trimStartQuery.Logs.First().StartIndex);
            Assert.Equal(newLogStart, trimStartQuery.Logs.First().EndIndex.Value);

            var trimEndQuery = deleteQueries.Last();
            Assert.Equal(newLogEnd, trimEndQuery.Logs.First().StartIndex.Value);
            Assert.Null(trimEndQuery.Logs.First().EndIndex);
        }

        [Fact]
        public async Task JobHasValidLaterStandAndEarlierEnd_DeletesAllBeforeNewStart_DeleteAllAfterNewEndIndex_TimeIndexed()
        {
            var logStart = new DateTime(2000, 1, 1);
            var logEnd = new DateTime(2000, 1, 10);
            var newLogStart = logStart.AddDays(1).ToISODateTimeString();
            var newLogEnd = logEnd.AddDays(-1).ToISODateTimeString();

            SetupLog(WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME, new DateTimeIndex(logStart), new DateTimeIndex(logEnd));
            var job = CreateJobTemplate();
            job.StartIndex = newLogStart;
            job.EndIndex = newLogEnd;

            var deleteQueries = new List<WitsmlLogs>();
            witsmlClient.Setup(client => client.DeleteFromStoreAsync(It.IsAny<WitsmlLogs>()))
                .Callback<WitsmlLogs>(logs => deleteQueries.Add(logs))
                .ReturnsAsync(new QueryResult(true));

            await worker.Execute(job);

            Assert.Equal(2, deleteQueries.Count);

            var trimStartQuery = deleteQueries.First();
            Assert.Null(trimStartQuery.Logs.First().StartDateTimeIndex);
            Assert.Equal(newLogStart, trimStartQuery.Logs.First().EndDateTimeIndex);

            var trimEndQuery = deleteQueries.Last();
            Assert.Equal(newLogEnd, trimEndQuery.Logs.First().StartDateTimeIndex);
            Assert.Null(trimEndQuery.Logs.First().EndDateTimeIndex);
        }

        private void SetupLog(string indexType, Index startIndex, Index endIndex)
        {
            witsmlClient.Setup(client =>
                    client.GetFromStoreAsync(It.Is<WitsmlLogs>(witsmlLogs => witsmlLogs.Logs.First().Uid == LogUid), OptionsIn.HeaderOnly))
                .ReturnsAsync(GetLogs(indexType, startIndex, endIndex));
        }

        private WitsmlLogs GetLogs(string indexType, Index startIndex, Index endIndex)
        {
            var witsmlLog = new WitsmlLog
            {
                UidWell = WellUid,
                UidWellbore = WellboreUid,
                Uid = LogUid,
                IndexType = indexType
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

        private static TrimLogDataJob CreateJobTemplate()
        {
            return new TrimLogDataJob
            {
                LogObject = new LogReference
                {
                    WellUid = WellUid,
                    WellboreUid = WellboreUid,
                    LogUid = LogUid
                }
            };
        }
    }
}
