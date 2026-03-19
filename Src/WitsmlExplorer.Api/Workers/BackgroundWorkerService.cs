using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Hosting;

using Serilog;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers
{
    public class BackgroundWorkerService : BackgroundService
    {
        private readonly IJobQueue _jobQueue;
        private readonly IHubContext<NotificationsHub> _hubContext;
        private const int NumberOfRegularThreadsToUse = 2;

        public BackgroundWorkerService(IJobQueue jobQueue, IHubContext<NotificationsHub> hubContext)
        {
            _jobQueue = jobQueue;
            _hubContext = hubContext;
        }

        public override Task StopAsync(CancellationToken cancellationToken)
        {
            Log.Warning("Background worker is stopping due to a host shutdown. Any queued jobs might be removed");
            return base.StopAsync(cancellationToken);
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            List<Task> backgroundWorkers = new();
            for (int i = 0; i < NumberOfRegularThreadsToUse; i++)
            {
                backgroundWorkers.Add(BackgroundProcessing(stoppingToken, isSlowLane: false));
            }

            // Slow jobs run in a dedicated single lane so at most one slow job executes at a time.
            backgroundWorkers.Add(BackgroundProcessing(stoppingToken, isSlowLane: true));

            await Task.WhenAll(backgroundWorkers);
        }

        private async Task BackgroundProcessing(CancellationToken cancellationToken, bool isSlowLane)
        {
            Log.Information("Background processing {lane} thread is started", isSlowLane ? "slow" : "regular");

            while (!cancellationToken.IsCancellationRequested)
            {
                QueuedJob job = isSlowLane ? _jobQueue.DequeueSlow() : _jobQueue.DequeueRegular();
                if (job == null)
                {
                    await Task.Delay(500, cancellationToken);
                    continue;
                }

                try
                {
                    (WorkerResult result, RefreshAction refreshAction) = await job.Run();

                    if (_hubContext == null)
                    {
                        continue;
                    }

                    await _hubContext.Clients.All.SendCoreAsync("jobFinished", new object[] { result }, cancellationToken);

                    if (refreshAction != null)
                    {
                        await _hubContext.Clients.All.SendCoreAsync("refresh", new object[] { refreshAction }, cancellationToken);
                    }
                }
                catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
                {
                    throw;
                }
                catch (System.Exception ex)
                {
                    Log.Error(ex, "Unexpected exception while executing queued {lane} job", isSlowLane ? "slow" : "regular");
                }
            }
        }
    }
}
