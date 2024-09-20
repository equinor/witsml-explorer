using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Moq;

using Serilog;

using Witsml;
using Witsml.Data;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;
using WitsmlExplorer.Api.Workers.Delete;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Workers
{
    public class DeleteWellboreWorkerTests
    {
        private readonly DeleteWellboreWorker _worker;
        private readonly Mock<IWitsmlClient> _witsmlClient;
        private const string WellboreUid = "wellboreUid";
        private const string WellUid = "wellUid";

        public DeleteWellboreWorkerTests()
        {
            Mock<IWitsmlClientProvider> witsmlClientProvider = new();
            _witsmlClient = new();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_witsmlClient.Object);
            ILoggerFactory loggerFactory = new LoggerFactory();
            loggerFactory.AddSerilog(Log.Logger);
            ILogger<DeleteWellboreJob> logger = loggerFactory.CreateLogger<DeleteWellboreJob>();
            _worker = new DeleteWellboreWorker(logger, witsmlClientProvider.Object);
        }

        private static DeleteWellboreJob CreateJob()
        {
            return new()
            {
                ToDelete = new()
                {
                    WellboreUid = WellboreUid,
                    WellUid = WellUid
                }
            };
        }

        [Fact]
        public async Task Execute_DeleteWellbore_RefreshAction()
        {
            _witsmlClient.Setup(client => client.DeleteFromStoreAsync(It.IsAny<IWitsmlQueryType>(), null))
                .ReturnsAsync(new QueryResult(true));

            (WorkerResult result, RefreshAction refreshAction) = await _worker.Execute(CreateJob());
            Assert.True(result.IsSuccess);
            Assert.True(((RefreshWellbore)refreshAction).WellboreUid == WellboreUid);
            Assert.True(((RefreshWellbore)refreshAction).WellUid == WellUid);
        }

        [Fact]
        public async Task Execute_DeleteWellbore_ReturnResult()
        {
            WitsmlWellbores query = null;
            _witsmlClient.Setup(client => client.DeleteFromStoreAsync(It.IsAny<WitsmlWellbores>(), null))
                .Callback<WitsmlWellbores>((wellBores) => query = wellBores)
                .ReturnsAsync(new QueryResult(true));

            (WorkerResult result, RefreshAction refreshAction) = await _worker.Execute(CreateJob());
            Assert.True(result.IsSuccess);
            Assert.Single(query.Wellbores);
            Assert.Equal(WellboreUid, query.Wellbores.First().Uid);
        }
    }
}
