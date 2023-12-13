using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Moq;

using Serilog;

using Witsml;
using Witsml.Data.Measures;
using Witsml.Data.Tubular;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers.Modify;

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
            Mock<IWitsmlClientProvider> witsmlClientProvider = new();
            _witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_witsmlClient.Object);
            ILoggerFactory loggerFactory = new LoggerFactory();
            loggerFactory.AddSerilog(Log.Logger);
            ILogger<ModifyTubularComponentJob> logger = loggerFactory.CreateLogger<ModifyTubularComponentJob>();
            _worker = new ModifyTubularComponentWorker(logger, witsmlClientProvider.Object);
        }

        [Fact]
        public async Task Update_Id()
        {
            const int expectedValue = 10;
            ModifyTubularComponentJob job = CreateJobTemplate();
            job.TubularComponent.Id = new Measure.LengthMeasure { Value = expectedValue, Uom = CommonConstants.Unit.Feet };
            List<WitsmlTubulars> updatedTubulars = await MockJob(job);
            WitsmlLengthMeasure id = updatedTubulars.First().Tubulars.First().TubularComponents.First().Id;
            decimal actual = decimal.Parse(id.Value);
            Assert.Single(updatedTubulars);
            Assert.Equal(expectedValue, actual);
        }

        [Fact]
        public async Task Update_Od()
        {
            const int expectedValue = 10;
            ModifyTubularComponentJob job = CreateJobTemplate();
            job.TubularComponent.Od = new Measure.LengthMeasure { Value = expectedValue, Uom = CommonConstants.Unit.Feet };
            List<WitsmlTubulars> updatedTubulars = await MockJob(job);
            WitsmlLengthMeasure od = updatedTubulars.First().Tubulars.First().TubularComponents.First().Od;
            decimal actual = decimal.Parse(od.Value);
            Assert.Single(updatedTubulars);
            Assert.Equal(expectedValue, actual);
        }

        [Fact]
        public async Task Update_Len()
        {
            const int expectedValue = 10;
            ModifyTubularComponentJob job = CreateJobTemplate();
            job.TubularComponent.Len = new Measure.LengthMeasure { Value = expectedValue, Uom = CommonConstants.Unit.Feet };
            List<WitsmlTubulars> updatedTubulars = await MockJob(job);
            WitsmlLengthMeasure len = updatedTubulars.First().Tubulars.First().TubularComponents.First().Len;
            decimal actual = decimal.Parse(len.Value);
            Assert.Single(updatedTubulars);
            Assert.Equal(expectedValue, actual);
        }

        [Fact]
        public async Task Update_Type()
        {
            const string expectedValue = "tc_type";
            ModifyTubularComponentJob job = CreateJobTemplate();
            job.TubularComponent.TypeTubularComponent = expectedValue;
            List<WitsmlTubulars> updatedTubulars = await MockJob(job);
            string actual = updatedTubulars.First().Tubulars.First().TubularComponents.First().TypeTubularComp;
            Assert.Single(updatedTubulars);
            Assert.Equal(expectedValue, actual);
        }

        [Fact]
        public async Task Update_Sequence()
        {
            const int expectedValue = 10;
            ModifyTubularComponentJob job = CreateJobTemplate();
            job.TubularComponent.Sequence = expectedValue;
            List<WitsmlTubulars> updatedTubulars = await MockJob(job);
            int? actual = updatedTubulars.First().Tubulars.First().TubularComponents.First().Sequence;
            Assert.Single(updatedTubulars);
            Assert.Equal(expectedValue, actual);
        }

        private async Task<List<WitsmlTubulars>> MockJob(ModifyTubularComponentJob job)
        {
            List<WitsmlTubulars> updatedTubulars = new();
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
                TubularReference = new ObjectReference()
                {
                    WellUid = "welluid",
                    WellboreUid = "wellboreuid",
                    Uid = "tubularuid"
                }
            };
        }
    }
}
