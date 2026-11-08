import {
  Accordion,
  Icon,
  LinearProgress,
  TextField,
  Typography
} from "@equinor/eds-core-react";
import {
  ContentTable,
  ContentTableColumn,
  ContentType
} from "components/ContentViews/table";
import { getSearchRegex } from "contexts/filter";
import { LabelsLayout } from "components/Modals/ComparisonModalStyles";
import { StyledAccordionHeader } from "components/Modals/LogComparisonModal";
import ModalDialog, { ModalWidth } from "components/Modals/ModalDialog";
import { Banner } from "components/StyledComponents/Banner";
import { useConnectedServer } from "contexts/connectedServerContext";
import OperationType from "contexts/operationType";
import {
  useLiveJobProgress,
  useLiveJobProgressDetails
} from "hooks/useLiveJobProgress";
import { useOperationState } from "hooks/useOperationState";
import BaseReport, {
  createReport,
  ReportItemColumn,
  ReportItemType
} from "models/reports/BaseReport";
import React, { useEffect, useState } from "react";
import JobService from "services/jobService";
import NotificationService from "services/notificationService";
import styled from "styled-components";
import { Colors } from "styles/Colors";
import StyledAccordion from "../StyledComponents/StyledAccordion";
import ConfirmModal from "./ConfirmModal";
import formatDateString from "components/DateFormatter";

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
    operationState: { colors, timeZone, dateTimeFormat }
  } = useOperationState();
  const [report, setReport] = useState<BaseReport>(reportProp);
  const fetchedReport = useGetReportOnJobFinished(jobId);
  const jobProgress = useLiveJobProgress(jobId);
  const jobProgressDetails = useLiveJobProgressDetails(jobId);
  const [persistentDetails, setPersistentDetails] = useState<
    JobProgressDetails | undefined
  >(undefined);
  const lastActivityRef = React.useRef<number>(Date.now());
  const [secondsSinceLastActivity, setSecondsSinceLastActivity] =
    useState<number>(0);

  useEffect(() => {
    if (jobProgressDetails) {
      lastActivityRef.current = Date.now();
      setSecondsSinceLastActivity(0);
      setPersistentDetails((prev) => ({
        progress: jobProgressDetails.progress,
        currentStage: jobProgressDetails.currentStage ?? prev?.currentStage,
        objectName: jobProgressDetails.objectName ?? prev?.objectName,
        mnemonic: jobProgressDetails.mnemonic ?? prev?.mnemonic,
        currentIndex: jobProgressDetails.currentIndex ?? prev?.currentIndex,
        indexRange: jobProgressDetails.indexRange ?? prev?.indexRange
      }));
    }
  }, [jobProgressDetails]);

  useEffect(() => {
    lastActivityRef.current = Date.now();
    setSecondsSinceLastActivity(0);
  }, [jobProgress]);

  const activeDetails = persistentDetails || jobProgressDetails;
  const [isCancelable, setIsCancelable] = useState(false);

  const startTimeRef = React.useRef<number>(Date.now());
  const [estimatedSecondsRemaining, setEstimatedSecondsRemaining] = useState<
    number | null
  >(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Countdown and elapsed timer running every second while waiting
  useEffect(() => {
    if (report) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTimeRef.current) / 1000);
      setElapsedSeconds(elapsed);

      const idleSec = Math.floor((now - lastActivityRef.current) / 1000);
      setSecondsSinceLastActivity(idleSec);

      setEstimatedSecondsRemaining((prev) => {
        if (prev === null || prev <= 1) return prev;
        if (idleSec >= 8 && prev <= 5) return prev;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [report]);

  // Recalculate estimated remaining time whenever jobProgress updates
  useEffect(() => {
    if (jobProgress >= 0.05 && jobProgress < 1.0) {
      const now = Date.now();
      const elapsed = (now - startTimeRef.current) / 1000;
      if (elapsed >= 1.5) {
        const estimatedTotalSec = elapsed / jobProgress;
        const remainingSec = Math.max(
          1,
          Math.round(estimatedTotalSec - elapsed)
        );
        setEstimatedSecondsRemaining((prev) => {
          if (prev === null) return remainingSec;
          return Math.round(0.65 * remainingSec + 0.35 * prev);
        });
      }
    } else if (jobProgress >= 1.0) {
      setEstimatedSecondsRemaining(0);
    }
  }, [jobProgress]);

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

  const evaluateNumericFilter = (
    cellValue: any,
    filterExpression: string
  ): boolean => {
    const rawStr = cellValue == null ? "" : String(cellValue).trim();
    const expr = filterExpression.trim();
    if (!expr) return true;

    const rangeMatch = expr.match(
      /^(-?\d+(?:\.\d+)?(?:e[+-]?\d+)?)\s*(?:\.\.|-)\s*(-?\d+(?:\.\d+)?(?:e[+-]?\d+)?)$/i
    );
    if (rangeMatch) {
      const numVal = parseFloat(rawStr);
      if (isNaN(numVal)) return false;
      const min = parseFloat(rangeMatch[1]);
      const max = parseFloat(rangeMatch[2]);
      return numVal >= Math.min(min, max) && numVal <= Math.max(min, max);
    }

    const parts = expr
      .split(/\s*(?:&&|&|,)\s*/)
      .map((p) => p.trim())
      .filter(Boolean);
    const opRegex =
      /^(>=|<=|!=|<>|>|<|==|=)\s*(-?\d+(?:\.\d+)?(?:e[+-]?\d+)?)$/i;
    if (parts.length > 0 && parts.every((p) => opRegex.test(p))) {
      const numVal = parseFloat(rawStr);
      if (isNaN(numVal)) return false;
      return parts.every((part) => {
        const m = part.match(opRegex);
        if (!m) return false;
        const op = m[1];
        const threshold = parseFloat(m[2]);
        switch (op) {
          case ">":
            return numVal > threshold;
          case ">=":
            return numVal >= threshold;
          case "<":
            return numVal < threshold;
          case "<=":
            return numVal <= threshold;
          case "!=":
          case "<>":
            return numVal !== threshold;
          case "=":
          case "==":
            return numVal === threshold;
          default:
            return false;
        }
      });
    }

    return getSearchRegex(expr, false).test(rawStr);
  };

  const asColumnType = (reportColumn: ReportItemColumn | undefined) => {
    if (reportColumn) {
      switch (reportColumn.type) {
        case ReportItemType.DateTime:
          return ContentType.DateTime;
        case ReportItemType.Measure:
          return ContentType.Measure;
        case ReportItemType.Number:
          return ContentType.Number;
        case ReportItemType.String:
        default:
          return ContentType.String;
      }
    } else {
      return ContentType.String;
    }
  };

  const columns: ContentTableColumn[] = React.useMemo(
    () =>
      report && report.reportItems?.length > 0
        ? Object.keys(report.reportItems[0]).map((key) => {
            const isDeltaColumn = key.toLowerCase() === "delta";
            const colType = asColumnType(
              report?.reportItemColumns?.find((c) => c.name === key)
            );
            return {
              property: key,
              label: key,
              type:
                colType !== ContentType.String
                  ? colType
                  : report.dateTimeColumns != null &&
                    report.dateTimeColumns.indexOf(key) > -1
                  ? ContentType.DateTime
                  : ContentType.String,
              ...(isDeltaColumn
                ? {
                    headerTooltip:
                      "Absolute difference |source - target| (or seconds for timestamps). Supports numeric filters: > 0.01, >= 0.5, < 1, != 0, 0.001..0.1",
                    sortingFn: (rowA: any, rowB: any, columnId: string) => {
                      const a = parseFloat(rowA.getValue(columnId));
                      const b = parseFloat(rowB.getValue(columnId));
                      const aValid = !isNaN(a);
                      const bValid = !isNaN(b);
                      if (aValid && bValid) return a > b ? 1 : a < b ? -1 : 0;
                      if (aValid && !bValid) return 1;
                      if (!aValid && bValid) return -1;
                      return 0;
                    },
                    filterFn: (row: any, id: string, value: any) =>
                      evaluateNumericFilter(
                        row.getValue(id),
                        String(value ?? "")
                      )
                  }
                : {})
            };
          })
        : [],
    [report]
  );

  const getTableData = () => {
    return report.reportItems.map((item) => {
      {
        const clonedItem = JSON.parse(JSON.stringify(item));
        Object.keys(item).forEach((entry) => {
          if (
            !!report.reportItemColumns &&
            report.reportItemColumns.some(
              (c) => c.name == entry && c.type == ReportItemType.DateTime
            )
          ) {
            clonedItem[entry] = formatDateString(
              item[entry],
              timeZone,
              dateTimeFormat
            );
          }
        });
        return clonedItem;
      }
    });
  };

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
                  data={getTableData()}
                  downloadToCsvFileName={report.title.replace(/\s+/g, "")}
                  disableSearchParamsFilter={true}
                />
              )}
            </>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                padding: "0.5rem 0.2rem"
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem"
                  }}
                >
                  <Typography
                    style={{
                      fontFamily: "EquinorMedium",
                      fontSize: "1.125rem"
                    }}
                  >
                    Generating report...
                  </Typography>
                </div>
                <Typography
                  style={{
                    fontFamily: "EquinorMedium",
                    fontSize: "1.125rem",
                    color: colors.interactive.primaryResting
                  }}
                >
                  {jobProgress > 0
                    ? `${Math.round(jobProgress * 100)}%`
                    : "Starting..."}
                </Typography>
              </div>

              <LinearProgress
                variant={jobProgress > 0 ? "determinate" : "indeterminate"}
                value={Math.round(jobProgress * 100)}
                style={{ width: "100%", height: "8px", borderRadius: "4px" }}
              />

              {activeDetails &&
                (activeDetails.currentStage || activeDetails.objectName) && (
                  <div
                    style={{
                      backgroundColor: colors.ui.backgroundLight,
                      border: `1px solid ${colors.interactive.disabledBorder}`,
                      borderRadius: "6px",
                      padding: "0.75rem 1rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem"
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "0.5rem"
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.6rem"
                        }}
                      >
                        <span
                          style={{
                            backgroundColor: colors.interactive.primaryResting,
                            color: "#ffffff",
                            padding: "2px 8px",
                            borderRadius: "12px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            letterSpacing: "0.5px"
                          }}
                        >
                          {activeDetails.currentStage || "Processing"}
                        </span>
                        {activeDetails.objectName && (
                          <Typography
                            style={{
                              fontSize: "0.85rem",
                              fontWeight: 600,
                              color: colors.text.staticIconsDefault
                            }}
                          >
                            {activeDetails.objectName}
                            {activeDetails.mnemonic && (
                              <span
                                style={{
                                  color: colors.interactive.primaryResting,
                                  marginLeft: "6px"
                                }}
                              >
                                ({activeDetails.mnemonic})
                              </span>
                            )}
                          </Typography>
                        )}
                      </div>
                      {activeDetails.indexRange && (
                        <Typography
                          variant="caption"
                          style={{
                            color: colors.text.staticIconsTertiary,
                            fontSize: "0.75rem"
                          }}
                        >
                          Range: {activeDetails.indexRange}
                        </Typography>
                      )}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "0.5rem"
                      }}
                    >
                      {activeDetails.currentIndex ? (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            fontSize: "0.8rem",
                            color: colors.text.staticIconsDefault
                          }}
                        >
                          <span
                            style={{ color: colors.text.staticIconsTertiary }}
                          >
                            Current Index:
                          </span>
                          <code
                            style={{
                              backgroundColor: colors.ui.backgroundDefault,
                              padding: "2px 6px",
                              borderRadius: "4px",
                              fontFamily: "monospace",
                              fontWeight: 600,
                              border: `1px solid ${colors.interactive.disabledBorder}`
                            }}
                          >
                            {activeDetails.currentIndex}
                          </code>
                        </div>
                      ) : (
                        <div />
                      )}

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "0.75rem",
                          fontWeight: 500
                        }}
                      >
                        <span
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            backgroundColor:
                              secondsSinceLastActivity >= 8
                                ? "#f59e0b"
                                : "#10b981",
                            display: "inline-block"
                          }}
                        />
                        <span
                          style={{
                            color:
                              secondsSinceLastActivity >= 8
                                ? "#d97706"
                                : colors.text.staticIconsTertiary
                          }}
                        >
                          {secondsSinceLastActivity >= 8
                            ? `Awaiting server response (${secondsSinceLastActivity}s)...`
                            : "Streaming data"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <Typography
                  variant="caption"
                  style={{
                    color: colors.text.staticIconsDefault,
                    fontWeight: 500
                  }}
                >
                  {secondsSinceLastActivity >= 15
                    ? `Awaiting server response (${secondsSinceLastActivity}s)...`
                    : jobProgress >= 0.05 && estimatedSecondsRemaining !== null
                    ? `Estimated time remaining: ~${formatRemainingTime(
                        estimatedSecondsRemaining
                      )}`
                    : "Estimating time remaining..."}
                </Typography>
                <Typography
                  variant="caption"
                  style={{ color: colors.text.staticIconsTertiary }}
                >
                  Elapsed: {formatElapsedTime(elapsedSeconds)}
                </Typography>
              </div>

              <Typography
                variant="caption"
                style={{ color: colors.text.staticIconsTertiary }}
              >
                The report will also be available in the jobs view once the job
                is finished.
              </Typography>
            </div>
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

const formatRemainingTime = (seconds: number): string => {
  if (seconds <= 0) return "Almost done...";
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (secs === 0) return `${mins}m`;
  return `${mins}m ${secs.toString().padStart(2, "0")}s`;
};

const formatElapsedTime = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs.toString().padStart(2, "0")}s`;
};
