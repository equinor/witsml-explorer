using System.Diagnostics.CodeAnalysis;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging.Abstractions;

using Moq;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;
using WitsmlExplorer.Api.Workers.Copy;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Workers
{
    [SuppressMessage("ReSharper", "InconsistentNaming")]
    public class CopyLogWithParentWorkerTests
    {
        private const string WellUid = "wellUid";
        private const string SourceWellboreUid = "sourceWellboreUid";
        private const string TargetWellboreUid = "targetWellboreUid";
        private const string LogUid = "sourceLogUid";

        private readonly CopyLogWithParentWorker _worker;

        private readonly Mock<ICopyWellWorker> _copyWellWorker;

        private readonly Mock<ICopyWellboreWorker> _copyWellboreWorker;

        private readonly Mock<ICopyLogWorker> _copyLogWorker;

        public CopyLogWithParentWorkerTests()
        {
            _copyLogWorker = new();
            _copyWellWorker = new();
            _copyWellboreWorker = new Mock<ICopyWellboreWorker>();

            Mock<IWitsmlClientProvider> witsmlClientProvider = new();

            _worker = new CopyLogWithParentWorker(NullLogger<CopyLogWithParentJob>.Instance,
                                                  witsmlClientProvider.Object,
                                                  _copyWellWorker.Object,
                                                  _copyWellboreWorker.Object,
                                                  _copyLogWorker.Object);
        }

        [Fact]
        public async Task Execute_AllJobs_Success()
        {
            CopyLogWithParentJob job = CreateJobTemplate(true, true);

            _copyWellWorker.Setup(w => w.Execute(job.CopyWellJob)).ReturnsAsync(SucessResult());
            _copyWellboreWorker.Setup(w => w.Execute(job.CopyWellboreJob)).ReturnsAsync(SucessResult());

            _copyLogWorker.Setup(w => w.Execute(It.Is<CopyLogJob>(j => j.Source == job.Source && j.Target == job.Target))).ReturnsAsync(SucessResult());

            (WorkerResult, RefreshAction) result = await _worker.Execute(job);

            Assert.True(result.Item1.IsSuccess);
        }

        [Fact]
        public async Task Execute_LogOnly_Success()
        {
            CopyLogWithParentJob job = CreateJobTemplate(false, false);

            _copyLogWorker.Setup(w => w.Execute(It.Is<CopyLogJob>(j => j.Source == job.Source && j.Target == job.Target))).ReturnsAsync(SucessResult());

            (WorkerResult, RefreshAction) result = await _worker.Execute(job);

            Assert.True(result.Item1.IsSuccess);

            _copyWellWorker.VerifyNoOtherCalls();
            _copyWellboreWorker.VerifyNoOtherCalls();
        }

        [Fact]
        public async Task Execute_ErrorOnWellCopy_ReasonInResult()
        {
            CopyLogWithParentJob job = CreateJobTemplate(true, true);

            string failReason = "test";

            _copyWellWorker.Setup(w => w.Execute(It.IsAny<CopyWellJob>())).ReturnsAsync(FailureResult(failReason));

            (WorkerResult, RefreshAction) result = await _worker.Execute(job);

            Assert.False(result.Item1.IsSuccess);

            Assert.Equal(failReason, result.Item1.Reason);

            _copyWellboreWorker.VerifyNoOtherCalls();
            _copyLogWorker.VerifyNoOtherCalls();
        }

        [Fact]
        public async Task Execute_ErrorOnWellboreCopy_ReasonInResult()
        {
            CopyLogWithParentJob job = CreateJobTemplate(true, true);

            string failReason = "test";

            _copyWellWorker.Setup(w => w.Execute(job.CopyWellJob)).ReturnsAsync(SucessResult());
            _copyWellboreWorker.Setup(w => w.Execute(It.IsAny<CopyWellboreJob>())).ReturnsAsync(FailureResult(failReason));

            (WorkerResult, RefreshAction) result = await _worker.Execute(job);

            Assert.False(result.Item1.IsSuccess);

            Assert.Equal(failReason, result.Item1.Reason);

            _copyLogWorker.VerifyNoOtherCalls();
        }

        [Fact]
        public async Task Execute_ErrorOnLogCopy_ReasonInResult()
        {
            CopyLogWithParentJob job = CreateJobTemplate(true, true);

            string failReason = "test";

            _copyWellWorker.Setup(w => w.Execute(job.CopyWellJob)).ReturnsAsync(SucessResult());
            _copyWellboreWorker.Setup(w => w.Execute(job.CopyWellboreJob)).ReturnsAsync(SucessResult());
            _copyLogWorker.Setup(w => w.Execute(It.IsAny<CopyLogJob>())).ReturnsAsync(FailureResult(failReason));

            (WorkerResult, RefreshAction) result = await _worker.Execute(job);

            Assert.False(result.Item1.IsSuccess);

            Assert.Equal(failReason, result.Item1.Reason);
        }

        private static (WorkerResult, RefreshAction) SucessResult()
        {
            return (new WorkerResult(null, true, "Success"), null);
        }

        private static (WorkerResult, RefreshAction) FailureResult(string reason = null)
        {
            return (new WorkerResult(null, false, "Failure", reason), null);
        }

        private static CopyLogWithParentJob CreateJobTemplate(bool withWell, bool withWellbore, string targetWellboreUid = TargetWellboreUid)
        {
            WellReference wellRef = new() { WellUid = WellUid };
            WellboreReference wellboreRef = new() { WellUid = WellUid, WellboreUid = targetWellboreUid };
            CopyWellJob wellJob = withWell ? new CopyWellJob() { Source = wellRef, Target = wellRef } : null;
            CopyWellboreJob wellboreJob = withWellbore ? new CopyWellboreJob() { Source = wellboreRef, Target = wellboreRef } : null;

            return new CopyLogWithParentJob
            {
                Source = new ObjectReferences
                {
                    WellUid = WellUid,
                    WellboreUid = SourceWellboreUid,
                    ObjectUids = new string[] { LogUid },
                },
                Target = wellboreRef,
                CopyWellJob = wellJob,
                CopyWellboreJob = wellboreJob
            };
        }
    }
}
