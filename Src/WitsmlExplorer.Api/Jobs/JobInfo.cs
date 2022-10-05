using System;
using System.Text.Json.Serialization;

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

        public string WitsmlUsername { get; set; }

        public string SourceServer { get; set; }

        public string TargetServer { get; set; }

        public DateTime StartTime { get; init; }

        public DateTime? EndTime { get; private set; }

        public DateTime KillTime { get; set; }

        public string FailedReason { get; set; }

        private JobStatus _status;

        [JsonConverter(typeof(JsonStringEnumConverter))]
        public JobStatus Status
        {
            get => _status;
            set
            {
                if (value is JobStatus.Finished or JobStatus.Failed)
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
