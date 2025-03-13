using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging.Abstractions;

using Moq;

using Witsml;
using Witsml.Data;
using Witsml.Extensions;
using Witsml.ServiceReference;
using Witsml.Xml;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;
using WitsmlExplorer.Api.Workers.Copy;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Workers
{
    [SuppressMessage("ReSharper", "InconsistentNaming")]
    public class CopyWellboreWorkerTests
    {
        private const string WellUid = "testWellUid";

        private readonly CopyWellboreWorker _worker;
        private readonly Mock<IWitsmlClient> _sourceWitsmlClient = new();
        private readonly Mock<IWitsmlClient> _targetWitsmlClient = new();

        public CopyWellboreWorkerTests()
        {
            Mock<IWitsmlClientProvider> witsmlClientProvider = new();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_targetWitsmlClient.Object);
            witsmlClientProvider.Setup(provider => provider.GetSourceClient()).Returns(_sourceWitsmlClient.Object);

            _worker = new CopyWellboreWorker(NullLogger<CopyWellboreJob>.Instance, witsmlClientProvider.Object);
        }

        [Fact]
        public async Task Execute_TargetWellboreExists_NoCopy()
        {
            string wellboreUid = "existing";

            WitsmlWellbore existing = CreateWellbore(wellboreUid);

            WitsmlWellbores existingWells = new() { Wellbores = existing.AsItemInList() };

            WitsmlWellbores query = WellboreQueries.GetWitsmlWellboreByUid(WellUid, wellboreUid);
            string queryText = XmlHelper.Serialize(WellQueries.GetWitsmlWellByUid(wellboreUid));

            _targetWitsmlClient.Setup(c => c.GetFromStoreAsync(IsQuery(query), It.IsAny<OptionsIn>(), null))
                               .ReturnsAsync((WitsmlWellbores q, OptionsIn op, CancellationToken? _) => existingWells);

            CopyWellboreJob job = CreateJobTemplate(wellboreUid);

            (WorkerResult, RefreshAction) result = await _worker.Execute(job);

            Assert.True(result.Item1.IsSuccess);

            _targetWitsmlClient.Verify(c => c.AddToStoreAsync(It.IsAny<WitsmlWellbores>()), Times.Never);
        }

        [Fact]
        public async Task Execute_TargetWellboreNotFound_Copied()
        {
            string wellboreUid = "newWellbore";

            WitsmlWellbore wellbore = CreateWellbore(wellboreUid);

            WitsmlWellbores sourceWells = new() { Wellbores = wellbore.AsItemInList() };

            WitsmlWellbores query = WellboreQueries.GetWitsmlWellboreByUid(WellUid, wellboreUid);

            _targetWitsmlClient.Setup(c => c.GetFromStoreAsync(It.IsAny<WitsmlWellbores>(), It.IsAny<OptionsIn>(), null))
                               .ReturnsAsync(new WitsmlWellbores { Wellbores = new List<WitsmlWellbore>() });

            _sourceWitsmlClient.Setup(c => c.GetFromStoreAsync(IsQuery(query), It.IsAny<OptionsIn>(), null))
                               .ReturnsAsync(sourceWells);

            QueryResult successQueryResult = new(true);

            _targetWitsmlClient.Setup(c => c.AddToStoreAsync(It.Is<WitsmlWellbores>(w => w.Wellbores[0].Uid == wellboreUid)))
                               .ReturnsAsync(successQueryResult);

            CopyWellboreJob job = CreateJobTemplate(wellboreUid);

            (WorkerResult, RefreshAction) result = await _worker.Execute(job);

            Assert.True(result.Item1.IsSuccess);
        }

        [Fact]
        public async Task Execute_AddFailed_ErrorInResult()
        {
            string wellboreUid = "newWellbore";

            WitsmlWellbore wellbore = CreateWellbore(wellboreUid);

            WitsmlWellbores sourceWells = new() { Wellbores = wellbore.AsItemInList() };

            WitsmlWellbores query = WellboreQueries.GetWitsmlWellboreByUid(WellUid, wellboreUid);

            _targetWitsmlClient.Setup(c => c.GetFromStoreAsync(It.IsAny<WitsmlWellbores>(), It.IsAny<OptionsIn>(), null))
                               .ReturnsAsync(new WitsmlWellbores { Wellbores = new List<WitsmlWellbore>() });

            _sourceWitsmlClient.Setup(c => c.GetFromStoreAsync(IsQuery(query), It.IsAny<OptionsIn>(), null))
                               .ReturnsAsync(sourceWells);

            QueryResult failureQueryResult = new(false, "test");

            _targetWitsmlClient.Setup(c => c.AddToStoreAsync(It.Is<WitsmlWellbores>(w => w.Wellbores[0].Uid == wellboreUid)))
                               .ReturnsAsync(failureQueryResult);

            CopyWellboreJob job = CreateJobTemplate(wellboreUid);

            (WorkerResult, RefreshAction) result = await _worker.Execute(job);

            Assert.False(result.Item1.IsSuccess);
            Assert.Equal(failureQueryResult.Reason, result.Item1.Reason);
        }

        private static T IsQuery<T>(T query)
            where T : IWitsmlQueryType
        {
            return It.Is<T>(q => XmlHelper.Serialize(q, false) == XmlHelper.Serialize(query, false));
        }

        private static WitsmlWellbore CreateWellbore(string uid, string name = null)
        {
            return new WitsmlWellbore { Uid = uid, Name = name ?? uid, UidWell = WellUid, NameWell = WellUid };
        }

        private static CopyWellboreJob CreateJobTemplate(string wellboreUid)
        {
            WellboreReference wellboreRef = new() { WellUid = WellUid, WellboreUid = wellboreUid };

            return new CopyWellboreJob
            {
                Source = wellboreRef,
                Target = wellboreRef,
            };
        }
    }
}
