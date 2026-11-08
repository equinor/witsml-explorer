using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging.Abstractions;

using Moq;

using Witsml;
using Witsml.Data;
using Witsml.Data.Curves;
using Witsml.Data.DataWorkOrder;
using Witsml.Data.Measures;
using Witsml.Data.MudLog;
using Witsml.Data.Rig;
using Witsml.Data.Tubular;
using Witsml.Extensions;
using Witsml.ServiceReference;
using Witsml.Xml;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Models.Reports;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Repositories;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Workers
{

    public class WellboreSubObjectsComparisonWorkerTests
    {
        private const string SourceWellUid = "sourceWellUid";
        private const string TargetWellUid = "targetWellUid";
        private const string SourceWellboreUid = "sourceWellboreUid";
        private const string TargetWellboreUid = "targetWellboreUid";

        private WellboreSubObjectsComparisonWorker _worker;
        private readonly Mock<IWitsmlClient> _sourceWitsmlClient = new();
        private readonly Mock<IWitsmlClient> _targetWitsmlClient = new();
        private readonly Mock<IWitsmlClientProvider> _witsmlClientProvider = new();

        private readonly Mock<ICountLogDataRowWorker> _countLogDataRowWorker;
        private readonly Mock<ICompareLogDataWorker> _compareLogDataRowWorker;

        private readonly Uri _targetUri = new("https://target");
        private readonly Uri _sourceUri = new("https://source");

        private const double DepthSourceStart = 10;
        private const double DepthSourceEnd = 15;
        private const double DepthTargetStart = 1;
        private const double DepthTargetEnd = 5;

        public WellboreSubObjectsComparisonWorkerTests()
        {
            _witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_sourceWitsmlClient.Object);
            _witsmlClientProvider.Setup(provider => provider.GetSourceClient()).Returns(_targetWitsmlClient.Object);
            _countLogDataRowWorker = new Mock<ICountLogDataRowWorker>();
            _compareLogDataRowWorker = new Mock<ICompareLogDataWorker>();
            MockWorkers();
        }

        [Fact]
        public async Task Execute_Compare_2_Wellbores()
        {
            //Arrange
            var witsmlLog = new WitsmlLog();
            WitsmlLogs sourceLogs = new() { Logs = witsmlLog.AsItemInList() };

            _sourceWitsmlClient.Setup(c =>
                    c.GetFromStoreNullableAsync(It.IsAny<IWitsmlObjectList>(),
                        It.IsAny<OptionsIn>(), null))
                .ReturnsAsync(sourceLogs);

            _targetWitsmlClient.Setup(c =>
                    c.GetFromStoreNullableAsync(It.IsAny<IWitsmlObjectList>(),
                        It.IsAny<OptionsIn>(), null))
                .ReturnsAsync(sourceLogs);

            SetupGetSourceWellbore();
            SetupGetTargetWellbore();

            MakeObjectListSetups(_sourceWitsmlClient, SourceWellUid, SourceWellboreUid, true);
            MakeObjectListSetups(_targetWitsmlClient, TargetWellUid, TargetWellboreUid, false);

            MockServerCapabilites(_sourceWitsmlClient);
            MockServerCapabilites(_targetWitsmlClient);

            var job = CreateJobTemplate();

            MakeLogsListSetups(_sourceWitsmlClient, job.SourceWellbore.WellUid, job.SourceWellbore.WellboreUid, true);
            MakeLogsListSetups(_targetWitsmlClient, job.TargetWellbore.WellUid, job.TargetWellbore.WellboreUid, false);



            //Act
            (WorkerResult, RefreshAction) result = await _worker.Execute(job);

            //Assert
            Assert.True(result.Item1.IsSuccess);
            var reportItems = job.JobInfo.Report.ReportItems as List<WellboreSubObjectsComparisonItem>;
            var existsOnSource = reportItems.Where(x =>
                x.ExistsOnSource.Equals("TRUE") && x.ExistsOnTarget.Equals("FALSE"));
            var existsOnTarget = reportItems.Where(x =>
                x.ExistsOnSource.Equals("FALSE") && x.ExistsOnTarget.Equals("TRUE"));
            var logsExistsOnBoth = reportItems.Where(x =>
                x.ExistsOnSource.Equals("TRUE") && x.ExistsOnTarget.Equals("TRUE"));
            var sameFluidReport =
                existsOnTarget.Where(x => x.ObjectUid.Equals("Uid_FluidsReport1"));
            var log = logsExistsOnBoth.Last();
            var differentNumberOfMnemonics =
                reportItems.Where(x => x.DataPointsOfMnemonicOnSource != null);
            var countOfIssuesInMnemonics =
                reportItems.Where(x => x.NumberOfDifferencesInValuesInMnemonics != null);
            var numberOfIssuesInMnemonics = countOfIssuesInMnemonics.First()
                .NumberOfDifferencesInValuesInMnemonics;

            Assert.Empty(sameFluidReport);
            Assert.Equal(13, existsOnSource.Count());
            Assert.Equal(13, existsOnTarget.Count());
            Assert.Equal(35, reportItems.Count());
            Assert.Equal(9, logsExistsOnBoth.Count());
            Assert.Equal(3, differentNumberOfMnemonics.Count());
            Assert.Equal(3, countOfIssuesInMnemonics.Count());
            Assert.Equal("3", numberOfIssuesInMnemonics);
            var firstCurveDiff = countOfIssuesInMnemonics.First();
            Assert.Equal("a", firstCurveDiff.Mnemonic);
            Assert.Equal("1", firstCurveDiff.IndexOrKey);
            Assert.Equal("LogCurve[a]", firstCurveDiff.PropertyPath);
            Assert.Equal("10", log.SourceStart);
            Assert.Equal("15", log.SourceEnd);
            Assert.Equal("1", log.TargetStart);
            Assert.Equal("5", log.TargetEnd);

        }

        [Fact]
        public async Task Execute_CompareDepthLogs_False_ExcludesDepthLogs()
        {
            // Arrange
            var witsmlLog = new WitsmlLog();
            WitsmlLogs sourceLogs = new() { Logs = witsmlLog.AsItemInList() };

            _sourceWitsmlClient.Setup(c =>
                    c.GetFromStoreNullableAsync(It.IsAny<IWitsmlObjectList>(),
                        It.IsAny<OptionsIn>(), null))
                .ReturnsAsync(sourceLogs);

            _targetWitsmlClient.Setup(c =>
                    c.GetFromStoreNullableAsync(It.IsAny<IWitsmlObjectList>(),
                        It.IsAny<OptionsIn>(), null))
                .ReturnsAsync(sourceLogs);

            SetupGetSourceWellbore();
            SetupGetTargetWellbore();

            MakeObjectListSetups(_sourceWitsmlClient, SourceWellUid, SourceWellboreUid, true);
            MakeObjectListSetups(_targetWitsmlClient, TargetWellUid, TargetWellboreUid, false);

            MockServerCapabilites(_sourceWitsmlClient);
            MockServerCapabilites(_targetWitsmlClient);

            var job = CreateJobTemplate() with
            {
                CompareDepthLogs = false,
                CompareTimeLogs = true
            };

            MakeLogsListSetups(_sourceWitsmlClient, job.SourceWellbore.WellUid, job.SourceWellbore.WellboreUid, true);
            MakeLogsListSetups(_targetWitsmlClient, job.TargetWellbore.WellUid, job.TargetWellbore.WellboreUid, false);

            // Act
            (WorkerResult, RefreshAction) result = await _worker.Execute(job);

            // Assert
            Assert.True(result.Item1.IsSuccess);
            var reportItems = job.JobInfo.Report.ReportItems as List<WellboreSubObjectsComparisonItem>;
            var depthLogItems = reportItems.Where(x => x.LogType == WitsmlLog.WITSML_INDEX_TYPE_MD || x.ObjectUid == $"Uid_{WitsmlLog.WITSML_INDEX_TYPE_MD}");
            Assert.Empty(depthLogItems);
        }

        [Fact]
        public async Task Execute_SpecificLogFilter_FiltersLogs()
        {
            // Arrange
            var witsmlLog = new WitsmlLog();
            WitsmlLogs sourceLogs = new() { Logs = witsmlLog.AsItemInList() };

            _sourceWitsmlClient.Setup(c =>
                    c.GetFromStoreNullableAsync(It.IsAny<IWitsmlObjectList>(),
                        It.IsAny<OptionsIn>(), null))
                .ReturnsAsync(sourceLogs);

            _targetWitsmlClient.Setup(c =>
                    c.GetFromStoreNullableAsync(It.IsAny<IWitsmlObjectList>(),
                        It.IsAny<OptionsIn>(), null))
                .ReturnsAsync(sourceLogs);

            SetupGetSourceWellbore();
            SetupGetTargetWellbore();

            MakeObjectListSetups(_sourceWitsmlClient, SourceWellUid, SourceWellboreUid, true);
            MakeObjectListSetups(_targetWitsmlClient, TargetWellUid, TargetWellboreUid, false);

            MockServerCapabilites(_sourceWitsmlClient);
            MockServerCapabilites(_targetWitsmlClient);

            var job = CreateJobTemplate() with
            {
                SpecificLogUidsOrNames = new List<string> { "NonExistentLog" }
            };

            MakeLogsListSetups(_sourceWitsmlClient, job.SourceWellbore.WellUid, job.SourceWellbore.WellboreUid, true);
            MakeLogsListSetups(_targetWitsmlClient, job.TargetWellbore.WellUid, job.TargetWellbore.WellboreUid, false);

            // Act
            (WorkerResult, RefreshAction) result = await _worker.Execute(job);

            // Assert
            Assert.True(result.Item1.IsSuccess);
            var reportItems = job.JobInfo.Report.ReportItems as List<WellboreSubObjectsComparisonItem>;
            var logItems = reportItems.Where(x => x.ObjectType == "Log" || x.LogType != null);
            Assert.Empty(logItems);
        }

        [Fact]
        public async Task Execute_SpecificMnemonicFilter_FiltersMnemonics()
        {
            // Arrange
            var witsmlLog = new WitsmlLog();
            WitsmlLogs sourceLogs = new() { Logs = witsmlLog.AsItemInList() };

            _sourceWitsmlClient.Setup(c =>
                    c.GetFromStoreNullableAsync(It.IsAny<IWitsmlObjectList>(),
                        It.IsAny<OptionsIn>(), null))
                .ReturnsAsync(sourceLogs);

            _targetWitsmlClient.Setup(c =>
                    c.GetFromStoreNullableAsync(It.IsAny<IWitsmlObjectList>(),
                        It.IsAny<OptionsIn>(), null))
                .ReturnsAsync(sourceLogs);

            SetupGetSourceWellbore();
            SetupGetTargetWellbore();

            MakeObjectListSetups(_sourceWitsmlClient, SourceWellUid, SourceWellboreUid, true);
            MakeObjectListSetups(_targetWitsmlClient, TargetWellUid, TargetWellboreUid, false);

            MockServerCapabilites(_sourceWitsmlClient);
            MockServerCapabilites(_targetWitsmlClient);

            var job = CreateJobTemplate() with
            {
                SpecificMnemonics = new List<string> { "MnemonicNonExistent" }
            };

            MakeLogsListSetups(_sourceWitsmlClient, job.SourceWellbore.WellUid, job.SourceWellbore.WellboreUid, true);
            MakeLogsListSetups(_targetWitsmlClient, job.TargetWellbore.WellUid, job.TargetWellbore.WellboreUid, false);

            // Act
            (WorkerResult, RefreshAction) result = await _worker.Execute(job);

            // Assert
            Assert.True(result.Item1.IsSuccess);
            var reportItems = job.JobInfo.Report.ReportItems as List<WellboreSubObjectsComparisonItem>;
            var mnemonicItems = reportItems.Where(x => x.Mnemonic != null);
            Assert.Empty(mnemonicItems);
        }


        [Fact]
        public async Task Execute_CountLogsData_WhenDataPointsMatch_IncludesMatchingItemsAndReportsNoMismatches()
        {
            // Arrange
            _countLogDataRowWorker
                .Setup(worker => worker.Execute(It.IsAny<CountLogDataRowJob>(), null))
                .ReturnsAsync((CountLogDataRowJob job, object _) =>
                {
                    job.JobInfo = new JobInfo
                    {
                        Report = new CountLogDataReport
                        {
                            ReportItems = new List<CountLogDataReportItem>
                            {
                                new() { Mnemonic = "M1", LogDataCount = 500 },
                                new() { Mnemonic = "M2", LogDataCount = 1000 }
                            }
                        }
                    };
                    return (new WorkerResult(null, true, null), null);
                });

            var witsmlLog = new WitsmlLog();
            WitsmlLogs sourceLogs = new() { Logs = witsmlLog.AsItemInList() };

            _sourceWitsmlClient.Setup(c =>
                    c.GetFromStoreNullableAsync(It.IsAny<IWitsmlObjectList>(),
                        It.IsAny<OptionsIn>(), null))
                .ReturnsAsync(sourceLogs);

            _targetWitsmlClient.Setup(c =>
                    c.GetFromStoreNullableAsync(It.IsAny<IWitsmlObjectList>(),
                        It.IsAny<OptionsIn>(), null))
                .ReturnsAsync(sourceLogs);

            SetupGetSourceWellbore();
            SetupGetTargetWellbore();

            MakeObjectListSetups(_sourceWitsmlClient, SourceWellUid, SourceWellboreUid, true);
            MakeObjectListSetups(_targetWitsmlClient, TargetWellUid, TargetWellboreUid, true);

            MockServerCapabilites(_sourceWitsmlClient);
            MockServerCapabilites(_targetWitsmlClient);

            var job = CreateJobTemplate() with
            {
                CountLogsData = true,
                CheckLogsData = false,
                DeepCompareObjects = false
            };

            MakeLogsListSetups(_sourceWitsmlClient, job.SourceWellbore.WellUid, job.SourceWellbore.WellboreUid, true);
            MakeLogsListSetups(_targetWitsmlClient, job.TargetWellbore.WellUid, job.TargetWellbore.WellboreUid, true);

            // Act
            (WorkerResult, RefreshAction) result = await _worker.Execute(job);

            // Assert
            Assert.True(result.Item1.IsSuccess);
            var reportItems = job.JobInfo.Report.ReportItems as List<WellboreSubObjectsComparisonItem>;
            Assert.NotNull(reportItems);
            var matchedItems = reportItems.Where(x => x.DifferenceType == "DataPointsCountMatched").ToList();
            Assert.Equal(2, matchedItems.Count);

            var m1 = matchedItems.FirstOrDefault(x => x.Mnemonic == "M1");
            Assert.NotNull(m1);
            Assert.Equal("500", m1.SourceValue);
            Assert.Equal("500", m1.TargetValue);
            Assert.Equal("500", m1.DataPointsOfMnemonicOnSource);
            Assert.Equal("500", m1.DataPointsOfMnemonicOnTarget);

            var m2 = matchedItems.FirstOrDefault(x => x.Mnemonic == "M2");
            Assert.NotNull(m2);
            Assert.Equal("1000", m2.SourceValue);
            Assert.Equal("1000", m2.TargetValue);

            Assert.Contains("All compared objects are identical", job.JobInfo.Report.Summary);
            Assert.Contains("No mismatches were found. Verified 2 mnemonic data point counts.", job.JobInfo.Report.Summary);
            Assert.DoesNotContain("Found", job.JobInfo.Report.Summary);
        }


        [Fact]
        public async Task Execute_CountLogsData_WhenDataPointsPartiallyMismatch_ReportsOnlyMismatchesAndVerifiesMatches()
        {
            // Arrange
            _countLogDataRowWorker
                .Setup(worker => worker.Execute(It.IsAny<CountLogDataRowJob>(), null))
                .ReturnsAsync((CountLogDataRowJob job, object _) =>
                {
                    bool isTarget = job.LogReference.WellboreUid == TargetWellboreUid;
                    job.JobInfo = new JobInfo
                    {
                        Report = new CountLogDataReport
                        {
                            ReportItems = new List<CountLogDataReportItem>
                            {
                                new() { Mnemonic = "M1", LogDataCount = 500 },
                                new() { Mnemonic = "M2", LogDataCount = isTarget ? 999 : 1000 }
                            }
                        }
                    };
                    return (new WorkerResult(null, true, null), null);
                });

            var witsmlLog = new WitsmlLog();
            WitsmlLogs sourceLogs = new() { Logs = witsmlLog.AsItemInList() };

            _sourceWitsmlClient.Setup(c =>
                    c.GetFromStoreNullableAsync(It.IsAny<IWitsmlObjectList>(),
                        It.IsAny<OptionsIn>(), null))
                .ReturnsAsync(sourceLogs);

            _targetWitsmlClient.Setup(c =>
                    c.GetFromStoreNullableAsync(It.IsAny<IWitsmlObjectList>(),
                        It.IsAny<OptionsIn>(), null))
                .ReturnsAsync(sourceLogs);

            SetupGetSourceWellbore();
            SetupGetTargetWellbore();

            MakeObjectListSetups(_sourceWitsmlClient, SourceWellUid, SourceWellboreUid, true);
            MakeObjectListSetups(_targetWitsmlClient, TargetWellUid, TargetWellboreUid, true);

            MockServerCapabilites(_sourceWitsmlClient);
            MockServerCapabilites(_targetWitsmlClient);

            var job = CreateJobTemplate() with
            {
                CountLogsData = true,
                CheckLogsData = false,
                DeepCompareObjects = false
            };

            MakeLogsListSetups(_sourceWitsmlClient, job.SourceWellbore.WellUid, job.SourceWellbore.WellboreUid, true);
            MakeLogsListSetups(_targetWitsmlClient, job.TargetWellbore.WellUid, job.TargetWellbore.WellboreUid, true);

            // Act
            (WorkerResult, RefreshAction) result = await _worker.Execute(job);

            // Assert
            Assert.True(result.Item1.IsSuccess);
            var reportItems = job.JobInfo.Report.ReportItems as List<WellboreSubObjectsComparisonItem>;
            Assert.NotNull(reportItems);
            var matchedItems = reportItems.Where(x => x.DifferenceType == "DataPointsCountMatched").ToList();
            var diffItems = reportItems.Where(x => x.DifferenceType == "DataPointsCountDifference").ToList();
            Assert.Single(matchedItems);
            Assert.Single(diffItems);

            Assert.Equal("M1", matchedItems[0].Mnemonic);
            Assert.Equal("500", matchedItems[0].SourceValue);
            Assert.Equal("500", matchedItems[0].TargetValue);

            Assert.Equal("M2", diffItems[0].Mnemonic);
            Assert.Equal("1000", diffItems[0].SourceValue);
            Assert.Equal("999", diffItems[0].TargetValue);

            Assert.Contains("Found 1 mismatches", job.JobInfo.Report.Summary);
            Assert.Contains("1 mnemonic data point counts verified matching", job.JobInfo.Report.Summary);
        }


        [Fact]
        public async Task Execute_CheckLogsData_PopulatesDataPointsOfMnemonicOnSourceAndTarget()
        {
            // Arrange
            _compareLogDataRowWorker
                .Setup(worker => worker.Execute(It.IsAny<CompareLogDataJob>(), null))
                .ReturnsAsync((CompareLogDataJob job, object _) =>
                {
                    job.JobInfo = new JobInfo
                    {
                        Report = new BaseReport
                        {
                            ReportItems = new List<CompareLogDataItem>
                            {
                                new()
                                {
                                    Mnemonic = "PWEA-T",
                                    Index = "1500.5",
                                    SourceValue = "10.0", // from TargetLog of job
                                    TargetValue = "10.5", // from SourceLog of job
                                    SourceDataPoints = "572", // Target points
                                    TargetDataPoints = "572"  // Source points
                                }
                            }
                        }
                    };
                    return (new WorkerResult(null, true, null), null);
                });

            var witsmlLog = new WitsmlLog();
            WitsmlLogs sourceLogs = new() { Logs = witsmlLog.AsItemInList() };

            _sourceWitsmlClient.Setup(c =>
                    c.GetFromStoreNullableAsync(It.IsAny<IWitsmlObjectList>(),
                        It.IsAny<OptionsIn>(), null))
                .ReturnsAsync(sourceLogs);

            _targetWitsmlClient.Setup(c =>
                    c.GetFromStoreNullableAsync(It.IsAny<IWitsmlObjectList>(),
                        It.IsAny<OptionsIn>(), null))
                .ReturnsAsync(sourceLogs);

            SetupGetSourceWellbore();
            SetupGetTargetWellbore();

            MakeObjectListSetups(_sourceWitsmlClient, SourceWellUid, SourceWellboreUid, true);
            MakeObjectListSetups(_targetWitsmlClient, TargetWellUid, TargetWellboreUid, true);

            MockServerCapabilites(_sourceWitsmlClient);
            MockServerCapabilites(_targetWitsmlClient);

            var job = CreateJobTemplate() with
            {
                CountLogsData = false,
                CheckLogsData = true,
                DeepCompareObjects = false
            };

            MakeLogsListSetups(_sourceWitsmlClient, job.SourceWellbore.WellUid, job.SourceWellbore.WellboreUid, true);
            MakeLogsListSetups(_targetWitsmlClient, job.TargetWellbore.WellUid, job.TargetWellbore.WellboreUid, true);

            // Act
            (WorkerResult, RefreshAction) result = await _worker.Execute(job);

            // Assert
            Assert.True(result.Item1.IsSuccess);
            var reportItems = job.JobInfo.Report.ReportItems as List<WellboreSubObjectsComparisonItem>;
            Assert.NotNull(reportItems);
            var valueDiff = reportItems.FirstOrDefault(x => x.DifferenceType == "LogDataValueDifference");
            Assert.NotNull(valueDiff);
            Assert.Equal("PWEA-T", valueDiff.Mnemonic);
            Assert.Equal("572", valueDiff.DataPointsOfMnemonicOnSource);
            Assert.Equal("572", valueDiff.DataPointsOfMnemonicOnTarget);
            Assert.Equal("1", valueDiff.NumberOfDifferencesInValuesInMnemonics);
        }

        [Fact]
        public async Task Execute_DetectsLogCurveAndHeaderUnitDifferences()
        {
            // Arrange
            var sourceLog = new WitsmlLog
            {
                Uid = "log1",
                Name = "Log 1",
                IndexType = WitsmlLog.WITSML_INDEX_TYPE_MD,
                StartIndex = new WitsmlIndex { Value = "100", Uom = "m" },
                EndIndex = new WitsmlIndex { Value = "200", Uom = "m" },
                LogCurveInfo = new List<WitsmlLogCurveInfo>
                {
                    new()
                    {
                        Uid = "GR",
                        Mnemonic = "GR",
                        Unit = "gAPI",
                        MinIndex = new WitsmlIndex { Value = "100", Uom = "m" },
                        MaxIndex = new WitsmlIndex { Value = "200", Uom = "m" }
                    },
                    new()
                    {
                        Uid = "ROP",
                        Mnemonic = "ROP",
                        Unit = "m/h",
                        MinIndex = new WitsmlIndex { Value = "100", Uom = "m" },
                        MaxIndex = new WitsmlIndex { Value = "200", Uom = "ft" }
                    }
                }
            };

            var targetLog = new WitsmlLog
            {
                Uid = "log1",
                Name = "Log 1",
                IndexType = WitsmlLog.WITSML_INDEX_TYPE_MD,
                StartIndex = new WitsmlIndex { Value = "100", Uom = "ft" },
                EndIndex = new WitsmlIndex { Value = "200", Uom = "m" },
                LogCurveInfo = new List<WitsmlLogCurveInfo>
                {
                    new()
                    {
                        Uid = "GR",
                        Mnemonic = "GR",
                        Unit = "API",
                        MinIndex = new WitsmlIndex { Value = "100", Uom = "m" },
                        MaxIndex = new WitsmlIndex { Value = "200", Uom = "m" }
                    },
                    new()
                    {
                        Uid = "ROP",
                        Mnemonic = "ROP",
                        Unit = "m/h",
                        MinIndex = new WitsmlIndex { Value = "100", Uom = "m" },
                        MaxIndex = new WitsmlIndex { Value = "200", Uom = "m" }
                    }
                }
            };

            _sourceWitsmlClient.Setup(c =>
                    c.GetFromStoreNullableAsync(It.IsAny<IWitsmlObjectList>(),
                        It.IsAny<OptionsIn>(), null))
                .ReturnsAsync(new WitsmlLogs { Logs = new() { sourceLog } });

            _targetWitsmlClient.Setup(c =>
                    c.GetFromStoreNullableAsync(It.IsAny<IWitsmlObjectList>(),
                        It.IsAny<OptionsIn>(), null))
                .ReturnsAsync(new WitsmlLogs { Logs = new() { targetLog } });

            _sourceWitsmlClient.Setup(c =>
                    c.GetFromStoreAsync(It.IsAny<WitsmlLogs>(),
                        It.IsAny<OptionsIn>(), null))
                .ReturnsAsync(new WitsmlLogs { Logs = new() { sourceLog } });

            _targetWitsmlClient.Setup(c =>
                    c.GetFromStoreAsync(It.IsAny<WitsmlLogs>(),
                        It.IsAny<OptionsIn>(), null))
                .ReturnsAsync(new WitsmlLogs { Logs = new() { targetLog } });

            SetupGetSourceWellbore();
            SetupGetTargetWellbore();
            MockServerCapabilites(_sourceWitsmlClient);
            MockServerCapabilites(_targetWitsmlClient);

            var job = CreateJobTemplate() with
            {
                CountLogsData = false,
                CheckLogsData = false,
                DeepCompareObjects = false
            };

            // Act
            (WorkerResult, RefreshAction) result = await _worker.Execute(job);

            // Assert
            Assert.True(result.Item1.IsSuccess);
            var reportItems = job.JobInfo.Report.ReportItems as List<WellboreSubObjectsComparisonItem>;
            Assert.NotNull(reportItems);

            var unitDiffs = reportItems.Where(x => x.DifferenceType == "UnitMismatch").ToList();
            Assert.Equal(3, unitDiffs.Count);

            var startUomDiff = unitDiffs.FirstOrDefault(x => x.PropertyPath == "StartIndex.Uom");
            Assert.NotNull(startUomDiff);
            Assert.Equal("m", startUomDiff.SourceValue);
            Assert.Equal("ft", startUomDiff.TargetValue);

            var curveUnitDiff = unitDiffs.FirstOrDefault(x => x.PropertyPath == "LogCurve[GR].Unit");
            Assert.NotNull(curveUnitDiff);
            Assert.Equal("gAPI", curveUnitDiff.SourceValue);
            Assert.Equal("API", curveUnitDiff.TargetValue);

            var maxIndexUomDiff = unitDiffs.FirstOrDefault(x => x.PropertyPath == "LogCurve[ROP].MaxIndex.Uom");
            Assert.NotNull(maxIndexUomDiff);
            Assert.Equal("ft", maxIndexUomDiff.SourceValue);
            Assert.Equal("m", maxIndexUomDiff.TargetValue);

            var report = job.JobInfo.Report;
            Assert.NotNull(report);
            Assert.Contains("Found 3 mismatches", report.Summary);
            Assert.Contains("Element differences: 3", report.Summary);
        }

        [Fact]
        public async Task Execute_WhenDeepCompareObjects_DetectsLogCurveMetadataDifferences()
        {
            // Arrange
            var sourceLog = new WitsmlLog
            {
                Uid = "log1",
                Name = "Log 1",
                IndexType = WitsmlLog.WITSML_INDEX_TYPE_MD,
                LogCurveInfo = new List<WitsmlLogCurveInfo>
                {
                    new()
                    {
                        Uid = "GR",
                        Mnemonic = "GR",
                        Unit = "gAPI",
                        NullValue = "-999.25",
                        CurveDescription = "Raw GR",
                        ClassWitsml = "gamma ray",
                        SensorOffset = new WitsmlLengthMeasure { Value = "10.0", Uom = "m" },
                        ExtensionNameValues = new List<WitsmlExtensionNameValue>
                        {
                            new() { Name = "Vendor", Value = new WitsmlExtensionValue { Value = "VendorA" } }
                        }
                    }
                }
            };

            var targetLog = new WitsmlLog
            {
                Uid = "log1",
                Name = "Log 1",
                IndexType = WitsmlLog.WITSML_INDEX_TYPE_MD,
                LogCurveInfo = new List<WitsmlLogCurveInfo>
                {
                    new()
                    {
                        Uid = "GR",
                        Mnemonic = "GR",
                        Unit = "gAPI",
                        NullValue = "-9999",
                        CurveDescription = "Filtered GR",
                        ClassWitsml = "gamma ray",
                        SensorOffset = new WitsmlLengthMeasure { Value = "12.5", Uom = "m" },
                        ExtensionNameValues = new List<WitsmlExtensionNameValue>
                        {
                            new() { Name = "Vendor", Value = new WitsmlExtensionValue { Value = "VendorB" } }
                        }
                    }
                }
            };

            _sourceWitsmlClient.Setup(c =>
                    c.GetFromStoreNullableAsync(It.IsAny<IWitsmlObjectList>(),
                        It.IsAny<OptionsIn>(), null))
                .ReturnsAsync(new WitsmlLogs { Logs = new() { sourceLog } });

            _targetWitsmlClient.Setup(c =>
                    c.GetFromStoreNullableAsync(It.IsAny<IWitsmlObjectList>(),
                        It.IsAny<OptionsIn>(), null))
                .ReturnsAsync(new WitsmlLogs { Logs = new() { targetLog } });

            _sourceWitsmlClient.Setup(c =>
                    c.GetFromStoreAsync(It.IsAny<WitsmlLogs>(),
                        It.IsAny<OptionsIn>(), null))
                .ReturnsAsync(new WitsmlLogs { Logs = new() { sourceLog } });

            _targetWitsmlClient.Setup(c =>
                    c.GetFromStoreAsync(It.IsAny<WitsmlLogs>(),
                        It.IsAny<OptionsIn>(), null))
                .ReturnsAsync(new WitsmlLogs { Logs = new() { targetLog } });

            SetupGetSourceWellbore();
            SetupGetTargetWellbore();
            MockServerCapabilites(_sourceWitsmlClient);
            MockServerCapabilites(_targetWitsmlClient);

            var job = CreateJobTemplate() with
            {
                CountLogsData = false,
                CheckLogsData = false,
                DeepCompareObjects = true
            };

            // Act
            (WorkerResult, RefreshAction) result = await _worker.Execute(job);

            // Assert
            Assert.True(result.Item1.IsSuccess);
            var reportItems = job.JobInfo.Report.ReportItems as List<WellboreSubObjectsComparisonItem>;
            Assert.NotNull(reportItems);

            var nullValueDiff = reportItems.FirstOrDefault(x => x.PropertyPath == "LogCurve[GR].NullValue");
            Assert.NotNull(nullValueDiff);
            Assert.Equal("-999.25", nullValueDiff.SourceValue);
            Assert.Equal("-9999", nullValueDiff.TargetValue);

            var descDiff = reportItems.FirstOrDefault(x => x.PropertyPath == "LogCurve[GR].CurveDescription");
            Assert.NotNull(descDiff);
            Assert.Equal("Raw GR", descDiff.SourceValue);
            Assert.Equal("Filtered GR", descDiff.TargetValue);

            var sensorDiff = reportItems.FirstOrDefault(x => x.PropertyPath == "LogCurve[GR].SensorOffset");
            Assert.NotNull(sensorDiff);
            Assert.Equal("MeasureMismatch", sensorDiff.DifferenceType);

            var extDiff = reportItems.FirstOrDefault(x => x.PropertyPath.Contains("Vendor"));
            Assert.NotNull(extDiff);
            Assert.Equal("VendorA", extDiff.SourceValue);
            Assert.Equal("VendorB", extDiff.TargetValue);
        }

        [Fact]
        public async Task Execute_WhenCompareWellboreMetadata_ComparesWellboreElementsWithOptionsInAll()
        {
            // Arrange
            var sourceWellbore = new WitsmlWellbore
            {
                Uid = SourceWellboreUid,
                UidWell = SourceWellUid,
                Name = "Wellbore 1",
                PurposeWellbore = "exploration",
                AchievedTD = "true",
                DTimKickoff = "2026-11-01T04:06:23.767+01:00",
                MdBit = new WitsmlMeasuredDepthCoord { Value = "1500", Uom = "m", Datum = "KB" }
            };
            var targetWellbore = new WitsmlWellbore
            {
                Uid = TargetWellboreUid,
                UidWell = TargetWellUid,
                Name = "Wellbore 1",
                PurposeWellbore = "development",
                AchievedTD = "false",
                DTimKickoff = "2026-11-01T04:06:23.000+01:00",
                MdBit = new WitsmlMeasuredDepthCoord { Value = "1500", Uom = "m", Datum = "MSL" }
            };

            WitsmlWellbores srcQuery = WellboreQueries.GetWitsmlWellboreByUid(SourceWellUid, SourceWellboreUid);
            WitsmlWellbores tgtQuery = WellboreQueries.GetWitsmlWellboreByUid(TargetWellUid, TargetWellboreUid);

            _sourceWitsmlClient.Setup(c => c.GetFromStoreAsync(IsQuery(srcQuery), It.Is<OptionsIn>(o => o.ReturnElements == ReturnElements.All), null))
                .ReturnsAsync(new WitsmlWellbores { Wellbores = new List<WitsmlWellbore> { sourceWellbore } });
            _targetWitsmlClient.Setup(c => c.GetFromStoreAsync(IsQuery(tgtQuery), It.Is<OptionsIn>(o => o.ReturnElements == ReturnElements.All), null))
                .ReturnsAsync(new WitsmlWellbores { Wellbores = new List<WitsmlWellbore> { targetWellbore } });

            MakeObjectListSetups(_sourceWitsmlClient, SourceWellUid, SourceWellboreUid, true);
            MakeObjectListSetups(_targetWitsmlClient, TargetWellUid, TargetWellboreUid, false);
            MockServerCapabilites(_sourceWitsmlClient);
            MockServerCapabilites(_targetWitsmlClient);

            var job = CreateJobTemplate() with
            {
                CompareWellboreMetadata = true,
                CompareAllObjects = false,
                ObjectTypesToCompare = new List<EntityType>(),
                DeepCompareObjects = true,
                MatchByNameIfUidDiffers = true,
                TimezoneMode = TimezoneComparisonMode.Utc,
                CountLogsData = false,
                CheckLogsData = false
            };

            // Act
            (WorkerResult, RefreshAction) result = await _worker.Execute(job);

            // Assert
            Assert.True(result.Item1.IsSuccess);
            var reportItems = job.JobInfo.Report.ReportItems as List<WellboreSubObjectsComparisonItem>;
            Assert.NotNull(reportItems);
            Assert.All(reportItems, x => Assert.Equal("Wellbore", x.ObjectType));
            Assert.Contains("Compared: Wellbore metadata.", job.JobInfo.Report.Summary);
            Assert.Contains(reportItems, x => x.ObjectType == "Wellbore" && x.PropertyPath == "Wellbore.PurposeWellbore" && x.SourceValue == "exploration" && x.TargetValue == "development");
            Assert.Contains(reportItems, x => x.ObjectType == "Wellbore" && x.PropertyPath == "Wellbore.AchievedTD" && x.SourceValue == "true" && x.TargetValue == "false");
            Assert.Contains(reportItems, x => x.ObjectType == "Wellbore" && x.PropertyPath == "Wellbore.DTimKickoff" && x.SourceValue == "2026-11-01T03:06:23.767Z" && x.TargetValue == "2026-11-01T03:06:23.000Z");
            Assert.Contains(reportItems, x => x.ObjectType == "Wellbore" && x.PropertyPath == "Wellbore.MdBit.Datum" && x.SourceValue == "KB" && x.TargetValue == "MSL");
        }

        private void MockWorkers()
        {
            _countLogDataRowWorker
                .Setup(worker => worker.Execute(It.IsAny<CountLogDataRowJob>(), null))
                .ReturnsAsync((CountLogDataRowJob job, object _) =>
                {
                    if (job.LogReference.WellboreUid == "targetWellboreUid")
                    {
                        job.JobInfo = new JobInfo
                        {
                            Report = new CountLogDataReport()
                            {
                                ReportItems = new List<CountLogDataReportItem>()
                                {
                                    new ()
                                    {
                                        Mnemonic = "a",
                                        LogDataCount = 1
                                    },
                                    new ()
                                    {
                                        Mnemonic = "b",
                                        LogDataCount = 2
                                    },
                                    new ()
                                    {
                                        Mnemonic = "c",
                                        LogDataCount = 3
                                    }
                                }
                            }
                        };
                    }
                    else
                    {
                        job.JobInfo = new JobInfo
                        {
                            Report = new CountLogDataReport()
                            {
                                ReportItems = new List<CountLogDataReportItem>()
                                {
                                    new ()
                                    {
                                        Mnemonic = "a",
                                        LogDataCount = 11
                                    },
                                    new ()
                                    {
                                        Mnemonic = "b",
                                        LogDataCount = 12
                                    },
                                    new ()
                                    {
                                        Mnemonic = "c",
                                        LogDataCount = 13
                                    }
                                }
                            }
                        };
                    }

                    return (new WorkerResult(null, true, null), null);

                });


            ;

            _compareLogDataRowWorker
                .Setup(worker => worker.Execute(It.IsAny<CompareLogDataJob>(), null))
                .ReturnsAsync((CompareLogDataJob job, object _) =>
                {
                    var reportItems = new List<CompareLogDataItem>()
                    {
                        new ()
                        {
                            Mnemonic = "a",
                            Index = "1",
                            SourceValue = "",
                            TargetValue = ""
                        },
                        new ()
                        {
                            Mnemonic = "b",
                            Index = "3",
                            SourceValue = "",
                            TargetValue = ""
                        },
                        new ()
                        {
                            Mnemonic = "c",
                            Index = "4",
                            SourceValue = "",
                            TargetValue = ""
                        }
                    };
                    if (job.Mnemonics != null && job.Mnemonics.Any())
                    {
                        reportItems = reportItems.Where(x => job.Mnemonics.Any(m => string.Equals(m, x.Mnemonic, StringComparison.OrdinalIgnoreCase))).ToList();
                    }
                    job.JobInfo = new JobInfo
                    {
                        Report = new BaseReport()
                        {
                            ReportItems = reportItems
                        }
                    };

                    return (new WorkerResult(null, true, null), null);
                });
            Mock<IObjectService> objectServiceMock = new();
            objectServiceMock.Setup(os => os.GetAllObjectsOnWellbore(It.IsAny<string>(), It.IsAny<string>())).ReturnsAsync(new List<SelectableObjectOnWellbore>());
            Mock<IDocumentRepository<Server, Guid>> documentRepository = new();
            documentRepository.Setup(client => client.GetDocumentsAsync())
                .ReturnsAsync(new List<Server>(){
                    new(){
                        Url = _targetUri,
                        DepthLogDecimals = 1
                    },
                    new(){
                        Url = _sourceUri,
                        DepthLogDecimals = 2
                    }
                }.AsCollection());



            _worker = new WellboreSubObjectsComparisonWorker(NullLogger<WellboreSubObjectsComparisonJob>.Instance,
                _witsmlClientProvider.Object,
                _countLogDataRowWorker.Object,
                _compareLogDataRowWorker.Object,
                documentRepository.Object);
        }

        /// <summary>
        /// Method to create a list of mock objects for the given wellboreUid.
        /// </summary>
        /// <param name="client"></param>
        /// <param name="wellUid"></param>
        /// <param name="wellboreUid"></param>
        /// <param name="isSource"></param>
        /// <param name="cancellationToken"></param>
        private static void MakeObjectListSetups(Mock<IWitsmlClient> client, string wellUid, string wellboreUid, bool isSource, CancellationToken? cancellationToken = null)
        {
            foreach (EntityType entityType in Enum.GetValues(typeof(EntityType)))
            {
                IWitsmlObjectList objectList = entityType
                switch
                {
                    EntityType.Attachment => new WitsmlAttachments(),
                    EntityType.DataWorkOrder => new WitsmlDataWorkOrders(),
                    EntityType.BhaRun => isSource ? GetBhaRuns(wellboreUid) : GetBhaRunsTarget(wellboreUid),
                    EntityType.FluidsReport => isSource ? GetFluidsReports(wellboreUid) : GetFluidsReportsTarget(wellboreUid),
                    EntityType.FormationMarker => new WitsmlFormationMarkers(),
                    EntityType.Message => new WitsmlMessages(),
                    EntityType.MudLog => new WitsmlMudLogs(),
                    EntityType.Rig => isSource ? GetRigs(wellboreUid) : GetRigsTarget(wellboreUid),
                    EntityType.Risk => new WitsmlRisks(),
                    EntityType.Tubular => new WitsmlTubulars(),
                    EntityType.Trajectory => new WitsmlTrajectories(),
                    EntityType.WbGeometry => new WitsmlWbGeometrys(),
                    _ => null
                };

                if (objectList == null)
                {
                    continue;
                }

                IWitsmlObjectList nonLogsObjectsQuery = ObjectQueries.GetWitsmlObjectById(wellUid, wellboreUid, "", entityType);
                client.Setup(c => c.GetFromStoreNullableAsync(IsQuery(nonLogsObjectsQuery), It.IsAny<OptionsIn>(), cancellationToken))
                                   .ReturnsAsync((IWitsmlObjectList _, OptionsIn _, CancellationToken? _) => objectList);
            }
        }

        private static void MakeLogsListSetups(
            Mock<IWitsmlClient> client, string wellUid,
            string wellboreUid, bool isSource)
        {
            WitsmlLogs logQuery = LogQueries.GetWitsmlLogsByWellbore(wellUid, wellboreUid);

            var logMockObjects =
                GetMockLogObjects(wellboreUid, wellUid, WitsmlLog.WITSML_INDEX_TYPE_MD, isSource);
            client.Setup(c => c.GetFromStoreAsync(IsQuery(logQuery),
                    It.IsAny<OptionsIn>(), null))
                .ReturnsAsync((IWitsmlObjectList _, OptionsIn _,
                    CancellationToken? _) => logMockObjects);
        }

        private void MockServerCapabilites(Mock<IWitsmlClient> witsmlClient)
        {
            var serverCapabalities = new WitsmlCapServers()
            {
                ServerCapabilities = new List<WitsmlServerCapabilities>()
                {
                    new WitsmlServerCapabilities()
                    {
                        Functions = new List<WitsmlFunction>()
                        {
                            new WitsmlFunction()
                            {
                                DataObjects = GetDataObjects(),
                                Name = "WMLS_GetFromStore"
                            }
                        }
                    }
                }

            };
            witsmlClient.Setup(client => client.GetCap()).ReturnsAsync(serverCapabalities);
        }

        private List<WitsmlFunctionDataObject> GetDataObjects()
        {
            var result = new List<WitsmlFunctionDataObject>();
            foreach (EntityType entityType in Enum.GetValues(typeof(EntityType)))
            {
                if (entityType is EntityType.Well or EntityType.Wellbore or EntityType.Log) continue;
                var dataObject = new WitsmlFunctionDataObject()
                {
                    MaxDataNodes = 10000,
                    MaxDataPoints = 8000000,
                    Name = entityType.ToString()
                };
                result.Add(dataObject);
            }
            return result;
        }
        private void SetupGetSourceWellbore()
        {
            WitsmlWellbores sourceWellbores = new();
            sourceWellbores.Wellbores = new List<WitsmlWellbore>()
            {
                new WitsmlWellbore()
                {
                    Name = "sourceWellboreName", Uid = SourceWellboreUid
                }
            };

            WitsmlWellbores query = WellboreQueries.GetWitsmlWellboreByUid(SourceWellUid, SourceWellboreUid);

            _sourceWitsmlClient.Setup(c => c.GetFromStoreAsync(IsQuery(query), It.IsAny<OptionsIn>(), null))
                .ReturnsAsync((WitsmlWellbores _, OptionsIn _, CancellationToken? _) => sourceWellbores);
        }

        private void SetupGetTargetWellbore()
        {
            WitsmlWellbores targetWellbores = new();
            targetWellbores.Wellbores = new List<WitsmlWellbore>()
            {
                new WitsmlWellbore()
                {
                    Uid = TargetWellboreUid, UidWell = TargetWellUid
                }
            };

            WitsmlWellbores query = WellboreQueries.GetWitsmlWellboreByUid(TargetWellUid, TargetWellboreUid);

            _targetWitsmlClient.Setup(c => c.GetFromStoreAsync(IsQuery(query), It.IsAny<OptionsIn>(), null))
                .ReturnsAsync((WitsmlWellbores _, OptionsIn _, CancellationToken? _) => targetWellbores);
        }


        private static WitsmlLogs GetMockLogObjects(string wellboreUid, string wellUid, string logIndexType, bool isSource)
        {
            List<WitsmlLog> logList = null;
            WitsmlIndex witsmlStartIndex = isSource ? new(new DepthIndex(DepthSourceStart)) : new(new DepthIndex(DepthTargetStart));
            WitsmlIndex witsmlEndIndex = isSource ? new(new DepthIndex(DepthSourceEnd)) : new(new DepthIndex(DepthTargetEnd));
            if (logIndexType.Equals(WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME))
            {
                logList = new List<WitsmlLog>();
                for (int i = 0; i < 5; i++)
                {
                    logList.Add(new WitsmlLog
                    {
                        Uid = $"Uid_{WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME}_{i}",
                        Name = $"LogIndexType{WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME}_{i}",
                        UidWell = wellUid,
                        NameWell = wellUid,
                        UidWellbore = wellboreUid,
                        NameWellbore = wellboreUid,
                        IndexType = logIndexType,
                        LogCurveInfo = LogUtils.SourceMnemonics[WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME].Select(mnemonic => new WitsmlLogCurveInfo
                        {
                            Uid = mnemonic,
                            Mnemonic = mnemonic,
                            MinIndex = witsmlStartIndex,
                            MaxIndex = witsmlEndIndex
                        }).ToList()
                    });
                }
            }

            if (logIndexType.Equals(WitsmlLog.WITSML_INDEX_TYPE_MD))
            {
                logList =
                [
                    new()
                    {
                        Uid = $"Uid_{WitsmlLog.WITSML_INDEX_TYPE_MD}",
                        Name = $"LogIndexType{WitsmlLog.WITSML_INDEX_TYPE_MD}",
                        UidWell = SourceWellUid,
                        NameWell = SourceWellUid,
                        UidWellbore = wellboreUid,
                        NameWellbore = wellboreUid,
                        IndexType = logIndexType,
                        LogCurveInfo = LogUtils.SourceMnemonics[WitsmlLog.WITSML_INDEX_TYPE_MD].Select(mnemonic => new WitsmlLogCurveInfo
                        {
                            Uid = mnemonic,
                            Mnemonic = mnemonic,
                            MinIndex = witsmlStartIndex,
                            MaxIndex = witsmlEndIndex
                        }).ToList()
                    }
                ];
            }

            return new WitsmlLogs()
            {
                Logs = logList
            };
        }

        private static IWitsmlObjectList GetRigs(string wellboreUid)
        {
            WitsmlRigs rigs = new();
            rigs.Rigs.Add(new WitsmlRig
            {
                Uid = "Uid_Rig1",
                Name = "Rig1",
                UidWell = SourceWellUid,
                NameWell = SourceWellUid,
                UidWellbore = wellboreUid,
                NameWellbore = wellboreUid,
            });
            rigs.Rigs.Add(new WitsmlRig
            {
                Uid = "Uid_Rig2",
                Name = "Rig2",
                UidWell = SourceWellUid,
                NameWell = SourceWellUid,
                UidWellbore = wellboreUid,
                NameWellbore = wellboreUid,
            });
            return rigs;
        }

        private static IWitsmlObjectList GetRigsTarget(string wellboreUid)
        {
            WitsmlRigs rigs = new();
            rigs.Rigs.Add(new WitsmlRig
            {
                Uid = "Uid_Rig1_Target",
                Name = "Rig1_Target",
                UidWell = SourceWellUid,
                NameWell = SourceWellUid,
                UidWellbore = wellboreUid,
                NameWellbore = wellboreUid,
            });
            rigs.Rigs.Add(new WitsmlRig
            {
                Uid = "Uid_Rig2_Target",
                Name = "Rig2_Target",
                UidWell = SourceWellUid,
                NameWell = SourceWellUid,
                UidWellbore = wellboreUid,
                NameWellbore = wellboreUid,
            });
            return rigs;
        }

        private static IWitsmlObjectList GetBhaRuns(string wellboreUid)
        {
            WitsmlBhaRuns runs = new();
            for (int i = 0; i < 10; i++)
            {
                runs.BhaRuns.Add(new WitsmlBhaRun
                {
                    Uid = $"Uid_BhaRun_{i}",
                    Name = $"BhaRun_{i}",
                    UidWell = SourceWellUid,
                    NameWell = SourceWellUid,
                    UidWellbore = wellboreUid,
                    NameWellbore = wellboreUid
                });
            }
            return runs;
        }

        private static IWitsmlObjectList GetBhaRunsTarget(string wellboreUid)
        {
            WitsmlBhaRuns runs = new();
            for (int i = 0; i < 10; i++)
            {
                runs.BhaRuns.Add(new WitsmlBhaRun
                {
                    Uid = $"Uid_BhaRun_Target_{i}",
                    Name = $"BhaRun_Target_{i}",
                    UidWell = TargetWellUid,
                    NameWell = TargetWellUid,
                    UidWellbore = wellboreUid,
                    NameWellbore = wellboreUid
                });
            }
            return runs;
        }

        private static IWitsmlObjectList GetFluidsReports(string wellboreUid)
        {
            return new WitsmlFluidsReports()
            {
                FluidsReports =
                [
                    new()
                    {
                        Uid = "Uid_FluidsReport1",
                        Name = "FluidsReport1",
                        UidWell = SourceWellUid,
                        NameWell = SourceWellUid,
                        UidWellbore = wellboreUid,
                        NameWellbore = wellboreUid,
                    },

                    new()
                    {
                        Uid = "Uid_FluidsReport2",
                        Name = "FluidsReport2",
                        UidWell = SourceWellUid,
                        NameWell = SourceWellUid,
                        UidWellbore = wellboreUid,
                        NameWellbore = wellboreUid,
                    }

                ]
            };
        }

        private static IWitsmlObjectList GetFluidsReportsTarget(string wellboreUid)
        {
            return new WitsmlFluidsReports()
            {
                FluidsReports =
                [
                    new()
                    {
                        Uid = "Uid_FluidsReport1",
                        Name = "FluidsReport1",
                        UidWell = TargetWellUid,
                        NameWell = TargetWellUid,
                        UidWellbore = wellboreUid,
                        NameWellbore = wellboreUid,
                    },

                    new()
                    {
                        Uid = "Uid_FluidsReport2_Target",
                        Name = "FluidsReport2_Target",
                        UidWell = TargetWellUid,
                        NameWell = TargetWellUid,
                        UidWellbore = wellboreUid,
                        NameWellbore = wellboreUid,
                    }

                ]
            };
        }

        private static T IsQuery<T>(T query)
            where T : IWitsmlQueryType
        {
            return It.Is<T>(q => XmlHelper.Serialize(q, false) == XmlHelper.Serialize(query, false));
        }

        private static WellboreSubObjectsComparisonJob CreateJobTemplate()
        {
            WellboreReference targetWellboreRef = new() { WellUid = TargetWellUid, WellboreUid = TargetWellboreUid };
            WellboreReference sourceWellboreRef = new() { WellUid = SourceWellUid, WellboreUid = SourceWellboreUid };

            return new WellboreSubObjectsComparisonJob
            {
                SourceWellbore = sourceWellboreRef,
                TargetWellbore = targetWellboreRef,
                JobInfo = new JobInfo()
                {
                    Id = "1"
                },
                CountLogsData = true,
                CheckLogsData = true,
                CheckTimeBasedLogsData = true,
                CheckDepthBasedLogsData = true
            };
        }
    }
}
