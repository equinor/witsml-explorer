using System;
using System.Text.Json.Serialization;

using WitsmlExplorer.Api.Models.Reports;

namespace WitsmlExplorer.Api.Jobs
{
    public record JobInfo
    {

        public JobInfo()
        {
            Id = Guid.NewGuid().ToString();
            StartTime = DateTime.Now;
            Status = JobStatus.Started;
            Progress = 0.0;
        }

        public string JobType { get; internal set; }

        public string Description { get; internal set; }

        public string Id { get; init; }

        public string Username { get; set; }

        public string WitsmlSourceUsername { get; set; }
        public string WitsmlTargetUsername { get; set; }

        public string SourceServer { get; set; }

        public string TargetServer { get; set; }

        public string WellName { get; set; }

        public string WellboreName { get; set; }

        public string ObjectName { get; set; }

        public DateTime StartTime { get; init; }

        public DateTime? EndTime { get; private set; }

        public DateTime KillTime { get; set; }

        public string FailedReason { get; set; }

        public double Progress { get; set; }

        public BaseReport Report { get; set; }

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
                    Progress = 1.0;
                }
                _status = value;
            }
        }

    }

    public enum JobStatus
    {
        Started,
        Finished,
        Failed
    }
}
