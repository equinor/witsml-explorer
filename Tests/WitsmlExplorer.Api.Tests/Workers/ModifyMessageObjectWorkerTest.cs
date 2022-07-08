using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Moq;
using Witsml;
using Witsml.Data;
using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;
using Xunit;

namespace WitsmlExplorer.Api.Tests.Workers
{
    public class ModifyMessageObjectWorkerTest
    {
        private ModifyMessageWorker worker;
        private readonly Mock<IWitsmlClient> witsmlClient;
        private const string WellUid = "wellUid";
        private const string WellboreUid = "wellboreUid";
        private const string MsgUid = "msgUid";
        private const string MsgText = "msgTXT";

        public ModifyMessageObjectWorkerTest()
        {
            var witsmlClientProvider = new Mock<IWitsmlClientProvider>();
            witsmlClient = new Mock<IWitsmlClient>();

            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(witsmlClient.Object);
            worker = new ModifyMessageWorker(witsmlClientProvider.Object);
        }

        [Fact]
        public async Task UpdateMessageInStore()
        {
            var job = CreateJobTemplate();

            var updatedMessages = new List<WitsmlMessages>();
            witsmlClient.Setup(client =>
                    client.UpdateInStoreAsync(It.IsAny<WitsmlMessages>())).Callback<WitsmlMessages>(msgs => updatedMessages.Add(msgs))
                .ReturnsAsync(new QueryResult(true));

            await worker.Execute(job);

            Assert.Single(updatedMessages);
            Assert.Equal(MsgText, updatedMessages.FirstOrDefault()?.Messages.FirstOrDefault()?.MessageText);
        }

        private static ModifyMessageObjectJob CreateJobTemplate()
        {
            return new ModifyMessageObjectJob
            {
                MessageObject = new MessageObject()
                {
                    WellUid = WellUid,
                    WellboreUid = WellboreUid,
                    Uid = MsgUid,
                    MessageText = MsgText
                }
            };
        }
    }
}
