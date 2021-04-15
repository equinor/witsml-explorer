import React, { useEffect, useState } from "react";
import { FormControl, InputLabel, MenuItem, Select, TextField, Typography } from "@material-ui/core";
import LogObject from "../../models/logObject";
import ModalDialog from "./ModalDialog";
import JobService, { JobType } from "../../services/jobService";
import OperationType from "../../contexts/operationType";
import { HideModalAction } from "../../contexts/operationStateReducer";
import { PropertiesModalMode, validText } from "./ModalParts";

export enum IndexCurve {
  Depth = "Depth",
  Time = "Time"
}

export interface LogPropertiesModalInterface {
  mode: PropertiesModalMode;
  logObject: LogObject;
  dispatchOperation: (action: HideModalAction) => void;
}

const LogPropertiesModal = (props: LogPropertiesModalInterface): React.ReactElement => {
  const { mode, logObject, dispatchOperation } = props;
  const [editableLogObject, setEditableLogObject] = useState<LogObject>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const editMode = mode === PropertiesModalMode.Edit;
  const validIndexCurves = [IndexCurve.Depth, IndexCurve.Time];

  const onSubmit = async (updatedLog: LogObject) => {
    setIsLoading(true);
    const wellboreLogJob = {
      logObject: updatedLog
    };
    await JobService.orderJob(editMode ? JobType.ModifyLogObject : JobType.CreateLogObject, wellboreLogJob);
    setIsLoading(false);
    dispatchOperation({ type: OperationType.HideModal });
  };

  const onChangeCurve = async (event: any) => {
    const indexCurve = event.target.value === IndexCurve.Time ? IndexCurve.Time : IndexCurve.Depth;
    setEditableLogObject({ ...editableLogObject, indexCurve });
  };

  useEffect(() => {
    setEditableLogObject(logObject);
  }, [logObject]);

  return (
    <>
      {editableLogObject && (
        <ModalDialog
          heading={editMode ? `Edit properties for ${editableLogObject.name}` : `New Log`}
          content={
            <>
              <TextField
                id="uid"
                label="uid"
                value={editableLogObject.uid}
                fullWidth
                disabled={editMode}
                required
                error={!validText(editableLogObject.uid)}
                helperText={editableLogObject.uid.length === 0 ? "A wellbore uid must be 1-64 characters" : ""}
                inputProps={{ minLength: 1, maxLength: 64 }}
                onChange={(e) => setEditableLogObject({ ...editableLogObject, uid: e.target.value })}
              />
              <TextField
                id="name"
                label="name"
                defaultValue={editableLogObject.name}
                error={editableLogObject.name.length === 0}
                helperText={editableLogObject.name.length === 0 ? "A log name must be 1-64 characters" : ""}
                fullWidth
                inputProps={{ minLength: 1, maxLength: 64 }}
                onChange={(e) => setEditableLogObject({ ...editableLogObject, name: e.target.value })}
              />
              <TextField disabled id="serviceCompany" label="service company" defaultValue={editableLogObject.serviceCompany} fullWidth />
              <TextField disabled id="startIndex" label="start index" defaultValue={editableLogObject.startIndex} fullWidth />
              <TextField disabled id="endIndex" label="end index" defaultValue={editableLogObject.endIndex} fullWidth />
              <TextField disabled id="wellUid" label="well uid" defaultValue={editableLogObject.wellUid} fullWidth />
              <TextField disabled id="wellName" label="well name" defaultValue={editableLogObject.wellName} fullWidth />
              <TextField disabled id="wellboreUid" label="wellbore uid" defaultValue={editableLogObject.wellboreUid} fullWidth />
              <TextField disabled id="wellboreName" label="wellbore name" defaultValue={editableLogObject.wellboreName} fullWidth />
              <FormControl fullWidth>
                <InputLabel id="curve-label">index curve</InputLabel>
                <Select labelId="index-curve" value={editableLogObject.indexCurve} onChange={onChangeCurve} disabled={editMode}>
                  {validIndexCurves.map((curve: IndexCurve) => (
                    <MenuItem value={curve} key={curve}>
                      <Typography color={"initial"}>{curve}</Typography>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          }
          confirmDisabled={!validText(editableLogObject.uid) || !validText(editableLogObject.name) || !validText(editableLogObject.indexCurve)}
          onSubmit={() => onSubmit(editableLogObject)}
          isLoading={isLoading}
        />
      )}
    </>
  );
};

export default LogPropertiesModal;
