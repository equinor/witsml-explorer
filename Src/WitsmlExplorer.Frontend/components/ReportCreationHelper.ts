import { ContentTableColumn, ContentType } from "./ContentViews/table";
import { defaultExportProperties } from "models/exportProperties";

export interface ReportProperties {
  columns: string;
  data: string;
}

export const generateReport = (
  reportItems: object[],
  reportHeader: string
) => {

  const columns: ContentTableColumn[] =
    reportItems.length > 0
      ? Object.keys(reportItems[0]).map((key) => ({
        property: key,
        label: key,
        type: ContentType.String
      }))
      : [];

  const exportColumns =
    reportHeader !== null
      ? reportHeader
      : columns
        .map((column) => `${column.property}`)
        .join(defaultExportProperties.separator);

  const data = reportItems
    .map((row) =>
      columns
        .map((col) => row[col.property] as string)
        .join(defaultExportProperties.separator)
    )
    .join(defaultExportProperties.newLineCharacter);

  return ({ exportColumns: exportColumns, data: data })
}