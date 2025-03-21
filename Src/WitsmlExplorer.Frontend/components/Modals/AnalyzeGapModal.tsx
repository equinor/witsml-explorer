import { TextField } from "@equinor/eds-core-react";
import {
  WITSML_INDEX_TYPE_DATE_TIME,
  WITSML_INDEX_TYPE_MD,
  WITSML_LOG_ORDERTYPE_DECREASING
} from "components/Constants";
import ModalDialog from "components/Modals/ModalDialog";
import { ReportModal } from "components/Modals/ReportModal";
import AdjustDateTimeIndexRange from "./TrimLogObject/AdjustDateTimeIndexRange.tsx";
import AdjustDepthIndexRange from "./TrimLogObject/AdjustDepthIndexRange.tsx";
import OperationType from "contexts/operationType";
import { useOperationState } from "hooks/useOperationState";
import LogObject from "models/logObject";
import React, { useState } from "react";
import JobService, { JobType } from "services/jobService";
import { formatIndexValue, indexToNumber } from "tools/IndexHelpers";

export interface AnalyzeGapModalProps {
  logObject: LogObject;
  mnemonics: string[];
}

const AnalyzeGapModal = (props: AnalyzeGapModalProps): React.ReactElement => {
  const { logObject, mnemonics } = props;
  const { dispatchOperation } = useOperationState();
  const timePattern = /^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
  const initialTime = "00:00:00";
  const [log] = useState<LogObject>(logObject);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [gapSize, setGapSize] = useState<number>(0);
  const [timeGapSize, setTimeGapSize] = useState(initialTime);
  const [gapSizeIsValid, setGapSizeIsValid] = useState<boolean>(false);

  const isTimeIndexed = logObject.indexType === WITSML_INDEX_TYPE_DATE_TIME;
  const [startIndex, setStartIndex] = useState<string | number>(
    isTimeIndexed ? logObject.startIndex : indexToNumber(logObject.startIndex)
  );
  const [endIndex, setEndIndex] = useState<string | number>(
    isTimeIndexed ? logObject.endIndex : indexToNumber(logObject.endIndex)
  );
  const [confirmDisabled, setConfirmDisabled] = useState<boolean>();
  const onSubmit = async () => {
    setIsLoading(true);
    const analyzeGapsJob = {
      logReference: logObject,
      mnemonics: mnemonics,
      gapSize: gapSize,
      timeGapSize: convertToMilliseconds(timeGapSize),
      startIndex: formatIndexValue(startIndex),
      endIndex: formatIndexValue(endIndex)
    };
    const jobId = await JobService.orderJob(
      JobType.AnalyzeGaps,
      analyzeGapsJob
    );
    setIsLoading(false);
    dispatchOperation({ type: OperationType.HideModal });
    if (jobId) {
      const reportModalProps = { jobId };
      dispatchOperation({
        type: OperationType.DisplayModal,
        payload: <ReportModal {...reportModalProps} />
      });
    }
  };

  const handleGapSizeChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value) {
      const value = Number(event.target.value);
      setGapSize(value);
      setGapSizeIsValid(value > 0);
    }
  };

  const handleTimeGapSizeChanged = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setGapSizeIsValid(new RegExp(timePattern).test(event.target.value));
    if (event.target.value) {
      setTimeGapSize(event.target.value);
      const millisecondsTime = convertToMilliseconds(event.target.value);
      setGapSizeIsValid(millisecondsTime > 0);
    }
  };

  const convertToMilliseconds = (time: string): number => {
    const [hours, minutes, seconds] = time.split(":").map(Number);
    return (hours * 3600 + minutes * 60 + seconds) * 1000;
  };

  const toggleConfirmDisabled = (isValid: boolean) => {
    setConfirmDisabled(!isValid);
  };

  return (
    <>
      {log && (
        <ModalDialog
          heading={`Analyze gaps`}
          content={
            <>
              {log.indexType === WITSML_INDEX_TYPE_DATE_TIME && (
                <>
                  <AdjustDateTimeIndexRange
                    minDate={log.startIndex}
                    maxDate={log.endIndex}
                    isDescending={
                      log.direction == WITSML_LOG_ORDERTYPE_DECREASING
                    }
                    onStartDateChanged={setStartIndex}
                    onEndDateChanged={setEndIndex}
                    onValidChange={toggleConfirmDisabled}
                  />
                  <TextField
                    id={"timeGapSize"}
                    label="gap size"
                    value={timeGapSize}
                    onChange={handleTimeGapSizeChanged}
                    placeholder="hh:mm:ss"
                    maxLength={8}
                    helperText={
                      !gapSizeIsValid
                        ? "Gap size time must be in format hh:mm:ss, where hours: 00..23, minutes: 00..59, seconds: 00..59 and must be greater then 00:00:00"
                        : null
                    }
                  />
                </>
              )}
              {log.indexType === WITSML_INDEX_TYPE_MD && (
                <>
                  <AdjustDepthIndexRange
                    minValue={indexToNumber(log.startIndex)}
                    maxValue={indexToNumber(log.endIndex)}
                    isDescending={
                      log.direction == WITSML_LOG_ORDERTYPE_DECREASING
                    }
                    onStartValueChanged={setStartIndex}
                    onEndValueChanged={setEndIndex}
                    onValidChange={toggleConfirmDisabled}
                  />
                  <TextField
                    id={"gapSize"}
                    label="gap size"
                    type="number"
                    value={gapSize}
                    onChange={handleGapSizeChanged}
                    helperText={
                      !gapSizeIsValid
                        ? "Gap size number must be greater than 0"
                        : null
                    }
                  />
                </>
              )}
            </>
          }
          onSubmit={() => onSubmit()}
          isLoading={isLoading}
          confirmText={"Analyze"}
          confirmDisabled={!gapSizeIsValid || confirmDisabled}
        />
      )}
    </>
  );
};

export default AnalyzeGapModal;
