import { TextField } from "@equinor/eds-core-react";
import formatDateString from "components/DateFormatter";
import ModalDialog from "components/Modals/ModalDialog";
import {
  PropertiesModalMode,
  validText,
  validTimeZone
} from "components/Modals/ModalParts";
import { HideModalAction } from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import { useOperationState } from "hooks/useOperationState";
import Well from "models/well";
import React, { ChangeEvent, useEffect, useState } from "react";
import JobService, { JobType } from "services/jobService";

export interface WellPropertiesModalProps {
  mode: PropertiesModalMode;
  well: Well;
  dispatchOperation: (action: HideModalAction) => void;
}

const WellPropertiesModal = (
  props: WellPropertiesModalProps
): React.ReactElement => {
  const { mode, well, dispatchOperation } = props;
  const {
    operationState: { timeZone, dateTimeFormat }
  } = useOperationState();
  const [editableWell, setEditableWell] = useState<Well>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const editMode = mode === PropertiesModalMode.Edit;

  const onSubmit = async (updatedWell: Well) => {
    setIsLoading(true);
    const wellJob = {
      well: updatedWell
    };
    await JobService.orderJob(
      mode == PropertiesModalMode.New ? JobType.CreateWell : JobType.ModifyWell,
      wellJob
    );
    setIsLoading(false);
    dispatchOperation({ type: OperationType.HideModal });
  };

  useEffect(() => {
    setEditableWell(well);
  }, [well]);

  const validWellUid = validText(editableWell?.uid, 1, 64);
  const validWellName = validText(editableWell?.name, 1, 64);
  const validWellField = validText(editableWell?.field, 0, 64);
  const validWellCountry = validText(editableWell?.country, 0, 32);
  const validWellOperator = validText(editableWell?.operator, 0, 64);

  return (
    <>
      {editableWell && (
        <ModalDialog
          heading={
            mode == PropertiesModalMode.New
              ? `New Well`
              : `Edit properties for Well: ${editableWell.name}`
          }
          content={
            <>
              <TextField
                id={"uid"}
                label={"uid"}
                value={editableWell.uid}
                disabled={editMode}
                required
                variant={validWellUid ? undefined : "error"}
                helperText={
                  !validWellUid ? "A well uid must be 1-64 characters" : ""
                }
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEditableWell({ ...editableWell, uid: e.target.value })
                }
              />
              <TextField
                id={"name"}
                label={"name"}
                value={editableWell.name}
                required
                variant={validWellName ? undefined : "error"}
                helperText={
                  !validWellName ? "A well name must be 1-64 characters" : ""
                }
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEditableWell({ ...editableWell, name: e.target.value })
                }
              />
              <TextField
                id={"field"}
                label={"field"}
                value={editableWell.field || ""}
                variant={validWellField ? undefined : "error"}
                helperText={
                  !validWellField ? "A well field must be 0-64 characters" : ""
                }
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEditableWell({ ...editableWell, field: e.target.value })
                }
              />
              <TextField
                id={"country"}
                label={"country"}
                value={editableWell.country || ""}
                variant={validWellCountry ? undefined : "error"}
                helperText={
                  !validWellCountry
                    ? "A well country must be 0-32 characters"
                    : ""
                }
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEditableWell({ ...editableWell, country: e.target.value })
                }
              />
              <TextField
                id={"operator"}
                label={"operator"}
                value={editableWell.operator || ""}
                variant={validWellOperator ? undefined : "error"}
                helperText={
                  !validWellOperator
                    ? "A well operator must be 0-64 characters"
                    : ""
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
                  validTimeZone(editableWell.timeZone) ? undefined : "error"
                }
                helperText={
                  "TimeZone has to be 'Z' or in the format -hh:mm or +hh:mm within the range (-12:00 to +14:00) and minutes has to be 00, 30 or 45"
                }
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEditableWell({ ...editableWell, timeZone: e.target.value })
                }
              />
              <TextField
                disabled
                id={"numLicense"}
                label={"numLicense"}
                defaultValue={well.numLicense}
              />
              {mode !== PropertiesModalMode.New && (
                <>
                  <TextField
                    disabled
                    id="dTimCreation"
                    label="commonData.dTimCreation"
                    defaultValue={formatDateString(
                      well.dateTimeCreation,
                      timeZone,
                      dateTimeFormat
                    )}
                  />
                  <TextField
                    disabled
                    id="dTimLastChange"
                    label="commonData.dTimLastChange"
                    defaultValue={formatDateString(
                      well.dateTimeLastChange,
                      timeZone,
                      dateTimeFormat
                    )}
                  />
                </>
              )}
            </>
          }
          confirmDisabled={
            !validWellName ||
            !validWellUid ||
            !validWellField ||
            !validWellOperator ||
            !validWellCountry ||
            !validTimeZone(editableWell.timeZone)
          }
          onSubmit={() => onSubmit(editableWell)}
          isLoading={isLoading}
        />
      )}
    </>
  );
};

export default WellPropertiesModal;
