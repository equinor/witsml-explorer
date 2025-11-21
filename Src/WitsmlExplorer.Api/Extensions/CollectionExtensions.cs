using System.Collections.Generic;
using System.Linq;

namespace WitsmlExplorer.Api.Extensions;

/// <summary>
/// A class which contains useful methods for processing collections.
/// </summary>
public static class CollectionExtensions
{
    /// <summary>
    /// Checks whether <paramref name="enumerable"/> is null or empty.
    /// </summary>
    /// <typeparam name="T">The type of the <paramref name="enumerable"/>.</typeparam>
    /// <param name="enumerable">The <see cref="IEnumerable{T}"/> to be checked.</param>
    /// <returns>True if <paramref name="enumerable"/> is null or empty, false otherwise.</returns>
    public static bool IsNullOrEmpty<T>(this IEnumerable<T> enumerable)
    {
        return enumerable == null || !enumerable.Any();
    }
}

