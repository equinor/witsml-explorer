export default interface BaseReport {
  title: string;
  summary: string;
  reportItems: any[];
  warningMessage?: string;
}

export const createReport = (
  title = "",
  summary = "",
  reportItems: any[] = [],
  warningMessage: string = null
): BaseReport => {
  return {
    title,
    summary,
    reportItems,
    warningMessage
  };
};
