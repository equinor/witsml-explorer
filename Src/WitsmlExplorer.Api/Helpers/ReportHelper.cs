using System.Collections.Generic;
using System.Linq;

using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Helpers
{
    /// <summary>
    /// Content type enumeration
    /// </summary>
    public enum ContentType
    {
        String,
        Number,
        DateTime,
        Measure,
        Component
    }

    /// <summary>
    /// Helper class for generating reports
    /// </summary>
    public class ReportHelper
    {
        // csv separator character
        const char Separator = ',';
        // new line character (LineFeed only)
        const char NewLineCharacter = '\n';

        /// <summary>
        /// Generates log report
        /// </summary>
        /// <param name="reportItems">Collection of report log data</param>
        /// <param name="reportHeader">Report header string</param>
        /// <returns>Report header and report body as separate strings</returns>
        public static (string header, string body) GenerateReport(ICollection<Dictionary<string, LogDataValue>> reportItems, string reportHeader)
        {
            var columns = reportItems.Count > 0 ?
                reportItems.First().Keys.Select(key => new
                {
                    Property = key,
                    Label = key,
                    Type = ContentType.String
                }).ToList()
                : [];

            var exportColumns = reportHeader ?? string.Join(Separator, columns.Select(column => column.Property));


            var data = string.Join(NewLineCharacter,
                reportItems.Select(row =>
                string.Join(Separator,
                    columns.Select(col => row.TryGetValue(col.Property, out LogDataValue value) ? value.Value.ToString() : string.Empty))));

            return (exportColumns, data);
        }
    }
}
