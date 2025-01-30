using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Moq;

using Serilog;

using Witsml;
using Witsml.Data;
using Witsml.Data.Curves;
using Witsml.Extensions;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;

namespace WitsmlExplorer.Api.Tests.Workers
{

    public class MinimumDataQcWorkerTests
    {
        private const string LogUid = "logUid";
        private const string WellUid = "wellUid";
        private const string WellboreUid = "wellboreUid";
        private const string CurveIndex = "Depth";
        private const string MnemonicList = "Depth,BPOS,SPM1";

        private const string DepthDataRow1 = "51,88,100";
        private const string DepthDataRow2 = "52,88,100";
        private const string DepthDataRow3 = "53,88,100";

        private const string DepthDataWithGapsRow1 = "51,88,100";
        private const string DepthDataWithGapsRow2 = "52,,110";
        private const string DepthDataWithGapsRow3 = "53,92,";
        private const string DepthDataWithGapsRow4 = "54,94,130";

        private const string TimeDataRow1 = "2023-04-19T00:00:00Z,88,100";
        private const string TimeDataRow2 = "2023-04-19T00:00:01Z,88,100";
        private const string TimeDataRow3 = "2023-04-19T00:00:02Z,88,100";

        private const string TimeDataWithGapsRow1 = "2023-04-19T00:00:00Z,88,100";
        private const string TimeDataWithGapsRow2 = "2023-04-19T00:00:01Z,,110";
        private const string TimeDataWithGapsRow3 = "2023-04-19T00:00:02Z,92,";
        private const string TimeDataWithGapsRow4 = "2023-04-19T00:00:03Z,94,130";


        private readonly Mock<IWitsmlClient> _witsmlClient;
        private readonly MinimumDataQcWorker _worker;

        public MinimumDataQcWorkerTests()
        {
            var witsmlClientProvider = new Mock<IWitsmlClientProvider>();
            _witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_witsmlClient.Object);
            ILoggerFactory loggerFactory = new LoggerFactory();
            loggerFactory.AddSerilog(Log.Logger);
            ILogger<MinimumDataQcJob> logger = loggerFactory.CreateLogger<MinimumDataQcJob>();
            _worker = new MinimumDataQcWorker(logger, witsmlClientProvider.Object);
        }

        private static void SetupClient(Mock<IWitsmlClient> witsmlClient, string indexType, bool isLogDataWithGaps, bool isIncreasing)
        {
            bool isDepthLog = indexType == WitsmlLog.WITSML_INDEX_TYPE_MD;
            var mockSequence = new MockSequence();

            var logDataWithGaps = GetTestLogDataWithGaps(isDepthLog);
            var logDataWithoutGaps = GetTestLogDataWithoutGaps(isDepthLog);
            witsmlClient.InSequence(mockSequence)
                .Setup(client =>
                    client.GetFromStoreAsync(It.IsAny<WitsmlLogs>(), It.IsAny<OptionsIn>()))
                .Returns((WitsmlLogs logs, OptionsIn options) => isLogDataWithGaps
                    ? Task.FromResult(GetTestWitsmlLogs(logDataWithGaps, isDepthLog, isIncreasing))
                    : Task.FromResult(GetTestWitsmlLogs(logDataWithoutGaps, isDepthLog, isIncreasing)));

            witsmlClient.InSequence(mockSequence)
                .Setup(client =>
                    client.GetFromStoreAsync(It.IsAny<WitsmlLogs>(), It.IsAny<OptionsIn>()))
                .Returns((WitsmlLogs logs, OptionsIn options) => isLogDataWithGaps
                    ? Task.FromResult(GetTestWitsmlLogs(logDataWithGaps, isDepthLog, isIncreasing))
                    : Task.FromResult(GetTestWitsmlLogs(logDataWithoutGaps, isDepthLog, isIncreasing)));

            witsmlClient.InSequence(mockSequence)
                .Setup(client =>
                    client.GetFromStoreAsync(It.IsAny<WitsmlLogs>(), It.IsAny<OptionsIn>()))
                .Returns(Task.FromResult(new WitsmlLogs() { Logs = new List<WitsmlLog>() }));
        }

