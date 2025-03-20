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
    public class DeleteWellWorkerTests
    {
        private readonly DeleteWellWorker _worker;
        private readonly Mock<IWitsmlClient> _witsmlClient;
        private readonly Mock<IUidMappingService> _uidMappingService;
        private const string WellUid = "wellUid";

        public DeleteWellWorkerTests()
        {
            Mock<IWitsmlClientProvider> witsmlClientProvider = new();
            _witsmlClient = new();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_witsmlClient.Object);
            ILoggerFactory loggerFactory = new LoggerFactory();
            loggerFactory.AddSerilog(Log.Logger);
            ILogger<DeleteWellJob> logger = loggerFactory.CreateLogger<DeleteWellJob>();
            _uidMappingService = new();
            _uidMappingService.Setup(service => service.DeleteUidMappings(It.IsAny<string>(), It.IsAny<string>())).ReturnsAsync(true);
            _worker = new DeleteWellWorker(logger, witsmlClientProvider.Object, _uidMappingService.Object);
        }

        private static DeleteWellJob CreateJob(bool cascadedDelete)
        {
            return new()
            {
                ToDelete = new()
                {
                    WellUid = WellUid
                },
                CascadedDelete = cascadedDelete
            };
        }

        [Fact]
        public async Task Execute_DeleteWell_RefreshAction()
        {
            _witsmlClient.Setup(client => client.DeleteFromStoreAsync(It.IsAny<IWitsmlQueryType>()))
                .ReturnsAsync(new QueryResult(true));

            (WorkerResult result, RefreshAction refreshAction) = await _worker.Execute(CreateJob(false));
            Assert.True(result.IsSuccess);
            Assert.True(((RefreshWell)refreshAction).WellUid == WellUid);
        }

        [Fact]
        public async Task Execute_CascadedDeleteWell_RefreshAction()
        {
            _witsmlClient.Setup(client => client.DeleteFromStoreAsync(It.IsAny<WitsmlWells>(), It.IsAny<OptionsIn>()))
                .ReturnsAsync(new QueryResult(true));

            (WorkerResult result, RefreshAction refreshAction) = await _worker.Execute(CreateJob(true));
            Assert.True(result.IsSuccess);
            Assert.True(((RefreshWell)refreshAction).WellUid == WellUid);
        }

        [Fact]
        public async Task Execute_DeleteWell_ReturnResult()
        {
            WitsmlWells query = null;
            _witsmlClient.Setup(client => client.DeleteFromStoreAsync(It.IsAny<WitsmlWells>()))
                .Callback<WitsmlWells>((wells) => query = wells)
                .ReturnsAsync(new QueryResult(true));

            (WorkerResult result, RefreshAction refreshAction) = await _worker.Execute(CreateJob(false));
            Assert.True(result.IsSuccess);
            Assert.Single(query.Wells);
            Assert.Equal(WellUid, query.Wells.First().Uid);
            _witsmlClient.Verify(client => client.DeleteFromStoreAsync(It.IsAny<IWitsmlQueryType>(), It.Is<OptionsIn>(options => options.CascadedDelete == true)), Times.Never);
        }

        [Fact]
        public async Task Execute_CascadedDeleteWell_ReturnResult()
        {
            WitsmlWells query = null;
            _witsmlClient.Setup(client => client.DeleteFromStoreAsync(It.IsAny<WitsmlWells>(), It.IsAny<OptionsIn>()))
                .Callback<WitsmlWells, OptionsIn>((wells, _) => query = wells)
                .ReturnsAsync(new QueryResult(true));

            (WorkerResult result, RefreshAction refreshAction) = await _worker.Execute(CreateJob(true));
            Assert.True(result.IsSuccess);
            Assert.Single(query.Wells);
            Assert.Equal(WellUid, query.Wells.First().Uid);
            _witsmlClient.Verify(client => client.DeleteFromStoreAsync(It.IsAny<IWitsmlQueryType>(), It.Is<OptionsIn>(options => options.CascadedDelete == true)), Times.Once);
        }
    }
}
