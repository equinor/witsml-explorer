using System;

namespace WitsmlExplorer.Api.Jobs
{
    public abstract record Job
    {
        private JobInfo _jobInfo;

        public abstract string Description();
        public abstract string GetWellName();
        public abstract string GetWellboreName();
        public abstract string GetObjectName();
        protected virtual bool IsCancelable { get; } = false;
        protected virtual bool IsSlowJob { get; } = false;
        public IProgress<double> ProgressReporter { get; set; }
        public IProgress<JobProgressUpdate> ProgressUpdateReporter { get; set; }

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
                _jobInfo.IsCancelable = IsCancelable;
                _jobInfo.IsSlowJob = IsSlowJob;
            }
        }

    }

    public class JobProgressUpdate
    {
        public double Progress { get; init; }
        public string CurrentStage { get; init; }
        public string ObjectName { get; init; }
        public string Mnemonic { get; init; }
        public string CurrentIndex { get; init; }
        public string IndexRange { get; init; }

        public JobProgressUpdate(double progress, string currentStage = null, string objectName = null, string mnemonic = null, string currentIndex = null, string indexRange = null)
        {
            Progress = progress;
            CurrentStage = currentStage;
            ObjectName = objectName;
            Mnemonic = mnemonic;
            CurrentIndex = currentIndex;
            IndexRange = indexRange;
        }
    }
}