        private static WitsmlLogs GetTestWitsmlLogs(WitsmlLogData logData, bool isDepthLog, bool isIncreasing)
        {
            logData.Data = isIncreasing
                ? logData.Data.OrderBy(x => x.Data).ToList()
                : logData.Data.OrderByDescending(x => x.Data).ToList();

            (int minIndex, int maxIndex) = (51, 54);
            (string minDateTimeIndex, string maxDateTimeIndex) = ("2023-04-19T00:00:00Z", "2023-04-19T00:00:03Z");

            (int startIndex, int endIndex) = isIncreasing ? (minIndex, maxIndex) : (maxIndex, minIndex);
            (string startDateTimeIndex, string endDateTimeIndex) = isIncreasing ? (minDateTimeIndex, maxDateTimeIndex) : (maxDateTimeIndex, minDateTimeIndex);

            return new WitsmlLogs
            {
                Logs = new WitsmlLog
                {
                    UidWell = WellUid,
                    UidWellbore = WellboreUid,
                    Uid = LogUid,
                    StartIndex = new WitsmlIndex(new DepthIndex(startIndex, CommonConstants.Unit.Meter)),
                    EndIndex = new WitsmlIndex(new DepthIndex(endIndex, CommonConstants.Unit.Meter)),
                    StartDateTimeIndex = startDateTimeIndex,
                    EndDateTimeIndex = endDateTimeIndex,
                    IndexCurve = new WitsmlIndexCurve() { Value = "Depth" },
                    LogData = logData,
                    Direction = isIncreasing ? WitsmlLog.WITSML_DIRECTION_INCREASING : WitsmlLog.WITSML_DIRECTION_DECREASING,
                    IndexType = isDepthLog ? WitsmlLog.WITSML_INDEX_TYPE_MD : WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME,
                    LogCurveInfo = new List<WitsmlLogCurveInfo>()
                {
                    new WitsmlLogCurveInfo()
                    {
                        Mnemonic = "Depth",
                        MinIndex = new WitsmlIndex(new DepthIndex(minIndex, CommonConstants.Unit.Meter)),
                        MaxIndex = new WitsmlIndex(new DepthIndex(maxIndex, CommonConstants.Unit.Meter)),
                        MinDateTimeIndex = minDateTimeIndex,
                        MaxDateTimeIndex = maxDateTimeIndex,
                    },
                    new WitsmlLogCurveInfo()
                    {
                        Mnemonic = "BPOS",
                        MinIndex = new WitsmlIndex(new DepthIndex(minIndex, CommonConstants.Unit.Meter)),
                        MaxIndex = new WitsmlIndex(new DepthIndex(maxIndex, CommonConstants.Unit.Meter)),
                        MinDateTimeIndex = minDateTimeIndex,
                        MaxDateTimeIndex = maxDateTimeIndex
                    },
                    new WitsmlLogCurveInfo()
                    {
                        Mnemonic = "SPM1",
                        MinIndex = new WitsmlIndex(new DepthIndex(minIndex, CommonConstants.Unit.Meter)),
                        MaxIndex = new WitsmlIndex(new DepthIndex(maxIndex, CommonConstants.Unit.Meter)),
                        MinDateTimeIndex = minDateTimeIndex,
                        MaxDateTimeIndex = maxDateTimeIndex
                    },
                },
                }.AsItemInList()
            };
        }

        private static WitsmlLogData GetTestLogDataWithoutGaps(bool isDepthLog)
        {
            return new WitsmlLogData()
            {
                MnemonicList = MnemonicList,
                Data = new List<WitsmlData>()
            {
                new() { Data = isDepthLog ? DepthDataRow1 : TimeDataRow1 },
                new() { Data = isDepthLog ? DepthDataRow2 : TimeDataRow2 },
                new() { Data = isDepthLog ? DepthDataRow3 : TimeDataRow3 },
            }
            };
        }

        private static WitsmlLogData GetTestLogDataWithGaps(bool isDepthLog)
        {
            return new WitsmlLogData()
            {
                MnemonicList = MnemonicList,
                Data = new List<WitsmlData>()
            {
                new() { Data = isDepthLog ? DepthDataWithGapsRow1 : TimeDataWithGapsRow1 },
                new() { Data = isDepthLog ? DepthDataWithGapsRow2 : TimeDataWithGapsRow2 },
                new() { Data = isDepthLog ? DepthDataWithGapsRow3 : TimeDataWithGapsRow3 },
                new() { Data = isDepthLog ? DepthDataWithGapsRow4 : TimeDataWithGapsRow4 }
            }
            };
        }

        private static MinimumDataQcJob GetMinimumDataQcJob(double? Density, double? DepthGap, long? TimeGap)
        {
            return new MinimumDataQcJob
            {
                Density = Density,
                DepthGap = DepthGap,
                TimeGap = TimeGap,
            };
        }
    }
}
