using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging.Abstractions;

using Moq;

using Witsml;
using Witsml.Data;
using Witsml.Data.Measures;
using Witsml.Extensions;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Models.Reports;
using WitsmlExplorer.Api.Repositories;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;
using WitsmlExplorer.Api.Workers.DeepComparison;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Workers
{
    public class CompareWellWorkerTests
    {
        private const string SourceWellUid = "sourceWellUid";
        private const string TargetWellUid = "targetWellUid";

        private readonly Mock<IWitsmlClient> _sourceWitsmlClient = new();
        private readonly Mock<IWitsmlClient> _targetWitsmlClient = new();
        private readonly Mock<IWitsmlClientProvider> _witsmlClientProvider = new();
        private readonly Mock<IDocumentRepository<Server, Guid>> _witsmlServerRepository = new();
        private readonly Uri _sourceUri = new("https://source");
        private readonly Uri _targetUri = new("https://target");

        public CompareWellWorkerTests()
        {
            _sourceWitsmlClient.Setup(c => c.GetServerHostname()).Returns(_sourceUri);
            _targetWitsmlClient.Setup(c => c.GetServerHostname()).Returns(_targetUri);

            // In WitsmlExplorer BaseWorker: GetTargetWitsmlClientOrThrow() calls provider.GetClient()
            // and GetSourceWitsmlClientOrThrow() calls provider.GetSourceClient()
            _witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_sourceWitsmlClient.Object);
            _witsmlClientProvider.Setup(provider => provider.GetSourceClient()).Returns(_targetWitsmlClient.Object);

            var servers = new List<Server>
            {
                new() { Id = Guid.NewGuid(), Name = "Source Server", Url = _sourceUri },
                new() { Id = Guid.NewGuid(), Name = "Target Server", Url = _targetUri }
            };
            _witsmlServerRepository.Setup(r => r.GetDocumentsAsync()).ReturnsAsync(servers);
        }

        [Fact]
        public async Task Execute_IdenticalWells_ReportsZeroMismatches()
        {
            var well = new WitsmlWell
            {
                Uid = "w1",
                Name = "Well 1",
                Field = "North Sea",
                Operator = "Equinor",
                Country = "Norway"
            };

            _sourceWitsmlClient
                .Setup(c => c.GetFromStoreNullableAsync(It.IsAny<WitsmlWells>(), It.IsAny<OptionsIn>(), null))
                .ReturnsAsync(new WitsmlWells { Wells = well.AsItemInList() });

            _targetWitsmlClient
                .Setup(c => c.GetFromStoreNullableAsync(It.IsAny<WitsmlWells>(), It.IsAny<OptionsIn>(), null))
                .ReturnsAsync(new WitsmlWells { Wells = well.AsItemInList() });

            var worker = new CompareWellWorker(
                NullLogger<CompareWellJob>.Instance,
                _witsmlClientProvider.Object,
                _witsmlServerRepository.Object);

            var job = new CompareWellJob
            {
                SourceWell = new WellReference { WellUid = "w1", WellName = "Well 1" },
                TargetWell = new WellReference { WellUid = "w1", WellName = "Well 1" },
                JobInfo = new JobInfo()
            };

            var (result, _) = await worker.Execute(job, CancellationToken.None);

            Assert.True(result.IsSuccess);
            Assert.Contains("No mismatches were found", result.Message);
            var report = job.JobInfo.Report as WellboreSubObjectsComparisonReport;
            Assert.NotNull(report);
            Assert.Empty(report.ReportItems);
        }

        [Fact]
        public async Task Execute_WellsWithDifferences_ReportsMismatches()
        {
            var sourceWell = new WitsmlWell
            {
                Uid = "w1",
                Name = "Well 1",
                Field = "Field A",
                Operator = "Operator A",
                GroundElevation = new WitsmlMeasureWithDatum { Value = "10.0", Uom = "m", Datum = "MSL" }
            };

            var targetWell = new WitsmlWell
            {
                Uid = "w1",
                Name = "Well 1",
                Field = "Field B",
                Operator = "Operator B",
                GroundElevation = new WitsmlMeasureWithDatum { Value = "20.0", Uom = "m", Datum = "MSL" }
            };

            _sourceWitsmlClient
                .Setup(c => c.GetFromStoreNullableAsync(It.IsAny<WitsmlWells>(), It.IsAny<OptionsIn>(), null))
                .ReturnsAsync(new WitsmlWells { Wells = sourceWell.AsItemInList() });

            _targetWitsmlClient
                .Setup(c => c.GetFromStoreNullableAsync(It.IsAny<WitsmlWells>(), It.IsAny<OptionsIn>(), null))
                .ReturnsAsync(new WitsmlWells { Wells = targetWell.AsItemInList() });

            var worker = new CompareWellWorker(
                NullLogger<CompareWellJob>.Instance,
                _witsmlClientProvider.Object,
                _witsmlServerRepository.Object);

            var job = new CompareWellJob
            {
                SourceWell = new WellReference { WellUid = "w1", WellName = "Well 1" },
                TargetWell = new WellReference { WellUid = "w1", WellName = "Well 1" },
                JobInfo = new JobInfo()
            };

            var (result, _) = await worker.Execute(job, CancellationToken.None);

            Assert.True(result.IsSuccess);
            Assert.Contains("Found 3 mismatch(es)", result.Message);
            var report = job.JobInfo.Report as WellboreSubObjectsComparisonReport;
            Assert.NotNull(report);
            Assert.Equal(3, (report.ReportItems as List<WellboreSubObjectsComparisonItem>)?.Count);
        }

        [Fact]
        public async Task Execute_SameWellOnSameServer_FailsWithErrorMessage()
        {
            // Point target client to same hostname
            _targetWitsmlClient.Setup(c => c.GetServerHostname()).Returns(_sourceUri);

            var worker = new CompareWellWorker(
                NullLogger<CompareWellJob>.Instance,
                _witsmlClientProvider.Object,
                _witsmlServerRepository.Object);

            var job = new CompareWellJob
            {
                SourceWell = new WellReference { WellUid = "w1", WellName = "Well 1" },
                TargetWell = new WellReference { WellUid = "w1", WellName = "Well 1" },
                JobInfo = new JobInfo()
            };

            var (result, _) = await worker.Execute(job, CancellationToken.None);

            Assert.False(result.IsSuccess);
            Assert.Contains("tried to compare the same well on the same server", result.Message);
        }

        [Fact]
        public async Task Execute_WithCompareWellbores_DetectsMissingWellbores()
        {
            var well = new WitsmlWell { Uid = "w1", Name = "Well 1" };

            _sourceWitsmlClient
                .Setup(c => c.GetFromStoreNullableAsync(It.IsAny<WitsmlWells>(), It.IsAny<OptionsIn>(), null))
                .ReturnsAsync(new WitsmlWells { Wells = well.AsItemInList() });

            _targetWitsmlClient
                .Setup(c => c.GetFromStoreNullableAsync(It.IsAny<WitsmlWells>(), It.IsAny<OptionsIn>(), null))
                .ReturnsAsync(new WitsmlWells { Wells = well.AsItemInList() });

            // Source has wb1 and wb2
            _sourceWitsmlClient
                .Setup(c => c.GetFromStoreNullableAsync(It.IsAny<WitsmlWellbores>(), It.IsAny<OptionsIn>(), null))
                .ReturnsAsync(new WitsmlWellbores
                {
                    Wellbores = new List<WitsmlWellbore>
                    {
                        new() { Uid = "wb1", Name = "Wellbore 1" },
                        new() { Uid = "wb2", Name = "Wellbore 2" }
                    }
                });

            // Target only has wb1
            _targetWitsmlClient
                .Setup(c => c.GetFromStoreNullableAsync(It.IsAny<WitsmlWellbores>(), It.IsAny<OptionsIn>(), null))
                .ReturnsAsync(new WitsmlWellbores
                {
                    Wellbores = new List<WitsmlWellbore>
                    {
                        new() { Uid = "wb1", Name = "Wellbore 1" }
                    }
                });

            var worker = new CompareWellWorker(
                NullLogger<CompareWellJob>.Instance,
                _witsmlClientProvider.Object,
                _witsmlServerRepository.Object);

            var job = new CompareWellJob
            {
                SourceWell = new WellReference { WellUid = "w1", WellName = "Well 1" },
                TargetWell = new WellReference { WellUid = "w1", WellName = "Well 1" },
                CompareWellboreObjects = true,
                JobInfo = new JobInfo()
            };

            var (result, _) = await worker.Execute(job, CancellationToken.None);

            Assert.True(result.IsSuccess);
            var report = job.JobInfo.Report as WellboreSubObjectsComparisonReport;
            Assert.NotNull(report);
            var items = report.ReportItems as List<WellboreSubObjectsComparisonItem>;
            Assert.Contains(items, i => i.ObjectType == "Wellbore" && i.ObjectUid == "wb2" && i.DifferenceType == "MissingOnTarget");
        }
    }
}
