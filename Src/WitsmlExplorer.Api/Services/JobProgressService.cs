using System;

using WitsmlExplorer.Api.Jobs;

namespace WitsmlExplorer.Api.Services
{
    public interface IJobProgressService
    {
        void Setup(JobInfo jobInfo, double start = 0, double end = double.MaxValue);
        void SetCurrent(double current);
    }

    public class JobProgressService : IJobProgressService
    {
        private JobInfo _jobInfo;
        private double _start;
        private double _end;
        private double _current;

        public void Setup(JobInfo jobInfo, double start = 0.0, double end = double.MaxValue)
        {
            if (jobInfo == null)
            {
                throw new InvalidOperationException("_jobInfo not set!");
            }

            _jobInfo = jobInfo;
            _start = start < end ? start : end;
            _end = end;
            _current = _start;

            UpdateJobProgress();
        }

        public void SetCurrent(double current)
        {
            if (_jobInfo != null)
            {
                if (current > _end)
                {
                    _current = _end;
                    UpdateJobProgress();
                }
                else if (current > _current)
                {
                    _current = current;
                    UpdateJobProgress();
                }
            }
        }

        private void UpdateJobProgress()
        {
            if (_jobInfo != null)
            {
                if (_start >= _end)
                {
                    _jobInfo.Progress = 100;
                }
                else
                {
                    _jobInfo.Progress = (int)Math.Floor((_current - _start) / (_end - _start) * 100.0);
                }
            }
        }
    }
}
