using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Moq;

using Witsml;
using Witsml.Data;
using Witsml.Extensions;
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
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_witsmlClient.Object);
            _service = new MessageObjectService(witsmlClientProvider.Object);
        }

        [Fact]
        public async Task GetMessageObjects_AllRequiredElements_AllAccountedFor()
        {
            string uidWellbore = "a";
            string uidWell = "b";
            string nameWellbore = "c";
            string nameWell = "d";
            string uid = "e";
            string name = "f";
            string messageText = "g";
            string typeMessage = "informational";
            string dTim = "2022-11-07T16:36:12.311+05:30";
            string sourceName = "h";
            string dTimCreation = "2022-11-07T15:36:12.311+05:30";
            string dTimLastChange = "2022-11-07T17:36:12.311+05:30";
            string comments = "i";
            WitsmlMessages messages = new()
            {
                Messages = new WitsmlMessage
                {
                    UidWellbore = uidWellbore,
                    UidWell = uidWell,
                    NameWellbore = nameWellbore,
                    NameWell = nameWell,
                    Uid = uid,
                    Name = name,
                    MessageText = messageText,
                    TypeMessage = typeMessage,
                    DTim = dTim,
                    CommonData = new WitsmlCommonData()
                    {
                        SourceName = sourceName,
                        DTimCreation = dTimCreation,
                        DTimLastChange = dTimLastChange,
                        Comments = comments
                    }
                }.AsItemInList()
            };
            _witsmlClient.Setup(client =>
                client.GetFromStoreAsync(It.IsAny<WitsmlMessages>(), It.Is<OptionsIn>(ops => ops.ReturnElements == ReturnElements.Requested), null))
                .Callback<WitsmlMessages, OptionsIn, CancellationToken?>((_, _, _) => { })
                .ReturnsAsync(messages);

            IEnumerable<MessageObject> result = await _service.GetMessageObjects("", "");
            MessageObject msg = result.First();

            Assert.Equal(msg.WellboreUid, uidWellbore);
            Assert.Equal(msg.WellUid, uidWell);
            Assert.Equal(msg.WellboreName, nameWellbore);
            Assert.Equal(msg.WellName, nameWell);
            Assert.Equal(msg.Uid, uid);
            Assert.Equal(msg.Name, name);
            Assert.Equal(msg.MessageText, messageText);
            Assert.Equal(msg.TypeMessage, typeMessage);
            Assert.Equal(msg.DTim, dTim);
            Assert.Equal(msg.CommonData.SourceName, sourceName);
            Assert.NotNull(msg.CommonData.DTimCreation);
            Assert.NotNull(msg.CommonData.DTimLastChange);
            Assert.Equal(msg.CommonData.Comments, comments);
        }
    }
}
