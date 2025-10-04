using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Moq;

using Witsml;
using Witsml.Data;
using Witsml.Data.DataWorkOrder;
using Witsml.Extensions;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Models.DataWorkOrder;
using WitsmlExplorer.Api.Services;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Services
{
    public class DataWorkdOrderServiceTests
    {
        private readonly DataWorkOrderService _service;
        private readonly Mock<IWitsmlClient> _witsmlClient;

        public DataWorkdOrderServiceTests()
        {
            Mock<IWitsmlClientProvider> witsmlClientProvider = new();
            _witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_witsmlClient.Object);
            _service = new DataWorkOrderService(witsmlClientProvider.Object);
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
            WitsmlDataWorkOrders workOrders = new()
            {
                DataWorkOrders = new WitsmlDataWorkOrder()
                {
                    UidWellbore = uidWellbore,
                    UidWell = uidWell,
                    NameWellbore = nameWellbore,
                    NameWell = nameWell,
                    Uid = uid,
                    Name = name,
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
                client.GetFromStoreAsync(It.IsAny<WitsmlDataWorkOrders>(), It.Is<OptionsIn>(ops => ops.ReturnElements == ReturnElements.Requested), null))
                .Callback<WitsmlDataWorkOrders, OptionsIn, CancellationToken?>((_, _, _) => { })
                .ReturnsAsync(workOrders);

            IEnumerable<DataWorkOrder> result = await _service.GetDataWorkOrders("", "");
            DataWorkOrder workOrder = result.First();

            Assert.Equal(workOrder.WellboreUid, uidWellbore);
            Assert.Equal(workOrder.WellUid, uidWell);
            Assert.Equal(workOrder.WellboreName, nameWellbore);
            Assert.Equal(workOrder.WellName, nameWell);
            Assert.Equal(workOrder.Uid, uid);
            Assert.Equal(workOrder.Name, name);

            Assert.Equal(workOrder.CommonData.SourceName, sourceName);
            Assert.NotNull(workOrder.CommonData.DTimCreation);
            Assert.NotNull(workOrder.CommonData.DTimLastChange);
            Assert.Equal(workOrder.CommonData.Comments, comments);
        }
    }
}
