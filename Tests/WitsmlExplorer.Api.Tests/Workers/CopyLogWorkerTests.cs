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
    public class CopyLogWorkerTests
    {
        private readonly CopyLogWorker copyLogWorker;
        private readonly Mock<ICopyLogDataWorker> copyLogDataWorker;
        private readonly Mock<IWitsmlClient> witsmlClient;
        private const string WellUid = "wellUid";
        private const string SourceWellboreUid = "sourceWellboreUid";
        private const string TargetWellboreUid = "targetWellboreUid";
        private const string LogUid = "sourceLogUid";

        private static readonly Dictionary<string, string[]> SourceMnemonics = new Dictionary<string, string[]>
        {
            {WitsmlLog.WITSML_INDEX_TYPE_MD, new[] {"Depth", "DepthBit", "DepthHole"}},
            {WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME, new[] {"Time", "DepthBit", "DepthHole"}}
        };

        private const string TimeStart = "2019-11-01T21:01:00.000Z";
        private const string TimeEnd = "2019-11-01T21:05:00.000Z";

        private const double DepthStart = 1;
        private const double DepthEnd = 5;

        public CopyLogWorkerTests()
        {
            var witsmlClientProvider = new Mock<IWitsmlClientProvider>();
            copyLogDataWorker = new Mock<ICopyLogDataWorker>();
            witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(witsmlClient.Object);
            copyLogWorker = new CopyLogWorker(witsmlClientProvider.Object, copyLogDataWorker.Object);
        }

        [Fact]
        public async Task CopyLog_TimeIndexed()
        {
            var copyLogJob = CreateJobTemplate();
            SetupSourceLog(WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME);
            SetupGetWellbore();
            var copyLogQuery = SetupAddInStoreAsync();
            copyLogDataWorker.Setup(worker => worker.Execute(It.IsAny<CopyLogDataJob>()))
                .ReturnsAsync((new WorkerResult(null, true, null), null));

            var result = await copyLogWorker.Execute(copyLogJob);
            var logInQuery = copyLogQuery.First().Logs.First();
            Assert.True(result.Item1.IsSuccess);
            Assert.Empty(logInQuery.LogData.Data);
            Assert.Null(logInQuery.EndIndex);
            Assert.Null(logInQuery.StartIndex);
            Assert.Equal(logInQuery.StartDateTimeIndex, TimeStart);
            Assert.Equal(logInQuery.EndDateTimeIndex, TimeEnd);
        }

        [Fact]
        public async Task CopyLog_DepthIndexed()
        {
            var copyLogJob = CreateJobTemplate();
            SetupSourceLog(WitsmlLog.WITSML_INDEX_TYPE_MD);
            SetupGetWellbore();
            var copyLogQuery = SetupAddInStoreAsync();
            copyLogDataWorker.Setup(worker => worker.Execute(It.IsAny<CopyLogDataJob>()))
                .ReturnsAsync((new WorkerResult(null, true, null), null));

            var result = await copyLogWorker.Execute(copyLogJob);

            var logInQuery = copyLogQuery.First().Logs.First();
            Assert.True(result.Item1.IsSuccess);
            Assert.Empty(logInQuery.LogData.Data);
            Assert.Equal(double.Parse(logInQuery.EndIndex.Value), DepthEnd);
            Assert.Equal(double.Parse(logInQuery.StartIndex.Value), DepthStart);
            Assert.Null(logInQuery.StartDateTimeIndex);
            Assert.Null(logInQuery.EndDateTimeIndex);
        }

        private void SetupSourceLog(string indexType, WitsmlLogs sourceLogs = null)
        {
            switch (indexType)
            {
                case WitsmlLog.WITSML_INDEX_TYPE_MD:
                    witsmlClient.Setup(client =>
                            client.GetFromStoreAsync(It.Is<WitsmlLogs>(witsmlLogs => witsmlLogs.Logs.First().Uid == LogUid), OptionsIn.All))
                        .ReturnsAsync(sourceLogs ?? GetSourceLogs(WitsmlLog.WITSML_INDEX_TYPE_MD, DepthStart, DepthEnd));
                    break;
                case WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME:
                    witsmlClient.Setup(client =>
                            client.GetFromStoreAsync(It.Is<WitsmlLogs>(witsmlLogs => witsmlLogs.Logs.First().Uid == LogUid), OptionsIn.All))
                        .ReturnsAsync(sourceLogs ?? GetSourceLogs(WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME, TimeStart, TimeEnd));
                    break;
            }
        }

        private void SetupGetWellbore()
        {
            witsmlClient.Setup(client =>
                    client.GetFromStoreAsync(It.IsAny<WitsmlWellbores>(), OptionsIn.Requested))
                .ReturnsAsync(new WitsmlWellbores
                {
                    Wellbores = new List<WitsmlWellbore>
                    {
                        new WitsmlWellbore
                        {
                            UidWell = "Well1",
                            Uid = "wellbore1",
                            Name = "Wellbore 1",
                            NameWell = "Well 1"
                        }
                    }
                });
        }

        private List<WitsmlLogs> SetupAddInStoreAsync()
        {
            var addedLog = new List<WitsmlLogs>();
            witsmlClient.Setup(client => client.AddToStoreAsync(It.IsAny<WitsmlLogs>(), It.IsAny<OptionsIn>()))
                .Callback<WitsmlLogs, OptionsIn>((witsmlLogs, _) => addedLog.Add(witsmlLogs))
                .ReturnsAsync(new QueryResult(true));
            return addedLog;
        }

        private void SetupGetDepthIndexed(WitsmlLogs query = null)
        {
            witsmlClient.Setup(client => client.GetFromStoreAsync(It.IsAny<WitsmlLogs>(), It.IsAny<OptionsIn>()))
                .Callback<WitsmlLogs, OptionsIn>((logs, _) => query = logs)
                .ReturnsAsync(() =>
                {
                    var startIndex = double.Parse(query.Logs.First().StartIndex.Value);
                    var endIndex = double.Parse(query.Logs.First().EndIndex.Value);
                    return GetSourceLogData(startIndex, endIndex);
                });
        }

        private CopyLogJob CreateJobTemplate(string targetWellboreUid = TargetWellboreUid)
        {
            return new CopyLogJob
            {
                Source = new LogReference
                {
                    WellUid = WellUid,
                    WellboreUid = SourceWellboreUid,
                    LogUid = LogUid
                },
                Target = new WellboreReference
                {
                    WellUid = WellUid,
                    WellboreUid = targetWellboreUid
                }
            };
        }

        private WitsmlLogs GetSourceLogs(string indexType, string startDateTimeIndex, string endDateTimeIndex)
        {
            var witsmlLog = new WitsmlLog
            {
                UidWell = WellUid,
                UidWellbore = SourceWellboreUid,
                Uid = LogUid,
                IndexType = indexType,
                IndexCurve = new WitsmlIndexCurve {Value = SourceMnemonics[indexType][0]},
                StartDateTimeIndex = startDateTimeIndex,
                EndDateTimeIndex = endDateTimeIndex,
                CommonData = new WitsmlCommonData(),
                LogData = new WitsmlLogData
                {
                    MnemonicList = SourceMnemonics[indexType].ToString()
                },
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
                Logs = new List<WitsmlLog> {witsmlLog}
            };
        }

        private WitsmlLogs GetSourceLogs(string indexType, double startIndex, double endIndex)
        {
            var minIndex = new WitsmlIndex(new DepthIndex(startIndex));
            var maxIndex = new WitsmlIndex(new DepthIndex(endIndex));

            var witsmlLog = new WitsmlLog
            {
                UidWell = WellUid,
                UidWellbore = SourceWellboreUid,
                Uid = LogUid,
                IndexType = indexType,
                IndexCurve = new WitsmlIndexCurve {Value = SourceMnemonics[indexType][0]},
                StartIndex = minIndex,
                EndIndex = maxIndex,
                CommonData = new WitsmlCommonData(),
                LogData = new WitsmlLogData
                {
                    MnemonicList = SourceMnemonics[indexType].ToString()
                },
                LogCurveInfo = SourceMnemonics[WitsmlLog.WITSML_INDEX_TYPE_MD].Select(mnemonic => new WitsmlLogCurveInfo
                {
                    Uid = mnemonic,
                    Mnemonic = mnemonic,
                    MinIndex = minIndex,
                    MaxIndex = maxIndex
                }).ToList()
            };
            return new WitsmlLogs
            {
                Logs = new List<WitsmlLog> {witsmlLog}
            };
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
                    data.Add(new WitsmlData {Data = $"{currentIndex.Value},1,1"});
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
