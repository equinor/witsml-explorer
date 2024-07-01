using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Moq;

using Serilog;

using Witsml;
using Witsml.Data;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers.Create;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Workers
{
    public class CreateRiskWorkerTests
    {
        private const string WellUid = "wellUid";
        private const string WellName = "wellName";
        private const string WellboreUid = "wellboreUid";
        private const string WellboreName = "wellboreName";
        private const string Uid = "riskUid";
        private const string Name = "riskname";
        private readonly Mock<IWitsmlClient> _witsmlClient;
        private readonly CreateObjectOnWellboreWorker _worker;

        public CreateRiskWorkerTests()
        {
            Mock<IWitsmlClientProvider> witsmlClientProvider = new();
            _witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_witsmlClient.Object);
            ILoggerFactory loggerFactory = new LoggerFactory();
            loggerFactory.AddSerilog(Log.Logger);
            ILogger<CreateObjectOnWellboreJob> logger = loggerFactory.CreateLogger<CreateObjectOnWellboreJob>();
            _worker = new CreateObjectOnWellboreWorker(logger, witsmlClientProvider.Object);
        }

        [Fact]
        public async Task ValidCreateObjectOnWellboreJobExecute()
        {
            CreateObjectOnWellboreJob job = CreateJobTemplate();

            List<WitsmlRisks> createdRisks = new();
            _witsmlClient.Setup(client =>
                    client.AddToStoreAsync(It.IsAny<IWitsmlQueryType>()))
                .Callback<IWitsmlQueryType>(risk => createdRisks.Add(risk as WitsmlRisks))
                .ReturnsAsync(new QueryResult(true));

            await _worker.Execute(job);

            Assert.Single(createdRisks);
            Assert.Single(createdRisks.First().Risks);
            WitsmlRisk createdRisk = createdRisks.First().Risks.First();
            Assert.Equal(Name, createdRisk.Name);
            Assert.Equal(WellUid, createdRisk.UidWell);
            Assert.Equal(WellName, createdRisk.NameWell);
        }

        private static CreateObjectOnWellboreJob CreateJobTemplate()
        {
            return new CreateObjectOnWellboreJob
            {
                Object = new Risk
                {
                    Uid = Uid,
                    Name = Name,
                    WellUid = WellUid,
                    WellName = WellName,
                    WellboreUid = WellboreUid,
                    WellboreName = WellboreName,
                    CommonData = new CommonData
                    {
                        ItemState = "model",
                        SourceName = "SourceName"
                    }
                },
                ObjectType = EntityType.Risk
            };
        }
    }
}
