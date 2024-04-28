import {
  Accordion,
  DotProgress,
  Icon,
  TextField,
  Typography
} from "@equinor/eds-core-react";
import {
  ContentTable,
  ContentTableColumn,
  ContentType
} from "components/ContentViews/table";
import { LabelsLayout } from "components/Modals/ComparisonModalStyles";
import { StyledAccordionHeader } from "components/Modals/LogComparisonModal";
import ModalDialog, { ModalWidth } from "components/Modals/ModalDialog";
import { generateReport } from "components/ReportCreationHelper";
import { Banner } from "components/StyledComponents/Banner";
import { useConnectedServer } from "contexts/connectedServerContext";
import OperationContext from "contexts/operationContext";
import OperationType from "contexts/operationType";
import useExport from "hooks/useExport";
import { useLiveJobProgress } from "hooks/useLiveJobProgress";
import BaseReport, { createReport } from "models/reports/BaseReport";
import React, { useEffect, useState } from "react";
import JobService from "services/jobService";
import NotificationService from "services/notificationService";
import styled from "styled-components";

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
  const jobProgress = useLiveJobProgress(jobId);
  const [isCancelable, setIsCancelable] = useState(false);

  useEffect(() => {
    if (fetchedReport) setReport(fetchedReport);
  }, [fetchedReport]);

  useEffect(() => {
    const fetchJobInfo = async () => {
      if (jobId) {
        const jobInfo = await JobService.getUserJobInfo(jobId);
        if (jobInfo !== null) {
          if (jobInfo.isCancelable === true) {
            setIsCancelable(true);
          }
        }
      }
    };
    fetchJobInfo();
  }, [jobId]);

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

  const onCancelButtonClick = () => {
    JobService.cancelJob(jobId);
    dispatchOperation({ type: OperationType.HideModal });
  };

  return (
    <ModalDialog
      width={ModalWidth.LARGE}
      heading={report ? report.title : "Loading report..."}
      confirmText="Ok"
      showCancelButton={!fetchedReport && isCancelable}
      content={
        <ContentLayout>
          {report ? (
            <>
              {report.jobDetails && (
                <LabelsLayout>
                  {report.jobDetails.split("|").map((jobDetail) => {
                    const keyValuePair = jobDetail.split("::");
                    return (
                      <TextField
                        key={keyValuePair[0].trim()}
                        readOnly
                        id={keyValuePair[0].trim()}
                        label={keyValuePair[0]}
                        defaultValue={keyValuePair[1]}
                      />
                    );
                  })}
                </LabelsLayout>
              )}
              {report.warningMessage && (
                <Banner colors={colors}>
                  <Banner.Icon variant="warning">
                    <Icon name="infoCircle" />
                  </Banner.Icon>
                  <Banner.Message>{report.warningMessage}</Banner.Message>
                </Banner>
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
                  {jobProgress > 0 ? ` ${Math.round(jobProgress * 100)}%` : ""}
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
      onCancel={() => onCancelButtonClick()}
      isLoading={false}
    />
  );
};

export const useGetReportOnJobFinished = (jobId: string): BaseReport => {
  const { connectedServer } = useConnectedServer();
  const [report, setReport] = useState<BaseReport>(null);
  const { exportData } = useExport();

  if (!jobId) return null;

  useEffect(() => {
    const unsubscribeOnJobFinished =
      NotificationService.Instance.snackbarDispatcherAsEvent.subscribe(
        async (notification) => {
          if (notification.jobId === jobId) {
            const report = await JobService.getReport(jobId);
            if (!report) {
              setReport(
                createReport(
                  `The job has finished, but could not find a report for job ${jobId}`
                )
              );
            } else {
              setReport(report);
              if (report.downloadImmediately === true) {
                const reportProperties = generateReport(
                  report.reportItems,
                  report.reportHeader
                );
                exportData(
                  report.title,
                  reportProperties.exportColumns,
                  reportProperties.data
                );
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
  }, [connectedServer, jobId]);

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
