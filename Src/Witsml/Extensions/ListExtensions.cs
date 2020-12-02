using System.Collections.Generic;

namespace Witsml.Extensions
{
    public static class ListExtensions
    {
        public static List<T> AsSingletonList<T>(this T item)
        {
            return new List<T>(new T[] { item });
        }
    }
}
