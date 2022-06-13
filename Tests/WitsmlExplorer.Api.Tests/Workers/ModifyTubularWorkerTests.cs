using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Moq;
using Witsml;
using Witsml.Data.Tubular;
using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;
using Xunit;

namespace WitsmlExplorer.Api.Tests.Workers
{
    public class ModifyTubularWorkerTests
    {
        private readonly Mock<IWitsmlClient> witsmlClient;
        private readonly ModifyTubularWorker worker;
        private const string TubularUid = "tubularUid";

        public ModifyTubularWorkerTests()
        {
            var witsmlClientProvider = new Mock<IWitsmlClientProvider>();
            witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(witsmlClient.Object);
            worker = new ModifyTubularWorker(witsmlClientProvider.Object);
        }

        [Fact]
        public async Task RenameTubular()
        {
            const string expectedNewName = "NewName";
            const string expectedNewType = "drilling";
            var job = CreateJobTemplate(TubularUid, expectedNewName, expectedNewType);

            var updatedTubulars = new List<WitsmlTubulars>();
            witsmlClient.Setup(client =>
                client.UpdateInStoreAsync(It.IsAny<WitsmlTubulars>())).Callback<WitsmlTubulars>(tubulars => updatedTubulars.Add(tubulars))
                .ReturnsAsync(new QueryResult(true));

            await worker.Execute(job);

            Assert.Single(updatedTubulars);
            Assert.Equal(expectedNewName, updatedTubulars.First().Tubulars.First().Name);
            Assert.Equal(expectedNewType, updatedTubulars.First().Tubulars.First().TypeTubularAssy);
        }

        [Fact]
        public async Task RenameTubular_EmptyName_ThrowsException()
        {
            var job = CreateJobTemplate(TubularUid, "");

            var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => worker.Execute(job));
            Assert.Equal("Name cannot be empty", exception.Message);

            witsmlClient.Verify(client => client.UpdateInStoreAsync(It.IsAny<WitsmlTubulars>()), Times.Never);
        }

        private static ModifyTubularJob CreateJobTemplate(string uid, string name, string type = null)
        {
            return new ModifyTubularJob
            {
                Tubular = new Tubular
                {
                    Uid = uid,
                    Name = name,
                    TypeTubularAssy = type
                }
            };
        }
    }
}
