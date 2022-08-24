using System;

namespace WitsmlExplorer.Api.Jobs
{
    public record JobInfo
    {

        public JobInfo()
        {
            Id = Guid.NewGuid().ToString();
            StartTime = DateTime.Now;
            Status = JobStatus.Ordered;
        }

        public string JobType { get; internal set; }

        public string Description { get; internal set; }

        public string Id { get; init; }

        public string Username { get; set; }

        public string Server { get; set; }

        public DateTime StartTime { get; init; }

        public DateTime? EndTime { get; private set; }

        public DateTime KillTime { get; set; }

        private JobStatus _status;

        public JobStatus Status
        {
            get { return _status; }
            set
            {
                if (value == JobStatus.Finished || value == JobStatus.Failed)
                {
                    EndTime = DateTime.Now;
                }
                _status = value;
            }
        }

    }

    public enum JobStatus
    {
        Ordered,
        Started,
        Finished,
        Failed
    }
}
