using System;
using System.Collections.Generic;
using System.Linq;
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
    public class ObjectServiceTests
    {
        private readonly ObjectService _service;
        private readonly Mock<IWitsmlClient> _witsmlClient;

        public ObjectServiceTests()
        {
            Mock<IWitsmlClientProvider> witsmlClientProvider = new();
            _witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_witsmlClient.Object);
            _service = new ObjectService(witsmlClientProvider.Object);
        }

        [Fact]
        public async Task GetObjectsIdOnly_TwoLogs_BothReturned()
        {
            const string uidWellbore = "uidWellbore";
            const string uidWell = "uidWell";
            WitsmlLogs logs = new()
            {
                Logs = new List<WitsmlLog>(){
                    new WitsmlLog(){
                        Uid = "uid1",
                        UidWellbore = uidWellbore,
                        UidWell = uidWell,
                        Name = "name1",
                        NameWellbore = "nameWellbore",
                        NameWell = "nameWell",
                    },
                    new WitsmlLog(){
                        Uid = "uid2",
                        UidWellbore = uidWellbore,
                        UidWell = uidWell,
                        Name = "name2",
                        NameWellbore = "nameWellbore",
                        NameWell = "nameWell",
                    }
                }
            };
            _witsmlClient.Setup(client =>
                client.GetFromStoreNullableAsync(
                    It.Is<IWitsmlObjectList>((queryIn) =>
                        queryIn.Objects.First().UidWell == uidWell &&
                        queryIn.Objects.First().UidWellbore == uidWellbore &&
                        queryIn.Objects.First().Uid == "" &&
                        queryIn.TypeName == new WitsmlLogs().TypeName
                    ),
                    It.Is<OptionsIn>((ops) => ops.ReturnElements == ReturnElements.IdOnly)))
                .ReturnsAsync(logs);

            IEnumerable<ObjectOnWellbore> result = await _service.GetObjectsIdOnly(uidWell, uidWellbore, EntityType.Log);
            ObjectOnWellbore log1 = result.First();
            ObjectOnWellbore log2 = result.ElementAt(1);

            Assert.Equal(2, result.Count());

            Assert.Equal("uid1", log1.Uid);
            Assert.Equal(uidWellbore, log1.WellboreUid);
            Assert.Equal(uidWell, log1.WellUid);
            Assert.Equal("name1", log1.Name);
            Assert.Equal("nameWellbore", log1.WellboreName);
            Assert.Equal("nameWell", log1.WellName);

            Assert.Equal("uid2", log2.Uid);
            Assert.Equal(uidWellbore, log2.WellboreUid);
            Assert.Equal(uidWell, log2.WellUid);
            Assert.Equal("name2", log2.Name);
            Assert.Equal("nameWellbore", log2.WellboreName);
            Assert.Equal("nameWell", log2.WellName);
        }

        [Fact]
        public async Task GetObjectsIdOnly_WrongType_Throws()
        {
            await Assert.ThrowsAsync<ArgumentException>(async () => await _service.GetObjectsIdOnly("uidWell", "uidWellbore", EntityType.Wellbore));
            await Assert.ThrowsAsync<ArgumentException>(async () => await _service.GetObjectsIdOnly("uidWell", "uidWellbore", EntityType.Well));
        }

        [Fact]
        public async Task GetObjectsIdOnly_NoObjectsFound_EmptyList()
        {
            const string uidWellbore = "uidWellbore";
            const string uidWell = "uidWell";
            WitsmlMessages messages = new()
            {
                Messages = new List<WitsmlMessage>()
            };
            _witsmlClient.Setup(client =>
                client.GetFromStoreNullableAsync(
                    It.Is<IWitsmlObjectList>((queryIn) =>
                        queryIn.Objects.First().UidWell == uidWell &&
                        queryIn.Objects.First().UidWellbore == uidWellbore &&
                        queryIn.Objects.First().Uid == "" &&
                        queryIn.TypeName == new WitsmlMessages().TypeName
                    ),
                    It.Is<OptionsIn>((ops) => ops.ReturnElements == ReturnElements.IdOnly)))
                .ReturnsAsync(messages);

            IEnumerable<ObjectOnWellbore> result = await _service.GetObjectsIdOnly(uidWell, uidWellbore, EntityType.Message);
            Assert.Empty(result);
        }

    }
}
