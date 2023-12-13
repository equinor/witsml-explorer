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
    public class ModifyWellWorkerTests
    {
        private readonly Mock<IWitsmlClient> _witsmlClient;
        private readonly ModifyWellWorker _worker;
        private const string WellUid = "wellUid";

        public ModifyWellWorkerTests()
        {
            Mock<IWitsmlClientProvider> witsmlClientProvider = new();
            _witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_witsmlClient.Object);
            ILoggerFactory loggerFactory = new LoggerFactory();
            loggerFactory.AddSerilog(Log.Logger);
            ILogger<ModifyWellJob> logger = loggerFactory.CreateLogger<ModifyWellJob>();
            _worker = new ModifyWellWorker(logger, witsmlClientProvider.Object);
        }

        [Fact]
        public async Task RenameWell()
        {
            const string expectedNewName = "NewName";
            ModifyWellJob job = CreateJobTemplate(WellUid, expectedNewName);

            List<WitsmlWells> updatedWells = new();
            _witsmlClient.Setup(client =>
                client.UpdateInStoreAsync(It.IsAny<WitsmlWells>())).Callback<WitsmlWells>(wells => updatedWells.Add(wells))
                .ReturnsAsync(new QueryResult(true));

            await _worker.Execute(job);

            Assert.Single(updatedWells);
            Assert.Equal(expectedNewName, updatedWells.First().Wells.First().Name);
        }

        [Fact]
        public async Task RenameWell_EmptyName_ThrowsException()
        {
            ModifyWellJob job = CreateJobTemplate(WellUid, string.Empty);

            InvalidOperationException exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _worker.Execute(job));
            Assert.Equal("Name cannot be empty", exception.Message);

            _witsmlClient.Verify(client => client.UpdateInStoreAsync(It.IsAny<WitsmlWells>()), Times.Never);
        }

        private static ModifyWellJob CreateJobTemplate(string uid, string name = null)
        {
            return new ModifyWellJob
            {
                Well = new Well
                {
                    Uid = uid,
                    Name = name
                }
            };
        }
    }
}
