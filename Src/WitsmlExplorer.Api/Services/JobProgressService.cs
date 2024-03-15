using System;
using System.Collections.Generic;
using System.Threading;

using Microsoft.AspNetCore.SignalR;

namespace WitsmlExplorer.Api.Services
{
    public class JobProgress
    {
        public JobProgress(string jobId, double progress)
        {
            JobId = jobId;
            Progress = progress;
        }
        public string JobId { get; set; }
        public double Progress { get; set; }
    }

    public interface IJobProgressService
    {
        void ReportProgress(JobProgress jobProgress);
    }

    public class JobProgressService : IJobProgressService
    {
        private readonly IHubContext<NotificationsHub> _hubContext;
        private readonly Dictionary<string, double> _jobProgresses;
        private Timer _sendTimer;

        public JobProgressService(IHubContext<NotificationsHub> hubContext)
        {
            _jobProgresses = new();
            _hubContext = hubContext;
        }

        public void ReportProgress(JobProgress jobProgress)
        {
            if (jobProgress?.JobId != null)
            {
                lock (_jobProgresses)
                {
                    _jobProgresses[jobProgress.JobId] = jobProgress.Progress;
                    _sendTimer ??= new Timer(SendProgresses, null, TimeSpan.FromSeconds(1), TimeSpan.FromSeconds(1));
                }
            }
        }

        private void SendProgresses(object state)
        {
            Dictionary<string, double> progressesToSend;
            lock (_jobProgresses)
            {
                if (_jobProgresses.Count == 0)
                {
                    _sendTimer?.Dispose();
                    _sendTimer = null;
                    return;
                }
                progressesToSend = new Dictionary<string, double>(_jobProgresses);
                _jobProgresses.Clear();
            }
            if (progressesToSend.Count > 0)
            {
                _hubContext.Clients.Group("jobProgress").SendAsync("jobProgress", progressesToSend);
            }
        }
    }
}
