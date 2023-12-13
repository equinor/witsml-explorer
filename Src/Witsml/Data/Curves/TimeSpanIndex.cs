using System;
using System.Globalization;

namespace Witsml.Data.Curves;

/// <summary>
/// Index of time span.
/// </summary>
public class TimeSpanIndex : Index
{
    public TimeSpan Value { get; }

    public TimeSpanIndex(TimeSpan value)
    {
        Value = value;
    }

    public TimeSpanIndex(long milliseconds)
    {
        Value = TimeSpan.FromMilliseconds(milliseconds);
    }

    [Obsolete("AddEpsilon is deprecated due to assuming 3 decimals of precision for depth indexes. Some WITSML servers do not use 3 decimals.")]
    public override Index AddEpsilon()
    {
        throw new System.NotImplementedException();
    }

    public override int CompareTo(Index that)
    {
        TimeSpanIndex thatWitsmlTimeSpan = (TimeSpanIndex)that;
        return Value.CompareTo(thatWitsmlTimeSpan.Value);
    }

    public override string GetValueAsString()
    {
        return Value.ToString(CommonConstants.TimeSpanIndex.Pattern, CultureInfo.InvariantCulture);
    }

    public override bool IsContinuous(Index that)
    {
        TimeSpanIndex thatWitsmlTimeSpan = (TimeSpanIndex)that;
        TimeSpan timespan = Value - thatWitsmlTimeSpan.Value;
        return Math.Abs(timespan.Seconds) < 10;
    }

    public override bool IsNegative()
    {
        return false;
    }

    public override bool IsNullValue()
    {
        return Value == TimeSpan.Zero;
    }

    public override string ToString()
    {
        return GetValueAsString();
    }
}
