export default interface BaseReport {
  title: string;
  summary: string;
  reportItems: any[];
  warningMessage?: string;
  hasFile?: boolean;
  jobDetails?: string;
}

export const createReport = (
  title = "",
  summary = "",
  reportItems: any[] = [],
  warningMessage: string = null,
  hasFile: boolean = null,
  jobDetails: string = null
): BaseReport => {
  return {
    title,
    summary,
    reportItems,
    warningMessage,
    hasFile,
    jobDetails
  };
};
