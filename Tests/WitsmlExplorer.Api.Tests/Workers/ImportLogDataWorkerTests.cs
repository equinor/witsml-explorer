using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Moq;
using Witsml;
using Witsml.Data;
using Witsml.ServiceReference;
using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;
using Xunit;

namespace WitsmlExplorer.Api.Tests.Workers
{
    public class ImportLogDataWorkerTests
    {
        private readonly Mock<IWitsmlClient> witsmlClient;
        private readonly ImportLogDataWorker worker;
        private const string WellUid = "wellUid";
        private const string WellboreUid = "wellboreUid";
        private const string LogUid = "logUid";

        public ImportLogDataWorkerTests()
        {
            var witsmlClientProvider = new Mock<IWitsmlClientProvider>();
            witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(witsmlClient.Object);
            worker = new ImportLogDataWorker(witsmlClientProvider.Object);
        }

        [Fact]
        public async Task ImportDepthLogData()
        {
            var depthJob = CreateDepthJobTemplate();
            var returnedWitsmlLog = new WitsmlLogs
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
                                Unit="m"
                            },
                            new WitsmlLogCurveInfo
                            {
                                Mnemonic="mnemo1",
                                Unit="unitless"
                            },
                            new WitsmlLogCurveInfo
                            {
                                Mnemonic="mnemo2",
                                Unit="unitless"
                            }
                        }
                    }
                }
            };

            witsmlClient.Setup(client =>
                client.GetFromStoreAsync(It.IsAny<WitsmlLogs>(), new OptionsIn(ReturnElements.HeaderOnly, null))).ReturnsAsync(returnedWitsmlLog);
            witsmlClient.Setup(client =>
                client.UpdateInStoreAsync(It.IsAny<WitsmlLogs>())).ReturnsAsync(new QueryResult(true));

            var depthJobResult = await worker.Execute(depthJob);

            Assert.True(depthJobResult.Item1.IsSuccess);
        }

        [Fact]
        public async Task ImportTimeLogData()
        {
            var timeJob = CreateTimeJobTemplate();
            var returnedWitsmlLog = new WitsmlLogs
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
                                Unit="unitless"
                            },
                            new WitsmlLogCurveInfo
                            {
                                Mnemonic="mnemo2",
                                Unit="unitless"
                            }
                        }
                    }
                }
            };

            witsmlClient.Setup(client =>
                client.GetFromStoreAsync(It.IsAny<WitsmlLogs>(), new OptionsIn(ReturnElements.HeaderOnly, null))).ReturnsAsync(returnedWitsmlLog);
            witsmlClient.Setup(client =>
                client.UpdateInStoreAsync(It.IsAny<WitsmlLogs>())).ReturnsAsync(new QueryResult(true));

            var timeJobResult = await worker.Execute(timeJob);

            Assert.True(timeJobResult.Item1.IsSuccess);
        }

        [Fact]
        public async Task ImportLogDataRequiresExistingLog()
        {
            var depthJob = CreateDepthJobTemplate();

            var result = await worker.Execute(depthJob);

            witsmlClient.Verify(client => client.UpdateInStoreAsync(It.IsAny<WitsmlLogs>()), Times.Never);
            Assert.Contains(result.Item1.Message, "Unable to find log", StringComparison.InvariantCultureIgnoreCase);
        }

        private static ImportLogDataJob CreateDepthJobTemplate()
        {
            var mnemonics = new List<string> { "Depth", "mnemo1", "mnemo2" };
            var units = new List<string> { "m", "unitless", "unitless" };
            var dataRows = new List<List<string>> {
                new List<string> { "1", "something", "something2" },
                new List<string> { "2", "something", "something2" },
                new List<string> { "3", "something", "something2" },
                new List<string> { "4", "something", "something2" },
            };
            return new ImportLogDataJob
            {
                TargetLog = new Jobs.Common.LogReference
                {
                    WellUid = WellUid,
                    WellboreUid = WellboreUid,
                    LogUid = LogUid
                },
                Mnemonics = mnemonics,
                DataRows = dataRows,
                Units = units
            };
        }
        private static ImportLogDataJob CreateTimeJobTemplate()
        {
            var mnemonics = new List<string> { "Time", "mnemo1", "mnemo2" };
            var units = new List<string> { "date time", "unitless", "unitless" };
            var dataRows = new List<List<string>> {
                new List<string> { "2018-01-21T12:24:30.000Z", "something", "something2" },
                new List<string> { "2019-01-21T12:24:30.000Z", "something", "something2" },
                new List<string> { "2020-01-21T12:24:30.000Z", "something", "something2" },
                new List<string> { "2021-01-21T12:24:30.000Z", "something", "something2" },
            };
            return new ImportLogDataJob
            {
                TargetLog = new Jobs.Common.LogReference
                {
                    WellUid = WellUid,
                    WellboreUid = WellboreUid,
                    LogUid = LogUid
                },
                Mnemonics = mnemonics,
                DataRows = dataRows,
                Units = units
            };
        }
    }
}
