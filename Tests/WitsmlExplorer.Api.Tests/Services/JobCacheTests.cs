using System;
using System.Collections.Generic;
using System.Linq;

using Microsoft.Extensions.Logging;

using Moq;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Services;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Services
{
    public class JobCacheTests
    {
        private readonly JobCache _jobCache;
        private readonly JobInfo[] _jobInfos;

        public JobCacheTests()
        {
            Mock<ILogger<JobCache>> logger = new();
            _jobCache = new(logger.Object);
            _jobInfos = new JobInfo[] { new(), new(), new(), new() };
            foreach (JobInfo jobInfo in _jobInfos)
            {
                _jobCache.CacheJob(jobInfo);
            }
        }

        [Fact]
        public void CacheJob_SetsKillTime()
        {
            Assert.NotEqual(default, _jobInfos[0].KillTime);
            Assert.True(_jobInfos[0].KillTime > DateTime.Now);
        }

        [Fact]
        public void GetJobInfosByUser_ReturnCorrectUser()
        {
            string user1 = "Alice";
            string user2 = "Bob";
            _jobInfos[0].Username = user1;
            _jobInfos[1].Username = user2;
            _jobInfos[2].Username = user1;
            _jobInfos[3].Username = user2;

            IEnumerable<JobInfo> result = _jobCache.GetJobInfosByUser(user2);
            Assert.Equal(2, result.Count());
            foreach (JobInfo jobInfo in result)
            {
                Assert.Equal(user2, jobInfo.Username);
            }
            Assert.Distinct(result.Select(jobInfo => jobInfo.Id));
        }
    }
}
