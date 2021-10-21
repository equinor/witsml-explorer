using System.Linq;
using System.Threading.Tasks;
using Moq;
using Witsml;
using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;
using Xunit;

namespace WitsmlExplorer.Api.Tests.Workers
{
    public class DeleteLogObjectsWorkerTests
    {
        private readonly DeleteLogObjectsWorker worker;
        private const string WellUid = "wellUid";
        private const string WellboreUid = "wellboreUid";
        private static readonly string[] LogUids =  { "logUid1", "logUid2" };

        public DeleteLogObjectsWorkerTests()
        {
            var witsmlClientProvider = new Mock<IWitsmlClientProvider>();
            var witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(witsmlClient.Object);
            worker = new DeleteLogObjectsWorker(witsmlClientProvider.Object);
        }

        [Fact]
        public async Task DeleteLogsSuccessful_ReturnResult()
        {
            var job =  new DeleteLogObjectsJob
            {
                LogReferences = LogUids
                            .Select( logUid => new LogReference { WellUid = WellUid,WellboreUid = WellboreUid, LogUid = logUid } )
                            .AsEnumerable()
            };
            var (result, refreshAction) = await worker.Execute(job);
            Assert.True(result.IsSuccess && ((RefreshWellbore) refreshAction).WellboreUid == WellboreUid);
        }
    }
}
