using System.Collections.Generic;

namespace Witsml.Extensions
{
    public static class ListExtensions
    {
        public static List<T> AsSingletonList<T>(this T item)
        {
            return new List<T> { item };
        }

        public static ICollection<T> AsCollection<T>(this IList<T> list)
        {
            return list;
        }
    }
}
