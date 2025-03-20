using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Moq;

using Serilog;

using Witsml;
using Witsml.Data;
using Witsml.Data.Curves;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers.Modify;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Workers
{
    public class ModifyLogCurveInfoWorkerTests
    {
        private readonly Mock<IWitsmlClient> _witsmlClient;
        private readonly ModifyLogCurveInfoWorker _worker;
        private const string WellUid = "wellUid";
        private const string WellboreUid = "wellboreUid";
        private const string LogUid = "logUid";

        public ModifyLogCurveInfoWorkerTests()
        {
            Mock<IWitsmlClientProvider> witsmlClientProvider = new();
            _witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_witsmlClient.Object);
            ILoggerFactory loggerFactory = new LoggerFactory();
            loggerFactory.AddSerilog(Log.Logger);
            ILogger<ModifyLogCurveInfoJob> logger = loggerFactory.CreateLogger<ModifyLogCurveInfoJob>();
            _worker = new ModifyLogCurveInfoWorker(logger, witsmlClientProvider.Object);
        }

        [Fact]
        public async void MnemonicEmpty_ModifyLogCurveInfo_ShouldThrowException()
        {
            ModifyLogCurveInfoJob job = CreateJobTemplate() with { LogCurveInfo = new LogCurveInfo() { Mnemonic = string.Empty } };

            Task ExecuteWorker()
            {
                return _worker.Execute(job);
            }

            await Assert.ThrowsAsync<InvalidOperationException>(ExecuteWorker);
        }

        [Fact]
        public async void MnemonicNull_ModifyLogCurveInfo_ShouldThrowException()
        {
            ModifyLogCurveInfoJob job = CreateJobTemplate() with { LogCurveInfo = new LogCurveInfo() { Mnemonic = null } };

            Task ExecuteWorker()
            {
                return _worker.Execute(job);
            }

            await Assert.ThrowsAsync<InvalidOperationException>(ExecuteWorker);
        }

        [Fact]
        public async void ModifyLogCurveInfoProperties_Execute_ValidResults()
        {
            var expectedMnemonic = "Mnemonic1";
            var expectedUnit = "NewUnit";
            var expectedCurveDescription = "NewCurveDescription";

            ModifyLogCurveInfoJob job = CreateJobTemplate() with
            {
                LogCurveInfo = new LogCurveInfo() { Uid = expectedMnemonic, Mnemonic = expectedMnemonic, Unit = expectedUnit, CurveDescription = expectedCurveDescription }
            };

            WitsmlLogs testWitsmlLogs = GetTestWitsmlLogs();

            _witsmlClient
                .Setup(client =>
                    client.GetFromStoreAsync(It.IsAny<WitsmlLogs>(), It.IsAny<OptionsIn>(), null))
                .Returns(Task.FromResult(testWitsmlLogs));

            List<WitsmlLogs> updatedLogs = new();
            _witsmlClient.Setup(client =>
                    client.UpdateInStoreAsync(It.IsAny<WitsmlLogs>())).Callback<WitsmlLogs>(logs => updatedLogs.Add(logs))
                .ReturnsAsync(new QueryResult(true));

            await _worker.Execute(job);

            Assert.Single(updatedLogs);
            Assert.Equal(expectedMnemonic, updatedLogs.FirstOrDefault()?.Logs.FirstOrDefault()?.LogCurveInfo.FirstOrDefault()?.Mnemonic);
            Assert.Equal(expectedUnit, updatedLogs.FirstOrDefault()?.Logs.FirstOrDefault()?.LogCurveInfo.FirstOrDefault()?.Unit);
            Assert.Equal(expectedCurveDescription, updatedLogs.FirstOrDefault()?.Logs.FirstOrDefault()?.LogCurveInfo.FirstOrDefault()?.CurveDescription);
        }

        [Fact]
        public async void RenameMnemonic_Execute_ValidResults()
        {
            var originalUid = "Mnemonic1";
            var expectedMnemonic = "NewMnemonic";
            var expectedUnit = CommonConstants.Unit.Meter;

            ModifyLogCurveInfoJob job = CreateJobTemplate() with { LogCurveInfo = new LogCurveInfo() { Uid = originalUid, Mnemonic = expectedMnemonic, Unit = expectedUnit } };

            WitsmlLogs testWitsmlLogs = GetTestWitsmlLogs();

            _witsmlClient
                .Setup(client =>
                    client.GetFromStoreAsync(It.IsAny<WitsmlLogs>(), It.IsAny<OptionsIn>(), null))
                .Returns(Task.FromResult(testWitsmlLogs));

            List<WitsmlLogs> updatedLogs = new();
            _witsmlClient.Setup(client =>
                    client.UpdateInStoreAsync(It.IsAny<WitsmlLogs>())).Callback<WitsmlLogs>(logs => updatedLogs.Add(logs))
                .ReturnsAsync(new QueryResult(true));

            _witsmlClient.Setup(client =>
                    client.DeleteFromStoreAsync(It.IsAny<WitsmlLogs>()))
                .ReturnsAsync(new QueryResult(true));

            await _worker.Execute(job);

            Assert.Single(updatedLogs);
            Assert.Equal(expectedMnemonic, updatedLogs.FirstOrDefault()?.Logs.FirstOrDefault()?.LogCurveInfo.FirstOrDefault()?.Mnemonic);
        }

        private WitsmlLogs GetTestWitsmlLogs()
        {
            return new WitsmlLogs
            {
                Logs = new List<WitsmlLog>
                {
                    new()
                    {
                        UidWell = WellUid,
                        UidWellbore = WellboreUid,
                        Uid = LogUid,
                        IndexCurve = new WitsmlIndexCurve() { Value = "Depth" },
                        StartIndex = new WitsmlIndex(new DepthIndex(81, CommonConstants.Unit.Meter)),
                        EndIndex = new WitsmlIndex(new DepthIndex(88, CommonConstants.Unit.Meter)),
                        IndexType = WitsmlLog.WITSML_INDEX_TYPE_MD,
                        LogCurveInfo = new List<WitsmlLogCurveInfo>
                        {
                            new() { Uid = "Depth", Mnemonic = "Depth", Unit = CommonConstants.Unit.Meter },
                            new() { Uid = "Mnemonic1", Mnemonic = "Mnemonic1", Unit = CommonConstants.Unit.Meter },
                            new() { Uid = "Mnemonic2", Mnemonic = "Mnemonic2", Unit = CommonConstants.Unit.Feet }
                        }
                    }
                }
            };
        }

        private static ModifyLogCurveInfoJob CreateJobTemplate()
        {
            return new ModifyLogCurveInfoJob { LogReference = new ObjectReference { WellUid = WellUid, WellboreUid = WellboreUid, Uid = LogUid } };
        }
    }
}
