using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Threading.Tasks;
using Moq;
using Witsml;
using Witsml.Data;
using Witsml.Data.Curves;
using Witsml.Extensions;
using Witsml.ServiceReference;
using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;
using Xunit;

namespace WitsmlExplorer.Api.Tests.Workers
{
    [SuppressMessage("ReSharper", "InconsistentNaming")]
    public class CopyLogDataWorkerTests
    {
        private readonly CopyLogDataWorker worker;
        private readonly Mock<IWitsmlClient> witsmlClient;
        private const string WellUid = "wellUid";
        private const string WellboreUid = "wellboreUid";
        private const string SourceLogUid = "sourceLogUid";
        private const string TargetLogUid = "targetLogUid";

        private static readonly Dictionary<string, string[]> SourceMnemonics = new Dictionary<string, string[]>
        {
            {WitsmlLog.WITSML_INDEX_TYPE_MD, new[] {"Depth", "DepthBit", "DepthHole"}},
            {WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME, new[] {"Time", "DepthBit", "DepthHole"}}
        };

        private const string TimeStart = "2019-11-01T21:01:00.000Z";
        private const string TimeEnd = "2019-11-01T21:05:00.000Z";

        private const double DepthStart = 1;
        private const double DepthEnd = 5;

        public CopyLogDataWorkerTests()
        {
            var witsmlClientProvider = new Mock<IWitsmlClientProvider>();
            witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(witsmlClient.Object);
            worker = new CopyLogDataWorker(witsmlClientProvider.Object);
        }

        [Fact]
        public async Task CopyLogData_TimeIndexed()
        {
            var job = CreateJobTemplate();

            SetupSourceLog(WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME);
            SetupTargetLog(WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME);
            var updatedLogs = SetupUpdateInStoreAsync();
            WitsmlLogs query = null;
            witsmlClient.Setup(client => client.GetFromStoreAsync(It.IsAny<WitsmlLogs>(), new OptionsIn(ReturnElements.DataOnly, null)))
                .Callback<WitsmlLogs, OptionsIn>((logs, _) => query = logs)
                .ReturnsAsync(() => GetSourceLogData(query.Logs.First().StartDateTimeIndex, query.Logs.First().EndDateTimeIndex));

            await worker.Execute(job);

            Assert.Equal(string.Join(",", SourceMnemonics[WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME]), updatedLogs.First().Logs.First().LogData.MnemonicList);
            Assert.Equal(5, updatedLogs.First().Logs.First().LogData.Data.Count);
        }

        [Fact]
        public async Task CopyLogData_DepthIndexed()
        {
            var job = CreateJobTemplate();

            SetupSourceLog(WitsmlLog.WITSML_INDEX_TYPE_MD);
            SetupTargetLog(WitsmlLog.WITSML_INDEX_TYPE_MD);
            SetupGetDepthIndexed();
            var updatedLogs = SetupUpdateInStoreAsync();

            await worker.Execute(job);

            Assert.Equal(string.Join(",", SourceMnemonics[WitsmlLog.WITSML_INDEX_TYPE_MD]), updatedLogs.First().Logs.First().LogData.MnemonicList);
            Assert.Equal(5, updatedLogs.First().Logs.First().LogData.Data.Count);
        }

        [Fact]
        public async Task CopyLogData_DepthIndexed_SelectedMnemonics()
        {
            var job = CreateJobTemplate();
            job.SourceLogCurvesReference.Mnemonics = new[] { "Depth", "DepthBit" };

            SetupSourceLog(WitsmlLog.WITSML_INDEX_TYPE_MD);
            SetupTargetLog(WitsmlLog.WITSML_INDEX_TYPE_MD);
            WitsmlLogs query = null;
            witsmlClient.Setup(client => client.GetFromStoreAsync(It.IsAny<WitsmlLogs>(), new OptionsIn(ReturnElements.DataOnly, null)))
                .Callback<WitsmlLogs, OptionsIn>((logs, _) => query = logs)
                .ReturnsAsync(() =>
                {
                    var startIndex = double.Parse(query.Logs.First().StartIndex.Value);
                    var endIndex = double.Parse(query.Logs.First().EndIndex.Value);
                    return GetSourceLogData(startIndex, endIndex, job.SourceLogCurvesReference.Mnemonics);
                });
            var updatedLogs = SetupUpdateInStoreAsync();

            await worker.Execute(job);

            Assert.NotNull(query);
            var queriedMnemonics = query.Logs.First().LogData.MnemonicList.Split(",");
            var copiedMnemonics = updatedLogs.First().Logs.First().LogData.MnemonicList.Split(",");
            Assert.Equal(job.SourceLogCurvesReference.Mnemonics, queriedMnemonics);
            Assert.Equal(job.SourceLogCurvesReference.Mnemonics, copiedMnemonics);
        }

