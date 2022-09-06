using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Moq;

using Serilog;

using Witsml;
using Witsml.Data;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers.Modify;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Workers
{
    public class ModifyLogObjectWorkerTests
    {
        private readonly Mock<IWitsmlClient> _witsmlClient;
        private readonly ModifyLogObjectWorker _worker;
        private const string WellUid = "wellUid";
        private const string WellboreUid = "wellboreUid";
        private const string LogUid = "logUid";

        public ModifyLogObjectWorkerTests()
        {
            Mock<IWitsmlClientProvider> witsmlClientProvider = new();
            _witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_witsmlClient.Object);
            ILoggerFactory loggerFactory = new LoggerFactory();
            loggerFactory.AddSerilog(Log.Logger);
            ILogger<ModifyLogObjectJob> logger = loggerFactory.CreateLogger<ModifyLogObjectJob>();
            _worker = new ModifyLogObjectWorker(logger, witsmlClientProvider.Object);
        }

        [Fact]
        public async Task RenameLogObject()
        {
            string expectedNewName = "NewName";
            ModifyLogObjectJob job = CreateJobTemplate();
            job.LogObject.Name = expectedNewName;

            List<WitsmlLogs> updatedLogs = new();
            _witsmlClient.Setup(client =>
                client.UpdateInStoreAsync(It.IsAny<WitsmlLogs>())).Callback<WitsmlLogs>(logs => updatedLogs.Add(logs))
                .ReturnsAsync(new QueryResult(true));

            await _worker.Execute(job);

            Assert.Single(updatedLogs);
            Assert.Equal(expectedNewName, updatedLogs.First().Logs.First().Name);
        }

        [Fact]
        public async Task RenameLogObjectEmptyNameThrowsException()
        {
            ModifyLogObjectJob job = CreateJobTemplate();
            job.LogObject.Name = "";

            InvalidOperationException exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _worker.Execute(job));
            Assert.Equal("Name cannot be empty", exception.Message);

            _witsmlClient.Verify(client => client.UpdateInStoreAsync(It.IsAny<WitsmlLogs>()), Times.Never);
        }

        private static ModifyLogObjectJob CreateJobTemplate()
        {
            return new ModifyLogObjectJob
            {
                LogObject = new LogObject
                {
                    WellUid = WellUid,
                    WellboreUid = WellboreUid,
                    Uid = LogUid
                }
            };
        }
    }
}
