using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
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
using WitsmlExplorer.Api.Models;
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
            Mock<IWitsmlClientProvider> witsmlClientProvider = new();
            _copyLogDataWorker = new Mock<ICopyLogDataWorker>();
            _witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_witsmlClient.Object);
            witsmlClientProvider.Setup(provider => provider.GetSourceClient()).Returns(_witsmlClient.Object);
            Mock<ILogger<CopyLogJob>> logger = new();
            _copyLogWorker = new CopyLogWorker(logger.Object, witsmlClientProvider.Object, _copyLogDataWorker.Object);
        }

        [Fact]
        public async Task CopyLog_TimeIndexed()
        {
            CopyLogJob copyLogJob = CreateJobTemplate();
            SetupSourceLog(WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME);
            SetupGetWellbore();
            IEnumerable<WitsmlLogs> copyLogQuery = SetupAddInStoreAsync();
            _copyLogDataWorker.Setup(worker => worker.Execute(It.IsAny<CopyLogDataJob>()))
                .ReturnsAsync((new WorkerResult(null, true, null), null));

            (WorkerResult, RefreshAction) result = await _copyLogWorker.Execute(copyLogJob);
            WitsmlLog logInQuery = copyLogQuery.First().Logs.First();
            Assert.True(result.Item1.IsSuccess);
            Assert.Null(logInQuery.EndIndex);
            Assert.Null(logInQuery.StartIndex);
            Assert.Equal(TimeStart, logInQuery.StartDateTimeIndex);
            Assert.Equal(TimeEnd, logInQuery.EndDateTimeIndex);
        }

        [Fact]
        public async Task CopyLog_DepthIndexed()
        {
            CopyLogJob copyLogJob = CreateJobTemplate();
            SetupSourceLog(WitsmlLog.WITSML_INDEX_TYPE_MD);
            SetupGetWellbore();
            IEnumerable<WitsmlLogs> copyLogQuery = SetupAddInStoreAsync();
            _copyLogDataWorker.Setup(worker => worker.Execute(It.IsAny<CopyLogDataJob>()))
                .ReturnsAsync((new WorkerResult(null, true, null), null));

            (WorkerResult, RefreshAction) result = await _copyLogWorker.Execute(copyLogJob);

            WitsmlLog logInQuery = copyLogQuery.First().Logs.First();
            Assert.True(result.Item1.IsSuccess);
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
                            client.GetFromStoreAsync(It.Is<WitsmlLogs>(witsmlLogs => witsmlLogs.Logs.First().Uid == LogUid), new OptionsIn(ReturnElements.HeaderOnly, null, null)))
                        .ReturnsAsync(sourceLogs ?? GetSourceLogs(WitsmlLog.WITSML_INDEX_TYPE_MD, DepthStart, DepthEnd));
                    break;
                case WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME:
                    _witsmlClient.Setup(client =>
                            client.GetFromStoreAsync(It.Is<WitsmlLogs>(witsmlLogs => witsmlLogs.Logs.First().Uid == LogUid), new OptionsIn(ReturnElements.HeaderOnly, null, null)))
                        .ReturnsAsync(sourceLogs ?? GetSourceLogs(WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME, TimeStart, TimeEnd));
                    break;
                default:
                    break;
            }
        }

        private void SetupGetWellbore()
        {
            _witsmlClient.Setup(client =>
                    client.GetFromStoreAsync(It.IsAny<WitsmlWellbores>(), new OptionsIn(ReturnElements.Requested, null, null)))
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
            List<WitsmlLogs> addedLog = new();
            _witsmlClient.Setup(client => client.AddToStoreAsync(It.IsAny<WitsmlLogs>()))
                .Callback<WitsmlLogs>(addedLog.Add)
                .ReturnsAsync(new QueryResult(true));
            return addedLog;
        }

        private static CopyLogJob CreateJobTemplate(string targetWellboreUid = TargetWellboreUid)
        {
            return new CopyLogJob
            {
                Source = new ObjectReferences
                {
                    WellUid = WellUid,
                    WellboreUid = SourceWellboreUid,
                    ObjectUids = new string[] { LogUid },
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
            WitsmlLog witsmlLog = new()
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
            WitsmlIndex minIndex = new(new DepthIndex(startIndex));
            WitsmlIndex maxIndex = new(new DepthIndex(endIndex));

            WitsmlLog witsmlLog = new()
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
