using System.Collections.Generic;
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
using WitsmlExplorer.Api.Workers.Modify;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Workers
{
    public class ModifyMessageObjectWorkerTest
    {
        private readonly ModifyMessageWorker _worker;
        private readonly Mock<IWitsmlClient> _witsmlClient;
        private const string WellUid = "wellUid";
        private const string WellboreUid = "wellboreUid";
        private const string MsgUid = "msgUid";
        private const string MsgText = "msgTXT";

        public ModifyMessageObjectWorkerTest()
        {
            Mock<IWitsmlClientProvider> witsmlClientProvider = new();
            _witsmlClient = new Mock<IWitsmlClient>();

            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(Task.FromResult(_witsmlClient.Object));
            ILoggerFactory loggerFactory = new LoggerFactory();
            loggerFactory.AddSerilog(Log.Logger);
            ILogger<ModifyMessageObjectJob> logger = loggerFactory.CreateLogger<ModifyMessageObjectJob>();
            _worker = new ModifyMessageWorker(logger, witsmlClientProvider.Object);
        }

        [Fact]
        public async Task UpdateMessageInStore()
        {
            ModifyMessageObjectJob job = CreateJobTemplate();

            List<WitsmlMessages> updatedMessages = new();
            _witsmlClient.Setup(client =>
                    client.UpdateInStoreAsync(It.IsAny<WitsmlMessages>())).Callback<WitsmlMessages>(msgs => updatedMessages.Add(msgs))
                .ReturnsAsync(new QueryResult(true));

            await _worker.Execute(job);

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
