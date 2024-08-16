using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Moq;

using Serilog;

using Witsml;
using Witsml.Data;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers.Modify;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Workers
{
    public class ModifyWbGeometrySectionWorkerTest
    {
        private readonly Mock<IWitsmlClient> _witsmlClient;
        private readonly ModifyWbGeometrySectionWorker _worker;

        public ModifyWbGeometrySectionWorkerTest()
        {
            Mock<IWitsmlClientProvider> witsmlClientProvider = new();
            _witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_witsmlClient.Object);
            ILoggerFactory loggerFactory = new LoggerFactory();
            loggerFactory.AddSerilog(Log.Logger);
            ILogger<ModifyWbGeometrySectionJob> logger = loggerFactory.CreateLogger<ModifyWbGeometrySectionJob>();
            _worker = new ModifyWbGeometrySectionWorker(logger, witsmlClientProvider.Object);
        }

        [Fact]
        public async Task Update_GeometryStation()
        {
            string expectedGrade = "a";
            ModifyWbGeometrySectionJob job = CreateJobTemplate();
            List<WitsmlWbGeometrys> updatedGeometrys = await MockJob(job);

            Assert.Single(updatedGeometrys);
            Assert.Equal(expectedGrade, updatedGeometrys.First().WbGeometrys.First().WbGeometrySections.First().Grade);
        }

        private async Task<List<WitsmlWbGeometrys>> MockJob(ModifyWbGeometrySectionJob job)
        {
            List<WitsmlWbGeometrys> updatedWbGeometrys = new();
            _witsmlClient.Setup(client =>
                client.UpdateInStoreAsync(It.IsAny<WitsmlWbGeometrys>())).Callback<WitsmlWbGeometrys>(geometrys => updatedWbGeometrys.Add(geometrys))
                .ReturnsAsync(new QueryResult(true));

            await _worker.Execute(job);
            return updatedWbGeometrys;
        }

        private static ModifyWbGeometrySectionJob CreateJobTemplate()
        {
            return new ModifyWbGeometrySectionJob
            {
                WbGeometrySection = new WbGeometrySection()
                {
                    Uid = "gs_uid",
                    Grade = "a"

                },

                WbGeometryReference = new ObjectReference()
                {
                    WellUid = "welluid",
                    WellboreUid = "wellboreuid",
                    Uid = "geometrysectionuid"
                }
            };
        }
    }
}
