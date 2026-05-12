using System;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Hosting;

using Serilog;

using WitsmlExplorer.Api.Services.ETP;

namespace WitsmlExplorer.Api.Workers;

public class EtpSessionCleanupWorker : BackgroundService
{
    private readonly IEtpSessionManager _sessionManager;
    private readonly TimeSpan _cleanupInterval;

    public EtpSessionCleanupWorker(IEtpSessionManager sessionManager)
    {
        _sessionManager = sessionManager;
        _cleanupInterval = TimeSpan.FromMinutes(1);
    }

    protected override async Task ExecuteAsync(CancellationToken cancellationToken)
    {
        while (!cancellationToken.IsCancellationRequested)
        {
            try
            {
                await Task.Delay(_cleanupInterval, cancellationToken);
                await _sessionManager.CleanupExpiredSessionsAsync();
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                throw;
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Error during ETP session cleanup");
            }
        }
    }
}
