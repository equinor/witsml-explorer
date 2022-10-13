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
        private const string Name = "riskname";
        private readonly Mock<IWitsmlClient> _witsmlClient;
        private readonly CreateRiskWorker _worker;

        public CreateRiskWorkerTests()
        {
            Mock<IWitsmlClientProvider> witsmlClientProvider = new();
            _witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(Task.FromResult(_witsmlClient.Object));
            ILoggerFactory loggerFactory = new LoggerFactory();
            loggerFactory.AddSerilog(Log.Logger);
            ILogger<CreateRiskJob> logger = loggerFactory.CreateLogger<CreateRiskJob>();
            _worker = new CreateRiskWorker(logger, witsmlClientProvider.Object);
        }

        [Fact]
        public async Task ValidCreateRiskJobExecute()
        {
            CreateRiskJob job = CreateJobTemplate();

            List<WitsmlRisks> createdRisks = new();
            _witsmlClient.Setup(client =>
                    client.AddToStoreAsync(It.IsAny<WitsmlRisks>()))
                .Callback<WitsmlRisks>(risk => createdRisks.Add(risk))
                .ReturnsAsync(new QueryResult(true));
            _witsmlClient.Setup(client => client.GetFromStoreAsync(It.IsAny<WitsmlRisks>(), It.IsAny<OptionsIn>()))
                .ReturnsAsync(new WitsmlRisks() { Risks = new List<WitsmlRisk>() { new WitsmlRisk() } });

            await _worker.Execute(job);

            Assert.Single(createdRisks);
            Assert.Single(createdRisks.First().Risks);
            WitsmlRisk createdRisk = createdRisks.First().Risks.First();
            Assert.Equal(Name, createdRisk.Name);
            Assert.Equal(WellUid, createdRisk.UidWell);
            Assert.Equal(WellName, createdRisk.NameWell);
        }

        private static CreateRiskJob CreateJobTemplate(string uid = WellboreUid, string name = Name,
            string wellUid = WellUid, string wellName = WellName)
        {
            return new CreateRiskJob
            {
                Risk = new Risk
                {
                    Uid = uid,
                    Name = name,
                    WellUid = wellUid,
                    WellName = wellName,
                    CommonData = new CommonData
                    {
                        ItemState = "model",
                        SourceName = "SourceName"
                    }
                }
            };
        }
    }
}
