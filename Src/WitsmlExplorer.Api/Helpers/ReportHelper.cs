using System.Collections.Generic;
using System.IO;
using System.Linq;

using Microsoft.Azure.Cosmos.Linq;

using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Helpers
{

    public class ContentTableColumn
    {
        public string Property { get; set; }
        public string Label { get; set; }
        public ContentType Type { get; set; }
    }

    public enum ContentType
    {
        String
    }

    public class ReportHelper
    {
        public static (string header, string body) GenerateReport(ICollection<Dictionary<string, LogDataValue>> reportItems, string reportHeader)
        {

            int a = 10;

            var columns = reportItems.Count > 0 ?
                reportItems.First().Keys.Select(key => new ContentTableColumn
                {
                    Property = key,
                    Label = key,
                    Type = ContentType.String
                }).ToList()
                : [];

            var exportColumns = reportHeader ?? string.Join(DefaultExportProperties.Separator, columns.Select(column => column.Property));



            var data = string.Join(DefaultExportProperties.NewLineCharacter,
                reportItems.Select(row =>
                string.Join(DefaultExportProperties.Separator,
                    columns.Select(col => row.TryGetValue(col.Property, out LogDataValue value) ? value.Value.ToString() : string.Empty))));



            return (exportColumns, data);
        }
    }
}
