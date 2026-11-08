using System;
using System.Collections.Generic;
using System.Threading;

using Microsoft.AspNetCore.SignalR;

namespace WitsmlExplorer.Api.Services
{
    public class JobProgress
    {
        public JobProgress(string jobId, double progress, string currentStage = null, string objectName = null, string mnemonic = null, string currentIndex = null, string indexRange = null)
        {
            JobId = jobId;
            Progress = progress;
            CurrentStage = currentStage;
            ObjectName = objectName;
            Mnemonic = mnemonic;
            CurrentIndex = currentIndex;
            IndexRange = indexRange;
        }
        public string JobId { get; set; }
        public double Progress { get; set; }
        public string CurrentStage { get; set; }
        public string ObjectName { get; set; }
        public string Mnemonic { get; set; }
        public string CurrentIndex { get; set; }
        public string IndexRange { get; set; }
    }

    public class JobProgressInfo
    {
        public double Progress { get; set; }
        public string CurrentStage { get; set; }
        public string ObjectName { get; set; }
        public string Mnemonic { get; set; }
        public string CurrentIndex { get; set; }
        public string IndexRange { get; set; }
    }

    public interface IJobProgressService
    {
        void ReportProgress(JobProgress jobProgress);
    }

    public class JobProgressService : IJobProgressService
    {
        private readonly IHubContext<NotificationsHub> _hubContext;
        private readonly Dictionary<string, JobProgressInfo> _pendingProgresses;
        private readonly Dictionary<string, JobProgressInfo> _activeJobStates;
        private Timer _sendTimer;

        public JobProgressService(IHubContext<NotificationsHub> hubContext)
        {
            _pendingProgresses = new();
            _activeJobStates = new();
            _hubContext = hubContext;
        }

        public void ReportProgress(JobProgress jobProgress)
        {
            if (jobProgress?.JobId != null)
            {
                lock (_pendingProgresses)
                {
                    if (!_activeJobStates.TryGetValue(jobProgress.JobId, out var state))
                    {
                        state = new JobProgressInfo();
                        _activeJobStates[jobProgress.JobId] = state;
                    }

                    state.Progress = jobProgress.Progress;
                    if (!string.IsNullOrEmpty(jobProgress.CurrentStage)) state.CurrentStage = jobProgress.CurrentStage;
                    if (!string.IsNullOrEmpty(jobProgress.ObjectName)) state.ObjectName = jobProgress.ObjectName;
                    if (!string.IsNullOrEmpty(jobProgress.Mnemonic)) state.Mnemonic = jobProgress.Mnemonic;
                    if (!string.IsNullOrEmpty(jobProgress.CurrentIndex)) state.CurrentIndex = jobProgress.CurrentIndex;
                    if (!string.IsNullOrEmpty(jobProgress.IndexRange)) state.IndexRange = jobProgress.IndexRange;

                    _pendingProgresses[jobProgress.JobId] = new JobProgressInfo
                    {
                        Progress = state.Progress,
                        CurrentStage = state.CurrentStage,
                        ObjectName = state.ObjectName,
                        Mnemonic = state.Mnemonic,
                        CurrentIndex = state.CurrentIndex,
                        IndexRange = state.IndexRange
                    };

                    if (jobProgress.Progress >= 1.0)
                    {
                        _activeJobStates.Remove(jobProgress.JobId);
                    }

                    _sendTimer ??= new Timer(SendProgresses, null, TimeSpan.FromSeconds(1), TimeSpan.FromSeconds(1));
                }
            }
        }

        private void SendProgresses(object state)
        {
            Dictionary<string, JobProgressInfo> progressesToSend;
            lock (_pendingProgresses)
            {
                if (_pendingProgresses.Count == 0)
                {
                    _sendTimer?.Dispose();
                    _sendTimer = null;
                    return;
                }
                progressesToSend = new Dictionary<string, JobProgressInfo>(_pendingProgresses);
                _pendingProgresses.Clear();
            }
            if (progressesToSend.Count > 0)
            {
                _hubContext.Clients.Group("jobProgress").SendAsync("jobProgress", progressesToSend);
            }
        }
    }
}
