import {
  WITSML_INDEX_TYPE_DATE_TIME,
  WITSML_INDEX_TYPE_MD,
  WITSML_LOG_ORDERTYPE_DECREASING
} from "components/Constants";
import ModalDialog from "components/Modals/ModalDialog";
import AdjustDateTimeIndexRange from "./AdjustDateTimeIndexRange.tsx";
import AdjustDepthIndexRange from "./AdjustDepthIndexRange.tsx";
import WarningBar from "components/WarningBar";
import OperationType from "contexts/operationType";
import { useOperationState } from "hooks/useOperationState";
import { createTrimLogObjectJob } from "models/jobs/trimLogObjectJob";
import LogObject, { indexToNumber } from "models/logObject";
import React, { useState } from "react";
import JobService, { JobType } from "services/jobService";

export interface TrimLogObjectModalProps {
  logObject: LogObject;
}

const TrimLogObjectModal = (
  props: TrimLogObjectModalProps
): React.ReactElement => {
  const { logObject } = props;
  const { dispatchOperation } = useOperationState();
  const [log] = useState<LogObject>(logObject);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [startIndex, setStartIndex] = useState<string | number>();
  const [endIndex, setEndIndex] = useState<string | number>();
  const [confirmDisabled, setConfirmDisabled] = useState<boolean>();

  const onSubmit = async () => {
    setIsLoading(true);
    const trimLogObjectJob = createTrimLogObjectJob(log, startIndex, endIndex);
    JobService.orderJob(JobType.TrimLogObject, trimLogObjectJob);
    dispatchOperation({ type: OperationType.HideModal });
  };

  const toggleConfirmDisabled = (isValid: boolean) => {
    setConfirmDisabled(!isValid);
  };

  return (
    <>
      {log && (
        <ModalDialog
          heading={`Trim start/end index for ${log.name}`}
          content={
            <>
              {log.indexType === WITSML_INDEX_TYPE_DATE_TIME && (
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
              )}
              {log.indexType === WITSML_INDEX_TYPE_MD && (
                <AdjustDepthIndexRange
                  minValue={indexToNumber(logObject.startIndex)}
                  maxValue={indexToNumber(logObject.endIndex)}
                  isDescending={
                    log.direction == WITSML_LOG_ORDERTYPE_DECREASING
                  }
                  onStartValueChanged={setStartIndex}
                  onEndValueChanged={setEndIndex}
                  onValidChange={toggleConfirmDisabled}
                />
              )}
              <WarningBar message="Trimming start/end index will permanently remove data values outside selected range" />
            </>
          }
          onSubmit={onSubmit}
          isLoading={isLoading}
          confirmColor={"danger"}
          confirmText={"Trim"}
          confirmDisabled={confirmDisabled}
          switchButtonPlaces
        />
      )}
    </>
  );
};

export default TrimLogObjectModal;
