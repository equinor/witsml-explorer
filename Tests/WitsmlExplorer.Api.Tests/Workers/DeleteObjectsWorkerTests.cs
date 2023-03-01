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
    public class DeleteObjectsWorkerTests
    {
        private readonly DeleteObjectsWorker _worker;
        private readonly Mock<IWitsmlClient> _witsmlClient;
        private const string WellUid = "wellUid";
        private const string WellboreUid = "wellboreUid";
        private static readonly string[] ObjectUids = { "objectUid1", "objectUid2" };

        public DeleteObjectsWorkerTests()
        {
            Mock<IWitsmlClientProvider> witsmlClientProvider = new();
            _witsmlClient = new();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_witsmlClient.Object);
            ILoggerFactory loggerFactory = new LoggerFactory();
            loggerFactory.AddSerilog(Log.Logger);

            ILogger<DeleteObjectsJob> logger2 = loggerFactory.CreateLogger<DeleteObjectsJob>();
            _worker = new DeleteObjectsWorker(logger2, witsmlClientProvider.Object);
        }

        private static DeleteObjectsJob CreateJob(EntityType objectType)
        {
            return new()
            {
                ToDelete = new ObjectReferences()
                {
                    WellUid = WellUid,
                    WellboreUid = WellboreUid,
                    ObjectUids = ObjectUids,
                    ObjectType = objectType
                }
            };
        }

        [Fact]
        public async Task Execute_DeleteTwoLogs_ReturnResult()
        {
            _witsmlClient.Setup(client => client.DeleteFromStoreAsync(
            Match.Create<IWitsmlQueryType>(o =>
                ((WitsmlLogs)o).Logs.First().UidWell == WellUid &&
                ((WitsmlLogs)o).Logs.First().UidWellbore == WellboreUid)))
            .ReturnsAsync(new QueryResult(true));

            (WorkerResult result, RefreshAction refreshAction) = await _worker.Execute(CreateJob(EntityType.Log));
            Assert.True(result.IsSuccess && ((RefreshObjects)refreshAction).WellboreUid == WellboreUid);
        }

        [Fact]
        public async Task Execute_DeleteTwoTubulars_ReturnResult()
        {
            _witsmlClient.Setup(client => client.DeleteFromStoreAsync(
            Match.Create<IWitsmlQueryType>(o =>
                ((WitsmlTubulars)o).Tubulars.First().UidWell == WellUid &&
                ((WitsmlTubulars)o).Tubulars.First().UidWellbore == WellboreUid)))
            .ReturnsAsync(new QueryResult(true));

            (WorkerResult result, RefreshAction refreshAction) = await _worker.Execute(CreateJob(EntityType.Tubular));
            Assert.True(result.IsSuccess && ((RefreshObjects)refreshAction).WellboreUid == WellboreUid);
        }
    }
}
