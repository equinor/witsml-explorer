using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

using Moq;

using WitsmlExplorer.Api.HttpHandlers;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Repositories;
using WitsmlExplorer.Api.Services;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Services
{
    public class UidMappingServiceTests
    {
        private readonly string[] USERNAMES = new[] { "TestUsername1", "TestUsername2" };

        private IUidMappingService _service;
        private readonly Mock<IDocumentRepository<UidMappingCollection, UidMappingKey>> _mappingRepositoryMock;

        public UidMappingServiceTests()
        {
            _mappingRepositoryMock = new Mock<IDocumentRepository<UidMappingCollection, UidMappingKey>>();
        }

        [Fact]
        public async Task CreateUidMapping_DbEntryAlreadyExists_ReturnsNull()
        {
            var mapping = new UidMapping()
            {
                SourceServerId = Guid.NewGuid(),
                SourceWellId = "SourceWell01",
                SourceWellboreId = "SourceWellbore01",
                TargetServerId = Guid.NewGuid(),
                TargetWellId = "TargetWell01",
                TargetWellboreId = "TargetWellbore01"
            };

            var mappingCollection = new UidMappingCollection(new(mapping.SourceServerId, mapping.TargetServerId))
            {
                MappingCollection = new List<UidMapping> { mapping }
            };

            _mappingRepositoryMock
                .Setup(mr => mr.GetDocumentAsync(It.Is<UidMappingKey>(k => k.SourceServerId == mapping.SourceServerId && k.TargetServerId == mapping.TargetServerId)))
                .ReturnsAsync(mappingCollection);

            SetupService();

            var result = await _service.CreateUidMapping(UidMappingClone(mapping), null);

            _mappingRepositoryMock.Verify(mrm => mrm.GetDocumentAsync(It.IsAny<UidMappingKey>()), Times.Once);
            _mappingRepositoryMock.Verify(mrm => mrm.CreateDocumentAsync(It.IsAny<UidMappingCollection>()), Times.Never);
            _mappingRepositoryMock.Verify(mrm => mrm.UpdateDocumentAsync(It.IsAny<UidMappingKey>(), It.IsAny<UidMappingCollection>()), Times.Never);
            _mappingRepositoryMock.Verify(mrm => mrm.DeleteDocumentAsync(It.IsAny<UidMappingKey>()), Times.Never);

            Assert.Null(result);
        }

        [Fact]
        public async Task CreateUidMapping_DbEmpty_OneReturned()
        {
            var mapping = new UidMapping
            {
                SourceServerId = Guid.NewGuid(),
                SourceWellId = "SourceWell01",
                SourceWellboreId = "SourceWellbore01",
                TargetServerId = Guid.NewGuid(),
                TargetWellId = "TargetWell01",
                TargetWellboreId = "TargetWellbore01"
            };

            _mappingRepositoryMock
                .Setup(mr => mr.GetDocumentAsync(It.Is<UidMappingKey>(k => k.SourceServerId == mapping.SourceServerId && k.TargetServerId == mapping.TargetServerId)))
                .ReturnsAsync((UidMappingCollection)null);

            var startTime = DateTime.UtcNow;

            SetupService();

            var result = await _service.CreateUidMapping(UidMappingClone(mapping), null);

            _mappingRepositoryMock.Verify(mrm => mrm.GetDocumentAsync(It.IsAny<UidMappingKey>()), Times.Once);
            _mappingRepositoryMock.Verify(mrm => mrm.CreateDocumentAsync(It.IsAny<UidMappingCollection>()), Times.Once);
            _mappingRepositoryMock.Verify(mrm => mrm.UpdateDocumentAsync(It.IsAny<UidMappingKey>(), It.IsAny<UidMappingCollection>()), Times.Never);
            _mappingRepositoryMock.Verify(mrm => mrm.DeleteDocumentAsync(It.IsAny<UidMappingKey>()), Times.Never);

            Assert.NotNull(result);
            AssertUidMappingEqual(mapping, result);
            AssertUidMappingTimestamp(result, startTime);
            AssertUidMappingUsername(result);
        }

        [Fact]
        public async Task CreateUidMapping_DbEntrySameTargetServer_OneReturned()
        {
            var mapping1 = new UidMapping
            {
                SourceServerId = Guid.NewGuid(),
                SourceWellId = "SourceWell01",
                SourceWellboreId = "SourceWellbore01",
                TargetServerId = Guid.NewGuid(),
                TargetWellId = "TargetWell01",
                TargetWellboreId = "TargetWellbore01"
            };

            var mappingCollection = new UidMappingCollection(new(mapping1.SourceServerId, mapping1.TargetServerId))
            {
                MappingCollection = new List<UidMapping> { mapping1 }
            };

            _mappingRepositoryMock
                .Setup(mr => mr.GetDocumentAsync(It.Is<UidMappingKey>(k => k.SourceServerId == mapping1.SourceServerId && k.TargetServerId == mapping1.TargetServerId)))
                .ReturnsAsync(mappingCollection);

            var mapping2 = new UidMapping
            {
                SourceServerId = mapping1.SourceServerId,
                SourceWellId = "SourceWell02",
                SourceWellboreId = "SourceWellbore02",
                TargetServerId = mapping1.TargetServerId,
                TargetWellId = "TargetWell02",
                TargetWellboreId = "TargetWellbore02"
            };

            _mappingRepositoryMock
                .Setup(mr => mr.CreateDocumentAsync(It.IsAny<UidMappingCollection>()))
                .ReturnsAsync((UidMappingCollection)null);

            SetupService();

            var startTime = DateTime.UtcNow;

            var result = await _service.CreateUidMapping(UidMappingClone(mapping2), null);

            _mappingRepositoryMock.Verify(mrm => mrm.GetDocumentAsync(It.IsAny<UidMappingKey>()), Times.Once);
            _mappingRepositoryMock.Verify(mrm => mrm.CreateDocumentAsync(It.IsAny<UidMappingCollection>()), Times.Never);
            _mappingRepositoryMock.Verify(mrm => mrm.UpdateDocumentAsync(It.IsAny<UidMappingKey>(), It.IsAny<UidMappingCollection>()), Times.Once);
            _mappingRepositoryMock.Verify(mrm => mrm.DeleteDocumentAsync(It.IsAny<UidMappingKey>()), Times.Never);

            Assert.NotNull(result);
            AssertUidMappingEqual(mapping2, result);
            AssertUidMappingTimestamp(result, startTime);
            AssertUidMappingUsername(result);
        }

        [Fact]
        public async Task CreateUidMapping_DbEntryDifferentTargetServer_OneReturned()
        {
            var mapping1 = new UidMapping()
            {
                SourceServerId = Guid.NewGuid(),
                SourceWellId = "SourceWell01",
                SourceWellboreId = "SourceWellbore01",
                TargetServerId = Guid.NewGuid(),
                TargetWellId = "TargetWell01",
                TargetWellboreId = "TargetWellbore01"
            };

            var mappingCollection = new UidMappingCollection(new(mapping1.SourceServerId, mapping1.TargetServerId))
            {
                MappingCollection = new List<UidMapping> { mapping1 }
            };

            _mappingRepositoryMock
                .Setup(mr => mr.GetDocumentAsync(It.Is<UidMappingKey>(k => k.SourceServerId == mapping1.SourceServerId && k.TargetServerId == mapping1.TargetServerId)))
                .ReturnsAsync(mappingCollection);

            var mapping2 = new UidMapping
            {
                SourceServerId = Guid.NewGuid(),
                SourceWellId = "SourceWell01",
                SourceWellboreId = "SourceWellbore01",
                TargetServerId = Guid.NewGuid(),
                TargetWellId = "TargetWell01",
                TargetWellboreId = "TargetWellbore01"
            };

            _mappingRepositoryMock
                .Setup(mr => mr.CreateDocumentAsync(It.IsAny<UidMappingCollection>()))
                .ReturnsAsync((UidMappingCollection)null);

            SetupService();

            var startTime = DateTime.UtcNow;

            var result = await _service.CreateUidMapping(UidMappingClone(mapping2), null);

            _mappingRepositoryMock.Verify(mrm => mrm.GetDocumentAsync(It.IsAny<UidMappingKey>()), Times.Once);
            _mappingRepositoryMock.Verify(mrm => mrm.CreateDocumentAsync(It.IsAny<UidMappingCollection>()), Times.Once);
            _mappingRepositoryMock.Verify(mrm => mrm.UpdateDocumentAsync(It.IsAny<UidMappingKey>(), It.IsAny<UidMappingCollection>()), Times.Never);
            _mappingRepositoryMock.Verify(mrm => mrm.DeleteDocumentAsync(It.IsAny<UidMappingKey>()), Times.Never);

            Assert.NotNull(result);
            AssertUidMappingEqual(mapping2, result);
            AssertUidMappingTimestamp(result, startTime);
            AssertUidMappingUsername(result);
        }

        [Fact]
        public async Task UpdateUidMapping_DbEntryNotExists_ReturnsNull()
        {
            var mapping = new UidMapping
            {
                SourceServerId = Guid.NewGuid(),
                SourceWellId = "SourceWell01",
                SourceWellboreId = "SourceWellbore01",
                TargetServerId = Guid.NewGuid(),
                TargetWellId = "TargetWell01",
                TargetWellboreId = "TargetWellbore01"
            };

            _mappingRepositoryMock
                .Setup(mr => mr.GetDocumentAsync(It.Is<UidMappingKey>(k => k.SourceServerId == mapping.SourceServerId && k.TargetServerId == mapping.TargetServerId)))
                .ReturnsAsync((UidMappingCollection)null);

            _mappingRepositoryMock
                .Setup(mr => mr.UpdateDocumentAsync(It.IsAny<UidMappingKey>(), It.IsAny<UidMappingCollection>()))
                .ReturnsAsync((UidMappingCollection)null);

            SetupService();

            var result = await _service.UpdateUidMapping(mapping, null);

            _mappingRepositoryMock.Verify(mrm => mrm.GetDocumentAsync(It.IsAny<UidMappingKey>()), Times.Once);
            _mappingRepositoryMock.Verify(mrm => mrm.CreateDocumentAsync(It.IsAny<UidMappingCollection>()), Times.Never);
            _mappingRepositoryMock.Verify(mrm => mrm.UpdateDocumentAsync(It.IsAny<UidMappingKey>(), It.IsAny<UidMappingCollection>()), Times.Never);
            _mappingRepositoryMock.Verify(mrm => mrm.DeleteDocumentAsync(It.IsAny<UidMappingKey>()), Times.Never);

            Assert.Null(result);
        }

        [Fact]
        public async Task UpdateUidMapping_DbEntryExists_OneUpdated()
        {
            var mapping = new UidMapping
            {
                SourceServerId = Guid.NewGuid(),
                SourceWellId = "SourceWell01",
                SourceWellboreId = "SourceWellbore01",
                TargetServerId = Guid.NewGuid(),
                TargetWellId = "TargetWell01",
                TargetWellboreId = "TargetWellbore01"
            };

            var mappingCollection = new UidMappingCollection(new(mapping.SourceServerId, mapping.TargetServerId))
            {
                MappingCollection = new List<UidMapping> { mapping }
            };

            _mappingRepositoryMock
                .Setup(mr => mr.GetDocumentAsync(It.Is<UidMappingKey>(k => k.SourceServerId == mapping.SourceServerId && k.TargetServerId == mapping.TargetServerId)))
                .ReturnsAsync(mappingCollection);

            var mappingUpdate = new UidMapping
            {
                SourceServerId = mapping.SourceServerId,
                SourceWellId = "SourceWell01",
                SourceWellboreId = "SourceWellbore01",
                TargetServerId = mapping.TargetServerId,
                TargetWellId = "TargetWell01Updated",
                TargetWellboreId = "TargetWellbore01Updated"
            };

            _mappingRepositoryMock
                .Setup(mr => mr.UpdateDocumentAsync(It.IsAny<UidMappingKey>(), It.IsAny<UidMappingCollection>()))
                .ReturnsAsync((UidMappingCollection)null);

            SetupService();

            var startTime = DateTime.UtcNow;

            var result = await _service.UpdateUidMapping(UidMappingClone(mappingUpdate), null);

            _mappingRepositoryMock.Verify(mrm => mrm.GetDocumentAsync(It.IsAny<UidMappingKey>()), Times.Once);
            _mappingRepositoryMock.Verify(mrm => mrm.CreateDocumentAsync(It.IsAny<UidMappingCollection>()), Times.Never);
            _mappingRepositoryMock.Verify(mrm => mrm.UpdateDocumentAsync(It.IsAny<UidMappingKey>(), It.IsAny<UidMappingCollection>()), Times.Once);
            _mappingRepositoryMock.Verify(mrm => mrm.DeleteDocumentAsync(It.IsAny<UidMappingKey>()), Times.Never);

            Assert.NotNull(result);
            AssertUidMappingEqual(mappingUpdate, result);
            AssertUidMappingTimestamp(result, startTime);
            AssertUidMappingUsername(result);
        }

        [Fact]
        public async Task QueryUidMapping_QueryForOne_FindsNone()
        {
            var mapping1 = new UidMapping
            {
                SourceServerId = Guid.NewGuid(),
                SourceWellId = "SourceWell01",
                SourceWellboreId = "SourceWellbore01",
                TargetServerId = Guid.NewGuid(),
                TargetWellId = "TargetWell01",
                TargetWellboreId = "TargetWellbore01"
            };

            var mappingCollection1 = new UidMappingCollection(new(mapping1.SourceServerId, mapping1.TargetServerId))
            {
                MappingCollection = new List<UidMapping>
                {
                    mapping1,
                    new UidMapping
                    {
                        SourceServerId = mapping1.SourceServerId,
                        SourceWellId = "SourceWell03",
                        SourceWellboreId = "SourceWellbore03",
                        TargetServerId = mapping1.TargetServerId,
                        TargetWellId = "TargetWell03",
                        TargetWellboreId = "TargetWellbore03"
                    }
                }
            };

            _mappingRepositoryMock
                .Setup(mr => mr.GetDocumentAsync(It.Is<UidMappingKey>(k => k.SourceServerId == mapping1.SourceServerId && k.TargetServerId == mapping1.TargetServerId)))
                .ReturnsAsync(mappingCollection1);

            var mapping2 = new UidMapping
            {
                SourceServerId = Guid.NewGuid(),
                SourceWellId = "SourceWell02",
                SourceWellboreId = "SourceWellbore02",
                TargetServerId = Guid.NewGuid(),
                TargetWellId = "TargetWell02",
                TargetWellboreId = "TargetWellbore02"
            };

            var mappingCollection2 = new UidMappingCollection(new(mapping2.SourceServerId, mapping2.TargetServerId))
            {
                MappingCollection = new List<UidMapping> { mapping2 }
            };

            _mappingRepositoryMock
                .Setup(mr => mr.GetDocumentAsync(It.Is<UidMappingKey>(k => k.SourceServerId == mapping2.SourceServerId && k.TargetServerId == mapping2.TargetServerId)))
                .ReturnsAsync(mappingCollection2);

            var query = new UidMappingDbQuery
            {
                SourceServerId = mapping1.SourceServerId,
                SourceWellId = mapping1.SourceWellId,
                SourceWellboreId = mapping1.SourceWellboreId,
                TargetServerId = Guid.NewGuid()
            };

            SetupService();

            var result = await _service.QueryUidMapping(query);

            _mappingRepositoryMock.Verify(mrm => mrm.GetDocumentAsync(It.IsAny<UidMappingKey>()), Times.Once);
            _mappingRepositoryMock.Verify(mrm => mrm.CreateDocumentAsync(It.IsAny<UidMappingCollection>()), Times.Never);
            _mappingRepositoryMock.Verify(mrm => mrm.UpdateDocumentAsync(It.IsAny<UidMappingKey>(), It.IsAny<UidMappingCollection>()), Times.Never);
            _mappingRepositoryMock.Verify(mrm => mrm.DeleteDocumentAsync(It.IsAny<UidMappingKey>()), Times.Never);

            Assert.NotNull(result);
            Assert.Empty(result);
        }

        [Fact]
        public async Task QueryUidMapping_QueryForOne_FindsOne()
        {
            var mapping1 = new UidMapping
            {
                SourceServerId = Guid.NewGuid(),
                SourceWellId = "SourceWell01",
                SourceWellboreId = "SourceWellbore01",
                TargetServerId = Guid.NewGuid(),
                TargetWellId = "TargetWell01",
                TargetWellboreId = "TargetWellbore01"
            };

            var mappingCollection1 = new UidMappingCollection(new(mapping1.SourceServerId, mapping1.TargetServerId))
            {
                MappingCollection = new List<UidMapping>
                {
                    mapping1,
                    new UidMapping
                    {
                        SourceServerId = mapping1.SourceServerId,
                        SourceWellId = "SourceWell03",
                        SourceWellboreId = "SourceWellbore03",
                        TargetServerId = mapping1.TargetServerId,
                        TargetWellId = "TargetWell03",
                        TargetWellboreId = "TargetWellbore03"
                    }
                }
            };

            _mappingRepositoryMock
                .Setup(mr => mr.GetDocumentAsync(It.Is<UidMappingKey>(k => k.SourceServerId == mapping1.SourceServerId && k.TargetServerId == mapping1.TargetServerId)))
                .ReturnsAsync(mappingCollection1);

            var mapping2 = new UidMapping
            {
                SourceServerId = Guid.NewGuid(),
                SourceWellId = "SourceWell02",
                SourceWellboreId = "SourceWellbore02",
                TargetServerId = Guid.NewGuid(),
                TargetWellId = "TargetWell02",
                TargetWellboreId = "TargetWellbore02"
            };

            var mappingCollection2 = new UidMappingCollection(new(mapping2.SourceServerId, mapping2.TargetServerId))
            {
                MappingCollection = new List<UidMapping> { mapping2 }
            };

            _mappingRepositoryMock
                .Setup(mr => mr.GetDocumentAsync(It.Is<UidMappingKey>(k => k.SourceServerId == mapping2.SourceServerId && k.TargetServerId == mapping2.TargetServerId)))
                .ReturnsAsync(mappingCollection2);

            var query = new UidMappingDbQuery
            {
                SourceServerId = mapping1.SourceServerId,
                SourceWellId = mapping1.SourceWellId,
                SourceWellboreId = mapping1.SourceWellboreId,
                TargetServerId = mapping1.TargetServerId
            };

            SetupService();

            var result = await _service.QueryUidMapping(query);

            _mappingRepositoryMock.Verify(mrm => mrm.GetDocumentAsync(It.IsAny<UidMappingKey>()), Times.Once);
            _mappingRepositoryMock.Verify(mrm => mrm.CreateDocumentAsync(It.IsAny<UidMappingCollection>()), Times.Never);
            _mappingRepositoryMock.Verify(mrm => mrm.UpdateDocumentAsync(It.IsAny<UidMappingKey>(), It.IsAny<UidMappingCollection>()), Times.Never);
            _mappingRepositoryMock.Verify(mrm => mrm.DeleteDocumentAsync(It.IsAny<UidMappingKey>()), Times.Never);

            Assert.NotNull(result);
            Assert.NotEmpty(result);
            Assert.Single(result);
            AssertUidMappingEqual(mapping1, result.First());
        }

        [Fact]
        public async Task QueryUidMapping_QueryForTargetServer_FindsTwo()
        {
            var mapping1 = new UidMapping
            {
                SourceServerId = Guid.NewGuid(),
                SourceWellId = "SourceWell01",
                SourceWellboreId = "SourceWellbore01",
                TargetServerId = Guid.NewGuid(),
                TargetWellId = "TargetWell01",
                TargetWellboreId = "TargetWellbore01"
            };

            var mapping2 = new UidMapping
            {
                SourceServerId = mapping1.SourceServerId,
                SourceWellId = "SourceWell03",
                SourceWellboreId = "SourceWellbore03",
                TargetServerId = mapping1.TargetServerId,
                TargetWellId = "TargetWell03",
                TargetWellboreId = "TargetWellbore03"
            };

            var mappingCollection1 = new UidMappingCollection(new(mapping1.SourceServerId, mapping1.TargetServerId))
            {
                MappingCollection = new List<UidMapping>
                {
                    mapping1,
                    mapping2
                }
            };

            _mappingRepositoryMock
                .Setup(mr => mr.GetDocumentAsync(It.Is<UidMappingKey>(k => k.SourceServerId == mapping1.SourceServerId && k.TargetServerId == mapping1.TargetServerId)))
                .ReturnsAsync(mappingCollection1);

            var mapping3 = new UidMapping
            {
                SourceServerId = Guid.NewGuid(),
                SourceWellId = "SourceWell02",
                SourceWellboreId = "SourceWellbore02",
                TargetServerId = Guid.NewGuid(),
                TargetWellId = "TargetWell02",
                TargetWellboreId = "TargetWellbore02"
            };

            var mappingCollection2 = new UidMappingCollection(new(mapping3.SourceServerId, mapping3.TargetServerId))
            {
                MappingCollection = new List<UidMapping> { mapping3 }
            };

            _mappingRepositoryMock
                .Setup(mr => mr.GetDocumentAsync(It.Is<UidMappingKey>(k => k.SourceServerId == mapping3.SourceServerId && k.TargetServerId == mapping3.TargetServerId)))
                .ReturnsAsync(mappingCollection2);

            var query = new UidMappingDbQuery
            {
                SourceServerId = mapping1.SourceServerId,
                TargetServerId = mapping1.TargetServerId
            };

            SetupService();

            var result = await _service.QueryUidMapping(query);

            _mappingRepositoryMock.Verify(mrm => mrm.GetDocumentAsync(It.IsAny<UidMappingKey>()), Times.Once);
            _mappingRepositoryMock.Verify(mrm => mrm.CreateDocumentAsync(It.IsAny<UidMappingCollection>()), Times.Never);
            _mappingRepositoryMock.Verify(mrm => mrm.UpdateDocumentAsync(It.IsAny<UidMappingKey>(), It.IsAny<UidMappingCollection>()), Times.Never);
            _mappingRepositoryMock.Verify(mrm => mrm.DeleteDocumentAsync(It.IsAny<UidMappingKey>()), Times.Never);

            Assert.NotNull(result);
            Assert.NotEmpty(result);
            Assert.Equal(2, result.Count);
            Assert.Distinct(result);
            Assert.Contains(result, r => r.ToString() == mapping1.ToString());
            Assert.Contains(result, r => r.ToString() == mapping2.ToString());
        }

        [Fact]
        public async Task DeleteUidMapping_NotFound_ReturnsFalse()
        {
            var mapping1 = new UidMapping
            {
                SourceServerId = Guid.NewGuid(),
                SourceWellId = "SourceWell01",
                SourceWellboreId = "SourceWellbore01",
                TargetServerId = Guid.NewGuid(),
                TargetWellId = "TargetWell01",
                TargetWellboreId = "TargetWellbore01"
            };

            var mapping2 = new UidMapping
            {
                SourceServerId = mapping1.SourceServerId,
                SourceWellId = "SourceWell03",
                SourceWellboreId = "SourceWellbore03",
                TargetServerId = mapping1.TargetServerId,
                TargetWellId = "TargetWell03",
                TargetWellboreId = "TargetWellbore03"
            };

            var mappingCollection1 = new UidMappingCollection(new(mapping1.SourceServerId, mapping1.TargetServerId))
            {
                MappingCollection = new List<UidMapping>
                {
                    mapping1,
                    mapping2
                }
            };

            _mappingRepositoryMock
                .Setup(mr => mr.GetDocumentAsync(It.Is<UidMappingKey>(k => k.SourceServerId == mapping1.SourceServerId && k.TargetServerId == mapping1.TargetServerId)))
                .ReturnsAsync(mappingCollection1);

            var mapping3 = new UidMapping
            {
                SourceServerId = Guid.NewGuid(),
                SourceWellId = "SourceWell02",
                SourceWellboreId = "SourceWellbore02",
                TargetServerId = Guid.NewGuid(),
                TargetWellId = "TargetWell02",
                TargetWellboreId = "TargetWellbore02"
            };

            var mappingCollection2 = new UidMappingCollection(new(mapping3.SourceServerId, mapping3.TargetServerId))
            {
                MappingCollection = new List<UidMapping> { mapping3 }
            };

            _mappingRepositoryMock
                .Setup(mr => mr.GetDocumentAsync(It.Is<UidMappingKey>(k => k.SourceServerId == mapping1.SourceServerId && k.TargetServerId == mapping1.TargetServerId)))
                .ReturnsAsync(mappingCollection1);

            var query = new UidMappingDbQuery
            {
                SourceServerId = mapping1.SourceServerId,
                SourceWellId = mapping2.SourceWellId,
                SourceWellboreId = mapping1.SourceWellboreId,
                TargetServerId = mapping1.TargetServerId
            };

            SetupService();

            var result = await _service.QueryDeleteUidMapping(query);

            _mappingRepositoryMock.Verify(mrm => mrm.GetDocumentAsync(It.IsAny<UidMappingKey>()), Times.Once);
            _mappingRepositoryMock.Verify(mrm => mrm.CreateDocumentAsync(It.IsAny<UidMappingCollection>()), Times.Never);
            _mappingRepositoryMock.Verify(mrm => mrm.UpdateDocumentAsync(It.IsAny<UidMappingKey>(), It.IsAny<UidMappingCollection>()), Times.Never);
            _mappingRepositoryMock.Verify(mrm => mrm.DeleteDocumentAsync(It.IsAny<UidMappingKey>()), Times.Never);

            Assert.False(result);
        }

        [Fact]
        public async Task DeleteUidMapping_DeleteSpecific_ReturnsTrue()
        {
            var mapping1 = new UidMapping
            {
                SourceServerId = Guid.NewGuid(),
                SourceWellId = "SourceWell01",
                SourceWellboreId = "SourceWellbore01",
                TargetServerId = Guid.NewGuid(),
                TargetWellId = "TargetWell01",
                TargetWellboreId = "TargetWellbore01"
            };

            var mapping2 = new UidMapping
            {
                SourceServerId = mapping1.SourceServerId,
                SourceWellId = "SourceWell03",
                SourceWellboreId = "SourceWellbore03",
                TargetServerId = mapping1.TargetServerId,
                TargetWellId = "TargetWell03",
                TargetWellboreId = "TargetWellbore03"
            };

            var mappingCollection1 = new UidMappingCollection(new(mapping1.SourceServerId, mapping1.TargetServerId))
            {
                MappingCollection = new List<UidMapping>
                {
                    mapping1,
                    mapping2
                }
            };

            _mappingRepositoryMock
                .Setup(mr => mr.GetDocumentAsync(It.Is<UidMappingKey>(k => k.SourceServerId == mapping1.SourceServerId && k.TargetServerId == mapping1.TargetServerId)))
                .ReturnsAsync(mappingCollection1);

            var mapping3 = new UidMapping
            {
                SourceServerId = Guid.NewGuid(),
                SourceWellId = "SourceWell02",
                SourceWellboreId = "SourceWellbore02",
                TargetServerId = Guid.NewGuid(),
                TargetWellId = "TargetWell02",
                TargetWellboreId = "TargetWellbore02"
            };

            var mappingCollection2 = new UidMappingCollection(new(mapping3.SourceServerId, mapping3.TargetServerId))
            {
                MappingCollection = new List<UidMapping> { mapping3 }
            };

            _mappingRepositoryMock
                .Setup(mr => mr.GetDocumentAsync(It.Is<UidMappingKey>(k => k.SourceServerId == mapping1.SourceServerId && k.TargetServerId == mapping1.TargetServerId)))
                .ReturnsAsync(mappingCollection1);

            var query = new UidMappingDbQuery
            {
                SourceServerId = mapping1.SourceServerId,
                SourceWellId = mapping1.SourceWellId,
                SourceWellboreId = mapping1.SourceWellboreId,
                TargetServerId = mapping1.TargetServerId
            };

            SetupService();

            var result = await _service.QueryDeleteUidMapping(query);

            _mappingRepositoryMock.Verify(mrm => mrm.GetDocumentAsync(It.IsAny<UidMappingKey>()), Times.Once);
            _mappingRepositoryMock.Verify(mrm => mrm.CreateDocumentAsync(It.IsAny<UidMappingCollection>()), Times.Never);
            _mappingRepositoryMock.Verify(mrm => mrm.UpdateDocumentAsync(It.IsAny<UidMappingKey>(), It.IsAny<UidMappingCollection>()), Times.Once);
            _mappingRepositoryMock.Verify(mrm => mrm.DeleteDocumentAsync(It.IsAny<UidMappingKey>()), Times.Never);

            Assert.True(result);
        }

        [Fact]
        public async Task DeleteUidMapping_DeleteForTargetServer_ReturnsTrue()
        {
            var mapping1 = new UidMapping
            {
                SourceServerId = Guid.NewGuid(),
                SourceWellId = "SourceWell01",
                SourceWellboreId = "SourceWellbore01",
                TargetServerId = Guid.NewGuid(),
                TargetWellId = "TargetWell01",
                TargetWellboreId = "TargetWellbore01"
            };

            var mapping2 = new UidMapping
            {
                SourceServerId = mapping1.SourceServerId,
                SourceWellId = "SourceWell03",
                SourceWellboreId = "SourceWellbore03",
                TargetServerId = mapping1.TargetServerId,
                TargetWellId = "TargetWell03",
                TargetWellboreId = "TargetWellbore03"
            };

            var mappingCollection1 = new UidMappingCollection(new(mapping1.SourceServerId, mapping1.TargetServerId))
            {
                MappingCollection = new List<UidMapping>
                {
                    mapping1,
                    mapping2
                }
            };

            _mappingRepositoryMock
                .Setup(mr => mr.GetDocumentAsync(It.Is<UidMappingKey>(k => k.SourceServerId == mapping1.SourceServerId && k.TargetServerId == mapping1.TargetServerId)))
                .ReturnsAsync(mappingCollection1);

            var mapping3 = new UidMapping
            {
                SourceServerId = Guid.NewGuid(),
                SourceWellId = "SourceWell02",
                SourceWellboreId = "SourceWellbore02",
                TargetServerId = Guid.NewGuid(),
                TargetWellId = "TargetWell02",
                TargetWellboreId = "TargetWellbore02"
            };

            var mappingCollection2 = new UidMappingCollection(new(mapping3.SourceServerId, mapping3.TargetServerId))
            {
                MappingCollection = new List<UidMapping> { mapping3 }
            };

            _mappingRepositoryMock
                .Setup(mr => mr.GetDocumentAsync(It.Is<UidMappingKey>(k => k.SourceServerId == mapping1.SourceServerId && k.TargetServerId == mapping1.TargetServerId)))
                .ReturnsAsync(mappingCollection1);

            var query = new UidMappingDbQuery
            {
                SourceServerId = mapping1.SourceServerId,
                TargetServerId = mapping1.TargetServerId
            };

            SetupService();

            var result = await _service.QueryDeleteUidMapping(query);

            _mappingRepositoryMock.Verify(mrm => mrm.GetDocumentAsync(It.IsAny<UidMappingKey>()), Times.Once);
            _mappingRepositoryMock.Verify(mrm => mrm.CreateDocumentAsync(It.IsAny<UidMappingCollection>()), Times.Never);
            _mappingRepositoryMock.Verify(mrm => mrm.UpdateDocumentAsync(It.IsAny<UidMappingKey>(), It.IsAny<UidMappingCollection>()), Times.Never);
            _mappingRepositoryMock.Verify(mrm => mrm.DeleteDocumentAsync(It.IsAny<UidMappingKey>()), Times.Once);

            Assert.True(result);
        }

        private UidMapping UidMappingClone(UidMapping mapping)
        {
            return JsonSerializer.Deserialize<UidMapping>(mapping.ToString());
        }

        private void SetupService()
        {
            var serverRepositoryMock = new Mock<IDocumentRepository<Server, Guid>>();
            serverRepositoryMock.Setup(sr => sr.GetDocumentAsync(It.IsAny<Guid>())).ReturnsAsync(new Server() { Url = new Uri("http://something.com") });

            var credentialsServiceMock = new Mock<ICredentialsService>();
            credentialsServiceMock.Setup(cs => cs.GetLoggedInUsernames(It.IsAny<EssentialHeaders>(), It.IsAny<Uri>())).ReturnsAsync(USERNAMES);

            _service = new UidMappingService(_mappingRepositoryMock.Object, serverRepositoryMock.Object, credentialsServiceMock.Object);
        }

        private void AssertUidMappingEqual(UidMapping expected, UidMapping actual)
        {
            Assert.Equal(expected.SourceServerId, actual.SourceServerId);
            Assert.Equal(expected.SourceWellId, actual.SourceWellId);
            Assert.Equal(expected.SourceWellboreId, actual.SourceWellboreId);
            Assert.Equal(expected.TargetServerId, actual.TargetServerId);
            Assert.Equal(expected.TargetWellId, actual.TargetWellId);
            Assert.Equal(expected.TargetWellboreId, actual.TargetWellboreId);
        }

        private void AssertUidMappingTimestamp(UidMapping uidMapping, DateTime startTime)
        {
            Assert.NotNull(uidMapping.Timestamp);
            Assert.InRange(uidMapping.Timestamp.Value, startTime, DateTime.UtcNow);
        }

        private void AssertUidMappingUsername(UidMapping uidMapping)
        {
            Assert.NotNull(uidMapping.Username);
            Assert.Equal(string.Join(", ", USERNAMES), uidMapping.Username);
        }
    }
}
