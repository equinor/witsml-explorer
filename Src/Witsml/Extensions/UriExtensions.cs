using System;

namespace Witsml.Extensions;

public static class UriExtensions
{
    /// <summary>
    /// Determines whether two specified Uri objects have the same value ignore case.
    /// </summary>
    /// The first Uri to compare.
    /// The second Uri to compare.
    /// <returns>True if the value of the <paramref name="firstUri" /> parameter is equal to the value of the <paramref name="secondUri" />, otherwise return false.</returns>
    public static bool EqualsIgnoreCase(this Uri firstUri, Uri secondUri)
    {
        return string.Equals(firstUri?.AbsoluteUri, secondUri?.AbsoluteUri, StringComparison.OrdinalIgnoreCase);
    }
}
