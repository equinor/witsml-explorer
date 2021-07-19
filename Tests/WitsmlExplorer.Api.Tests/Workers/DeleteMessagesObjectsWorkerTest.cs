using System.Linq;
using System.Threading.Tasks;
using Moq;
using Witsml;
using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;
using Xunit;

namespace WitsmlExplorer.Api.Tests.Workers
{
    public class DeleteMessagesObjectsWorkerTest
    {
        private readonly DeleteMessagesWorker worker;
        private const string WellUid = "wellUid";
        private const string WellboreUid = "wellboreUid";
        private static readonly string[] MessageUids = { "messageUid1", "messageUid2" };

        public DeleteMessagesObjectsWorkerTest()
        {
            var witsmlClientProvider = new Mock<IWitsmlClientProvider>();
            var witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(witsmlClient.Object);
            worker = new DeleteMessagesWorker(witsmlClientProvider.Object);
        }
        [Fact]
        public async Task DeleteMessageObjectsSuccessful_ReturnResult()
        {
            var job = new DeleteMessageObjectsJob
            {
                MessageObjects = MessageUids
                    .Select(msgUid => new MessageObjectReference { WellUid = WellUid, WellboreUid = WellboreUid, Uid = msgUid })
                    .AsEnumerable<MessageObjectReference>()
            };
            var result = await worker.Execute(job);
            Assert.True(result.Item1.IsSuccess);
        }
    }
}
