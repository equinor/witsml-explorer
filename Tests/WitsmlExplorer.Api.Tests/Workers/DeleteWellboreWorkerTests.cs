using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Moq;

using Serilog;

using Witsml;
using Witsml.Data;
using Witsml.ServiceReference;

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
        private readonly Mock<IUidMappingService> _uidMappingService;
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
            _uidMappingService = new();
            _uidMappingService.Setup(service => service.DeleteUidMappings(It.IsAny<string>(), It.IsAny<string>())).ReturnsAsync(true);
            _worker = new DeleteWellboreWorker(logger, witsmlClientProvider.Object, _uidMappingService.Object);
        }

        private static DeleteWellboreJob CreateJob(bool cascadedDelete)
        {
            return new()
            {
                ToDelete = new()
                {
                    WellboreUid = WellboreUid,
                    WellUid = WellUid
                },
                CascadedDelete = cascadedDelete
            };
        }

        [Fact]
        public async Task Execute_DeleteWellbore_RefreshAction()
        {
            _witsmlClient.Setup(client => client.DeleteFromStoreAsync(It.IsAny<IWitsmlQueryType>()))
                .ReturnsAsync(new QueryResult(true));

            (WorkerResult result, RefreshAction refreshAction) = await _worker.Execute(CreateJob(false));
            Assert.True(result.IsSuccess);
            Assert.True(((RefreshWellbore)refreshAction).WellboreUid == WellboreUid);
            Assert.True(((RefreshWellbore)refreshAction).WellUid == WellUid);
        }

        [Fact]
        public async Task Execute_CascadedDeleteWellbore_RefreshAction()
        {
            _witsmlClient.Setup(client => client.DeleteFromStoreAsync(It.IsAny<WitsmlWellbores>(), It.IsAny<OptionsIn>()))
                .ReturnsAsync(new QueryResult(true));

            (WorkerResult result, RefreshAction refreshAction) = await _worker.Execute(CreateJob(true));
            Assert.True(result.IsSuccess);
            Assert.True(((RefreshWellbore)refreshAction).WellboreUid == WellboreUid);
            Assert.True(((RefreshWellbore)refreshAction).WellUid == WellUid);
        }

        [Fact]
        public async Task Execute_DeleteWellbore_ReturnResult()
        {
            WitsmlWellbores query = null;
            _witsmlClient.Setup(client => client.DeleteFromStoreAsync(It.IsAny<WitsmlWellbores>()))
                .Callback<WitsmlWellbores>((wellBores) => query = wellBores)
                .ReturnsAsync(new QueryResult(true));

            (WorkerResult result, RefreshAction refreshAction) = await _worker.Execute(CreateJob(false));
            Assert.True(result.IsSuccess);
            Assert.Single(query.Wellbores);
            Assert.Equal(WellboreUid, query.Wellbores.First().Uid);
            _witsmlClient.Verify(client => client.DeleteFromStoreAsync(It.IsAny<IWitsmlQueryType>(), It.Is<OptionsIn>(options => options.CascadedDelete == true)), Times.Never);
        }

        [Fact]
        public async Task Execute_CascadedDeleteWellbore_ReturnResult()
        {
            WitsmlWellbores query = null;
            _witsmlClient.Setup(client => client.DeleteFromStoreAsync(It.IsAny<WitsmlWellbores>(), It.IsAny<OptionsIn>()))
                .Callback<WitsmlWellbores, OptionsIn>((wellBores, _) => query = wellBores)
                .ReturnsAsync(new QueryResult(true));

            (WorkerResult result, RefreshAction refreshAction) = await _worker.Execute(CreateJob(true));
            Assert.True(result.IsSuccess);
            Assert.Single(query.Wellbores);
            Assert.Equal(WellboreUid, query.Wellbores.First().Uid);
            _witsmlClient.Verify(client => client.DeleteFromStoreAsync(It.IsAny<IWitsmlQueryType>(), It.Is<OptionsIn>(options => options.CascadedDelete == true)), Times.Once);
        }
    }
}
