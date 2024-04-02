import { TextField } from "@mui/material";
import formatDateString from "components/DateFormatter";
import ModalDialog from "components/Modals/ModalDialog";
import {
  PropertiesModalMode,
  validText,
  validTimeZone
} from "components/Modals/ModalParts";
import OperationContext from "contexts/operationContext";
import { HideModalAction } from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import Well from "models/well";
import React, { useContext, useEffect, useState } from "react";
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
  } = useContext(OperationContext);
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
                fullWidth
                disabled={editMode}
                required
                error={!validText(editableWell.uid)}
                inputProps={{ maxLength: 64 }}
                onChange={(e) =>
                  setEditableWell({ ...editableWell, uid: e.target.value })
                }
              />
              <TextField
                id={"name"}
                label={"name"}
                value={editableWell.name}
                fullWidth
                required
                error={!validText(editableWell.name)}
                inputProps={{ maxLength: 64 }}
                onChange={(e) =>
                  setEditableWell({ ...editableWell, name: e.target.value })
                }
              />
              <TextField
                id={"field"}
                label={"field"}
                value={editableWell.field || ""}
                fullWidth
                inputProps={{ maxLength: 64 }}
                onChange={(e) =>
                  setEditableWell({ ...editableWell, field: e.target.value })
                }
              />
              <TextField
                id={"country"}
                label={"country"}
                value={editableWell.country || ""}
                fullWidth
                inputProps={{ maxLength: 32 }}
                onChange={(e) =>
                  setEditableWell({ ...editableWell, country: e.target.value })
                }
              />
              <TextField
                id={"operator"}
                label={"operator"}
                value={editableWell.operator || ""}
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
                error={!validTimeZone(editableWell.timeZone)}
                helperText={
                  "TimeZone has to be 'Z' or in the format -hh:mm or +hh:mm within the range (-12:00 to +14:00) and minutes has to be 00, 30 or 45"
                }
                inputProps={{ maxLength: 6 }}
                onChange={(e) =>
                  setEditableWell({ ...editableWell, timeZone: e.target.value })
                }
              />
              <TextField
                disabled
                id={"numLicense"}
                label={"numLicense"}
                defaultValue={well.numLicense}
                fullWidth
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
                    fullWidth
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
                    fullWidth
                  />
                </>
              )}
            </>
          }
          confirmDisabled={
            !validText(editableWell.uid) ||
            !validText(editableWell.name) ||
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
