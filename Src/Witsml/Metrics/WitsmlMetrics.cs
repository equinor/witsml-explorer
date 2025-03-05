using System;
using System.Diagnostics;
using System.Diagnostics.Metrics;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;

using Serilog;

using Witsml.ServiceReference;

namespace Witsml.Metrics;

internal sealed class WitsmlMetrics
{
    #region Singleton
    // We still want to collect unified metrics in case there are multiple WitsmlClient instances used

    private static readonly Lazy<WitsmlMetrics> LazyInstance =
        new(() => new WitsmlMetrics());

    public static WitsmlMetrics Instance { get { return LazyInstance.Value; } }

    private WitsmlMetrics() { }

    #endregion

    private static readonly AssemblyName AssemblyName =
        typeof(WitsmlMetrics).Assembly.GetName();

    internal static readonly string MeterName = AssemblyName.Name;

    private static readonly Meter MeterInstance = new(MeterName, AssemblyName.Version!.ToString());

    private readonly Histogram<long> _requestDuration = MeterInstance.CreateHistogram<long>(
        "witsml.requests.duration",
        unit: "s",
        description: "Time spent during requests to a Witsml server");

    private readonly UpDownCounter<int> _activeRequests =
        MeterInstance.CreateUpDownCounter<int>(
            "witsml.requests.active",
            description: "Number of active requests");

    internal async Task<TResponseType> MeasureQuery<TResponseType>(Uri serverUri, WitsmlMethod method, string witsmlType, Task<TResponseType> wmlsTask, CancellationToken? cancellationToken = null)
        where TResponseType : IWitsmlResponse
    {
        var tagList = new TagList
        {
            { "host", serverUri.Host },
            { "method", Enum.GetName(method) },
            { "objectType", witsmlType },
        };

        Stopwatch timer = null;
        TResponseType response;
        try
        {
            _activeRequests.Add(1, tagList);
            timer = Stopwatch.StartNew();
            response = await wmlsTask.WaitAsync(cancellationToken ?? CancellationToken.None);
        }
        finally
        {
            timer?.Stop();
            _activeRequests.Add(-1, tagList);
        }

        tagList.Add("resultCode", response.GetResultCode());

        var elapsedSeconds = timer.ElapsedMilliseconds / 1000;
        _requestDuration.Record(elapsedSeconds, tagList);
        return response;
    }
}
