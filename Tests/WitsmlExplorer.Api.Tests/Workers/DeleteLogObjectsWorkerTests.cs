using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Moq;

using Serilog;

using Witsml;
using Witsml.Data;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;
using WitsmlExplorer.Api.Workers.Delete;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Workers
{
    public class DeleteLogObjectsWorkerTests
    {
        private readonly DeleteLogObjectsWorker _worker;
        private const string WellUid = "wellUid";
        private const string WellboreUid = "wellboreUid";
        private static readonly string[] LogUids = { "logUid1", "logUid2" };

        public DeleteLogObjectsWorkerTests()
        {
            var witsmlClientProvider = new Mock<IWitsmlClientProvider>();
            var witsmlClient = new Mock<IWitsmlClient>();
            witsmlClient.Setup(client => client.DeleteFromStoreAsync(Match.Create<WitsmlLogs>(o => o.Logs.First().UidWell == WellUid && o.Logs.First().UidWellbore == WellboreUid))).ReturnsAsync(new QueryResult(true));
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(witsmlClient.Object);
            var loggerFactory = (ILoggerFactory)new LoggerFactory();
            loggerFactory.AddSerilog(Log.Logger);

            var logger = loggerFactory.CreateLogger<DeleteUtils>();
            var deleteUtils = new DeleteUtils(logger, witsmlClientProvider.Object);

            var logger2 = loggerFactory.CreateLogger<DeleteLogObjectsJob>();
            _worker = new DeleteLogObjectsWorker(logger2, witsmlClientProvider.Object, deleteUtils);
        }

        [Fact]
        public async Task DeleteLogsSuccessful_ReturnResult()
        {
            var job = new DeleteLogObjectsJob
            {
                ToDelete = new LogReferences()
                {
                    LogReferenceList = LogUids
                            .Select(logUid => new LogReference { WellUid = WellUid, WellboreUid = WellboreUid, LogUid = logUid })
                            .AsEnumerable()
                }
            };
            var (result, refreshAction) = await _worker.Execute(job);
            Assert.True(result.IsSuccess && ((RefreshWellbore)refreshAction).WellboreUid == WellboreUid);
        }
    }
}
