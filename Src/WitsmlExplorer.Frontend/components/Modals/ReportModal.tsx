import {
  Accordion,
  Banner,
  DotProgress,
  Icon,
  Typography
} from "@equinor/eds-core-react";
import {
  ContentTable,
  ContentTableColumn,
  ContentType
} from "components/ContentViews/table";
import { StyledAccordionHeader } from "components/Modals/LogComparisonModal";
import ModalDialog, { ModalWidth } from "components/Modals/ModalDialog";
import NavigationContext from "contexts/navigationContext";
import OperationContext from "contexts/operationContext";
import OperationType from "contexts/operationType";
import useExport from "hooks/useExport";
import BaseReport, { createReport } from "models/reports/BaseReport";
import React, { useContext, useEffect, useState } from "react";
import JobService from "services/jobService";
import NotificationService from "services/notificationService";
import styled from "styled-components";
import { Colors } from "styles/Colors";

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
  const {
    dispatchOperation,
    operationState: { colors }
  } = React.useContext(OperationContext);
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
        <ContentLayout>
          {report ? (
            <>
              {report.warningMessage && (
                <StyledBanner colors={colors}>
                  <Banner.Icon variant="warning">
                    <Icon name="infoCircle" />
                  </Banner.Icon>
                  <Banner.Message>{report.warningMessage}</Banner.Message>
                </StyledBanner>
              )}
              {report.summary?.includes("\n") ? (
                <Accordion>
                  <Accordion.Item>
                    <StyledAccordionHeader colors={colors}>
                      {report.summary.split("\n")[0]}
                    </StyledAccordionHeader>
                    <Accordion.Panel
                      style={{ backgroundColor: colors.ui.backgroundLight }}
                    >
                      <Typography style={{ whiteSpace: "pre-line" }}>
                        {report.summary.split("\n").splice(1).join("\n")}
                      </Typography>
                    </Accordion.Panel>
                  </Accordion.Item>
                </Accordion>
              ) : (
                <Typography>{report.summary}</Typography>
              )}
              {columns.length > 0 && report.downloadImmediately !== true && (
                <ContentTable
                  columns={columns}
                  data={report.reportItems}
                  downloadToCsvFileName={report.title.replace(/\s+/g, "")}
                />
              )}
            </>
          ) : (
            <>
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.5em" }}
              >
                <Typography
                  style={{ fontFamily: "EquinorMedium", fontSize: "1.125rem" }}
                >
                  Waiting for the job to finish.
                </Typography>
                <DotProgress />
              </div>
              <Typography>
                The report will also be available in the jobs view once the job
                is finished.
              </Typography>
            </>
          )}
        </ContentLayout>
      }
      onSubmit={() => dispatchOperation({ type: OperationType.HideModal })}
      isLoading={false}
    />
  );
};

export const useGetReportOnJobFinished = (jobId: string): BaseReport => {
  const { navigationState } = useContext(NavigationContext);
  const [report, setReport] = useState<BaseReport>(null);
  const { exportData, exportOptions } = useExport();

  if (!jobId) return null;

  const downloadData = (reportItems: any[], reportTitle: string) => {
    if (reportItems === null) {
      return;
    }

    const columns: ContentTableColumn[] =
      reportItems.length > 0
        ? Object.keys(reportItems[0]).map((key) => ({
            property: key,
            label: key,
            type: ContentType.String
          }))
        : [];

    const exportColumns = columns
      .map((column) => `${column.property}]`)
      .join(exportOptions.separator);

    const data = reportItems
      .map((row) =>
        columns
          .map((col) => row[col.property] as string)
          .join(exportOptions.separator)
      )
      .join(exportOptions.newLineCharacter);

    exportData(reportTitle, exportColumns, data);
  };

  useEffect(() => {
    const unsubscribeOnJobFinished =
      NotificationService.Instance.snackbarDispatcherAsEvent.subscribe(
        async (notification) => {
          if (notification.jobId === jobId) {
            const jobInfo = await JobService.getUserJobInfo(notification.jobId);
            if (!jobInfo) {
              setReport(
                createReport(
                  `The job has finished, but could not find job info for job ${jobId}`
                )
              );
            } else {
              setReport(jobInfo.report);
              if (jobInfo.report.downloadImmediately === true) {
                downloadData(jobInfo.report.reportItems, jobInfo.report.title);
              }
            }
          }
        }
      );
    const unsubscribeOnJobFailed =
      NotificationService.Instance.alertDispatcherAsEvent.subscribe(
        async (notification) => {
          if (notification.jobId === jobId) {
            setReport(createReport(notification.message, notification.reason));
          }
        }
      );

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

const StyledBanner = styled(Banner)<{ colors: Colors }>`
  background-color: ${(props) => props.colors.ui.backgroundDefault};
  span {
    background-color: ${(props) => props.colors.ui.backgroundDefault};
    color: ${(props) => props.colors.infographic.primaryMossGreen};
  }
  div {
    background-color: ${(props) => props.colors.ui.backgroundDefault};
  }
  p {
    color: ${(props) => props.colors.infographic.primaryMossGreen};
  }
  hr {
    background-color: ${(props) => props.colors.ui.backgroundDefault};
  }
`;
