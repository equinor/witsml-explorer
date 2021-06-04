using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WitsmlExplorer.Api.Extensions
{
    public static class CollectionExtensions
    {
        public static IEnumerable<IEnumerable<T>> Chunk<T>(this IEnumerable<T> data, int chunkSize)
        {
            return data
              .Select((x, i) => new { Index = i, Value = x })
              .GroupBy(x => x.Index / chunkSize)
              .Select(x => x.Select(v => v.Value));
        }
    }
}
