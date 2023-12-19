using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Moq;

using Serilog;

using Witsml;
using Witsml.Data;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Models.Reports;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers.Modify;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Workers
{
    public class BatchModifyObjectsOnWellboreTests
    {
        private readonly Mock<IWitsmlClient> _witsmlClient;
        private readonly BatchModifyObjectsOnWellboreWorker _worker;
        private const string WellUid = "wellUid";
        private const string WellboreUid = "wellboreUid";
        private const string LogUid = "logUid";
        private const string Well2Uid = "well2Uid";
        private const string Wellbore2Uid = "wellbore2Uid";
        private const string Log2Uid = "log2Uid";

        public BatchModifyObjectsOnWellboreTests()
        {
            Mock<IWitsmlClientProvider> witsmlClientProvider = new();
            _witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_witsmlClient.Object);
            ILoggerFactory loggerFactory = new LoggerFactory();
            loggerFactory.AddSerilog(Log.Logger);
            ILogger<BatchModifyObjectsOnWellboreJob> logger = loggerFactory.CreateLogger<BatchModifyObjectsOnWellboreJob>();
            _worker = new BatchModifyObjectsOnWellboreWorker(logger, witsmlClientProvider.Object);
        }

        [Fact]
        public async Task ModifyLogObject_KeepsSameUids()
        {
            BatchModifyObjectsOnWellboreJob job = CreateJobTemplate();

            List<WitsmlLogs> updatedLogs = new();
            _witsmlClient.Setup(client =>
                client.UpdateInStoreAsync(It.IsAny<IWitsmlQueryType>())).Callback<IWitsmlQueryType>(logs => updatedLogs.Add(logs as WitsmlLogs))
                .ReturnsAsync(new QueryResult(true));

            await _worker.Execute(job);

            Assert.Equal(WellUid, updatedLogs.First().Logs.First().UidWell);
            Assert.Equal(WellboreUid, updatedLogs.First().Logs.First().UidWellbore);
            Assert.Equal(LogUid, updatedLogs.First().Logs.First().Uid);
            Assert.Equal(Well2Uid, updatedLogs.Last().Logs.First().UidWell);
            Assert.Equal(Wellbore2Uid, updatedLogs.Last().Logs.First().UidWellbore);
            Assert.Equal(Log2Uid, updatedLogs.Last().Logs.First().Uid);
        }

        [Fact]
        public async Task RenameLogObject_ValidName_UpdatesName()
        {
            string expectedNewName = "NewName";
            BatchModifyObjectsOnWellboreJob job = CreateJobTemplate("name", expectedNewName);

            List<WitsmlLogs> updatedLogs = new();
            _witsmlClient.Setup(client =>
                client.UpdateInStoreAsync(It.IsAny<IWitsmlQueryType>())).Callback<IWitsmlQueryType>(logs => updatedLogs.Add(logs as WitsmlLogs))
                .ReturnsAsync(new QueryResult(true));

            await _worker.Execute(job);

            BatchModifyReport report = (BatchModifyReport)job.JobInfo.Report;
            IEnumerable<BatchModifyReportItem> reportItems = (IEnumerable<BatchModifyReportItem>)report.ReportItems;

            Assert.Equal(2, updatedLogs.Count);
            Assert.Equal(WellUid, updatedLogs.First().Logs.First().UidWell);
            Assert.Equal(expectedNewName, updatedLogs.First().Logs.First().Name);
            Assert.Equal(expectedNewName, updatedLogs.Last().Logs.First().Name);
            Assert.Equal(2, reportItems.Count());
            Assert.Equal("Yes", reportItems.First().IsSuccessful);
            Assert.Equal("Yes", reportItems.Last().IsSuccessful);
        }

        [Fact]
        public async Task RenameLogObject_EmptyName_ThrowsException()
        {
            BatchModifyObjectsOnWellboreJob job = CreateJobTemplate("name", string.Empty);

            var (workerResult, _) = await _worker.Execute(job);

            Assert.False(workerResult.IsSuccess);
            Assert.Equal("Name cannot be empty", workerResult.Reason);

            _witsmlClient.Verify(client => client.UpdateInStoreAsync(It.IsAny<IWitsmlQueryType>()), Times.Never);
        }

        private static BatchModifyObjectsOnWellboreJob CreateJobTemplate(string property = null, string propertyValue = null)
        {
            var job = new BatchModifyObjectsOnWellboreJob
            {
                Objects = new List<ObjectOnWellbore>
                {
                    new LogObject
                    {
                        WellUid = WellUid,
                        WellboreUid = WellboreUid,
                        Uid = LogUid
                    },
                    new LogObject
                    {
                        WellUid = Well2Uid,
                        WellboreUid = Wellbore2Uid,
                        Uid = Log2Uid
                    }
                },
                ObjectType = EntityType.Log,
                JobInfo = new JobInfo()
            };
            if (property != null && propertyValue != null)
            {
                foreach (var obj in job.Objects)
                {
                    QueryHelper.AddPropertyToObject(obj, property, propertyValue);
                }
            }
            return job;
        }
    }
}
