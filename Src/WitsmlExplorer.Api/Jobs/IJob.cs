using System;

namespace WitsmlExplorer.Api.Jobs
{
    public abstract record IJob
    {

        public IJob()
        {
            Id = Guid.NewGuid().ToString();
            StartTime = DateTime.Now;
        }

        public abstract string Description();

        public string Id { get; init; }

        public DateTime StartTime { get; init; }
    }
}
