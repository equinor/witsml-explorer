import { Autocomplete, TextField } from "@equinor/eds-core-react";
import React, { useContext, useEffect, useState } from "react";
import OperationContext from "../../contexts/operationContext";
import { HideModalAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import LogObject from "../../models/logObject";
import JobService, { JobType } from "../../services/jobService";
import { WITSML_INDEX_TYPE_DATE_TIME } from "../Constants";
import formatDateString from "../DateFormatter";
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
  const {
    operationState: { timeZone }
  } = useContext(OperationContext);
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
    const indexCurve = event.selectedItems[0] === IndexCurve.Time ? IndexCurve.Time : IndexCurve.Depth;
    setEditableLogObject({ ...editableLogObject, indexCurve });
  };

  useEffect(() => {
    const isTimeIndexed = logObject.indexType === WITSML_INDEX_TYPE_DATE_TIME;
    setEditableLogObject({
      ...logObject,
      startIndex: isTimeIndexed ? formatDateString(logObject.startIndex, timeZone) : logObject.startIndex,
      endIndex: isTimeIndexed ? formatDateString(logObject.endIndex, timeZone) : logObject.endIndex
    });
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
                variant={validText(editableLogObject.uid) ? undefined : "error"}
                onChange={(e: any) => setEditableLogObject({ ...editableLogObject, uid: e.target.value })}
              />
              <TextField
                id="name"
                label="name"
                defaultValue={editableLogObject.name}
                helperText={editableLogObject.name.length === 0 ? "A log name must be 1-64 characters" : ""}
                variant={editableLogObject.name.length === 0 ? "error" : undefined}
                onChange={(e: any) => setEditableLogObject({ ...editableLogObject, name: e.target.value })}
              />
              <TextField disabled={editMode} id="serviceCompany" label="service company" defaultValue={editableLogObject.serviceCompany} />
              <TextField disabled={editMode} id="startIndex" label="start index" defaultValue={editableLogObject.startIndex} />
              <TextField disabled={editMode} id="endIndex" label="end index" defaultValue={editableLogObject.endIndex} />
              <TextField disabled={editMode} id="wellUid" label="well uid" defaultValue={editableLogObject.wellUid} />
              <TextField disabled={editMode} id="wellName" label="well name" defaultValue={editableLogObject.wellName} />
              <TextField disabled={editMode} id="wellboreUid" label="wellbore uid" defaultValue={editableLogObject.wellboreUid} />
              <TextField disabled={editMode} id="wellboreName" label="wellbore name" defaultValue={editableLogObject.wellboreName} />
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
