import {
  WITSML_INDEX_TYPE_DATE_TIME,
  WITSML_INDEX_TYPE_MD,
  WITSML_LOG_ORDERTYPE_DECREASING
} from "components/Constants";
import ModalDialog from "components/Modals/ModalDialog";
import AdjustDateTimeModal from "components/Modals/TrimLogObject/AdjustDateTimeModal";
import AdjustNumberRangeModal from "components/Modals/TrimLogObject/AdjustNumberRangeModal";
import WarningBar from "components/WarningBar";
import ModificationType from "contexts/modificationType";
import { NavigationAction } from "contexts/navigationAction";
import { HideModalAction } from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import { createTrimLogObjectJob } from "models/jobs/trimLogObjectJob";
import LogObject, { indexToNumber } from "models/logObject";
import { ObjectType } from "models/objectType";
import React, { useState } from "react";
import { truncateAbortHandler } from "services/apiClient";
import JobService, { JobType } from "services/jobService";
import ObjectService from "services/objectService";

export interface TrimLogObjectModalProps {
  dispatchNavigation: (action: NavigationAction) => void;
  dispatchOperation: (action: HideModalAction) => void;
  logObject: LogObject;
}

const TrimLogObjectModal = (
  props: TrimLogObjectModalProps
): React.ReactElement => {
  const { dispatchNavigation, dispatchOperation, logObject } = props;
  const [log] = useState<LogObject>(logObject);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [startIndex, setStartIndex] = useState<string | number>();
  const [endIndex, setEndIndex] = useState<string | number>();
  const [confirmDisabled, setConfirmDisabled] = useState<boolean>();

  const onSubmit = async (updatedLog: LogObject) => {
    setIsLoading(true);
    const trimLogObjectJob = createTrimLogObjectJob(log, startIndex, endIndex);
    await JobService.orderJob(JobType.TrimLogObject, trimLogObjectJob);
    refreshWellboreLogs(updatedLog);
  };

  const refreshWellboreLogs = (log: LogObject) => {
    const controller = new AbortController();

    async function getLogObject() {
      const freshLogs = await ObjectService.getObjects(
        log.wellUid,
        log.wellboreUid,
        ObjectType.Log,
        controller.signal
      );
      dispatchNavigation({
        type: ModificationType.UpdateWellboreObjects,
        payload: {
          wellUid: log.wellUid,
          wellboreUid: log.wellboreUid,
          wellboreObjects: freshLogs,
          objectType: ObjectType.Log
        }
      });
      setIsLoading(false);
      dispatchOperation({ type: OperationType.HideModal });
    }

    getLogObject().catch(truncateAbortHandler);

    return () => controller.abort();
  };

  const toggleConfirmDisabled = (isValid: boolean) => {
    setConfirmDisabled(!isValid);
  };

  return (
    <>
      {log && (
        <ModalDialog
          heading={`Adjust start/end index for ${log.name}`}
          content={
            <>
              {log.indexType === WITSML_INDEX_TYPE_DATE_TIME && (
                <AdjustDateTimeModal
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
                <AdjustNumberRangeModal
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
              <WarningBar message="Adjusting start/end index will permanently remove data values outside selected range" />
            </>
          }
          onSubmit={() => onSubmit(log)}
          isLoading={isLoading}
          confirmColor={"danger"}
          confirmText={"Adjust"}
          confirmDisabled={confirmDisabled}
          switchButtonPlaces
        />
      )}
    </>
  );
};

export default TrimLogObjectModal;
