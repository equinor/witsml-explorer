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
import { Banner } from "components/StyledComponents/Banner";
import { useConnectedServer } from "contexts/connectedServerContext";
import OperationType from "contexts/operationType";
import { useLiveJobProgress } from "hooks/useLiveJobProgress";
import { useOperationState } from "hooks/useOperationState";
import BaseReport, { createReport } from "models/reports/BaseReport";
import React, { useEffect, useState } from "react";
import JobService from "services/jobService";
import NotificationService from "services/notificationService";
import styled from "styled-components";
import { Colors } from "styles/Colors";
import StyledAccordion from "../StyledComponents/StyledAccordion";
import ConfirmModal from "./ConfirmModal";

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
  } = useOperationState();
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
      report && report.reportItems?.length > 0
        ? Object.keys(report.reportItems[0]).map((key) => ({
            property: key,
            label: key,
            type: ContentType.String
          }))
        : [],
    [report]
  );

  const cancelJob = async (jobId: string) => {
    await JobService.cancelJob(jobId);
    dispatchOperation({ type: OperationType.HideContextMenu });
    dispatchOperation({ type: OperationType.HideModal });
  };

  const onClickCancel = async () => {
    const confirmation = (
      <ConfirmModal
        heading={"Confirm job cancellation"}
        content={
          <Typography>Do you really want to cancel this job?</Typography>
        }
        onConfirm={() => {
          dispatchOperation({ type: OperationType.HideModal });
          cancelJob(jobId);
        }}
        confirmColor={"danger"}
        confirmText={"Yes"}
        cancelText={"No"}
        switchButtonPlaces={true}
      />
    );
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: confirmation
    });
  };

  return (
    <ModalDialog
      width={ModalWidth.LARGE}
      heading={report ? report.title : "Loading report..."}
      confirmText="Ok"
      showCancelButton={!fetchedReport && isCancelable}
      cancelText="Cancel job"
      content={
        <ContentLayout>
          {report ? (
            <>
              {report.jobDetails && (
                <LabelsLayout>
                  {report.jobDetails.split("|").map((jobDetail) => {
                    const keyValuePair = jobDetail.split("::");
                    return (
                      <StyledTextField
                        colors={colors}
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
                <StyledAccordion>
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
                </StyledAccordion>
              ) : (
                <Typography>{report.summary}</Typography>
              )}
              {columns.length > 0 && report.hasFile !== true && (
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
      onCancel={() => onClickCancel()}
      isLoading={false}
    />
  );
};

export const useGetReportOnJobFinished = (jobId: string): BaseReport => {
  const { connectedServer } = useConnectedServer();
  const [report, setReport] = useState<BaseReport>(null);

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
              if (report.hasFile === true) {
                await JobService.downloadFile(jobId);
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

const StyledTextField = styled(TextField)<{ colors: Colors }>`
  label {
    color: ${(props) => props.colors.interactive.primaryResting};
  }
`;

const ContentLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  justify-content: space-between;
  margin: 1em 0.2em 1em 0.2em;
  max-height: 65vh;
`;
