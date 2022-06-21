using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Moq;
using Witsml;
using Measure = WitsmlExplorer.Api.Models.Measure;
using Witsml.Data.Tubular;
using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;
using Xunit;
using WitsmlExplorer.Api.Jobs.Common;

namespace WitsmlExplorer.Api.Tests.Workers
{
    public class ModifyTubularComponentWorkerTests
    {
        private readonly Mock<IWitsmlClient> witsmlClient;
        private readonly ModifyTubularComponentWorker worker;
        private const string TubularComponentUid = "tubularComponentUid";

        public ModifyTubularComponentWorkerTests()
        {
            var witsmlClientProvider = new Mock<IWitsmlClientProvider>();
            witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(witsmlClient.Object);
            worker = new ModifyTubularComponentWorker(witsmlClientProvider.Object);
        }

        [Fact]
        public async Task Update_Id()
        {
            const int expectedValue = 10;
            var job = CreateJobTemplate();
            job.TubularComponent.Id = new Measure.LengthMeasure { Value = expectedValue, Uom = "ft" };
            var updatedTubulars = await MockJob(job);
            var Id = updatedTubulars.First().Tubulars.First().TubularComponents.First().Id;
            var actual = decimal.Parse(Id.Value);
            Assert.Single(updatedTubulars);
            Assert.Equal(expectedValue, actual);
        }

        [Fact]
        public async Task Update_Od()
        {
            const int expectedValue = 10;
            var job = CreateJobTemplate();
            job.TubularComponent.Od = new Measure.LengthMeasure { Value = expectedValue, Uom = "ft" };
            var updatedTubulars = await MockJob(job);
            var Od = updatedTubulars.First().Tubulars.First().TubularComponents.First().Od;
            var actual = decimal.Parse(Od.Value);
            Assert.Single(updatedTubulars);
            Assert.Equal(expectedValue, actual);
        }

        [Fact]
        public async Task Update_Len()
        {
            const int expectedValue = 10;
            var job = CreateJobTemplate();
            job.TubularComponent.Len = new Measure.LengthMeasure { Value = expectedValue, Uom = "ft" };
            var updatedTubulars = await MockJob(job);
            var Len = updatedTubulars.First().Tubulars.First().TubularComponents.First().Len;
            var actual = decimal.Parse(Len.Value);
            Assert.Single(updatedTubulars);
            Assert.Equal(expectedValue, actual);
        }

        [Fact]
        public async Task Update_Type()
        {
            const string expectedValue = "tc_type";
            var job = CreateJobTemplate();
            job.TubularComponent.TypeTubularComponent = expectedValue;
            var updatedTubulars = await MockJob(job);
            var actual = updatedTubulars.First().Tubulars.First().TubularComponents.First().TypeTubularComp;
            Assert.Single(updatedTubulars);
            Assert.Equal(expectedValue, actual);
        }

        [Fact]
        public async Task Update_Sequence()
        {
            const int expectedValue = 10;
            var job = CreateJobTemplate();
            job.TubularComponent.Sequence = expectedValue;
            var updatedTubulars = await MockJob(job);
            var actual = updatedTubulars.First().Tubulars.First().TubularComponents.First().Sequence;
            Assert.Single(updatedTubulars);
            Assert.Equal(expectedValue, actual);
        }

        private async Task<List<WitsmlTubulars>> MockJob(ModifyTubularComponentJob job)
        {
            var updatedTubulars = new List<WitsmlTubulars>();
            witsmlClient.Setup(client =>
                client.UpdateInStoreAsync(It.IsAny<WitsmlTubulars>())).Callback<WitsmlTubulars>(tubulars => updatedTubulars.Add(tubulars))
                .ReturnsAsync(new QueryResult(true));

            await worker.Execute(job);
            return updatedTubulars;
        }

        private static ModifyTubularComponentJob CreateJobTemplate()
        {
            return new ModifyTubularComponentJob
            {
                TubularComponent = new TubularComponent()
                {
                    Uid = "tc_uid"
                },
                TubularReference = new TubularReference()
                {
                    WellUid = "welluid",
                    WellboreUid = "wellboreuid",
                    TubularUid = "tubularuid"
                }
            };
        }
    }
}
