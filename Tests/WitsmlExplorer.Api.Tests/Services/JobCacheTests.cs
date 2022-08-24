using System;
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
            var logger = new Mock<ILogger<JobCache>>();
            _jobCache = new(logger.Object);
            _jobInfos = new JobInfo[] { new(), new(), new(), new() };
            foreach (var jobInfo in _jobInfos)
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
        public void GetJobInfos_CorrectReturn()
        {
            var indicesToGet = new int[] { 1, 2 };
            var ids = indicesToGet.Select(index => _jobInfos[index].Id);
            var result = _jobCache.GetJobInfos(ids);
            Assert.Equal(indicesToGet.Length, result.Count());
            foreach (var jobInfo in result)
            {
                Assert.Contains(jobInfo.Id, ids);
            }
            Assert.Distinct(result.Select(jobInfo => jobInfo.Id));
        }

        [Fact]
        public void GetJobInfos_IdNotPresent_ResultOmitted()
        {
            var validId = _jobInfos[3].Id;
            var ids = new string[] { validId, "invalid_id" };
            var result = _jobCache.GetJobInfos(ids);
            Assert.Single(result);
            Assert.Equal(validId, result.First().Id);
        }
    }
}
