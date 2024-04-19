import { TextField } from "@equinor/eds-core-react";
import { WellRow } from "components/ContentViews/WellsListView";
import ModalDialog from "components/Modals/ModalDialog";
import { validText, validTimeZone } from "components/Modals/ModalParts";
import { HideModalAction } from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import BatchModifyWellJob, {
  createBatchModifyWellJob
} from "models/jobs/batchModifyWellJob";
import Well, { emptyWell } from "models/well";
import React, { ChangeEvent, useState } from "react";
import JobService, { JobType } from "services/jobService";

export interface WellBatchUpdateModalProps {
  wellRows: WellRow[];
  dispatchOperation: (action: HideModalAction) => void;
}

const WellBatchUpdateModal = (
  props: WellBatchUpdateModalProps
): React.ReactElement => {
  const { wellRows, dispatchOperation } = props;

  const [editableWell, setEditableWell] = useState<Well>(emptyWell);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onSubmit = async () => {
    setIsLoading(true);
    const job: BatchModifyWellJob = {
      wells: createBatchModifyWellJob(editableWell, wellRows)
    };

    await JobService.orderJob(JobType.BatchModifyWell, job);
    setIsLoading(false);
    dispatchOperation({ type: OperationType.HideModal });
  };

  const validField = validText(editableWell?.field, 0, 64);
  const validCountry = validText(editableWell?.country, 0, 32);
  const validOperator = validText(editableWell?.operator, 0, 64);

  return (
    <>
      {editableWell && (
        <ModalDialog
          heading={`Edit ${wellRows.length} ${
            wellRows.length > 1 ? "wells" : "well"
          }`}
          content={
            <>
              <TextField
                id={"field"}
                label={"field"}
                value={editableWell.field}
                variant={validField ? undefined : "error"}
                helperText={
                  !validField ? "Field max length is 64 characters." : ""
                }
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEditableWell({ ...editableWell, field: e.target.value })
                }
              />
              <TextField
                id={"country"}
                label={"country"}
                value={editableWell.country}
                variant={validCountry ? undefined : "error"}
                helperText={
                  !validCountry ? "Country max length is 32 characters." : ""
                }
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEditableWell({ ...editableWell, country: e.target.value })
                }
              />
              <TextField
                id={"operator"}
                label={"operator"}
                value={editableWell.operator}
                variant={validOperator ? undefined : "error"}
                helperText={
                  !validOperator ? "Operator max length is 64 characters." : ""
                }
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEditableWell({ ...editableWell, operator: e.target.value })
                }
              />
              <TextField
                id={"timeZone"}
                label={"time zone"}
                value={editableWell.timeZone}
                variant={
                  !validTimeZone(editableWell.timeZone) &&
                  editableWell.timeZone.length !== 0
                    ? "error"
                    : undefined
                }
                helperText={
                  "TimeZone has to be 'Z' or in the format -hh:mm or +hh:mm within the range (-12:00 to +14:00) and minutes has to be 00, 30 or 45"
                }
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEditableWell({ ...editableWell, timeZone: e.target.value })
                }
              />
            </>
          }
          confirmDisabled={
            !validField ||
            !validCountry ||
            !validOperator ||
            (!validTimeZone(editableWell.timeZone) &&
              editableWell.timeZone.length !== 0)
          }
          onSubmit={() => onSubmit()}
          isLoading={isLoading}
        />
      )}
    </>
  );
};
export default WellBatchUpdateModal;
