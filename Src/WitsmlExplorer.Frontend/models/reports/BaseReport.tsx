export default interface BaseReport {
  title: string;
  summary: string;
  reportItems: any[];
  dateTimeColumns?: string[];
  warningMessage?: string;
  hasFile?: boolean;
  jobDetails?: string;
}

export const createReport = (
  title = "",
  summary = "",
  reportItems: any[] = [],
  dateTimeColumns: string[] = null,
  warningMessage: string = null,
  hasFile: boolean = null,
  jobDetails: string = null
): BaseReport => {
  return {
    title,
    summary,
    reportItems,
    dateTimeColumns,
    warningMessage,
    hasFile,
    jobDetails
  };
};
