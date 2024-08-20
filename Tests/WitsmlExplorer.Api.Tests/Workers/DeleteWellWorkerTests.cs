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
    public class DeleteWellWorkerTests
    {
        private readonly DeleteWellWorker _worker;
        private readonly Mock<IWitsmlClient> _witsmlClient;
        private const string WellUid = "wellUid";

        public DeleteWellWorkerTests()
        {
            Mock<IWitsmlClientProvider> witsmlClientProvider = new();
            _witsmlClient = new();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_witsmlClient.Object);
            ILoggerFactory loggerFactory = new LoggerFactory();
            loggerFactory.AddSerilog(Log.Logger);
            ILogger<DeleteWellJob> logger = loggerFactory.CreateLogger<DeleteWellJob>();
            _worker = new DeleteWellWorker(logger, witsmlClientProvider.Object);
        }

        private static DeleteWellJob CreateJob()
        {
            return new()
            {
                ToDelete = new ()
                {
                    WellUid = WellUid
                }
            };
        }

        [Fact]
        public async Task Execute_DeleteWell_ReturnResult()
        {
            _witsmlClient.Setup(client => client.DeleteFromStoreAsync(It.IsAny<IWitsmlQueryType>()))
                .ReturnsAsync(new QueryResult(true));

            (WorkerResult result, RefreshAction refreshAction) = await _worker.Execute(CreateJob());
            Assert.True(result.IsSuccess);
            Assert.True(((RefreshWell)refreshAction).WellUid == WellUid);
        }
    }
}
