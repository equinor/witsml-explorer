using System;

namespace WitsmlExplorer.Api.Jobs
{
    public record JobInfo
    {

        public JobInfo()
        {
            Id = Guid.NewGuid().ToString();
            StartTime = DateTime.Now;
        }

        public string JobType { get; internal set; }

        public string Description { get; internal set; }

        public string Id { get; init; }

        public DateTime StartTime { get; init; }

        public DateTime KillTime { get; set; }
    }
}
