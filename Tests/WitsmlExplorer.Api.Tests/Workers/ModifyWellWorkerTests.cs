using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Moq;
using Witsml;
using Witsml.Data;
using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;
using Xunit;

namespace WitsmlExplorer.Api.Tests.Workers
{
    public class ModifyWellWorkerTests
    {
        private readonly Mock<IWitsmlClient> witsmlClient;
        private readonly ModifyWellWorker worker;
        private const string WellUid = "wellUid";

        public ModifyWellWorkerTests()
        {
            var witsmlClientProvider = new Mock<IWitsmlClientProvider>();
            witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(witsmlClient.Object);
            worker = new ModifyWellWorker(witsmlClientProvider.Object);
        }

        [Fact]
        public async Task RenameWell()
        {
            const string expectedNewName = "NewName";
            var job = CreateJobTemplate(WellUid, expectedNewName);

            var updatedWells = new List<WitsmlWells>();
            witsmlClient.Setup(client =>
                client.UpdateInStoreAsync(It.IsAny<WitsmlWells>())).Callback<WitsmlWells>(wells => updatedWells.Add(wells))
                .ReturnsAsync(new QueryResult(true));

            await worker.Execute(job);

            Assert.Single(updatedWells);
            Assert.Equal(expectedNewName, updatedWells.First().Wells.First().Name);
        }

        [Fact]
        public async Task RenameWell_EmptyName_ThrowsException()
        {
            var job = CreateJobTemplate(WellUid, "");

            var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => worker.Execute(job));
            Assert.Equal("Name cannot be empty", exception.Message);

            witsmlClient.Verify(client => client.UpdateInStoreAsync(It.IsAny<WitsmlWells>()), Times.Never);
        }

        private static ModifyWellJob CreateJobTemplate(string uid, string name=null)
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