        [Fact]
        public async Task CopyLogData_DepthIndexed_AddsIndexMnemonicIfNotIncludedInJob()
        {
            var indexMnemonic = "Depth";
            var job = CreateJobTemplate();
            job.SourceLogCurvesReference.Mnemonics = new[] { "DepthBit" };

            SetupSourceLog(WitsmlLog.WITSML_INDEX_TYPE_MD);
            SetupTargetLog(WitsmlLog.WITSML_INDEX_TYPE_MD);

            WitsmlLogs query = null;
            witsmlClient.Setup(client => client.GetFromStoreAsync(It.IsAny<WitsmlLogs>(), new OptionsIn(ReturnElements.DataOnly, null)))
                .Callback<WitsmlLogs, OptionsIn>((logs, _) => query = logs)
                .ReturnsAsync(() =>
                {
                    var startIndex = double.Parse(query.Logs.First().StartIndex.Value);
                    var endIndex = double.Parse(query.Logs.First().EndIndex.Value);
                    return GetSourceLogData(startIndex, endIndex);
                });
            var updatedLogs = SetupUpdateInStoreAsync();

            await worker.Execute(job);

            Assert.NotNull(query);
            var queriedMnemonics = query.Logs.First().LogData.MnemonicList.Split(",");
            var copiedMnemonics = updatedLogs.First().Logs.First().LogData.MnemonicList.Split(",");
            Assert.Contains(indexMnemonic, queriedMnemonics);
            Assert.Contains(indexMnemonic, copiedMnemonics);
        }

        [Fact]
        public async Task CopyLogData_Returns_Error_IfMismatchedIndexTypes()
        {
            var job = CreateJobTemplate();

            SetupSourceLog(WitsmlLog.WITSML_INDEX_TYPE_MD);
            SetupTargetLog(WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME);

            var (result, _) = await worker.Execute(job);
            Assert.False(result.IsSuccess);
            Assert.Equal("sourceLog and targetLog has mismatching index types", result.Reason);
        }

        [Fact]
        public async Task CopyLogData_DepthIndexed_AllowIndexCurveNamesThatOnlyDifferInCasing()
        {
            var sourceIndexCurve = "DEPTH";
            var targetIndexCurve = "Depth";
            var mnemonics = new[] { sourceIndexCurve, "DepthBit", "DepthHole" };
            var job = CreateJobTemplate();
            job.SourceLogCurvesReference.Mnemonics = mnemonics;
            var sourceLogs = GetSourceLogs(WitsmlLog.WITSML_INDEX_TYPE_MD, DepthStart, DepthEnd, sourceIndexCurve);
            SetupSourceLog(WitsmlLog.WITSML_INDEX_TYPE_MD, sourceLogs);
            SetupTargetLog(WitsmlLog.WITSML_INDEX_TYPE_MD);

            WitsmlLogs query = null;
            witsmlClient.Setup(client => client.GetFromStoreAsync(It.IsAny<WitsmlLogs>(), new OptionsIn(ReturnElements.DataOnly, null)))
                .Callback<WitsmlLogs, OptionsIn>((logs, _) => query = logs)
                .ReturnsAsync(() =>
                {
                    var startIndex = double.Parse(query.Logs.First().StartIndex.Value);
                    var endIndex = double.Parse(query.Logs.First().EndIndex.Value);
                    return GetSourceLogData(startIndex, endIndex, job.SourceLogCurvesReference.Mnemonics);
                });
            var updatedLogs = SetupUpdateInStoreAsync();

            var (result, _) = await worker.Execute(job);
            Assert.True(result.IsSuccess);
            Assert.Equal(3, updatedLogs.First().Logs.First().LogCurveInfo.Count);
            Assert.Equal(targetIndexCurve, updatedLogs.First().Logs.First().LogCurveInfo.First().Mnemonic);
        }

