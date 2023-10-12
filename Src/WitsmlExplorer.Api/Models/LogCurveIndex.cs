using Index = Witsml.Data.Curves.Index;

namespace WitsmlExplorer.Api.Models;

/// <summary>
/// Common model of curve min max index values.
/// </summary>
public class LogCurveIndex
{
    /// <summary>
    /// Min index of curve.
    /// </summary>
    public Index MinIndex { get; set; }
    /// <summary>
    /// Max index of curve.
    /// </summary>
    public Index MaxIndex { get; set; }
}
