using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Moq;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Repositories;
using WitsmlExplorer.Api.Services;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Services
{
    public class LogCurvePriorityServiceTests
    {
        private readonly Mock<IDocumentRepository<LogCurvePriority, string>> _repository;
        private readonly ILogCurvePriorityService _logCurvePriorityService;
        private readonly List<string> _prioritizedCurvesWell1Wellbore1 = new() { "curve1", "curve2" };
        private readonly List<string> _prioritizedCurvesWell1Wellbore2 = new() { "A", "B", "C" };
        private readonly List<string> _prioritizedCurvesWell2Wellbore1 = new() { "1", "2", "3", "4" };
        private readonly List<string> _prioritizedCurvesUniversal = new() { "A", "B", "C" };
        private readonly LogCurvePriority _logCurvePriorityWell1Wellbore1;
        private readonly LogCurvePriority _logCurvePriorityWell1Wellbore2;
        private readonly LogCurvePriority _logCurvePriorityWell2Wellbore1;
        private readonly LogCurvePriority _logCurvePriorityUniversal;

        public LogCurvePriorityServiceTests()
        {
            _repository = new Mock<IDocumentRepository<LogCurvePriority, string>>();
            _logCurvePriorityService = new LogCurvePriorityService(_repository.Object);
            _logCurvePriorityWell1Wellbore1 = new LogCurvePriority("well1-wellbore1")
            {
                PrioritizedCurves = _prioritizedCurvesWell1Wellbore1
            };
            _logCurvePriorityWell1Wellbore2 = new LogCurvePriority("well1-wellbore2")
            {
                PrioritizedCurves = _prioritizedCurvesWell1Wellbore2
            };
            _logCurvePriorityWell2Wellbore1 = new LogCurvePriority("well2-wellbore1")
            {
                PrioritizedCurves = _prioritizedCurvesWell2Wellbore1
            };
            _logCurvePriorityUniversal = new LogCurvePriority("universal")
            {
                PrioritizedCurves = _prioritizedCurvesUniversal
            };

            _repository.Setup(repo => repo.GetDocumentAsync(It.IsAny<string>())).ReturnsAsync((LogCurvePriority)null);
            _repository.Setup(repo => repo.GetDocumentAsync("well1-wellbore1")).ReturnsAsync(_logCurvePriorityWell1Wellbore1);
            _repository.Setup(repo => repo.GetDocumentAsync("well1-wellbore2")).ReturnsAsync(_logCurvePriorityWell1Wellbore2);
            _repository.Setup(repo => repo.GetDocumentAsync("well2-wellbore1")).ReturnsAsync(_logCurvePriorityWell2Wellbore1);
            _repository.Setup(repo => repo.UpdateDocumentAsync(It.IsAny<string>(), It.IsAny<LogCurvePriority>()))
                       .ReturnsAsync((string id, LogCurvePriority lcp) => lcp);
            _repository.Setup(repo => repo.CreateDocumentAsync(It.IsAny<LogCurvePriority>()))
                       .ReturnsAsync((LogCurvePriority lcp) => lcp);
            _repository.Setup(repo => repo.DeleteDocumentAsync(It.IsAny<string>())).Returns(Task.CompletedTask);
        }

        [Fact]
        public async Task GetPrioritizedLocalCurves_CorrectIds_ReturnsExpectedCurves()
        {
            var wellUid = "well1";
            var wellboreUid = "wellbore1";

            var result = await _logCurvePriorityService.GetPrioritizedLocalCurves(wellUid, wellboreUid);

            Assert.Equal(_prioritizedCurvesWell1Wellbore1, result);
            _repository.Verify(repo => repo.GetDocumentAsync(It.Is<string>(id => id == $"{wellUid}-{wellboreUid}")), Times.Once);
        }

        [Fact]
        public async Task GetPrioritizedUniversalCurves_CorrectIds_ReturnsExpectedCurves()
        {
            _repository.Setup(repo => repo.GetDocumentAsync("universal")).ReturnsAsync(_logCurvePriorityUniversal);
            var result = await _logCurvePriorityService.GetPrioritizedUniversalCurves();

            Assert.Equal(_prioritizedCurvesUniversal, result);
            _repository.Verify(repo => repo.GetDocumentAsync(It.Is<string>(id => id == "universal")), Times.Once);
        }

        [Fact]
        public async Task GetPrioritizedLocalCurves_IncorrectId_ReturnsNull()
        {
            var wellUid = "well";
            var wellboreUid = "wellbore";

            var result = await _logCurvePriorityService.GetPrioritizedLocalCurves(wellUid, wellboreUid);

            Assert.Null(result);
            _repository.Verify(repo => repo.GetDocumentAsync(It.Is<string>(id => id == $"{wellUid}-{wellboreUid}")), Times.Once);
        }

        [Fact]
        public async Task GetPrioritizedUniversalCurves_IncorrectId_ReturnsNull()
        {
            var result = await _logCurvePriorityService.GetPrioritizedUniversalCurves();

            Assert.Null(result);
            _repository.Verify(repo => repo.GetDocumentAsync(It.Is<string>(id => id == $"universal")), Times.Once);
        }

        [Fact]
        public async Task SetPrioritizedLocalCurves_NoExistingPriority_CreatesNewPriority()
        {
            var wellUid = "well3";
            var wellboreUid = "wellbore3";
            var curves = new List<string> { "AA", "AB", "AA" };
            var expectedUniqueCurves = new List<string> { "AA", "AB" };
            var logCurvePriority = new LogCurvePriority($"{wellUid}-{wellboreUid}")
            {
                PrioritizedCurves = curves
            };

            var result = await _logCurvePriorityService.SetPrioritizedLocalCurves(wellUid, wellboreUid, curves);

            Assert.Equal(expectedUniqueCurves, result);
            _repository.Verify(repo => repo.UpdateDocumentAsync(It.IsAny<string>(), It.IsAny<LogCurvePriority>()), Times.Never);
            _repository.Verify(repo => repo.CreateDocumentAsync(It.Is<LogCurvePriority>(lcp => lcp.Id == $"{wellUid}-{wellboreUid}" && lcp.PrioritizedCurves.SequenceEqual(expectedUniqueCurves))), Times.Once);
        }

        [Fact]
        public async Task SetPrioritizedUniversalCurves_NoExistingPriority_CreatesNewPriority()
        {
            var curves = new List<string> { "AA", "AB", "AA" };
            var expectedUniqueCurves = new List<string> { "AA", "AB" };
            var logCurvePriority = new LogCurvePriority($"universal")
            {
                PrioritizedCurves = curves
            };

            var result = await _logCurvePriorityService.SetPrioritizedUniversalCurves(curves);
            Assert.Equal(expectedUniqueCurves, result);
            _repository.Verify(repo => repo.UpdateDocumentAsync(It.IsAny<string>(), It.IsAny<LogCurvePriority>()), Times.Never);
            _repository.Verify(repo => repo.CreateDocumentAsync(It.Is<LogCurvePriority>(lcp => lcp.Id == $"universal" && lcp.PrioritizedCurves.SequenceEqual(expectedUniqueCurves))), Times.Once);
        }

        [Fact]
        public async Task SetPrioritizedLocalCurves_ExistingPriority_ReplacesPriority()
        {
            var wellUid = "well1";
            var wellboreUid = "wellbore2";
            var curves = new List<string> { "D", "E", "D" };
            var expectedUniqueCurves = new List<string> { "D", "E" };
            var logCurvePriority = new LogCurvePriority($"{wellUid}-{wellboreUid}")
            {
                PrioritizedCurves = curves
            };

            var result = await _logCurvePriorityService.SetPrioritizedLocalCurves(wellUid, wellboreUid, curves);

            Assert.Equal(expectedUniqueCurves, result);
            _repository.Verify(repo => repo.UpdateDocumentAsync($"{wellUid}-{wellboreUid}", It.Is<LogCurvePriority>(lcp => lcp.PrioritizedCurves.SequenceEqual(expectedUniqueCurves))), Times.Once);
        }

        [Fact]
        public async Task SetPrioritizedUniversalCurves_ExistingPriority_ReplacesPriority()
        {
            _repository.Setup(repo => repo.GetDocumentAsync("universal")).ReturnsAsync(_logCurvePriorityUniversal);
            var curves = new List<string> { "D", "E", "D" };
            var expectedUniqueCurves = new List<string> { "D", "E" };
            var logCurvePriority = new LogCurvePriority($"universal")
            {
                PrioritizedCurves = curves
            };

            var result = await _logCurvePriorityService.SetPrioritizedUniversalCurves(curves);

            Assert.Equal(expectedUniqueCurves, result);
            _repository.Verify(repo => repo.UpdateDocumentAsync($"universal", It.Is<LogCurvePriority>(lcp => lcp.PrioritizedCurves.SequenceEqual(expectedUniqueCurves))), Times.Once);
        }

        [Fact]
        public async Task SetPrioritizedLocalCurves_EmptyInput_RemovesPriorityObject()
        {
            var wellUid = "well2";
            var wellboreUid = "wellbore1";
            var curves = new List<string>();

            var result = await _logCurvePriorityService.SetPrioritizedLocalCurves(wellUid, wellboreUid, curves);

            Assert.Null(result);
            _repository.Verify(repo => repo.UpdateDocumentAsync(It.IsAny<string>(), It.IsAny<LogCurvePriority>()), Times.Never);
            _repository.Verify(repo => repo.DeleteDocumentAsync($"{wellUid}-{wellboreUid}"), Times.Once);
        }

        [Fact]
        public async Task SetPrioritizedUniversalCurves_EmptyInput_RemovesPriorityObject()
        {
            var expectedResult = 0;
            _repository.Setup(repo => repo.GetDocumentAsync("universal")).ReturnsAsync(_logCurvePriorityUniversal);
            var curves = new List<string>();

            var result = await _logCurvePriorityService.SetPrioritizedUniversalCurves(curves);

            Assert.Equal(result.Count, expectedResult);
            _repository.Verify(repo => repo.UpdateDocumentAsync(It.IsAny<string>(), It.IsAny<LogCurvePriority>()), Times.Once);
        }
    }
}
