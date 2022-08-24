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
        public void GetJobInfosById_CorrectReturn()
        {
            var indicesToGet = new int[] { 1, 2 };
            var ids = indicesToGet.Select(index => _jobInfos[index].Id);
            var result = _jobCache.GetJobInfosById(ids);
            Assert.Equal(indicesToGet.Length, result.Count());
            foreach (JobInfo jobInfo in result)
            {
                Assert.Contains(jobInfo.Id, ids);
            }
            Assert.Distinct(result.Select(jobInfo => jobInfo.Id));
        }

        [Fact]
        public void GetJobInfosId_IdNotPresent_ResultOmitted()
        {
            var validId = _jobInfos[3].Id;
            var ids = new string[] { validId, "invalid_id" };
            var result = _jobCache.GetJobInfosById(ids);
            Assert.Single(result);
            Assert.Equal(validId, result.First().Id);
        }

        [Fact]
        public void GetJobInfosByUser_ReturnCorrectUser()
        {
            var user1 = "Alice";
            var user2 = "Bob";
            _jobInfos[0].Username = user1;
            _jobInfos[1].Username = user2;
            _jobInfos[2].Username = user1;
            _jobInfos[3].Username = user2;

            var result = _jobCache.GetJobInfosByUser(user2);
            Assert.Equal(2, result.Count());
            foreach (JobInfo jobInfo in result)
            {
                Assert.Equal(user2, jobInfo.Username);
            }
            Assert.Distinct(result.Select(jobInfo => jobInfo.Id));
        }
    }
}
