namespace WitsmlExplorer.Api.Jobs
{
    public abstract record Job
    {
        private JobInfo _jobInfo;

        public abstract string Description();

        public JobInfo JobInfo
        {
            get => _jobInfo;
            set
            {
                _jobInfo = value;
                _jobInfo.Description = Description();
                _jobInfo.JobType = GetType().Name;
            }
        }

    }
}
