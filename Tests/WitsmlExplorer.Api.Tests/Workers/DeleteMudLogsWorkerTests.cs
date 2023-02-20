using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Moq;

using Serilog;

using Witsml;
using Witsml.Data.MudLog;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;
using WitsmlExplorer.Api.Workers.Delete;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Workers
{
    public class DeleteMudLogsWorkerTests
    {
        private readonly DeleteMudLogsWorker _worker;
        private const string WellUid = "wellUid";
        private const string WellboreUid = "wellboreUid";
        private static readonly string[] MudLogUids = { "mudLogUid1", "mudLogUid2" };

        public DeleteMudLogsWorkerTests()
        {
            Mock<IWitsmlClientProvider> witsmlClientProvider = new();
            Mock<IWitsmlClient> witsmlClient = new();
            witsmlClient.Setup(client => client.DeleteFromStoreAsync(Match.Create<WitsmlMudLogs>(o => o.MudLogs.First().UidWell == WellUid && o.MudLogs.First().UidWellbore == WellboreUid))).ReturnsAsync(new QueryResult(true));
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(witsmlClient.Object);
            ILoggerFactory loggerFactory = new LoggerFactory();
            loggerFactory.AddSerilog(Log.Logger);

            ILogger<DeleteUtils> logger = loggerFactory.CreateLogger<DeleteUtils>();
            DeleteUtils deleteUtils = new(logger);

            ILogger<DeleteMudLogsJob> logger2 = loggerFactory.CreateLogger<DeleteMudLogsJob>();
            _worker = new DeleteMudLogsWorker(logger2, witsmlClientProvider.Object, deleteUtils);
        }

        [Fact]
        public async Task Execute_TwoMudLogs_ReturnResult()
        {
            DeleteMudLogsJob job = new()
            {
                ToDelete = new ObjectReferences()
                {
                    WellUid = WellUid,
                    WellboreUid = WellboreUid,
                    ObjectUids = MudLogUids
                }
            };
            (WorkerResult result, RefreshAction refreshAction) = await _worker.Execute(job);
            Assert.True(result.IsSuccess && ((RefreshObjects)refreshAction).WellboreUid == WellboreUid);
        }
    }
}