        [Fact]
        public async Task CopyLogData_DepthIndexed_ShouldUseTargetLogUidIfSourceHasDifferent()
        {
            var job = CreateJobTemplate();
            job.SourceLogCurvesReference.Mnemonics = new[] { "Depth", "DepthBit" };

            var sourceLogs = GetSourceLogs(WitsmlLog.WITSML_INDEX_TYPE_MD, DepthStart, DepthEnd - 1);
            var targetLogs = GetSourceLogs(WitsmlLog.WITSML_INDEX_TYPE_MD, DepthEnd, DepthEnd + 2);
            targetLogs.Logs[0].LogCurveInfo[1].Uid = "SomethingElse";

            SetupSourceLog(WitsmlLog.WITSML_INDEX_TYPE_MD, sourceLogs);
            SetupTargetLog(WitsmlLog.WITSML_INDEX_TYPE_MD, targetLogs);
            SetupGetDepthIndexed();

            var expectedQuery = GetSourceLogs(WitsmlLog.WITSML_INDEX_TYPE_MD, DepthStart, DepthEnd - 1);
            expectedQuery.Logs[0].LogData = GetSourceLogData(double.Parse(expectedQuery.Logs[0].StartIndex.Value),
                double.Parse(expectedQuery.Logs[0].EndIndex.Value), job.SourceLogCurvesReference.Mnemonics).Logs[0].LogData;

            WitsmlLogs actual = null;
            witsmlClient.Setup(client =>
                    client.UpdateInStoreAsync(It.IsAny<WitsmlLogs>()))
                .Callback<WitsmlLogs>(witsmlLogs => actual = witsmlLogs)
                .ReturnsAsync(new QueryResult(true));

            await worker.Execute(job);

            Assert.NotNull(actual);
            Assert.Equal("SomethingElse", actual.Logs[0].LogCurveInfo[1].Uid);
        }

        private void SetupSourceLog(string indexType, WitsmlLogs sourceLogs = null)
        {
            switch (indexType)
            {
                case WitsmlLog.WITSML_INDEX_TYPE_MD:
                    witsmlClient.Setup(client =>
                            client.GetFromStoreAsync(It.Is<WitsmlLogs>(witsmlLogs => witsmlLogs.Logs.First().Uid == SourceLogUid), new OptionsIn(ReturnElements.HeaderOnly, null)))
                        .ReturnsAsync(sourceLogs ?? GetSourceLogs(WitsmlLog.WITSML_INDEX_TYPE_MD, DepthStart, DepthEnd));
                    break;
                case WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME:
                    witsmlClient.Setup(client =>
                            client.GetFromStoreAsync(It.Is<WitsmlLogs>(witsmlLogs => witsmlLogs.Logs.First().Uid == SourceLogUid), new OptionsIn(ReturnElements.HeaderOnly, null)))
                        .ReturnsAsync(sourceLogs ?? GetSourceLogs(WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME, TimeStart, TimeEnd));
                    break;
            }
        }

        private void SetupTargetLog(string indexType, WitsmlLogs targetLogs = null)
        {
            switch (indexType)
            {
                case WitsmlLog.WITSML_INDEX_TYPE_MD:
                    witsmlClient.Setup(client =>
                            client.GetFromStoreAsync(It.Is<WitsmlLogs>(witsmlLogs => witsmlLogs.Logs.First().Uid == TargetLogUid), new OptionsIn(ReturnElements.HeaderOnly, null)))
                        .ReturnsAsync(targetLogs ?? GetTargetLogs(WitsmlLog.WITSML_INDEX_TYPE_MD));
                    break;
                case WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME:
                    witsmlClient.Setup(client =>
                            client.GetFromStoreAsync(It.Is<WitsmlLogs>(witsmlLogs => witsmlLogs.Logs.First().Uid == TargetLogUid), new OptionsIn(ReturnElements.HeaderOnly, null)))
                        .ReturnsAsync(targetLogs ?? GetTargetLogs(WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME));
                    break;
            }
        }

