using System;

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
            JobInfo job = new();
            JobCache.CacheJob(job);
            Assert.NotEqual(default, job.KillTime);
            Assert.True(job.KillTime > DateTime.Now);
        }
    }
}
