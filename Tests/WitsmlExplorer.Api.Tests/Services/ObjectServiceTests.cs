using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Moq;

using Witsml;
using Witsml.Data;
using Witsml.Data.Rig;
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
            Mock<ILogger<ObjectService>> logger = new();
            _service = new ObjectService(witsmlClientProvider.Object, logger.Object);
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
                        queryIn.Objects.First().Uid == string.Empty &&
                        queryIn.TypeName == new WitsmlLogs().TypeName
                    ),
                    It.Is<OptionsIn>((ops) => ops.ReturnElements == ReturnElements.IdOnly), null))
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
                        queryIn.Objects.First().Uid == string.Empty &&
                        queryIn.TypeName == new WitsmlMessages().TypeName
                    ),
                    It.Is<OptionsIn>((ops) => ops.ReturnElements == ReturnElements.IdOnly), null))
                .ReturnsAsync(messages);

            IEnumerable<ObjectOnWellbore> result = await _service.GetObjectsIdOnly(uidWell, uidWellbore, EntityType.Message);
            Assert.Empty(result);
        }

        [Fact]
        public async Task GetExpandableObjectsCount_FourTypesExist_ReturnCount()
        {
            SetupReturnsObjectList(EntityType.FluidsReport, 0);
            SetupReturnsObjectList(EntityType.MudLog, 2);
            SetupReturnsObjectList(EntityType.Trajectory, 4);
            SetupReturnsObjectList(EntityType.Tubular, 5);
            SetupReturnsObjectList(EntityType.WbGeometry, 6);

            Dictionary<EntityType, int> result = await _service.GetExpandableObjectsCount("uidWell", "uidWellbore");
            Assert.Equal(5, result.Count);
            Assert.Equal(0, result[EntityType.FluidsReport]);
            Assert.Equal(2, result[EntityType.MudLog]);
            Assert.Equal(4, result[EntityType.Trajectory]);
            Assert.Equal(5, result[EntityType.Tubular]);
            Assert.Equal(6, result[EntityType.WbGeometry]);
        }

        private void SetupReturnsObjectList(EntityType type, int count)
        {
            IWitsmlObjectList objectList = EntityTypeHelper.ToObjectList(type);
            for (int i = 0; i < count; i++)
            {
                objectList.Objects = objectList.Objects.Append(EntityTypeHelper.ToObjectOnWellbore(type));
            }
            _witsmlClient.Setup(client =>
                client.GetFromStoreNullableAsync(
                    It.Is<IWitsmlObjectList>((queryIn) => queryIn.TypeName == objectList.TypeName),
                    It.IsAny<OptionsIn>(),
                    null))
                .ReturnsAsync(objectList);
        }

        [Fact]
        public async Task GetExpandableObjectsCount_NullResult_ReturnZero()
        {
            _witsmlClient.Setup(client =>
                client.GetFromStoreNullableAsync(
                    It.Is<IWitsmlObjectList>((queryIn) => queryIn.TypeName == new WitsmlFluidsReports().TypeName),
                    It.IsAny<OptionsIn>(),
                    null))
                .ReturnsAsync(() => null);

            Dictionary<EntityType, int> result = await _service.GetExpandableObjectsCount("uidWell", "uidWellbore");
            Assert.Equal(0, result[EntityType.FluidsReport]);
        }

        [Fact]
        public async Task GetExpandableObjectsCount_FetchingThrows_ReturnZero()
        {
            _witsmlClient.Setup(client =>
                client.GetFromStoreNullableAsync(
                    It.Is<IWitsmlObjectList>((queryIn) => queryIn.TypeName == new WitsmlFluidsReports().TypeName),
                    It.IsAny<OptionsIn>(),
                    null))
                .Throws(new SystemException());

            Dictionary<EntityType, int> result = await _service.GetExpandableObjectsCount("uidWell", "uidWellbore");
            Assert.Equal(0, result[EntityType.FluidsReport]);
        }

        [Fact]
        public async Task GetObjectsByType_ReturnsObjects()
        {
            WitsmlObjectOnWellbore o = EntityTypeHelper.ToObjectOnWellbore(EntityType.Rig);
            o.UidWell = "";
            o.UidWellbore = "";
            o.Uid = "";
            o.Name = "";
            IWitsmlObjectList objectList = (IWitsmlObjectList)o.AsItemInWitsmlList();

            _witsmlClient.Setup(client =>
                client.GetFromStoreNullableAsync(
                    It.Is<IWitsmlObjectList>(queryIn => queryIn.Objects.Count() == 1 && queryIn.Objects.All(witsmlObjectOnWellbore => witsmlObjectOnWellbore is WitsmlRig)),
                    It.Is<OptionsIn>((optionsIn) => optionsIn.ReturnElements == ReturnElements.Requested),
                    null))
                .ReturnsAsync(() => objectList);

            IEnumerable<ObjectSearchResult> result = await _service.GetObjectsByType(EntityType.Rig);
            Assert.NotEmpty(result);
        }

        [Fact]
        public async Task GetObjectsByType_NullResult_ReturnZero()
        {
            _witsmlClient.Setup(client =>
                client.GetFromStoreNullableAsync(
                    It.Is<IWitsmlObjectList>((queryIn) => queryIn.TypeName == new WitsmlRigs().TypeName),
                    It.IsAny<OptionsIn>(),
                    null))
                .ReturnsAsync(() => null);

            IEnumerable<ObjectSearchResult> result = await _service.GetObjectsByType(EntityType.Rig);
            Assert.Empty(result);
        }

        [Fact]
        public async Task GetObjectsWithParamByType_ReturnsObjects()
        {
            WitsmlLog log = new()
            {
                UidWell = "",
                UidWellbore = "",
                Uid = "",
                Name = "",
                ServiceCompany = "myCompany"
            };
            IWitsmlObjectList objectList = log.AsItemInWitsmlList();

            _witsmlClient.SetupSequence(client =>
                client.GetFromStoreNullableAsync(
                    It.Is<IWitsmlObjectList>((queryIn) => queryIn.TypeName == new WitsmlLogs().TypeName),
                    It.IsAny<OptionsIn>(),
                    null))
                .ReturnsAsync(() => objectList)
                .ReturnsAsync(() => objectList);

            IEnumerable<ObjectSearchResult> result = await _service.GetObjectsWithParamByType(EntityType.Log, "serviceCompany", "myCompany");
            Assert.NotEmpty(result);
        }

        [Fact]
        public async Task GetObjectsWithParamByType_NullResult_ReturnZero()
        {
            WitsmlLog log = new()
            {
                UidWell = "",
                UidWellbore = "",
                Uid = "",
                Name = "",
                ServiceCompany = "myCompany"
            };
            IWitsmlObjectList objectList = log.AsItemInWitsmlList();

            _witsmlClient.SetupSequence(client =>
                client.GetFromStoreNullableAsync(
                    It.Is<IWitsmlObjectList>((queryIn) => queryIn.TypeName == new WitsmlLogs().TypeName),
                    It.IsAny<OptionsIn>(),
                    null))
                .ReturnsAsync(() => objectList)
                .ReturnsAsync(() => null);

            IEnumerable<ObjectSearchResult> result = await _service.GetObjectsWithParamByType(EntityType.Log, "serviceCompany", "myCompany");
            Assert.Empty(result);
        }

        [Fact]
        public async Task GetObjectsWithParamByType_Uncapable_ThrowsError()
        {
            WitsmlObjectOnWellbore o = EntityTypeHelper.ToObjectOnWellbore(EntityType.Rig);
            o.UidWell = "";
            o.UidWellbore = "";
            o.Uid = "";
            o.Name = "";
            IWitsmlObjectList objectList = (IWitsmlObjectList)o.AsItemInWitsmlList();

            _witsmlClient.SetupSequence(client =>
                client.GetFromStoreNullableAsync(
                    It.Is<IWitsmlObjectList>((queryIn) => queryIn.TypeName == new WitsmlLogs().TypeName),
                    It.IsAny<OptionsIn>(),
                    null))
                .ReturnsAsync(() => objectList)
                .ReturnsAsync(() => objectList);

            await Assert.ThrowsAsync<Middleware.WitsmlUnsupportedCapabilityException>(async () => await _service.GetObjectsWithParamByType(EntityType.Log, "serviceCompany", "myCompany"));
        }
    }
}
