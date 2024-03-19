using OpenTelemetry.Metrics;

namespace Witsml.Metrics;

public static class WitsmlMetricsExtensions
{
    // ReSharper disable once UnusedMember.Global (For usage by external applications)
    public static MeterProviderBuilder AddWitsmlInstrumentation(this MeterProviderBuilder builder)
    {
        builder.AddMeter(WitsmlMetrics.MeterName);
        builder.AddView("witsml.requests.duration", new ExplicitBucketHistogramConfiguration()
        {
            Boundaries = [0.5, 1, 3, 5, 10, 15, 30, 60]
        });
        return builder;
    }
}
