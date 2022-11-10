using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;

using Moq;

using Witsml;
using Witsml.Data;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Services
{
    public class MessageObjectServiceTests
    {
        private readonly MessageObjectService _service;
        private readonly Mock<IWitsmlClient> _witsmlClient;

        public MessageObjectServiceTests()
        {
            Mock<IWitsmlClientProvider> witsmlClientProvider = new();
            _witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(Task.FromResult(_witsmlClient.Object));
            _service = new MessageObjectService(witsmlClientProvider.Object);
        }

        [Fact]
        public async Task GetMessageObjects_DTimWithOffset_ResultSerializesDateWithOffset()
        {
            string originalDateTime = "2022-11-07T16:36:12.311+05:30";
            string serializedMessage = await WitsmlMessageToJson(originalDateTime);
            Assert.Contains(originalDateTime, serializedMessage);
        }

        [Fact]
        public async Task GetMessageObjects_DTimWithZuluTime_ResultSerializesDateWithZuluTime()
        {
            string originalDateTime = "2022-11-07T16:36:12.311Z";
            string serializedMessage = await WitsmlMessageToJson(originalDateTime);
            Assert.Contains("2022-11-07T16:36:12.311+00:00", serializedMessage);
        }

        [Fact]
        public async Task GetMessageObjects_DTimWithNegativeOffset_ResultSerializesDateWithNegativeOffset()
        {
            string originalDateTime = "2022-11-07T16:36:12.311-04:00";
            string serializedMessage = await WitsmlMessageToJson(originalDateTime);
            Assert.Contains(originalDateTime, serializedMessage);
        }

        private async Task<string> WitsmlMessageToJson(string dTim)
        {
            WitsmlMessages messages = new()
            {
                Messages = new()
                {
                    new WitsmlMessage
                    {
                        DTim = dTim,
                        CommonData = new()
                        {
                            DTimLastChange = "",
                            DTimCreation = ""
                        }
                    }
                }
            };
            _witsmlClient.Setup(client =>
            client.GetFromStoreAsync(It.IsAny<WitsmlMessages>(), It.Is<OptionsIn>((ops) => ops.ReturnElements == ReturnElements.Requested)))
            .Callback<WitsmlMessages, OptionsIn>((_, _) => { })
            .ReturnsAsync(messages);

            IEnumerable<MessageObject> result = await _service.GetMessageObjects("", "");
            return JsonSerializer.Serialize(result);
        }
    }
}