        private List<WitsmlLogs> SetupUpdateInStoreAsync()
        {
            var updatedLogs = new List<WitsmlLogs>();
            witsmlClient.Setup(client =>
                    client.UpdateInStoreAsync(It.IsAny<WitsmlLogs>())).Callback<WitsmlLogs>(witsmlLogs => updatedLogs.Add(witsmlLogs))
                .ReturnsAsync(new QueryResult(true));
            return updatedLogs;
        }

        private void SetupGetDepthIndexed(WitsmlLogs query = null)
        {
            witsmlClient.Setup(client => client.GetFromStoreAsync(It.IsAny<WitsmlLogs>(), new OptionsIn(ReturnElements.DataOnly, null)))
                .Callback<WitsmlLogs, OptionsIn>((logs, _) => query = logs)
                .ReturnsAsync(() =>
                {
                    var startIndex = double.Parse(query!.Logs.First().StartIndex.Value);
                    var endIndex = double.Parse(query.Logs.First().EndIndex.Value);
                    return GetSourceLogData(startIndex, endIndex);

                });
        }

        private CopyLogDataJob CreateJobTemplate()
        {
            return new CopyLogDataJob
            {
                SourceLogCurvesReference = new LogCurvesReference
                {
                    LogReference = new LogReference
                    {
                        WellUid = WellUid,
                        WellboreUid = WellboreUid,
                        LogUid = SourceLogUid
                    }
                },
                TargetLogReference = new LogReference
                {
                    WellUid = WellUid,
                    WellboreUid = WellboreUid,
                    LogUid = TargetLogUid
                }
            };
        }

        private WitsmlLogs GetSourceLogs(string indexType, string startDateTimeIndex, string endDateTimeIndex)
        {
            var witsmlLog = new WitsmlLog
            {
                UidWell = WellUid,
                UidWellbore = WellboreUid,
                Uid = SourceLogUid,
                IndexType = indexType,
                IndexCurve = new WitsmlIndexCurve { Value = SourceMnemonics[indexType][0] },
                StartDateTimeIndex = startDateTimeIndex,
                EndDateTimeIndex = endDateTimeIndex,
                LogCurveInfo = SourceMnemonics[WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME].Select(mnemonic => new WitsmlLogCurveInfo
                {
                    Uid = mnemonic,
                    Mnemonic = mnemonic,
                    MinDateTimeIndex = startDateTimeIndex,
                    MaxDateTimeIndex = endDateTimeIndex
                }).ToList()
            };

            return new WitsmlLogs
            {
                Logs = new List<WitsmlLog> { witsmlLog }
            };
        }

        private WitsmlLogs GetSourceLogs(string indexType, double startIndex, double endIndex, string indexCurveValue = null)
        {
            var minIndex = new WitsmlIndex(new DepthIndex(startIndex));
            var maxIndex = new WitsmlIndex(new DepthIndex(endIndex));
            var witsmlLog = new WitsmlLog
            {
                UidWell = WellUid,
                UidWellbore = WellboreUid,
                Uid = SourceLogUid,
                IndexType = indexType,
                IndexCurve = new WitsmlIndexCurve { Value = indexCurveValue ?? SourceMnemonics[indexType][0] },
                StartIndex = minIndex,
                EndIndex = maxIndex,
                LogCurveInfo = SourceMnemonics[WitsmlLog.WITSML_INDEX_TYPE_MD].Select(mnemonic => new WitsmlLogCurveInfo
                {
                    Uid = mnemonic,
                    Mnemonic = mnemonic.Equals(indexCurveValue, StringComparison.OrdinalIgnoreCase) ? indexCurveValue : mnemonic,
                    MinIndex = minIndex,
                    MaxIndex = maxIndex
                }).ToList()
            };

            return new WitsmlLogs
            {
                Logs = new List<WitsmlLog> { witsmlLog }
            };
        }

