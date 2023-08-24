import React, { useState } from "react";
import { NavigationAction } from "../../contexts/navigationAction";
import { DisplayModalAction, HideModalAction } from "../../contexts/operationStateReducer";
import LogObject from "../../models/logObject";
import JobService, { JobType } from "../../services/jobService";
import { WITSML_INDEX_TYPE_DATE_TIME, WITSML_INDEX_TYPE_MD } from "../Constants";
import ModalDialog from "./ModalDialog";
import { TextField } from "@material-ui/core";
import OperationType from "../../contexts/operationType";
import { ReportModal } from "./ReportModal";
import WarningBar from "../WarningBar";

export interface AnalyzeGapModalProps {
  dispatchNavigation: (action: NavigationAction) => void;
  dispatchOperation: (action: HideModalAction | DisplayModalAction) => void;
  logObject: LogObject;
  mnemonics: string[];
}

const AnalyzeGapModal = (props: AnalyzeGapModalProps): React.ReactElement => {
  const { dispatchOperation, logObject } = props;
  const timePattern = /^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
  const initialTime = "00:00:00";
  const [log] = useState<LogObject>(logObject);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [gapSize, setGapSize] = useState<number>(0);
  const [timeGapSize, setTimeGapSize] = useState(initialTime);
  const [gapSizeIsValid, setGapSizeIsValid] = useState<boolean>(true);
  const [gapSizeShowWarning, setGapSizeShowWarning] = useState<boolean>(true);

  const onSubmit = async () => {
    setIsLoading(true);
    const logReference: LogObject = props.logObject;
    const analyzeGapsJob = {
      logReference: logReference,
      mnemonics: props.mnemonics,
      gapSize: gapSize,
      timeGapSize: convertToMilliseconds(timeGapSize)
    };
    const jobId = await JobService.orderJob(JobType.AnalyzeGaps, analyzeGapsJob);
    const reportModalProps = { jobId };
    setIsLoading(false);
    dispatchOperation({ type: OperationType.HideModal });
    dispatchOperation({ type: OperationType.DisplayModal, payload: <ReportModal {...reportModalProps} /> });
  };

  const handleGapSizeChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value) {
      const value = Number(event.target.value);
      setGapSize(value);
      setGapSizeIsValid(value >= 0);
      setGapSizeShowWarning(value >= 0 && value < 1);
    }
  };

  const handleTimeGapSizeChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGapSizeIsValid(new RegExp(timePattern).test(event.target.value));
    if (event.target.value) {
      setTimeGapSize(event.target.value);
      const millisecondsTime = convertToMilliseconds(event.target.value);
      setGapSizeShowWarning(millisecondsTime >= 0 && millisecondsTime < 60000);
    }
  };

  const convertToMilliseconds = (time: string): number => {
    const [hours, minutes, seconds] = time.split(":").map(Number);
    return (hours * 3600 + minutes * 60 + seconds) * 1000;
  };

  return (
    <>
      {log && (
        <ModalDialog
          heading={`Analyze gaps`}
          content={
            <>
              {log.indexType === WITSML_INDEX_TYPE_DATE_TIME && (
                <TextField
                  id={"timeGapSize"}
                  label="gap size"
                  value={timeGapSize}
                  onChange={handleTimeGapSizeChanged}
                  placeholder="hh:mm:ss"
                  fullWidth
                  inputProps={{ maxLength: 8 }}
                  error={!gapSizeIsValid}
                  helperText={"Gap size time must be in format hh:mm:ss, where hours: 00..23, minutes: 00..59, seconds: 00..59"}
                />
              )}
              {log.indexType === WITSML_INDEX_TYPE_MD && (
                <TextField
                  id={"gapSize"}
                  label="gap size"
                  type="number"
                  fullWidth
                  value={gapSize}
                  onChange={handleGapSizeChanged}
                  error={!gapSizeIsValid}
                  helperText={"Gap size number must be greater than or equal to 0"}
                />
              )}
              {gapSizeShowWarning && <WarningBar message={"The gap size is too small, gap analysis might take some time."} />}
            </>
          }
          onSubmit={() => onSubmit()}
          isLoading={isLoading}
          confirmColor={"danger"}
          confirmText={"Analyze"}
          confirmDisabled={!gapSizeIsValid}
        />
      )}
    </>
  );
};

export default AnalyzeGapModal;
