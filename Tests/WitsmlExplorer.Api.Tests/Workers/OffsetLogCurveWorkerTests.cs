using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Moq;

using Serilog;

using Witsml;
using Witsml.Data;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Workers
{
    public class OffsetLogCurveWorkerTests
    {
        private const string LogUid = "8cfad887-3e81-40f0-9034-178be642df65";
        private const string LogName = "Test log";
        private const string WellUid = "W-5209671";
        private const string WellName = "Test well";
        private const string WellboreUid = "B-5209671";
        private const string WellboreName = "Test wellbore";
        private readonly Mock<IWitsmlClient> _witsmlClient;
        private readonly OffsetLogCurveWorker _worker;

        public OffsetLogCurveWorkerTests()
        {
            Mock<IWitsmlClientProvider> witsmlClientProvider = new();
            _witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_witsmlClient.Object);
            ILoggerFactory loggerFactory = new LoggerFactory();
            loggerFactory.AddSerilog(Log.Logger);
            LogUtils.SetUpGetServerCapabilites(_witsmlClient);
            ILogger<OffsetLogCurveJob> logger = loggerFactory.CreateLogger<OffsetLogCurveJob>();
            _worker = new OffsetLogCurveWorker(logger, witsmlClientProvider.Object, null, null);
        }

        [Fact]
        public async Task Execute_DepthLog_AddsDepth()
        {
            /*
            Initial Data (indexCurve, curve1):
            [(0,0), (1,1), (2,2), (3,3), (4,4), (5,5)]

            Offset: 10

            Expected Data (indexCurve, curve1):
            [(10,0), (11,1), (12,2), (13,3), (14,4), (15,5)]
            */

            var job = CreateJob("0", "5", depthOffset: 10);
            SetupClient(_witsmlClient, WitsmlLog.WITSML_INDEX_TYPE_MD);
            var expectedData = new List<string>
            {
                "10,0",
                "11,1",
                "12,2",
                "13,3",
                "14,4",
                "15,5"
            };

            var (result, refreshAction) = await _worker.Execute(job);

            Assert.True(result.IsSuccess);
            _witsmlClient.Verify(client => client.DeleteFromStoreAsync(It.IsAny<WitsmlLogs>()), Times.Once);
            _witsmlClient.Verify(client => client.UpdateInStoreAsync(It.Is<WitsmlLogs>(logs => ValidateLogs(logs, expectedData))), Times.Once);
        }

        [Fact]
        public async Task Execute_TimeLog_AddsTime()
        {
            /*
            Initial Data (indexCurve, curve1):
            [(2024-01-16T15:00:00.000Z,0), (2024-01-16T15:15:00.000Z,1), (2024-01-16T15:30:00.000Z,2), (2024-01-16T15:45:00.000Z,3), (2024-01-16T16:00:00.000Z,4)]

            Offset: 1 hour

            Expected Data (indexCurve, curve1):
            [(2024-01-16T16:00:00.000Z,0), (2024-01-16T16:15:00.000Z,1), (2024-01-16T16:30:00.000Z,2), (2024-01-16T16:45:00.000Z,3), (2024-01-16T17:00:00.000Z,4)]
            */

            var job = CreateJob("2024-01-16T15:00:00.000Z", "2024-01-16T16:00:00.000Z", timeOffsetMilliseconds: 60 * 60 * 1000);
            SetupClient(_witsmlClient, WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME);
            var expectedData = new List<string>
            {
                "2024-01-16T16:00:00.000Z,0",
                "2024-01-16T16:15:00.000Z,1",
                "2024-01-16T16:30:00.000Z,2",
                "2024-01-16T16:45:00.000Z,3",
                "2024-01-16T17:00:00.000Z,4"
            };

            var (result, refreshAction) = await _worker.Execute(job);

            Assert.True(result.IsSuccess);
            _witsmlClient.Verify(client => client.DeleteFromStoreAsync(It.IsAny<WitsmlLogs>()), Times.Once);
            _witsmlClient.Verify(client => client.UpdateInStoreAsync(It.Is<WitsmlLogs>(logs => ValidateLogs(logs, expectedData))), Times.Once);
        }

        private bool ValidateLogs(WitsmlLogs logs, List<string> expectedData)
        {
            WitsmlLogData logData = logs.Logs.First().LogData;
            if (logData.Data.Count != expectedData.Count) return false;
            for (int i = 0; i < expectedData.Count; i++)
            {
                if (logData.Data[i].Data != expectedData[i]) return false;
            }
            return true;
        }

        private OffsetLogCurveJob CreateJob(string startIndex, string endIndex, double? depthOffset = null, long? timeOffsetMilliseconds = null)
        {
            return new OffsetLogCurveJob
            {
                LogCurveInfoReferences = new ComponentReferences
                {
                    Parent = new ObjectReference
                    {
                        WellUid = WellUid,
                        WellboreUid = WellboreUid,
                        Uid = LogUid,
                        WellName = WellName,
                        WellboreName = WellboreName,
                        Name = LogName
                    },
                    ComponentUids = new string[] { "Curve1", }
                },
                DepthOffset = depthOffset,
                TimeOffsetMilliseconds = timeOffsetMilliseconds,
                StartIndex = startIndex,
                EndIndex = endIndex,
                JobInfo = new JobInfo
                {
                    Id = "123"
                }
            };
        }

        private void SetupClient(Mock<IWitsmlClient> witsmlClient, string indexType)
        {
            WitsmlLogs logHeader = GetTestLogHeader(indexType);
            WitsmlLogs logData = GetTestLogData(indexType);

            int getDataCount = 0;
            // Mock fetching log
            witsmlClient.Setup(client =>
                client.GetFromStoreAsync(It.IsAny<WitsmlLogs>(), It.IsAny<OptionsIn>(), null))
                .Returns((WitsmlLogs _, OptionsIn options, CancellationToken? _) =>
            {
                // Mock fetching the header
                if (options.ReturnElements == ReturnElements.HeaderOnly)
                {
                    return Task.FromResult(logHeader);
                }
                // Mock feching log data for each log
                else if (options.ReturnElements == ReturnElements.DataOnly)
                {
                    getDataCount++; // LogDataReader calls GetFromStoreAsync multiple times, so simulate end of data for every 2nd call.
                    return getDataCount % 2 == 0
                        ? Task.FromResult(new WitsmlLogs())
                        : Task.FromResult(logData);
                }
                throw new ArgumentException("The sent request has not been mocked.");
            });

            witsmlClient.Setup(client =>
                client.UpdateInStoreAsync(It.IsAny<WitsmlLogs>()))
                .Returns((WitsmlLogs logs) =>
            {
                return Task.FromResult(new QueryResult(true));
            });

            witsmlClient.Setup(client =>
                client.DeleteFromStoreAsync(It.IsAny<WitsmlLogs>()))
                .Returns((WitsmlLogs logs) =>
            {
                return Task.FromResult(new QueryResult(true));
            });
        }

        private WitsmlLogs GetTestLogHeader(string indexType)
        {

            return new WitsmlLogs
            {
                Logs = new List<WitsmlLog>
                {
                    new WitsmlLog
                    {
                        Uid = LogUid,
                        Name = LogName,
                        UidWell = WellUid,
                        NameWell = WellName,
                        UidWellbore = WellboreUid,
                        NameWellbore = WellboreName,
                        Direction = WitsmlLog.WITSML_DIRECTION_INCREASING,
                        IndexType = indexType,
                        StartIndex = new WitsmlIndex { Value = "0", Uom = "m" },
                        EndIndex = new WitsmlIndex { Value = "5", Uom = "m" },
                        StartDateTimeIndex = "2024-01-16T15:00:00.000Z",
                        EndDateTimeIndex = "2024-01-16T16:00:00.000Z",
                        IndexCurve = new WitsmlIndexCurve { Value = "IndexCurve" },
                        LogCurveInfo = new List<WitsmlLogCurveInfo>
                        {
                            new WitsmlLogCurveInfo
                            {
                                Uid = "Curve1",
                                Mnemonic = "Curve1",
                                MinIndex = new WitsmlIndex { Value = "0", Uom = "m" },
                                MaxIndex = new WitsmlIndex { Value = "5", Uom = "m" },
                                MinDateTimeIndex = "2024-01-16T15:00:00.000Z",
                                MaxDateTimeIndex = "2024-01-16T16:00:00.000Z"
                            }
                        }
                    }
                }
            };
        }

        private WitsmlLogs GetTestLogData(string indexType)
        {
            var isDepthLog = indexType == WitsmlLog.WITSML_INDEX_TYPE_MD;
            return new WitsmlLogs
            {
                Logs = new List<WitsmlLog>
                {
                    new WitsmlLog
                    {
                        Uid = LogUid,
                        Name = LogName,
                        UidWell = WellUid,
                        NameWell = WellName,
                        UidWellbore = WellboreUid,
                        NameWellbore = WellboreName,
                        IndexType = indexType,
                        LogData = new WitsmlLogData
                        {
                            MnemonicList="IndexCurve,Curve1",
                            UnitList="m,m",
                            Data = isDepthLog
                                ? new List<WitsmlData>
                                {
                                    new WitsmlData{ Data = "0,0" },
                                    new WitsmlData{ Data = "1,1" },
                                    new WitsmlData{ Data = "2,2" },
                                    new WitsmlData{ Data = "3,3" },
                                    new WitsmlData{ Data = "4,4" },
                                    new WitsmlData{ Data = "5,5" },
                                }
                                : new List<WitsmlData>
                                {
                                    new WitsmlData{ Data = "2024-01-16T15:00:00.000Z,0" },
                                    new WitsmlData{ Data = "2024-01-16T15:15:00.000Z,1" },
                                    new WitsmlData{ Data = "2024-01-16T15:30:00.000Z,2" },
                                    new WitsmlData{ Data = "2024-01-16T15:45:00.000Z,3" },
                                    new WitsmlData{ Data = "2024-01-16T16:00:00.000Z,4" },
                                }
                        }
                    }
                }
            };
        }

    }
}
