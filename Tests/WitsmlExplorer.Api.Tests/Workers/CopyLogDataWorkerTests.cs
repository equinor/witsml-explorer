using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Moq;

using Witsml;
using Witsml.Data;
using Witsml.Data.Curves;
using Witsml.Extensions;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;
using WitsmlExplorer.Api.Workers.Copy;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Workers
{
    [SuppressMessage("ReSharper", "InconsistentNaming")]
    public class CopyLogDataWorkerTests
    {
        private readonly CopyLogDataWorker _worker;
        private readonly Mock<IWitsmlClient> _witsmlClient;
        private const string WellUid = "wellUid";
        private const string WellboreUid = "wellboreUid";
        private const string SourceLogUid = "sourceLogUid";
        private const string TargetLogUid = "targetLogUid";

        private static readonly Dictionary<string, string[]> SourceMnemonics = new()
        {
            { WitsmlLog.WITSML_INDEX_TYPE_MD, new[] { "Depth", "DepthBit", "DepthHole" } },
            { WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME, new[] { "Time", "DepthBit", "DepthHole" } }
        };

        private const string TimeStart = "2019-11-01T21:01:00.000Z";
        private const string TimeEnd = "2019-11-01T21:05:00.000Z";

        private const double DepthStart = 1;
        private const double DepthEnd = 5;

        public CopyLogDataWorkerTests()
        {
            Mock<IWitsmlClientProvider> witsmlClientProvider = new();
            _witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(Task.FromResult(_witsmlClient.Object));
            Mock<ILogger<CopyLogDataJob>> logger = new();
            _worker = new CopyLogDataWorker(witsmlClientProvider.Object, logger.Object);
        }

        [Fact]
        public async Task CopyLogData_TimeIndexed()
        {
            CopyLogDataJob job = CreateJobTemplate();

            SetupSourceLog(WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME);
            SetupTargetLog(WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME);
            List<WitsmlLogs> updatedLogs = SetupUpdateInStoreAsync();
            WitsmlLogs query = null;
            _witsmlClient.Setup(client => client.GetFromStoreAsync(It.IsAny<WitsmlLogs>(), new OptionsIn(ReturnElements.DataOnly, null)))
                .Callback<WitsmlLogs, OptionsIn>((logs, _) => query = logs)
                .ReturnsAsync(() => GetSourceLogData(query.Logs.First().StartDateTimeIndex, query.Logs.First().EndDateTimeIndex));

            await _worker.Execute(job);

            Assert.Equal(string.Join(",", SourceMnemonics[WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME]), updatedLogs.First().Logs.First().LogData.MnemonicList);
            Assert.Equal(5, updatedLogs.First().Logs.First().LogData.Data.Count);
        }

        [Fact]
        public async Task CopyLogData_DepthIndexed()
        {
            CopyLogDataJob job = CreateJobTemplate();

            SetupSourceLog(WitsmlLog.WITSML_INDEX_TYPE_MD);
            SetupTargetLog(WitsmlLog.WITSML_INDEX_TYPE_MD);
            SetupGetDepthIndexed();
            List<WitsmlLogs> updatedLogs = SetupUpdateInStoreAsync();

            await _worker.Execute(job);

            Assert.Equal(string.Join(",", SourceMnemonics[WitsmlLog.WITSML_INDEX_TYPE_MD]), updatedLogs.First().Logs.First().LogData.MnemonicList);
            Assert.Equal(5, updatedLogs.First().Logs.First().LogData.Data.Count);
        }

        [Fact]
        public async Task CopyLogData_DepthIndexed_SelectedMnemonics()
        {
            CopyLogDataJob job = CreateJobTemplate();
            job.Source.ComponentUids = new[] { "Depth", "DepthBit" };

            SetupSourceLog(WitsmlLog.WITSML_INDEX_TYPE_MD);
            SetupTargetLog(WitsmlLog.WITSML_INDEX_TYPE_MD);
            WitsmlLogs query = null;
            _witsmlClient.Setup(client => client.GetFromStoreAsync(It.IsAny<WitsmlLogs>(), new OptionsIn(ReturnElements.DataOnly, null)))
                .Callback<WitsmlLogs, OptionsIn>((logs, _) => query = logs)
                .ReturnsAsync(() =>
                {
                    double startIndex = double.Parse(query.Logs.First().StartIndex.Value);
                    double endIndex = double.Parse(query.Logs.First().EndIndex.Value);
                    return GetSourceLogData(startIndex, endIndex, job.Source.ComponentUids);
                });
            List<WitsmlLogs> updatedLogs = SetupUpdateInStoreAsync();

            await _worker.Execute(job);

            Assert.NotNull(query);
            string[] queriedMnemonics = query.Logs.First().LogData.MnemonicList.Split(",");
            string[] copiedMnemonics = updatedLogs.Last().Logs.First().LogData.MnemonicList.Split(",");
            Assert.Equal(job.Source.ComponentUids, queriedMnemonics);
            Assert.Equal(job.Source.ComponentUids, copiedMnemonics);
        }

        [Fact]
        public async Task CopyLogData_DepthIndexed_AddsIndexMnemonicIfNotIncludedInJob()
        {
            string indexMnemonic = "Depth";
            CopyLogDataJob job = CreateJobTemplate();
            job.Source.ComponentUids = new[] { "DepthBit" };

            SetupSourceLog(WitsmlLog.WITSML_INDEX_TYPE_MD);
            SetupTargetLog(WitsmlLog.WITSML_INDEX_TYPE_MD);

            WitsmlLogs query = null;
            _witsmlClient.Setup(client => client.GetFromStoreAsync(It.IsAny<WitsmlLogs>(), new OptionsIn(ReturnElements.DataOnly, null)))
                .Callback<WitsmlLogs, OptionsIn>((logs, _) => query = logs)
                .ReturnsAsync(() =>
                {
                    double startIndex = double.Parse(query.Logs.First().StartIndex.Value);
                    double endIndex = double.Parse(query.Logs.First().EndIndex.Value);
                    return GetSourceLogData(startIndex, endIndex);
                });
            List<WitsmlLogs> updatedLogs = SetupUpdateInStoreAsync();

            await _worker.Execute(job);

            Assert.NotNull(query);
            string[] queriedMnemonics = query.Logs.First().LogData.MnemonicList.Split(",");
            string[] copiedMnemonics = updatedLogs.Last().Logs.First().LogData.MnemonicList.Split(",");
            Assert.Contains(indexMnemonic, queriedMnemonics);
            Assert.Contains(indexMnemonic, copiedMnemonics);
        }

        [Fact]
        public async Task CopyLogData_Returns_Error_IfMismatchedIndexTypes()
        {
            CopyLogDataJob job = CreateJobTemplate();

            SetupSourceLog(WitsmlLog.WITSML_INDEX_TYPE_MD);
            SetupTargetLog(WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME);

            (WorkerResult result, RefreshAction _) = await _worker.Execute(job);
            Assert.False(result.IsSuccess);
            Assert.Equal("sourceLog and targetLog has mismatching index types", result.Reason);
        }

        [Fact]
        public async Task CopyLogData_DepthIndexed_AllowIndexCurveNamesThatOnlyDifferInCasing()
        {
            string sourceIndexCurve = "DEPTH";
            string targetIndexCurve = "Depth";
            string[] mnemonics = new[] { sourceIndexCurve, "DepthBit", "DepthHole" };
            CopyLogDataJob job = CreateJobTemplate();
            job.Source.ComponentUids = mnemonics;
            WitsmlLogs sourceLogs = GetSourceLogs(WitsmlLog.WITSML_INDEX_TYPE_MD, DepthStart, DepthEnd, sourceIndexCurve);
            SetupSourceLog(WitsmlLog.WITSML_INDEX_TYPE_MD, sourceLogs);
            SetupTargetLog(WitsmlLog.WITSML_INDEX_TYPE_MD);

            WitsmlLogs query = null;
            _witsmlClient.Setup(client => client.GetFromStoreAsync(It.IsAny<WitsmlLogs>(), new OptionsIn(ReturnElements.DataOnly, null)))
                .Callback<WitsmlLogs, OptionsIn>((logs, _) => query = logs)
                .ReturnsAsync(() =>
                {
                    double startIndex = double.Parse(query.Logs.First().StartIndex.Value);
                    double endIndex = double.Parse(query.Logs.First().EndIndex.Value);
                    return GetSourceLogData(startIndex, endIndex, job.Source.ComponentUids);
                });
            List<WitsmlLogs> updatedLogs = SetupUpdateInStoreAsync();

            (WorkerResult result, RefreshAction _) = await _worker.Execute(job);
            Assert.True(result.IsSuccess);
            Assert.Equal(3, updatedLogs.First().Logs.First().LogCurveInfo.Count);
            Assert.Equal(targetIndexCurve, updatedLogs.First().Logs.First().LogCurveInfo.First().Mnemonic);
        }

        private void SetupSourceLog(string indexType, WitsmlLogs sourceLogs = null)
        {
            switch (indexType)
            {
                case WitsmlLog.WITSML_INDEX_TYPE_MD:
                    _witsmlClient.Setup(client =>
                            client.GetFromStoreAsync(It.Is<WitsmlLogs>(witsmlLogs => witsmlLogs.Logs.First().Uid == SourceLogUid), new OptionsIn(ReturnElements.HeaderOnly, null)))
                        .ReturnsAsync(sourceLogs ?? GetSourceLogs(WitsmlLog.WITSML_INDEX_TYPE_MD, DepthStart, DepthEnd));
                    break;
                case WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME:
                    _witsmlClient.Setup(client =>
                            client.GetFromStoreAsync(It.Is<WitsmlLogs>(witsmlLogs => witsmlLogs.Logs.First().Uid == SourceLogUid), new OptionsIn(ReturnElements.HeaderOnly, null)))
                        .ReturnsAsync(sourceLogs ?? GetSourceLogs(WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME, TimeStart, TimeEnd));
                    break;
                default:
                    break;
            }
        }

        private void SetupTargetLog(string indexType, WitsmlLogs targetLogs = null)
        {
            switch (indexType)
            {
                case WitsmlLog.WITSML_INDEX_TYPE_MD:
                    _witsmlClient.Setup(client =>
                            client.GetFromStoreAsync(It.Is<WitsmlLogs>(witsmlLogs => witsmlLogs.Logs.First().Uid == TargetLogUid), new OptionsIn(ReturnElements.HeaderOnly, null)))
                        .ReturnsAsync(targetLogs ?? GetTargetLogs(WitsmlLog.WITSML_INDEX_TYPE_MD));
                    break;
                case WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME:
                    _witsmlClient.Setup(client =>
                            client.GetFromStoreAsync(It.Is<WitsmlLogs>(witsmlLogs => witsmlLogs.Logs.First().Uid == TargetLogUid), new OptionsIn(ReturnElements.HeaderOnly, null)))
                        .ReturnsAsync(targetLogs ?? GetTargetLogs(WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME));
                    break;
                default:
                    break;
            }
        }

        private List<WitsmlLogs> SetupUpdateInStoreAsync()
        {
            List<WitsmlLogs> updatedLogs = new();
            _witsmlClient.Setup(client =>
                    client.UpdateInStoreAsync(It.IsAny<WitsmlLogs>())).Callback<WitsmlLogs>(witsmlLogs => updatedLogs.Add(witsmlLogs))
                .ReturnsAsync(new QueryResult(true));
            return updatedLogs;
        }

        private void SetupGetDepthIndexed(WitsmlLogs query = null)
        {
            _witsmlClient.Setup(client => client.GetFromStoreAsync(It.IsAny<WitsmlLogs>(), new OptionsIn(ReturnElements.DataOnly, null)))
                .Callback<WitsmlLogs, OptionsIn>((logs, _) => query = logs)
                .ReturnsAsync(() =>
                {
                    double startIndex = double.Parse(query!.Logs.First().StartIndex.Value);
                    double endIndex = double.Parse(query.Logs.First().EndIndex.Value);
                    return GetSourceLogData(startIndex, endIndex);

                });
        }

        private static CopyLogDataJob CreateJobTemplate()
        {
            return new CopyLogDataJob
            {
                Source = new ComponentReferences
                {
                    Parent = new ObjectReference
                    {
                        WellUid = WellUid,
                        WellboreUid = WellboreUid,
                        Uid = SourceLogUid
                    }
                },
                Target = new ObjectReference
                {
                    WellUid = WellUid,
                    WellboreUid = WellboreUid,
                    Uid = TargetLogUid
                }
            };
        }

        private static WitsmlLogs GetSourceLogs(string indexType, string startDateTimeIndex, string endDateTimeIndex)
        {
            WitsmlLog witsmlLog = new()
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

        private static WitsmlLogs GetSourceLogs(string indexType, double startIndex, double endIndex, string indexCurveValue = null)
        {
            WitsmlIndex minIndex = new(new DepthIndex(startIndex));
            WitsmlIndex maxIndex = new(new DepthIndex(endIndex));
            WitsmlLog witsmlLog = new()
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

        private static WitsmlLogs GetTargetLogs(string indexType)
        {
            WitsmlLogCurveInfo indexLogCurveInfo = indexType switch
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

            WitsmlLog witsmlLog = new()
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
                default:
                    break;
            }

            return new WitsmlLogs
            {
                Logs = new List<WitsmlLog> { witsmlLog }
            };
        }

        private static WitsmlLogs GetSourceLogData(string startIndexValue, string endIndexValue)
        {
            DateTimeIndex startIndex = DateTimeIndex.FromString(startIndexValue);
            DateTimeIndex endIndex = DateTimeIndex.FromString(endIndexValue);
            DateTimeIndex currentIndex = DateTimeIndex.FromString(startIndexValue);

            List<WitsmlData> data = new();
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

        private static WitsmlLogs GetSourceLogData(double startIndexValue, double endIndexValue, IEnumerable<string> mnemonics = null)
        {
            DepthIndex startIndex = new(startIndexValue);
            DepthIndex endIndex = new(endIndexValue);
            DepthIndex currentIndex = new(startIndexValue);

            List<WitsmlData> data = new();
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
