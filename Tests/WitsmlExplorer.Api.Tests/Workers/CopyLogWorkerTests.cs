using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Moq;

using Witsml;
using Witsml.Data;
using Witsml.Data.Curves;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;
using WitsmlExplorer.Api.Workers.Copy;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Workers
{
    [SuppressMessage("ReSharper", "InconsistentNaming")]
    public class CopyLogWorkerTests
    {
        private readonly CopyLogWorker _copyLogWorker;
        private readonly Mock<ICopyLogDataWorker> _copyLogDataWorker;
        private readonly Mock<IWitsmlClient> _witsmlClient;
        private const string WellUid = "wellUid";
        private const string SourceWellboreUid = "sourceWellboreUid";
        private const string TargetWellboreUid = "targetWellboreUid";
        private const string LogUid = "sourceLogUid";

        private static readonly Dictionary<string, string[]> SourceMnemonics = new()
        {
            { WitsmlLog.WITSML_INDEX_TYPE_MD, new[] { "Depth", "DepthBit", "DepthHole" } },
            { WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME, new[] { "Time", "DepthBit", "DepthHole" } }
        };

        private const string TimeStart = "2019-11-01T21:01:00.000Z";
        private const string TimeEnd = "2019-11-01T21:05:00.000Z";

        private const double DepthStart = 1;
        private const double DepthEnd = 5;

        public CopyLogWorkerTests()
        {
            var witsmlClientProvider = new Mock<IWitsmlClientProvider>();
            _copyLogDataWorker = new Mock<ICopyLogDataWorker>();
            _witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_witsmlClient.Object);
            var logger = new Mock<ILogger<CopyLogJob>>();
            _copyLogWorker = new CopyLogWorker(logger.Object, witsmlClientProvider.Object, _copyLogDataWorker.Object);
        }

        [Fact]
        public async Task CopyLog_TimeIndexed()
        {
            var copyLogJob = CreateJobTemplate();
            SetupSourceLog(WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME);
            SetupGetWellbore();
            var copyLogQuery = SetupAddInStoreAsync();
            _copyLogDataWorker.Setup(worker => worker.Execute(It.IsAny<CopyLogDataJob>()))
                .ReturnsAsync((new WorkerResult(null, true, null), null));

            var result = await _copyLogWorker.Execute(copyLogJob);
            var logInQuery = copyLogQuery.First().Logs.First();
            Assert.True(result.Item1.IsSuccess);
            Assert.Empty(logInQuery.LogData.Data);
            Assert.Null(logInQuery.EndIndex);
            Assert.Null(logInQuery.StartIndex);
            Assert.Equal(TimeStart, logInQuery.StartDateTimeIndex);
            Assert.Equal(TimeEnd, logInQuery.EndDateTimeIndex);
        }

        [Fact]
        public async Task CopyLog_DepthIndexed()
        {
            var copyLogJob = CreateJobTemplate();
            SetupSourceLog(WitsmlLog.WITSML_INDEX_TYPE_MD);
            SetupGetWellbore();
            var copyLogQuery = SetupAddInStoreAsync();
            _copyLogDataWorker.Setup(worker => worker.Execute(It.IsAny<CopyLogDataJob>()))
                .ReturnsAsync((new WorkerResult(null, true, null), null));

            var result = await _copyLogWorker.Execute(copyLogJob);

            var logInQuery = copyLogQuery.First().Logs.First();
            Assert.True(result.Item1.IsSuccess);
            Assert.Empty(logInQuery.LogData.Data);
            Assert.Equal(DepthEnd, double.Parse(logInQuery.EndIndex.Value));
            Assert.Equal(DepthStart, double.Parse(logInQuery.StartIndex.Value));
            Assert.Null(logInQuery.StartDateTimeIndex);
            Assert.Null(logInQuery.EndDateTimeIndex);
        }

        private void SetupSourceLog(string indexType, WitsmlLogs sourceLogs = null)
        {
            switch (indexType)
            {
                case WitsmlLog.WITSML_INDEX_TYPE_MD:
                    _witsmlClient.Setup(client =>
                            client.GetFromStoreAsync(It.Is<WitsmlLogs>(witsmlLogs => witsmlLogs.Logs.First().Uid == LogUid), new OptionsIn(ReturnElements.All, null)))
                        .ReturnsAsync(sourceLogs ?? GetSourceLogs(WitsmlLog.WITSML_INDEX_TYPE_MD, DepthStart, DepthEnd));
                    break;
                case WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME:
                    _witsmlClient.Setup(client =>
                            client.GetFromStoreAsync(It.Is<WitsmlLogs>(witsmlLogs => witsmlLogs.Logs.First().Uid == LogUid), new OptionsIn(ReturnElements.All, null)))
                        .ReturnsAsync(sourceLogs ?? GetSourceLogs(WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME, TimeStart, TimeEnd));
                    break;
            }
        }

        private void SetupGetWellbore()
        {
            _witsmlClient.Setup(client =>
                    client.GetFromStoreAsync(It.IsAny<WitsmlWellbores>(), new OptionsIn(ReturnElements.Requested, null)))
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

        private IEnumerable<WitsmlLogs> SetupAddInStoreAsync()
        {
            var addedLog = new List<WitsmlLogs>();
            _witsmlClient.Setup(client => client.AddToStoreAsync(It.IsAny<WitsmlLogs>()))
                .Callback<WitsmlLogs>((witsmlLogs) => addedLog.Add(witsmlLogs))
                .ReturnsAsync(new QueryResult(true));
            return addedLog;
        }

        private static CopyLogJob CreateJobTemplate(string targetWellboreUid = TargetWellboreUid)
        {
            return new CopyLogJob
            {
                Source = new LogReferences
                {
                    LogReferenceList = new[]
                    {
                        new LogReference
                        {
                            WellUid = WellUid,
                            WellboreUid = SourceWellboreUid,
                            LogUid = LogUid,
                        }
                    }
                },
                Target = new WellboreReference
                {
                    WellUid = WellUid,
                    WellboreUid = targetWellboreUid
                }
            };
        }

        private static WitsmlLogs GetSourceLogs(string indexType, string startDateTimeIndex, string endDateTimeIndex)
        {
            var witsmlLog = new WitsmlLog
            {
                UidWell = WellUid,
                UidWellbore = SourceWellboreUid,
                Uid = LogUid,
                IndexType = indexType,
                IndexCurve = new WitsmlIndexCurve { Value = SourceMnemonics[indexType][0] },
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
                Logs = new List<WitsmlLog> { witsmlLog }
            };
        }

        private static WitsmlLogs GetSourceLogs(string indexType, double startIndex, double endIndex)
        {
            var minIndex = new WitsmlIndex(new DepthIndex(startIndex));
            var maxIndex = new WitsmlIndex(new DepthIndex(endIndex));

            var witsmlLog = new WitsmlLog
            {
                UidWell = WellUid,
                UidWellbore = SourceWellboreUid,
                Uid = LogUid,
                IndexType = indexType,
                IndexCurve = new WitsmlIndexCurve { Value = SourceMnemonics[indexType][0] },
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
                Logs = new List<WitsmlLog> { witsmlLog }
            };
        }
    }
}
