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
using WitsmlExplorer.Api.Models.Reports;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Workers
{
    public class CheckLogHeaderWorkerTests
    {
        private const string LogUid = "8cfad887-3e81-40f0-9034-178be642df65";
        private const string LogName = "Test log";
        private const string WellUid = "W-5209671";
        private const string WellboreUid = "B-5209671";
        private readonly Mock<IWitsmlClient> _witsmlClient;
        private readonly CheckLogHeaderWorker _worker;

        public CheckLogHeaderWorkerTests()
        {
            Mock<IWitsmlClientProvider> witsmlClientProvider = new();
            _witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_witsmlClient.Object);
            ILoggerFactory loggerFactory = new LoggerFactory();
            loggerFactory.AddSerilog(Log.Logger);
            ILogger<CheckLogHeaderJob> logger = loggerFactory.CreateLogger<CheckLogHeaderJob>();
            _worker = new CheckLogHeaderWorker(logger, witsmlClientProvider.Object);
        }

        [Fact]
        public async Task CheckLogHeader_CorrectData_IsValid()
        {
            CheckLogHeaderJob job = CreateJobTemplate();
            JobInfo jobInfo = new();
            job.JobInfo = jobInfo;

            _witsmlClient.Setup(client =>
                client.GetFromStoreNullableAsync(It.IsAny<WitsmlLogs>(), It.IsAny<OptionsIn>()))
                .Returns((WitsmlLogs logs, OptionsIn options) =>
                {
                    if (options.MaxReturnNodes == 1)
                    {
                        if (logs.Logs[0].LogData.MnemonicList == "")
                        {
                            return Task.FromResult(GetTestLogDataFirstRow());
                        }
                        return Task.FromResult(GetTestLogDataFirstRowForMnemonic());
                    }
                    else if (options.RequestLatestValues == 1)
                    {
                        return Task.FromResult(GetTestLogDataLatestValues());
                    }
                    return Task.FromResult(GetTestLogHeader());
                });

            (WorkerResult result, RefreshAction _) = await _worker.Execute(job);

            Assert.IsType<CheckLogHeaderReport>(jobInfo.Report);
            CheckLogHeaderReport report = (CheckLogHeaderReport)jobInfo.Report;
            Assert.Equal(LogUid, report.LogReference.Uid);
            Assert.Equal(WellUid, report.LogReference.WellUid);
            Assert.Equal(WellboreUid, report.LogReference.WellboreUid);
            Assert.Empty(report.ReportItems);
        }

        [Fact]
        public async Task CheckLogHeader_IncorrectData_IsInvalid()
        {
            CheckLogHeaderJob job = CreateJobTemplate();
            JobInfo jobInfo = new();
            job.JobInfo = jobInfo;

            _witsmlClient.Setup(client =>
                client.GetFromStoreNullableAsync(It.IsAny<WitsmlLogs>(), It.IsAny<OptionsIn>()))
                .Returns((WitsmlLogs logs, OptionsIn options) =>
                {
                    if (options.MaxReturnNodes == 1)
                    {
                        if (logs.Logs[0].LogData.MnemonicList == "")
                        {
                            return Task.FromResult(GetTestLogDataFirstRow());
                        }
                        return Task.FromResult(GetTestLogDataFirstRowForMnemonic());
                    }
                    else if (options.RequestLatestValues == 1)
                    {
                        return Task.FromResult(GetTestLogDataLatestValues());
                    }
                    return Task.FromResult(GetTestLogHeader(shouldBeConsistent: false));
                });

            (WorkerResult result, RefreshAction _) = await _worker.Execute(job);

            Assert.IsType<CheckLogHeaderReport>(jobInfo.Report);
            CheckLogHeaderReport report = (CheckLogHeaderReport)jobInfo.Report;
            Assert.Equal(LogUid, report.LogReference.Uid);
            Assert.Equal(WellUid, report.LogReference.WellUid);
            Assert.Equal(WellboreUid, report.LogReference.WellboreUid);
            List<CheckLogHeaderReportItem> reportItems = (List<CheckLogHeaderReportItem>)report.ReportItems;
            Assert.Single(reportItems);
            Assert.Equal("TQ", reportItems[0].Mnemonic);
            Assert.Equal("101", reportItems[0].HeaderEndIndex);
            Assert.Equal("102", reportItems[0].DataEndIndex);
            Assert.Equal("101", reportItems[0].HeaderStartIndex);
            Assert.Equal("101", reportItems[0].DataStartIndex);
        }

        private static CheckLogHeaderJob CreateJobTemplate()
        {
            return new CheckLogHeaderJob
            {
                LogReference = new ObjectReference
                {
                    Uid = LogUid,
                    Name = LogName,
                    WellUid = WellUid,
                    WellboreUid = WellboreUid,
                }
            };
        }

        public static WitsmlLogs GetTestLogHeader(bool shouldBeConsistent = true)
        {
            return new WitsmlLogs
            {
                Logs = new WitsmlLog
                {
                    UidWell = WellUid,
                    UidWellbore = WellboreUid,
                    Uid = LogUid,
                    StartIndex = new WitsmlIndex("100"),
                    EndIndex = new WitsmlIndex("102"),
                    LogCurveInfo = new List<WitsmlLogCurveInfo>()
                    {
                        new WitsmlLogCurveInfo()
                        {
                            Mnemonic = "Depth",
                            MinIndex = new WitsmlIndex("100"),
                            MaxIndex = new WitsmlIndex("102"),
                            // MinDateTimeIndex = "",
                            // MaxDateTimeIndex = ""
                        },
                        new WitsmlLogCurveInfo()
                        {
                            Mnemonic = "TQ",
                            MinIndex = new WitsmlIndex("101"),
                            MaxIndex = new WitsmlIndex(shouldBeConsistent ? "102" : "101"),
                            // MinDateTimeIndex = "",
                            // MaxDateTimeIndex = ""
                        },
                        new WitsmlLogCurveInfo()
                        {
                            Mnemonic = "ROP",
                            MinIndex = new WitsmlIndex("100"),
                            MaxIndex = new WitsmlIndex("101"),
                            // MinDateTimeIndex = "",
                            // MaxDateTimeIndex = ""
                        },
                    },
                }.AsSingletonList()
            };
        }

        public static WitsmlLogs GetTestLogDataLatestValues()
        {
            return new WitsmlLogs
            {
                Logs = new WitsmlLog
                {
                    UidWell = WellUid,
                    UidWellbore = WellboreUid,
                    Uid = LogUid,
                    LogData = new WitsmlLogData()
                    {
                        MnemonicList = "Depth,TQ,ROP",
                        Data = new List<WitsmlData>()
                        {
                            new WitsmlData(){Data = "100,,501"},
                            new WitsmlData(){Data = "101,51,502"},
                            new WitsmlData(){Data = "102,52,"}
                        }
                    }
                }.AsSingletonList()
            };
        }

        public static WitsmlLogs GetTestLogDataFirstRow()
        {
            return new WitsmlLogs
            {
                Logs = new WitsmlLog
                {
                    UidWell = WellUid,
                    UidWellbore = WellboreUid,
                    Uid = LogUid,
                    LogData = new WitsmlLogData()
                    {
                        MnemonicList = "Depth,TQ,ROP",
                        Data = new List<WitsmlData>()
                        {
                            new WitsmlData(){Data = "100,,501"},
                        }
                    }
                }.AsSingletonList()
            };
        }

        public static WitsmlLogs GetTestLogDataFirstRowForMnemonic()
        {
            return new WitsmlLogs
            {
                Logs = new WitsmlLog
                {
                    UidWell = WellUid,
                    UidWellbore = WellboreUid,
                    Uid = LogUid,
                    LogData = new WitsmlLogData()
                    {
                        MnemonicList = "Depth,TQ",
                        Data = new List<WitsmlData>()
                        {
                            new WitsmlData()
                            {
                                Data = "101,51"
                            },
                        }
                    }
                }.AsSingletonList()
            };
        }
    }
}