        private WitsmlLogs GetTargetLogs(string indexType)
        {
            var indexLogCurveInfo = indexType switch
            {
                WitsmlLog.WITSML_INDEX_TYPE_MD => new WitsmlLogCurveInfo
                {
                    Uid = "Depth",
                    Mnemonic = "Depth",
                    MinIndex = new WitsmlIndex(new DepthIndex(-999.25)),
                    MaxIndex = new WitsmlIndex(new DepthIndex(-999.25))
                },
                WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME => new WitsmlLogCurveInfo
                {
                    Uid = "Time",
                    Mnemonic = "Time",
                    MinDateTimeIndex = "1900-01-01T00:00:00.000Z",
                    MaxDateTimeIndex = "1900-01-01T00:00:00.000Z"
                },
                _ => null
            };

            var witsmlLog = new WitsmlLog
            {
                UidWell = WellUid,
                UidWellbore = WellboreUid,
                Uid = TargetLogUid,
                IndexType = indexType,
                IndexCurve = new WitsmlIndexCurve { Value = SourceMnemonics[indexType][0] },
                LogCurveInfo = new List<WitsmlLogCurveInfo> { indexLogCurveInfo }
            };
            switch (indexType)
            {
                case WitsmlLog.WITSML_INDEX_TYPE_MD:
                    witsmlLog.StartIndex = new WitsmlIndex(new DepthIndex(DepthIndex.NullValue));
                    witsmlLog.EndIndex = new WitsmlIndex(new DepthIndex(DepthIndex.NullValue));
                    break;
                case WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME:
                    witsmlLog.StartDateTimeIndex = DateTimeIndex.NullValue;
                    witsmlLog.EndDateTimeIndex = DateTimeIndex.NullValue;
                    break;
            }

            return new WitsmlLogs
            {
                Logs = new List<WitsmlLog> { witsmlLog }
            };
        }

        private WitsmlLogs GetSourceLogData(string startIndexValue, string endIndexValue)
        {
            var startIndex = DateTimeIndex.FromString(startIndexValue);
            var endIndex = DateTimeIndex.FromString(endIndexValue);
            var currentIndex = DateTimeIndex.FromString(startIndexValue);

            var data = new List<WitsmlData>();
            while (currentIndex <= endIndex)
            {
                data.Add(new WitsmlData { Data = $"{currentIndex.GetValueAsString()},1,1" });
                currentIndex = new DateTimeIndex(currentIndex.Value.AddMinutes(1));
            }

            if (data.Any())
            {
                return new WitsmlLogs
                {
                    Logs = new WitsmlLog
                    {
                        StartDateTimeIndex = startIndex.GetValueAsString(),
                        EndDateTimeIndex = endIndex.GetValueAsString(),
                        IndexType = WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME,
                        LogData = new WitsmlLogData
                        {
                            MnemonicList = string.Join(",", SourceMnemonics[WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME]),
                            UnitList = "datetime,m,m",
                            Data = data
                        }
                    }.AsSingletonList()
                };
            }

            return new WitsmlLogs();
        }

        private WitsmlLogs GetSourceLogData(double startIndexValue, double endIndexValue, IEnumerable<string> mnemonics = null)
        {
            var startIndex = new DepthIndex(startIndexValue);
            var endIndex = new DepthIndex(endIndexValue);
            var currentIndex = new DepthIndex(startIndexValue);

            var data = new List<WitsmlData>();
            if (startIndex < endIndex)
            {
                while (currentIndex <= endIndex)
                {
                    data.Add(new WitsmlData { Data = $"{currentIndex.Value},1,1" });
                    currentIndex = new DepthIndex(currentIndex.Value + 1);
                }
            }

            if (data.Any())
            {
                return new WitsmlLogs
                {
                    Logs = new WitsmlLog
                    {
                        StartIndex = new WitsmlIndex(new DepthIndex(startIndex.Value)),
                        EndIndex = new WitsmlIndex(new DepthIndex(endIndex.Value)),
                        IndexType = WitsmlLog.WITSML_INDEX_TYPE_MD,
                        LogData = new WitsmlLogData
                        {
                            MnemonicList = string.Join(",", mnemonics ?? SourceMnemonics[WitsmlLog.WITSML_INDEX_TYPE_MD]),
                            UnitList = "m,m,m",
                            Data = data
                        }
                    }.AsSingletonList()
                };
            }

            return new WitsmlLogs();
        }
    }
}
