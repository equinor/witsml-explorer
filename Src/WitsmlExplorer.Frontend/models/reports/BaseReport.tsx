export enum ReportItemType {
  String = "string",
  Number = "number",
  DateTime = "datetime",
  Measure = "measure"
}

export interface ReportItemColumn {
  name: string;
  type: ReportItemType;
}

export default interface BaseReport {
  title: string;
  summary: string;
  reportItems: any[];
  reportItemColumns?: ReportItemColumn[];
  warningMessage?: string;
  hasFile?: boolean;
  jobDetails?: string;
}

export const createReport = (
  title = "",
  summary = "",
  reportItems: any[] = [],
  reportColumns: ReportItemColumn[] = null,
  warningMessage: string = null,
  hasFile: boolean = null,
  jobDetails: string = null
): BaseReport => {
  return {
    title,
    summary,
    reportItems,
    reportItemColumns: reportColumns,
    warningMessage,
    hasFile,
    jobDetails
  };
};
