import React, { useEffect, useState } from "react";
import { TextField } from "@material-ui/core";
import Well from "../../models/well";
import ModalDialog from "./ModalDialog";
import JobService, { JobType } from "../../services/jobService";
import OperationType from "../../contexts/operationType";
import { HideModalAction } from "../../contexts/operationStateReducer";
import { PropertiesModalMode, validText, validTimeZone } from "./ModalParts";

export interface WellPropertiesModalProps {
  mode: PropertiesModalMode;
  well: Well;
  dispatchOperation: (action: HideModalAction) => void;
}

const WellPropertiesModal = (props: WellPropertiesModalProps): React.ReactElement => {
  const { mode, well, dispatchOperation } = props;
  const [editableWell, setEditableWell] = useState<Well>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const editMode = mode === PropertiesModalMode.Edit;

  const onSubmit = async (updatedWell: Well) => {
    setIsLoading(true);
    const wellJob = {
      well: updatedWell
    };
    await JobService.orderJob(mode == PropertiesModalMode.New ? JobType.CreateWell : JobType.ModifyWell, wellJob);
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
          heading={mode == PropertiesModalMode.New ? `New Well` : `Edit properties for Well: ${editableWell.name}`}
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
                onChange={(e) => setEditableWell({ ...editableWell, uid: e.target.value })}
              />
              <TextField
                id={"name"}
                label={"name"}
                value={editableWell.name}
                fullWidth
                required
                error={!validText(editableWell.name)}
                inputProps={{ maxLength: 64 }}
                onChange={(e) => setEditableWell({ ...editableWell, name: e.target.value })}
              />
              <TextField
                id={"field"}
                label={"field"}
                value={editableWell.field}
                fullWidth
                disabled={editMode}
                inputProps={{ maxLength: 64 }}
                onChange={(e) => setEditableWell({ ...editableWell, field: e.target.value })}
              />
              <TextField
                id={"country"}
                label={"country"}
                value={editableWell.country}
                fullWidth
                disabled={editMode}
                inputProps={{ maxLength: 32 }}
                onChange={(e) => setEditableWell({ ...editableWell, country: e.target.value })}
              />
              <TextField
                id={"operator"}
                label={"operator"}
                value={editableWell.operator}
                fullWidth
                disabled={editMode}
                inputProps={{ maxLength: 64 }}
                onChange={(e) => setEditableWell({ ...editableWell, operator: e.target.value })}
              />
              <TextField
                id={"timeZone"}
                label={"time zone"}
                value={editableWell.timeZone}
                fullWidth
                disabled={editMode}
                error={!validTimeZone(editableWell.timeZone)}
                helperText={"TimeZone has to be in the format -hh:mm or +hh:mm within the range (-12:00 to +14:00) and minutes has to be 00, 30 or 45"}
                inputProps={{ maxLength: 6 }}
                onChange={(e) => setEditableWell({ ...editableWell, timeZone: e.target.value })}
              />
            </>
          }
          confirmDisabled={!validText(editableWell.uid) || !validText(editableWell.name) || !validTimeZone(editableWell.timeZone)}
          onSubmit={() => onSubmit(editableWell)}
          isLoading={isLoading}
        />
      )}
    </>
  );
};

export default WellPropertiesModal;
