import React, { ChangeEvent, useEffect, useState } from "react";
import { TextField } from "@material-ui/core";
import MenuItem from "@material-ui/core/MenuItem";
import Wellbore from "../../models/wellbore";
import ModalDialog from "./ModalDialog";
import JobService, { JobType } from "../../services/jobService";
import OperationType from "../../contexts/operationType";
import { HideModalAction } from "../../contexts/operationStateReducer";
import { PropertiesModalMode, validText } from "./ModalParts";

export interface WellborePropertiesModalProps {
  mode: PropertiesModalMode;
  wellbore: Wellbore;
  dispatchOperation: (action: HideModalAction) => void;
}

const purposeValues = ["appraisal", "development", "exploration", "fluid storage", "general srvc", "mineral", "unknown"];

const WellborePropertiesModal = (props: WellborePropertiesModalProps): React.ReactElement => {
  const { mode, wellbore, dispatchOperation } = props;
  const [editableWellbore, setEditableWellbore] = useState<Wellbore>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const editMode = mode === PropertiesModalMode.Edit;

  const onSubmit = async (updatedWellbore: Wellbore) => {
    setIsLoading(true);
    const wellboreJob = {
      wellbore: updatedWellbore
    };
    await JobService.orderJob(mode == PropertiesModalMode.New ? JobType.CreateWellbore : JobType.ModifyWellbore, wellboreJob);
    setIsLoading(false);
    dispatchOperation({ type: OperationType.HideModal });
  };

  const onChangePurpose = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setEditableWellbore({ ...editableWellbore, wellborePurpose: e.target.value });
  };

  useEffect(() => {
    setEditableWellbore(wellbore);
  }, [wellbore]);

  return (
    <>
      {editableWellbore && (
        <ModalDialog
          heading={mode == PropertiesModalMode.New ? `New Wellbore` : `Edit properties for ${editableWellbore.name}`}
          content={
            <>
              <TextField
                id={"uid"}
                label={"uid"}
                value={editableWellbore.uid}
                fullWidth
                disabled={editMode}
                required
                error={!validText(editableWellbore.uid)}
                helperText={editableWellbore.uid.length === 0 ? "A wellbore uid must be 1-64 characters" : ""}
                inputProps={{ minLength: 1, maxLength: 64 }}
                onChange={(e) => setEditableWellbore({ ...editableWellbore, uid: e.target.value })}
              />
              <TextField
                id={"name"}
                label={"wellbore name"}
                value={editableWellbore.name}
                error={!validText(editableWellbore.name)}
                helperText={editableWellbore.name.length === 0 ? "A wellbore name must be 1-64 characters" : ""}
                fullWidth
                inputProps={{ minLength: 1, maxLength: 64 }}
                onChange={(e) => setEditableWellbore({ ...editableWellbore, name: e.target.value })}
              />
              <TextField disabled id="wellUid" label="well uid" defaultValue={editableWellbore.wellUid} fullWidth />
              <TextField disabled id="wellName" label="well name" defaultValue={editableWellbore.wellName} fullWidth />
              <TextField disabled id={"wellboreParent"} label={"wellbore parent"} defaultValue={editableWellbore.wellboreParentName} fullWidth />
              <TextField id={"wellborePurpose"} select label={"wellbore purpose"} value={editableWellbore.wellborePurpose} fullWidth onChange={(e) => onChangePurpose(e)}>
                {purposeValues &&
                  purposeValues.map((purposeValue) => (
                    <MenuItem key={purposeValue} value={purposeValue}>
                      {purposeValue}
                    </MenuItem>
                  ))}
              </TextField>
            </>
          }
          confirmDisabled={!validText(editableWellbore.uid) || !validText(editableWellbore.name)}
          onSubmit={() => onSubmit(editableWellbore)}
          isLoading={isLoading}
        />
      )}
    </>
  );
};

export default WellborePropertiesModal;
