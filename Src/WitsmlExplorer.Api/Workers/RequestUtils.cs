using System;
using System.ServiceModel;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

namespace WitsmlExplorer.Api.Workers
{
    public class RequestUtils
    {
        public static async Task<T> WithRetry<T>(Func<Task<T>> func, ILogger logger)
        {
            try
            {
                return await Task.Run(func);
            }
            catch (Exception ex) when (ex is TimeoutException or CommunicationException)
            {
                logger?.LogWarning("Attempting retry after an exception has occured: {Exception}", ex);
            }
            await Task.Delay(60000);
            return await Task.Run(func);
        }
    }
}
