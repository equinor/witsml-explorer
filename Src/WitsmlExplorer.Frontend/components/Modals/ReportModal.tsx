import { DotProgress, Typography } from "@equinor/eds-core-react";
import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import NavigationContext from "../../contexts/navigationContext";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import BaseReport, { createReport } from "../../models/reports/BaseReport";
import JobService from "../../services/jobService";
import NotificationService from "../../services/notificationService";
import { ContentTable, ContentTableColumn, ContentType } from "../ContentViews/table";
import ModalDialog, { ModalWidth } from "./ModalDialog";

export interface ReportModal {
  report?: BaseReport;
  jobId?: string;
}

/**
 * A modal component to display a report.
 *
 * Either `report` or `jobId` must be set, but not both. If `jobId` is set, the component will subscribe to NotificationService events
 * until the job has finished or failed.
 *
 * @component
 * @param {BaseReport} props.report - The report to display.
 * @param {string} props.jobId - The ID of the job to monitor.
 *
 * @returns {React.ReactElement} The rendered ReportModal component.
 */
export const ReportModal = (props: ReportModal): React.ReactElement => {
  const { jobId, report: reportProp } = props;
  const { operationState, dispatchOperation } = React.useContext(OperationContext);
  const { colors } = operationState;
  const [report, setReport] = useState<BaseReport>(reportProp);
  const fetchedReport = useGetReportOnJobFinished(jobId);

  useEffect(() => {
    if (fetchedReport) setReport(fetchedReport);
  }, [fetchedReport]);

  const columns: ContentTableColumn[] = React.useMemo(
    () =>
      report && report.reportItems.length > 0
        ? Object.keys(report.reportItems[0]).map((key) => ({
            property: key,
            label: key,
            type: ContentType.String
          }))
        : [],
    [report]
  );

  return (
    <ModalDialog
      width={ModalWidth.LARGE}
      heading={report ? report.title : "Loading report..."}
      confirmText="Ok"
      showCancelButton={false}
      content={
        <>
          {report ? (
            <ContentLayout>
              {report.summary && <Typography style={{ color: colors.text.staticIconsDefault }}>{report.summary}</Typography>}
              {columns.length > 0 && <ContentTable columns={columns} data={report.reportItems} downloadToCsvFileName={report.title.replace(/\s+/g, "")} />}
            </ContentLayout>
          ) : (
            <ContentLayout>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5em" }}>
                <Typography style={{ fontFamily: "EquinorMedium", fontSize: "1.125rem", color: colors.text.staticIconsDefault }}>Waiting for job to finish.</Typography>
                <DotProgress />
              </div>
              <Typography style={{ color: colors.text.staticIconsDefault }}>The report can also be found in the Jobs view.</Typography>
            </ContentLayout>
          )}
        </>
      }
      onSubmit={() => dispatchOperation({ type: OperationType.HideModal })}
      isLoading={false}
    />
  );
};

export const useGetReportOnJobFinished = (jobId: string): BaseReport => {
  const { navigationState } = useContext(NavigationContext);
  const [report, setReport] = useState<BaseReport>(null);

  if (!jobId) return null;

  useEffect(() => {
    const unsubscribeOnJobFinished = NotificationService.Instance.snackbarDispatcherAsEvent.subscribe(async (notification) => {
      if (notification.jobId === jobId) {
        const jobInfo = await JobService.getUserJobInfo(notification.jobId);
        if (!jobInfo) {
          setReport(createReport(`The job has finished, but could not find job info for job ${jobId}`));
        } else {
          setReport(jobInfo.report);
        }
      }
    });
    const unsubscribeOnJobFailed = NotificationService.Instance.alertDispatcherAsEvent.subscribe(async (notification) => {
      if (notification.jobId === jobId) {
        setReport(createReport(notification.message, notification.reason));
      }
    });

    return function cleanup() {
      unsubscribeOnJobFinished();
      unsubscribeOnJobFailed();
    };
  }, [navigationState.selectedServer, jobId]);

  return report;
};

const ContentLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  justify-content: space-between;
  margin: 1em 0.2em 1em 0.2em;
  max-height: 65vh;
`;
