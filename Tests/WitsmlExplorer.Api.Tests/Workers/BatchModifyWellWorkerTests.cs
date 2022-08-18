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
using WitsmlExplorer.Api.Workers;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Workers
{
    public class BatchModifyWellWorkerTests
    {
        private readonly Mock<IWitsmlClient> _witsmlClient;
        private readonly BatchModifyWellWorker _worker;
        private const string Well1Uid = "well1Uid";
        private const string Well2Uid = "well2Uid";

        public BatchModifyWellWorkerTests()
        {
            var witsmlClientProvider = new Mock<IWitsmlClientProvider>();
            _witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_witsmlClient.Object);
            var loggerFactory = (ILoggerFactory)new LoggerFactory();
            loggerFactory.AddSerilog(Log.Logger);
            var logger = loggerFactory.CreateLogger<BatchModifyWellJob>();
            _worker = new BatchModifyWellWorker(logger, witsmlClientProvider.Object);
        }

        [Fact]
        public async Task Modify_Wells_Empty_Payload_ThrowsException()
        {
            var job = CreateJobTemplate(Array.Empty<string>());

            var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _worker.Execute(job));
            Assert.Equal("payload cannot be empty", exception.Message);

            _witsmlClient.Verify(client => client.UpdateInStoreAsync(It.IsAny<WitsmlWells>()), Times.Never);
        }

        [Fact]
        public async Task RenameWells()
        {
            const string expectedWell1Name = "well1UidName";
            const string expectedWell2Name = "well2UidName";
            var job = CreateJobTemplate(new[] { Well1Uid, Well2Uid });

            var updatedWells = new List<WitsmlWells>();
            _witsmlClient.Setup(client =>
                client.UpdateInStoreAsync(It.IsAny<WitsmlWells>())).Callback<WitsmlWells>(wells => updatedWells.Add(wells))
                .ReturnsAsync(new QueryResult(true));

            await _worker.Execute(job);

            Assert.Equal(2, updatedWells.Count);
            Assert.Equal(expectedWell1Name, updatedWells.First().Wells.First().Name);
            Assert.Equal(expectedWell2Name, updatedWells.Last().Wells.First().Name);
        }

        private static BatchModifyWellJob CreateJobTemplate(IEnumerable<string> wellUids)
        {
            var wells = CreateWells(wellUids);
            return new BatchModifyWellJob
            {
                Wells = wells
            };
        }

        private static IEnumerable<Well> CreateWells(IEnumerable<string> wellUids)
        {
            return wellUids.Select(wellId => new Well { Uid = wellId, Name = wellId + "Name" }).ToArray();
        }
    }
}
