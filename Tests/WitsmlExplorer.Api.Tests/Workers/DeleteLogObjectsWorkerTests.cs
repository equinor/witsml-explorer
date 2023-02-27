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
            Mock<IWitsmlClientProvider> witsmlClientProvider = new();
            Mock<IWitsmlClient> witsmlClient = new();
            witsmlClient.Setup(client => client.DeleteFromStoreAsync(
                Match.Create<IWitsmlQueryType>(o => ((WitsmlLogs)o).Logs.First().UidWell == WellUid && ((WitsmlLogs)o).Logs.First().UidWellbore == WellboreUid)))
                .ReturnsAsync(new QueryResult(true));
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(witsmlClient.Object);
            ILoggerFactory loggerFactory = new LoggerFactory();
            loggerFactory.AddSerilog(Log.Logger);

            ILogger<DeleteUtils> logger = loggerFactory.CreateLogger<DeleteUtils>();
            DeleteUtils deleteUtils = new(logger);

            ILogger<DeleteLogObjectsJob> logger2 = loggerFactory.CreateLogger<DeleteLogObjectsJob>();
            _worker = new DeleteLogObjectsWorker(logger2, witsmlClientProvider.Object, deleteUtils);
        }

        [Fact]
        public async Task DeleteLogsSuccessful_ReturnResult()
        {
            DeleteLogObjectsJob job = new()
            {
                ToDelete = new ObjectReferences()
                {
                    WellUid = WellUid,
                    WellboreUid = WellboreUid,
                    ObjectUids = LogUids
                }
            };
            (WorkerResult result, RefreshAction refreshAction) = await _worker.Execute(job);
            Assert.True(result.IsSuccess && ((RefreshObjects)refreshAction).WellboreUid == WellboreUid);
        }
    }
}
