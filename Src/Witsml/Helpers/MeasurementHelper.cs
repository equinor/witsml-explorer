using System;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;

using Serilog;

namespace Witsml.Helpers;

/// <summary>
/// The class allows customization of the message for execution time logging.
/// </summary>
public class TimeMeasurer
{
    /// <summary>
    /// Gets or sets a delegate that takes an elapsed time in milliseconds and returns a log message.
    /// </summary>
    public Func<long, string> LogMessage { get; set; }
}

/// <summary>
/// Measures execution time of code and logging.
/// </summary>
public static class MeasurementHelper
{
    private const int MeasuredMethodNameStackTraceFrameDepth = 5;

    /// <summary>
    /// Measures the execution time of an asynchronous operation and provides the ability to customize the logging message.
    /// </summary>
    /// <param name="measureCode">A delegate representing the asynchronous operation to be measured.</param>
    /// <typeparam name="TResult">The type of result returned by the asynchronous operation.</typeparam>
    /// <returns>An asynchronous task that represents the result of the measured operation.</returns>
    public static async Task<TResult> MeasureExecutionTimeAsync<TResult>(Func<TimeMeasurer, Task<TResult>> measureCode)
    {
        var timeMeasurer = new TimeMeasurer();
        var stopwatch = new Stopwatch();
        var measuredMethodName = new StackTrace().GetFrames().Skip(MeasuredMethodNameStackTraceFrameDepth).FirstOrDefault()?.GetMethod()?.Name;

        stopwatch.Start();

        TResult result = await measureCode(timeMeasurer);

        stopwatch.Stop();

        if (timeMeasurer.LogMessage != null)
        {
            Log.Debug(timeMeasurer.LogMessage(stopwatch.ElapsedMilliseconds));
        }
        else
        {
            Log.Debug("The execution of the method '{MeasuredMethodName}' finished in {ElapsedMilliseconds}ms.", measuredMethodName, stopwatch.ElapsedMilliseconds);
        }

        return result;
    }
}
