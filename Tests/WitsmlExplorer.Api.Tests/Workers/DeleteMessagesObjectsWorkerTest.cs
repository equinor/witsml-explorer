using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Moq;

using Serilog;

using Witsml;
using Witsml.Data;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
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
            var witsmlClientProvider = new Mock<IWitsmlClientProvider>();
            var witsmlClient = new Mock<IWitsmlClient>();
            witsmlClient.Setup(client => client.DeleteFromStoreAsync(Match.Create<WitsmlMessages>(o => o.Messages.First().UidWell == WellUid && o.Messages.First().UidWellbore == WellboreUid))).ReturnsAsync(new QueryResult(true));
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(witsmlClient.Object);
            var loggerFactory = (ILoggerFactory)new LoggerFactory();
            loggerFactory.AddSerilog(Log.Logger);

            var logger = loggerFactory.CreateLogger<DeleteUtils>();
            var deleteUtils = new DeleteUtils(logger, witsmlClientProvider.Object);

            var logger2 = loggerFactory.CreateLogger<DeleteMessageObjectsJob>();

            _worker = new DeleteMessagesWorker(logger2, witsmlClientProvider.Object, deleteUtils);
        }
        [Fact]
        public async Task DeleteMessageObjectsSuccessful_ReturnResult()
        {
            var job = new DeleteMessageObjectsJob
            {
                ToDelete = new MessageObjectReferences()
                {
                    MessageObjectUids = MessageUids,
                    WellUid = WellUid,
                    WellboreUid = WellboreUid
                }
            };
            var result = await _worker.Execute(job);
            Assert.True(result.Item1.IsSuccess);
        }
    }
}
