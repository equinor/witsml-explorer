using System;

namespace WitsmlExplorer.Api.Workers
{
    public class WorkerResult
    {
        public WorkerResult(Uri serverUrl, bool isSuccess, string message, string reason = null, EntityDescription description = null, string jobId = null, Uri sourceServerUrl = null)
        {
            ServerUrl = serverUrl;
            SourceServerUrl = sourceServerUrl;
            IsSuccess = isSuccess;
            Message = message;
            Reason = reason;
            Description = description;
            JobId = jobId;
        }

        public Uri ServerUrl { get; }
        public Uri SourceServerUrl { get; }
        public bool IsSuccess { get; }
        public string Message { get; }
        public string Reason { get; }
        public EntityDescription Description { get; }
        public string JobId { get; }
    }

    public class EntityDescription
    {
        public string WellName { get; set; }
        public string WellboreName { get; set; }
        public string ObjectName { get; set; }
    }
}
