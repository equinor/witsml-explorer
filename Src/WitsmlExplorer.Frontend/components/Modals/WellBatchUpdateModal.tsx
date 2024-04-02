import { TextField } from "@mui/material";
import { WellRow } from "components/ContentViews/WellsListView";
import ModalDialog from "components/Modals/ModalDialog";
import { validTimeZone } from "components/Modals/ModalParts";
import { HideModalAction } from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import BatchModifyWellJob, {
  createBatchModifyWellJob
} from "models/jobs/batchModifyWellJob";
import Well, { emptyWell } from "models/well";
import React, { useState } from "react";
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
                fullWidth
                inputProps={{ maxLength: 64 }}
                onChange={(e) =>
                  setEditableWell({ ...editableWell, field: e.target.value })
                }
              />
              <TextField
                id={"country"}
                label={"country"}
                value={editableWell.country}
                fullWidth
                inputProps={{ maxLength: 32 }}
                onChange={(e) =>
                  setEditableWell({ ...editableWell, country: e.target.value })
                }
              />
              <TextField
                id={"operator"}
                label={"operator"}
                value={editableWell.operator}
                fullWidth
                inputProps={{ maxLength: 64 }}
                onChange={(e) =>
                  setEditableWell({ ...editableWell, operator: e.target.value })
                }
              />
              <TextField
                id={"timeZone"}
                label={"time zone"}
                value={editableWell.timeZone}
                fullWidth
                error={
                  !validTimeZone(editableWell.timeZone) &&
                  editableWell.timeZone.length !== 0
                }
                helperText={
                  "TimeZone has to be 'Z' or in the format -hh:mm or +hh:mm within the range (-12:00 to +14:00) and minutes has to be 00, 30 or 45"
                }
                inputProps={{ maxLength: 6 }}
                onChange={(e) =>
                  setEditableWell({ ...editableWell, timeZone: e.target.value })
                }
              />
            </>
          }
          onSubmit={() => onSubmit()}
          isLoading={isLoading}
        />
      )}
    </>
  );
};
export default WellBatchUpdateModal;
