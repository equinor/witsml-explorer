using System;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers
{
    /// <summary>
    /// Periodically removes abandoned chunked uploads from the temporary upload directory.
    /// </summary>
    public class UploadCleanupService : BackgroundService
    {
        private static readonly TimeSpan Interval = TimeSpan.FromHours(1);
        private static readonly TimeSpan MaxUploadAge = TimeSpan.FromHours(24);
        private readonly ILogUploadService _uploadService;
        private readonly ILogger<UploadCleanupService> _logger;

        public UploadCleanupService(ILogUploadService uploadService, ILogger<UploadCleanupService> logger)
        {
            _uploadService = uploadService;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            using PeriodicTimer timer = new(Interval);
            do
            {
                try
                {
                    _uploadService.DeleteExpiredUploads(MaxUploadAge);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to clean up expired uploads");
                }
            }
            while (await timer.WaitForNextTickAsync(stoppingToken).ConfigureAwait(false));
        }
    }
}
