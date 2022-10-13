using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Moq;

using Witsml;
using Witsml.Data.Tubular;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;
using WitsmlExplorer.Api.Workers.Copy;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Workers
{
    public class CopyTubularComponentWorkerTests
    {
        private readonly CopyTubularComponentsWorker _copyTubularComponentWorker;
        private readonly Mock<IWitsmlClient> _witsmlClient;
        private const string WellUid = "wellUid";
        private const string WellboreUid = "sourceWellboreUid";
        private const string TargetTubularUid = "targetTubularUid";
        private const string SourceTubularUid = "sourceTubularUid";
        private const string TcUid1 = "TcUid1";
        private const string TcUid2 = "TcUid2";
        private const string TcUid3 = "TcUid3";
        private const string TcUid4 = "TcUid4";

        public CopyTubularComponentWorkerTests()
        {
            Mock<IWitsmlClientProvider> witsmlClientProvider = new();
            _witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(Task.FromResult(_witsmlClient.Object));
            Mock<ILogger<CopyTubularComponentsJob>> logger = new();
            _copyTubularComponentWorker = new CopyTubularComponentsWorker(logger.Object, witsmlClientProvider.Object);
        }

        [Fact]
        public async Task CopyTubularComponentCopiedCorrectly()
        {
            CopyTubularComponentsJob copyTubularComponentJob = CreateJobTemplate();
            _witsmlClient.Setup(client =>
                    client.GetFromStoreAsync(It.Is<WitsmlTubulars>(witsmlTubulars => witsmlTubulars.Tubulars.First().Uid == SourceTubularUid), new OptionsIn(ReturnElements.All, null)))
                .ReturnsAsync(GetSourceTubulars());
            _witsmlClient.Setup(client =>
                    client.GetFromStoreAsync(It.Is<WitsmlTubulars>(witsmlTubulars => witsmlTubulars.Tubulars.First().Uid == TargetTubularUid), new OptionsIn(ReturnElements.All, null)))
                .ReturnsAsync(GetTargetTubulars());
            List<WitsmlTubulars> copyTubularComponentQuery = SetupUpdateInStoreAsync();

            (WorkerResult, RefreshAction) result = await _copyTubularComponentWorker.Execute(copyTubularComponentJob);
            WitsmlTubular updatedTubular = copyTubularComponentQuery.First().Tubulars.First();
            Assert.True(result.Item1.IsSuccess);
            Assert.Equal(TargetTubularUid, updatedTubular.Uid);
            Assert.Empty(updatedTubular.TubularComponents.FindAll((tc) => tc.Uid == TcUid1));
            Assert.Single(updatedTubular.TubularComponents.FindAll((tc) => tc.Uid == TcUid2));
            Assert.Single(updatedTubular.TubularComponents.FindAll((tc) => tc.Uid == TcUid3));
            Assert.Single(updatedTubular.TubularComponents.FindAll((tc) => tc.Uid == TcUid4));
            Assert.Equal(3, updatedTubular.TubularComponents.Count);
        }

        private List<WitsmlTubulars> SetupUpdateInStoreAsync()
        {
            List<WitsmlTubulars> updatedTubulars = new();
            _witsmlClient.Setup(client => client.UpdateInStoreAsync(It.IsAny<WitsmlTubulars>()))
                .Callback<WitsmlTubulars>(witsmlTubulars => updatedTubulars.Add(witsmlTubulars))
                .ReturnsAsync(new QueryResult(true));
            return updatedTubulars;
        }

        private static CopyTubularComponentsJob CreateJobTemplate()
        {
            return new CopyTubularComponentsJob
            {
                Source = new ComponentReferences
                {
                    Parent = new ObjectReference
                    {
                        Uid = SourceTubularUid,
                        WellboreUid = WellboreUid,
                        WellUid = WellUid
                    },
                    ComponentUids = new string[] { TcUid2, TcUid3 }
                },
                Target = new ObjectReference
                {
                    WellUid = WellUid,
                    WellboreUid = WellboreUid,
                    Uid = TargetTubularUid
                }
            };
        }

        private static WitsmlTubulars GetSourceTubulars()
        {
            WitsmlTubular witsmlTubular = new()
            {
                UidWell = WellUid,
                UidWellbore = WellboreUid,
                Uid = SourceTubularUid,
                TubularComponents = new List<WitsmlTubularComponent>
                {
                    new WitsmlTubularComponent(){
                        Uid = TcUid1,
                    },
                    new WitsmlTubularComponent(){
                        Uid = TcUid2,
                    },
                    new WitsmlTubularComponent(){
                        Uid = TcUid3,
                    }
                },
            };
            return new WitsmlTubulars
            {
                Tubulars = new List<WitsmlTubular> { witsmlTubular }
            };
        }

        private static WitsmlTubulars GetTargetTubulars()
        {
            WitsmlTubular witsmlTubular = new()
            {
                UidWell = WellUid,
                UidWellbore = WellboreUid,
                Uid = TargetTubularUid,
                TubularComponents = new List<WitsmlTubularComponent>
                {
                    new WitsmlTubularComponent(){
                        Uid = TcUid4,
                    }
                },
            };
            return new WitsmlTubulars
            {
                Tubulars = new List<WitsmlTubular> { witsmlTubular }
            };
        }
    }
}
