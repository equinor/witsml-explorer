using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Services;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Services
{
    public class JobProgressServiceTest
    {
        private readonly IJobProgressService _jobProgressService;

        public JobProgressServiceTest()
        {
            _jobProgressService = new JobProgressService();
        }

        [Fact]
        public void SetupFailed()
        {
            Assert.Throws<InvalidOperationException>(() => _jobProgressService.Setup(null));
        }

        [Fact]
        public void SimpleRun()
        {
            var jobInfo = new JobInfo();

            _jobProgressService.Setup(jobInfo, 0.0, 100.0);
            Assert.Equal(0, jobInfo.Progress);

            _jobProgressService.SetCurrent(10.0);
            Assert.Equal(10, jobInfo.Progress);

            _jobProgressService.SetCurrent(20.0);
            Assert.Equal(20, jobInfo.Progress);

            _jobProgressService.SetCurrent(10.0);
            Assert.Equal(20, jobInfo.Progress);

            _jobProgressService.SetCurrent(25.0);
            Assert.Equal(25, jobInfo.Progress);

            _jobProgressService.SetCurrent(50.0);
            Assert.Equal(50, jobInfo.Progress);

            _jobProgressService.SetCurrent(75.0);
            Assert.Equal(75, jobInfo.Progress);

            _jobProgressService.SetCurrent(100.0);
            Assert.Equal(100, jobInfo.Progress);

            _jobProgressService.SetCurrent(100.0);
            Assert.Equal(100, jobInfo.Progress);

            _jobProgressService.SetCurrent(101.0);
            Assert.Equal(100, jobInfo.Progress);
        }

        [Fact]
        public void ComplexRun()
        {
            var jobInfo = new JobInfo();

            _jobProgressService.Setup(jobInfo, 2.1, 999.9);
            Assert.Equal(0, jobInfo.Progress);

            _jobProgressService.SetCurrent(20.0);
            Assert.Equal(1, jobInfo.Progress);

            _jobProgressService.SetCurrent(19.9);
            Assert.Equal(1, jobInfo.Progress);

            _jobProgressService.SetCurrent(99.9);
            Assert.Equal(9, jobInfo.Progress);

            _jobProgressService.SetCurrent(222.5);
            Assert.Equal(22, jobInfo.Progress);

            _jobProgressService.SetCurrent(999.2);
            Assert.Equal(99, jobInfo.Progress);

            _jobProgressService.SetCurrent(999.9);
            Assert.Equal(100, jobInfo.Progress);

            _jobProgressService.SetCurrent(1001.1);
            Assert.Equal(100, jobInfo.Progress);
        }

        [Fact]
        public void EmptyRun()
        {
            var jobInfo = new JobInfo();

            _jobProgressService.Setup(jobInfo, 1.0, 1.0);
            Assert.Equal(100, jobInfo.Progress);

            _jobProgressService.Setup(jobInfo, 10.0, 1.0);
            Assert.Equal(100, jobInfo.Progress);
        }
    }
}
