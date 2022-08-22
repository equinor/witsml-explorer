using System;

using Microsoft.Extensions.Logging;

using Moq;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Services;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Services
{
    public class JobCacheTests
    {
        [Fact]
        public void CacheJob_SetsKillTime()
        {
            JobInfo jobInfo = new();
            var logger = new Mock<ILogger<JobCache>>();
            JobCache jobCache = new(logger.Object);
            jobCache.CacheJob(jobInfo);
            Assert.NotEqual(default, jobInfo.KillTime);
            Assert.True(jobInfo.KillTime > DateTime.Now);
        }
    }
}
