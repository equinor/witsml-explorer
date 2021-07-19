using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Moq;
using Witsml;
using Witsml.Data;
using Witsml.ServiceReference;
using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;
using Xunit;

namespace WitsmlExplorer.Api.Tests.Workers
{
    public class CreateRiskWorkerTests
    {
        private const string WellUid = "wellUid";
        private const string WellName = "wellName";
        private const string WellboreUid = "wellboreUid";
        private const string Name = "riskname";
        private readonly Mock<IWitsmlClient> witsmlClient;
        private readonly CreateRiskWorker worker;

        public CreateRiskWorkerTests()
        {
            var witsmlClientProvider = new Mock<IWitsmlClientProvider>();
            witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(witsmlClient.Object);
            worker = new CreateRiskWorker(witsmlClientProvider.Object);
        }

        [Fact]
        public async Task ValidCreateRiskJob_Execute()
        {
            var job = CreateJobTemplate();

            var createdRisks = new List<WitsmlRisks>();
            witsmlClient.Setup(client =>
                    client.AddToStoreAsync(It.IsAny<WitsmlRisks>()))
                .Callback<WitsmlRisks>(risk=> createdRisks.Add(risk))
                .ReturnsAsync(new QueryResult(true));
            witsmlClient.Setup(client => client.GetFromStoreAsync(It.IsAny<WitsmlRisks>(), It.IsAny<OptionsIn>()))
                .ReturnsAsync(new WitsmlRisks() { Risks = new List<WitsmlRisk>() { new WitsmlRisk() }});

            await worker.Execute(job);

            Assert.Single(createdRisks);
            Assert.Single(createdRisks.First().Risks);
            var createdRisk = createdRisks.First().Risks.First();
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
                    UidWell = wellUid,
                    NameWell = wellName,
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
