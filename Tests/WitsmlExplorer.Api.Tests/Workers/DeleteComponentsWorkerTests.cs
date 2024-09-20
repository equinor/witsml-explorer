using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Moq;

using Serilog;

using Witsml;
using Witsml.Data;
using Witsml.Data.Tubular;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;
using WitsmlExplorer.Api.Workers.Delete;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Workers
{
    public class DeleteComponentsWorkerTests
    {
        private readonly DeleteComponentsWorker _worker;
        private readonly Mock<IWitsmlClient> _witsmlClient;
        private const string WellUid = "wellUid";
        private const string WellboreUid = "wellboreUid";
        private static readonly string ObjectUid = "objectUid1";
        private static readonly string[] ComponentUids = new string[] { "componentUid1", "componentUid2" };

        public DeleteComponentsWorkerTests()
        {
            Mock<IWitsmlClientProvider> witsmlClientProvider = new();
            _witsmlClient = new();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_witsmlClient.Object);
            ILoggerFactory loggerFactory = new LoggerFactory();
            loggerFactory.AddSerilog(Log.Logger);
            ILogger<DeleteComponentsJob> logger = loggerFactory.CreateLogger<DeleteComponentsJob>();
            _worker = new DeleteComponentsWorker(logger, witsmlClientProvider.Object);
        }

        private static DeleteComponentsJob CreateJob(ComponentType componentType)
        {
            return new()
            {
                ToDelete = new ComponentReferences()
                {
                    ComponentUids = ComponentUids,
                    ComponentType = componentType,
                    Parent = new ObjectReference()
                    {
                        WellUid = WellUid,
                        WellboreUid = WellboreUid,
                        Uid = ObjectUid,
                    }
                }
            };
        }

        [Fact]
        public async Task Execute_DeleteTwoMnemonics_ReturnResult()
        {
            _witsmlClient.Setup(client => client.DeleteFromStoreAsync(
            Match.Create<IWitsmlQueryType>(o =>
                ((WitsmlLogs)o).Logs.First().UidWell == WellUid &&
                ((WitsmlLogs)o).Logs.First().UidWellbore == WellboreUid)))
            .ReturnsAsync(new QueryResult(true));

            (WorkerResult result, RefreshAction refreshAction) = await _worker.Execute(CreateJob(ComponentType.Mnemonic));
            Assert.True(result.IsSuccess);
            Assert.True(((RefreshObjects)refreshAction).WellUid == WellUid);
            Assert.True(((RefreshObjects)refreshAction).WellboreUid == WellboreUid);
            Assert.True(((RefreshObjects)refreshAction).ObjectUid == ObjectUid);
        }

        [Fact]
        public async Task Execute_DeleteTwoTubularComponents_CorrectQuery()
        {
            List<IWitsmlQueryType> deleteQueries = new();
            _witsmlClient.Setup(client => client.DeleteFromStoreAsync(It.IsAny<IWitsmlQueryType>()))
            .Callback<IWitsmlQueryType>(deleteQueries.Add)
            .ReturnsAsync(new QueryResult(true));

            await _worker.Execute(CreateJob(ComponentType.TubularComponent));

            Assert.Single(deleteQueries);
            WitsmlTubulars deleteQuery = (WitsmlTubulars)deleteQueries.First();
            Assert.Single(deleteQuery.Tubulars);
            WitsmlTubular tubularQuery = deleteQuery.Tubulars.First();
            Assert.Equal(ObjectUid, tubularQuery.Uid);
            Assert.Equal(WellboreUid, tubularQuery.UidWellbore);
            Assert.Equal(WellUid, tubularQuery.UidWell);
            Assert.Equal(2, tubularQuery.TubularComponents.Count);
            Assert.Equal(ComponentUids[0], tubularQuery.TubularComponents[0].Uid);
            Assert.Equal(ComponentUids[1], tubularQuery.TubularComponents[1].Uid);
        }

        [Fact]
        public async Task Execute_DeleteTwoTubularComponents_ReturnResult()
        {
            _witsmlClient.Setup(client => client.DeleteFromStoreAsync(It.IsAny<IWitsmlQueryType>()))
            .ReturnsAsync(new QueryResult(true));

            (WorkerResult result, RefreshAction refreshAction) = await _worker.Execute(CreateJob(ComponentType.TubularComponent));
            Assert.True(result.IsSuccess);
            Assert.True(((RefreshObjects)refreshAction).WellUid == WellUid);
            Assert.True(((RefreshObjects)refreshAction).WellboreUid == WellboreUid);
            Assert.True(((RefreshObjects)refreshAction).ObjectUid == ObjectUid);
        }

        [Fact]
        public async Task Execute_NoComponentUids_ThrowError()
        {
            DeleteComponentsJob job = CreateJob(ComponentType.TubularComponent);
            job.ToDelete.ComponentUids = Array.Empty<string>();
            await Assert.ThrowsAsync<ArgumentException>(() => _worker.Execute(job));
        }
    }
}
