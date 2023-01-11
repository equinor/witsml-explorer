import { Autocomplete, TextField } from "@equinor/eds-core-react";
import React, { useEffect, useState } from "react";
import { HideModalAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import LogObject from "../../models/logObject";
import JobService, { JobType } from "../../services/jobService";
import ModalDialog from "./ModalDialog";
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
    const indexCurve = event[0] === IndexCurve.Time ? IndexCurve.Time : IndexCurve.Depth;
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
                disabled={editMode}
                required
                helperText={editableLogObject.uid.length === 0 ? "A wellbore uid must be 1-64 characters" : ""}
                onChange={(e: any) => setEditableLogObject({ ...editableLogObject, uid: e.target.value })}
              />
              <TextField
                id="name"
                label="name"
                defaultValue={editableLogObject.name}
                helperText={editableLogObject.name.length === 0 ? "A log name must be 1-64 characters" : ""}
                onChange={(e: any) => setEditableLogObject({ ...editableLogObject, name: e.target.value })}
              />
              <TextField disabled id="serviceCompany" label="service company" defaultValue={editableLogObject.serviceCompany} />
              <TextField disabled id="startIndex" label="start index" defaultValue={editableLogObject.startIndex} />
              <TextField disabled id="endIndex" label="end index" defaultValue={editableLogObject.endIndex} />
              <TextField disabled id="wellUid" label="well uid" defaultValue={editableLogObject.wellUid} />
              <TextField disabled id="wellName" label="well name" defaultValue={editableLogObject.wellName} />
              <TextField disabled id="wellboreUid" label="wellbore uid" defaultValue={editableLogObject.wellboreUid} />
              <TextField disabled id="wellboreName" label="wellbore name" defaultValue={editableLogObject.wellboreName} />
              <Autocomplete
                label="index curve"
                initialSelectedOptions={[editableLogObject.indexCurve]}
                options={validIndexCurves}
                onOptionsChange={onChangeCurve}
                hideClearButton={true}
              />
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
