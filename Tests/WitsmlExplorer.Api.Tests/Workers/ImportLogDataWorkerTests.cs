using System;
using System.Collections.Generic;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Moq;

using Serilog;

using Witsml;
using Witsml.Data;
using Witsml.Extensions;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Workers
{
    public class ImportLogDataWorkerTests
    {
        private readonly Mock<IWitsmlClient> _witsmlClient;
        private readonly ImportLogDataWorker _worker;
        private const string WellUid = "wellUid";
        private const string WellboreUid = "wellboreUid";
        private const string LogUid = "logUid";

        public ImportLogDataWorkerTests()
        {
            Mock<IWitsmlClientProvider> witsmlClientProvider = new();
            _witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_witsmlClient.Object);
            ILoggerFactory loggerFactory = new LoggerFactory();
            loggerFactory.AddSerilog(Log.Logger);
            LogUtils.SetUpGetServerCapabilites(_witsmlClient);
            ILogger<ImportLogDataJob> logger = loggerFactory.CreateLogger<ImportLogDataJob>();
            _worker = new ImportLogDataWorker(logger, witsmlClientProvider.Object);
        }

        [Fact]
        public async Task ImportDepthLogData()
        {
            ImportLogDataJob depthJob = CreateDepthJobTemplate();
            WitsmlLogs returnedWitsmlLog = new()
            {
                Logs = new List<WitsmlLog> {
                    new WitsmlLog
                    {
                        UidWell = WellUid,
                        UidWellbore = WellboreUid,
                        Uid = LogUid,
                        LogCurveInfo = new List<WitsmlLogCurveInfo>
                        {
                            new WitsmlLogCurveInfo
                            {
                                Mnemonic="Depth",
                                Unit = CommonConstants.Unit.Meter
                            },
                            new WitsmlLogCurveInfo
                            {
                                Mnemonic="mnemo1",
                                Unit = CommonConstants.Unit.Unitless
                            },
                            new WitsmlLogCurveInfo
                            {
                                Mnemonic="mnemo2",
                                Unit = CommonConstants.Unit.Unitless
                            }
                        }
                    }
                }
            };

            _witsmlClient.Setup(client =>
                client.GetFromStoreAsync(It.IsAny<WitsmlLogs>(), It.Is<OptionsIn>((ops) => ops.ReturnElements == ReturnElements.HeaderOnly), null)).ReturnsAsync(returnedWitsmlLog);
            _witsmlClient.Setup(client =>
                client.UpdateInStoreAsync(It.IsAny<WitsmlLogs>())).ReturnsAsync(new QueryResult(true));

            (WorkerResult, RefreshAction) depthJobResult = await _worker.Execute(depthJob);

            Assert.True(depthJobResult.Item1.IsSuccess);
        }

        [Fact]
        public async Task ImportTimeLogData()
        {
            ImportLogDataJob timeJob = CreateTimeJobTemplate();
            WitsmlLogs returnedWitsmlLog = new()
            {
                Logs = new List<WitsmlLog> {
                    new WitsmlLog
                    {
                        UidWell = WellUid,
                        UidWellbore = WellboreUid,
                        Uid = LogUid,
                        LogCurveInfo = new List<WitsmlLogCurveInfo>
                        {
                            new WitsmlLogCurveInfo
                            {
                                Mnemonic="Time",
                                Unit="date time"
                            },
                            new WitsmlLogCurveInfo
                            {
                                Mnemonic="mnemo1",
                                Unit = CommonConstants.Unit.Unitless
                            },
                            new WitsmlLogCurveInfo
                            {
                                Mnemonic="mnemo2",
                                Unit = CommonConstants.Unit.Unitless
                            }
                        }
                    }
                }
            };

            _witsmlClient.Setup(client =>
                client.GetFromStoreAsync(It.IsAny<WitsmlLogs>(), It.Is<OptionsIn>((ops) => ops.ReturnElements == ReturnElements.HeaderOnly), null)).ReturnsAsync(returnedWitsmlLog);
            _witsmlClient.Setup(client =>
                client.UpdateInStoreAsync(It.IsAny<WitsmlLogs>())).ReturnsAsync(new QueryResult(true));

            (WorkerResult, RefreshAction) timeJobResult = await _worker.Execute(timeJob);

            Assert.True(timeJobResult.Item1.IsSuccess);
        }

        [Fact]
        public async Task ImportLogDataRequiresExistingLog()
        {
            ImportLogDataJob depthJob = CreateDepthJobTemplate();

            (WorkerResult, RefreshAction) result = await _worker.Execute(depthJob);

            _witsmlClient.Verify(client => client.UpdateInStoreAsync(It.IsAny<WitsmlLogs>()), Times.Never);
            Assert.Contains(result.Item1.Message, "Unable to find log", StringComparison.InvariantCultureIgnoreCase);
        }

        private static ImportLogDataJob CreateDepthJobTemplate()
        {
            List<string> mnemonics = new() { "Depth", "mnemo1", "mnemo2" };
            List<string> units = new() { CommonConstants.Unit.Meter, CommonConstants.Unit.Unitless, CommonConstants.Unit.Unitless };
            ICollection<ICollection<string>> dataRows = new List<ICollection<string>>
            {
                new List<string> { "1", "something", "something2" },
                new List<string> { "2", "something", "something2" },
                new List<string> { "3", "something", "something2" },
                new List<string> { "4", "something", "something2" },
            };
            return new ImportLogDataJob
            {
                TargetLog = new ObjectReference
                {
                    WellUid = WellUid,
                    WellboreUid = WellboreUid,
                    Uid = LogUid
                },
                Mnemonics = mnemonics,
                DataRows = dataRows,
                Units = units
            };
        }
        private static ImportLogDataJob CreateTimeJobTemplate()
        {
            List<string> mnemonics = new() { "Time", "mnemo1", "mnemo2" };
            List<string> units = new() { "date time", CommonConstants.Unit.Unitless, CommonConstants.Unit.Unitless };
            ICollection<ICollection<string>> dataRows = new List<ICollection<string>>
            {
                new List<string> { "2018-01-21T12:24:30.000Z", "something", "something2" },
                new List<string> { "2019-01-21T12:24:30.000Z", "something", "something2" },
                new List<string> { "2020-01-21T12:24:30.000Z", "something", "something2" },
                new List<string> { "2021-01-21T12:24:30.000Z", "something", "something2" },
            };
            return new ImportLogDataJob
            {
                TargetLog = new ObjectReference
                {
                    WellUid = WellUid,
                    WellboreUid = WellboreUid,
                    Uid = LogUid
                },
                Mnemonics = mnemonics,
                DataRows = dataRows,
                Units = units
            };
        }
    }
}
