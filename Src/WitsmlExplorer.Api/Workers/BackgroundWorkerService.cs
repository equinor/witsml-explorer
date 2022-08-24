using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Hosting;

using Serilog;

using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers
{
    public class BackgroundWorkerService : BackgroundService
    {
        private readonly IJobQueue _jobQueue;
        private readonly IHubContext<NotificationsHub> _hubContext;
        private const int NumberOfThreadsToUse = 2;

        public BackgroundWorkerService(IJobQueue jobQueue, IHubContext<NotificationsHub> hubContext)
        {
            this._jobQueue = jobQueue;
            this._hubContext = hubContext;
        }

        public override Task StopAsync(CancellationToken cancellationToken)
        {
            Log.Warning("Background worker is stopping due to a host shutdown. Any queued jobs might be removed");
            return base.StopAsync(cancellationToken);
        }

        protected override async Task ExecuteAsync(CancellationToken cancellationToken)
        {
            var backgroundWorkers = new List<Task>();
            for (var i = 0; i < NumberOfThreadsToUse; i++)
                backgroundWorkers.Add(BackgroundProcessing(cancellationToken));

            await Task.WhenAny(backgroundWorkers);
        }

        private async Task BackgroundProcessing(CancellationToken cancellationToken)
        {
            Log.Information("Background processing thread is started");

            while (!cancellationToken.IsCancellationRequested)
            {
                var job = _jobQueue.Dequeue();
                if (job == null)
                {
                    await Task.Delay(500, cancellationToken);
                    continue;
                }

                var (result, refreshAction) = await job;

                if (_hubContext == null) continue;

                await _hubContext.Clients.All.SendCoreAsync("jobFinished", new object[] { result }, cancellationToken);

                if (refreshAction != null)
                    await _hubContext.Clients.All.SendCoreAsync("refresh", new object[] { refreshAction }, cancellationToken);
            }
        }
    }
}
