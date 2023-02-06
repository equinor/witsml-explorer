namespace WitsmlExplorer.Api.Jobs
{
    public abstract record Job
    {
        private JobInfo _jobInfo;

        public abstract string Description();
        public abstract string GetWellName();
        public abstract string GetWellboreName();
        public abstract string GetObjectName();

        public JobInfo JobInfo
        {
            get => _jobInfo;
            set
            {
                _jobInfo = value;
                _jobInfo.Description = Description();
                _jobInfo.JobType = GetType().Name;
                _jobInfo.ObjectName = GetObjectName();
                _jobInfo.WellboreName = GetWellboreName();
                _jobInfo.WellName = GetWellName();
            }
        }

        public string ConnectionId { get; init; }

    }
}
