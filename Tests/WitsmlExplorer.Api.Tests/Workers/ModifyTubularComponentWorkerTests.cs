using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Moq;

using Serilog;

using Witsml;
using Witsml.Data.Tubular;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;

using Xunit;

using Measure = WitsmlExplorer.Api.Models.Measure;

namespace WitsmlExplorer.Api.Tests.Workers
{
    public class ModifyTubularComponentWorkerTests
    {
        private readonly Mock<IWitsmlClient> _witsmlClient;
        private readonly ModifyTubularComponentWorker _worker;

        public ModifyTubularComponentWorkerTests()
        {
            var witsmlClientProvider = new Mock<IWitsmlClientProvider>();
            _witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_witsmlClient.Object);
            var loggerFactory = (ILoggerFactory)new LoggerFactory();
            loggerFactory.AddSerilog(Log.Logger);
            var logger = loggerFactory.CreateLogger<ModifyTubularComponentJob>();
            _worker = new ModifyTubularComponentWorker(logger, witsmlClientProvider.Object);
        }

        [Fact]
        public async Task Update_Id()
        {
            const int expectedValue = 10;
            var job = CreateJobTemplate();
            job.TubularComponent.Id = new Measure.LengthMeasure { Value = expectedValue, Uom = "ft" };
            var updatedTubulars = await MockJob(job);
            var id = updatedTubulars.First().Tubulars.First().TubularComponents.First().Id;
            var actual = decimal.Parse(id.Value);
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
            var od = updatedTubulars.First().Tubulars.First().TubularComponents.First().Od;
            var actual = decimal.Parse(od.Value);
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
            var len = updatedTubulars.First().Tubulars.First().TubularComponents.First().Len;
            var actual = decimal.Parse(len.Value);
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
            _witsmlClient.Setup(client =>
                client.UpdateInStoreAsync(It.IsAny<WitsmlTubulars>())).Callback<WitsmlTubulars>(tubulars => updatedTubulars.Add(tubulars))
                .ReturnsAsync(new QueryResult(true));

            await _worker.Execute(job);
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
