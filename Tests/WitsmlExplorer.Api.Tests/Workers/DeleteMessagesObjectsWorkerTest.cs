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
    public class DeleteMessagesObjectsWorkerTest
    {
        private readonly DeleteMessagesWorker _worker;
        private const string WellUid = "wellUid";
        private const string WellboreUid = "wellboreUid";
        private static readonly string[] MessageUids = { "messageUid1", "messageUid2" };

        public DeleteMessagesObjectsWorkerTest()
        {
            Mock<IWitsmlClientProvider> witsmlClientProvider = new();
            Mock<IWitsmlClient> witsmlClient = new();
            witsmlClient.Setup(client => client.DeleteFromStoreAsync(Match.Create<WitsmlMessages>(o => o.Messages.First().UidWell == WellUid && o.Messages.First().UidWellbore == WellboreUid))).ReturnsAsync(new QueryResult(true));
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(Task.FromResult(witsmlClient.Object));
            ILoggerFactory loggerFactory = new LoggerFactory();
            loggerFactory.AddSerilog(Log.Logger);

            ILogger<DeleteUtils> logger = loggerFactory.CreateLogger<DeleteUtils>();
            DeleteUtils deleteUtils = new(logger, witsmlClientProvider.Object);

            ILogger<DeleteMessageObjectsJob> logger2 = loggerFactory.CreateLogger<DeleteMessageObjectsJob>();

            _worker = new DeleteMessagesWorker(logger2, witsmlClientProvider.Object, deleteUtils);
        }
        [Fact]
        public async Task DeleteMessageObjectsSuccessful_ReturnResult()
        {
            DeleteMessageObjectsJob job = new()
            {
                ToDelete = new ObjectReferences()
                {
                    ObjectUids = MessageUids,
                    WellUid = WellUid,
                    WellboreUid = WellboreUid
                }
            };
            (WorkerResult, RefreshAction) result = await _worker.Execute(job);
            Assert.True(result.Item1.IsSuccess);
        }
    }
}
