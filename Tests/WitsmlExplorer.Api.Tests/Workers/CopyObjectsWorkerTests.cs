using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Moq;

using Witsml;
using Witsml.Data;
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
    public class CopyObjectsWorkerTests
    {
        private readonly CopyObjectsWorker _copyObjectWorker;
        private readonly Mock<IWitsmlClient> _witsmlClient;
        private const string WellUid = "wellUid";
        private const string SourceWellboreUid = "sourceWellboreUid";
        private const string TargetWellboreUid = "targetWellboreUid";
        private const string ObjectUid = "objectUid";

        public CopyObjectsWorkerTests()
        {
            Mock<IWitsmlClientProvider> witsmlClientProvider = new();
            _witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_witsmlClient.Object);
            witsmlClientProvider.Setup(provider => provider.GetSourceClient()).Returns(_witsmlClient.Object);
            Mock<ILogger<CopyObjectsJob>> logger = new();
            CopyUtils copyUtils = new(new Mock<ILogger<CopyUtils>>().Object);
            CopyLogWorker copyLogWorker = new(new Mock<ILogger<CopyObjectsJob>>().Object, witsmlClientProvider.Object);
            _copyObjectWorker = new CopyObjectsWorker(logger.Object, witsmlClientProvider.Object, copyUtils, copyLogWorker);
        }

        [Fact]
        public async Task Execute_CopyOneTubular_IsSuccess()
        {
            CopyObjectsJob copyObjectJob = CreateJobTemplate();
            _witsmlClient.Setup(client =>
                    client.GetFromStoreNullableAsync(It.Is<IWitsmlObjectList>(witsmlObjects => witsmlObjects.Objects.First().Uid == ObjectUid), new OptionsIn(ReturnElements.All, null, null)))
                .ReturnsAsync(GetSourceObjects());
            SetupGetWellbore();
            IEnumerable<IWitsmlObjectList> copyObjectQuery = CopyTestsUtils.SetupAddInStoreAsync<IWitsmlObjectList>(_witsmlClient);

            (WorkerResult workerResult, RefreshAction refreshAction) = await _copyObjectWorker.Execute(copyObjectJob);
            Assert.True(workerResult.IsSuccess);
            Assert.Equal(EntityType.Tubular, refreshAction.EntityType);
        }

        private void SetupGetWellbore()
        {
            _witsmlClient.Setup(client =>
                    client.GetFromStoreAsync(It.IsAny<WitsmlWellbores>(), new OptionsIn(ReturnElements.Requested, null, null)))
                .ReturnsAsync(new WitsmlWellbores
                {
                    Wellbores = new List<WitsmlWellbore>
                    {
                        new WitsmlWellbore
                        {
                            UidWell = "Well1",
                            Uid = "wellbore1",
                            Name = "Wellbore 1",
                            NameWell = "Well 1"
                        }
                    }
                });
        }

        private static CopyObjectsJob CreateJobTemplate(string targetWellboreUid = TargetWellboreUid)
        {
            return new CopyObjectsJob
            {
                Source = new ObjectReferences
                {
                    WellUid = WellUid,
                    WellboreUid = SourceWellboreUid,
                    ObjectUids = new string[] { ObjectUid },
                    ObjectType = EntityType.Tubular
                },
                Target = new WellboreReference
                {
                    WellUid = WellUid,
                    WellboreUid = targetWellboreUid
                }
            };
        }

        private static IWitsmlObjectList GetSourceObjects()
        {
            WitsmlTubular witsmlObject = new()
            {
                UidWell = WellUid,
                UidWellbore = SourceWellboreUid,
                Uid = ObjectUid,
            };
            return new WitsmlTubulars
            {
                Objects = new List<WitsmlTubular> { witsmlObject }
            };
        }
    }
}
