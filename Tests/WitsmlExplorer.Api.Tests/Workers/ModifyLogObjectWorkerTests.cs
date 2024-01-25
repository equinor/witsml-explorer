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
        private readonly ModifyObjectOnWellboreWorker _worker;
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
            ILogger<ModifyObjectOnWellboreJob> logger = loggerFactory.CreateLogger<ModifyObjectOnWellboreJob>();
            _worker = new ModifyObjectOnWellboreWorker(logger, witsmlClientProvider.Object);
        }

        [Fact]
        public async Task RenameLogObject()
        {
            string expectedNewName = "NewName";
            ModifyObjectOnWellboreJob job = CreateJobTemplate();
            job.Object.Name = expectedNewName;

            List<WitsmlLogs> updatedLogs = new();
            _witsmlClient.Setup(client =>
                client.UpdateInStoreAsync(It.IsAny<IWitsmlQueryType>())).Callback<IWitsmlQueryType>(logs => updatedLogs.Add(logs as WitsmlLogs))
                .ReturnsAsync(new QueryResult(true));

            await _worker.Execute(job);

            Assert.Single(updatedLogs);
            Assert.Equal(expectedNewName, updatedLogs.First().Logs.First().Name);
        }

        [Fact]
        public async Task RenameLogObject_EmptyName_ThrowsException()
        {
            ModifyObjectOnWellboreJob job = CreateJobTemplate();
            job.Object.Name = string.Empty;

            var (workerResult, _) = await _worker.Execute(job);

            Assert.False(workerResult.IsSuccess);
            Assert.Equal("Name cannot be empty", workerResult.Message);

            _witsmlClient.Verify(client => client.UpdateInStoreAsync(It.IsAny<IWitsmlQueryType>()), Times.Never);
        }

        private static ModifyObjectOnWellboreJob CreateJobTemplate()
        {
            return new ModifyObjectOnWellboreJob
            {
                Object = new LogObject
                {
                    WellUid = WellUid,
                    WellboreUid = WellboreUid,
                    Uid = LogUid
                },
                ObjectType = EntityType.Log
            };
        }
    }
}
