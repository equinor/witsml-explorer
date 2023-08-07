export default interface BaseReport {
  title: string;
  summary: string;
  reportItems: any[];
}

export const createReport = (title = "", summary = "", reportItems: any[] = []): BaseReport => {
  return {
    title,
    summary,
    reportItems
  };
};
