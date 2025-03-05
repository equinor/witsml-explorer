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
    public class CopyWellWorkerTests
    {
        private readonly CopyWellWorker _worker;
        private readonly Mock<IWitsmlClient> _sourceWitsmlClient = new();
        private readonly Mock<IWitsmlClient> _targetWitsmlClient = new();

        public CopyWellWorkerTests()
        {
            Mock<IWitsmlClientProvider> witsmlClientProvider = new();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_targetWitsmlClient.Object);
            witsmlClientProvider.Setup(provider => provider.GetSourceClient()).Returns(_sourceWitsmlClient.Object);

            _worker = new CopyWellWorker(NullLogger<CopyWellJob>.Instance, witsmlClientProvider.Object);
        }

        [Fact]
        public async Task Execute_TargetWellExists_NoCopy()
        {
            string wellUid = "existing";

            WitsmlWell existing = CreateWell(wellUid);

            WitsmlWells existingWells = new() { Wells = existing.AsItemInList() };

            WitsmlWells query = WellQueries.GetWitsmlWellByUid(wellUid);
            string queryText = XmlHelper.Serialize(WellQueries.GetWitsmlWellByUid(wellUid));

            _targetWitsmlClient.Setup(c => c.GetFromStoreAsync(IsQuery(query), It.IsAny<OptionsIn>(), null))
                               .ReturnsAsync((WitsmlWells q, OptionsIn op, CancellationToken? _) => existingWells);

            CopyWellJob job = CreateJobTemplate(wellUid);

            (WorkerResult, RefreshAction) result = await _worker.Execute(job);

            Assert.True(result.Item1.IsSuccess);

            _targetWitsmlClient.Verify(c => c.AddToStoreAsync(It.IsAny<WitsmlWells>()), Times.Never);
        }

        [Fact]
        public async Task Execute_TargetWellNotFound_Copied()
        {
            string wellUid = "newWell";

            WitsmlWell well = CreateWell(wellUid);

            WitsmlWells sourceWells = new() { Wells = well.AsItemInList() };

            WitsmlWells query = WellQueries.GetWitsmlWellByUid(wellUid);

            _targetWitsmlClient.Setup(c => c.GetFromStoreAsync(It.IsAny<WitsmlWells>(), It.IsAny<OptionsIn>(), null))
                               .ReturnsAsync(new WitsmlWells { Wells = new List<WitsmlWell>() });

            _sourceWitsmlClient.Setup(c => c.GetFromStoreAsync(IsQuery(query), It.IsAny<OptionsIn>(), null))
                               .ReturnsAsync(sourceWells);

            QueryResult successQueryResult = new(true);

            _targetWitsmlClient.Setup(c => c.AddToStoreAsync(It.Is<WitsmlWells>(w => w.Wells[0].Uid == wellUid)))
                               .ReturnsAsync(successQueryResult);

            CopyWellJob job = CreateJobTemplate(wellUid);

            (WorkerResult, RefreshAction) result = await _worker.Execute(job);

            Assert.True(result.Item1.IsSuccess);
        }

        [Fact]
        public async Task Execute_AddFailed_ErrorInResult()
        {
            string wellUid = "newWell";

            WitsmlWell well = CreateWell(wellUid);

            WitsmlWells sourceWells = new() { Wells = well.AsItemInList() };

            WitsmlWells query = WellQueries.GetWitsmlWellByUid(wellUid);

            _targetWitsmlClient.Setup(c => c.GetFromStoreAsync(It.IsAny<WitsmlWells>(), It.IsAny<OptionsIn>(), null))
                               .ReturnsAsync(new WitsmlWells { Wells = new List<WitsmlWell>() });

            _sourceWitsmlClient.Setup(c => c.GetFromStoreAsync(IsQuery(query), It.IsAny<OptionsIn>(), null))
                               .ReturnsAsync(sourceWells);

            QueryResult failureQueryResult = new(false, "test");

            _targetWitsmlClient.Setup(c => c.AddToStoreAsync(It.Is<WitsmlWells>(w => w.Wells[0].Uid == wellUid)))
                               .ReturnsAsync(failureQueryResult);

            CopyWellJob job = CreateJobTemplate(wellUid);

            (WorkerResult, RefreshAction) result = await _worker.Execute(job);

            Assert.False(result.Item1.IsSuccess);
            Assert.Equal(failureQueryResult.Reason, result.Item1.Reason);
        }

        private static T IsQuery<T>(T query)
            where T : IWitsmlQueryType
        {
            return It.Is<T>(q => XmlHelper.Serialize(q, false) == XmlHelper.Serialize(query, false));
        }

        private static WitsmlWell CreateWell(string uid, string name = null)
        {
            return new WitsmlWell { Uid = uid, Name = name ?? uid };
        }

        private static CopyWellJob CreateJobTemplate(string wellUid)
        {
            WellReference wellRef = new() { WellUid = wellUid };

            return new CopyWellJob
            {
                Source = wellRef,
                Target = wellRef,
            };
        }
    }
}
