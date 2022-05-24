using System.Collections.Generic;
using System.Globalization;
using System.Linq;

namespace Witsml.Data.Curves
{
    public class Row
    {
        public Index Index { get; }
        public IEnumerable<CurveValue> Values { get; }

        public Row(string commaSeparated)
        {
            var row = commaSeparated.Split(",");
            if (DateTimeIndex.TryParseISODate(row.First(), out var witsmlDateTime))
            {
                Index = witsmlDateTime;
            }
            else
            {
                Index = new DepthIndex(double.Parse(row.First(), CultureInfo.InvariantCulture));
            }

            Values = row[1..].Select(CurveValue.From);
        }
    }
}
