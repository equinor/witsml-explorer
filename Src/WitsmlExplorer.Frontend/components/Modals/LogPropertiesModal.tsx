import { Autocomplete, TextField } from "@equinor/eds-core-react";
import { WITSML_INDEX_TYPE_DATE_TIME } from "components/Constants";
import formatDateString from "components/DateFormatter";
import ModalDialog from "components/Modals/ModalDialog";
import { PropertiesModalMode, validText } from "components/Modals/ModalParts";
import { HideModalAction } from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import { useOperationState } from "hooks/useOperationState";
import LogObject from "models/logObject";
import { ObjectType } from "models/objectType";
import React, { ChangeEvent, useEffect, useState } from "react";
import JobService, { JobType } from "services/jobService";

export enum IndexCurve {
  Depth = "Depth",
  Time = "Time"
}

export interface LogPropertiesModalInterface {
  mode: PropertiesModalMode;
  logObject: LogObject;
  dispatchOperation: (action: HideModalAction) => void;
}

const LogPropertiesModal = (
  props: LogPropertiesModalInterface
): React.ReactElement => {
  const { mode, logObject, dispatchOperation } = props;
  const {
    operationState: { timeZone, dateTimeFormat }
  } = useOperationState();
  const [editableLogObject, setEditableLogObject] = useState<LogObject>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const editMode = mode === PropertiesModalMode.Edit;
  const validIndexCurves = [IndexCurve.Depth, IndexCurve.Time];

  const validServiceCompany = () => {
    if (mode === PropertiesModalMode.New) {
      return validText(editableLogObject.serviceCompany, 0, 64);
    } else if (mode === PropertiesModalMode.Edit) {
      if (
        logObject.serviceCompany === null &&
        editableLogObject.serviceCompany === null
      )
        return true;
      return validText(editableLogObject.serviceCompany, 1, 64);
    }
  };

  const getServiceCompanyHelperText = () => {
    if (mode === PropertiesModalMode.New) {
      return "A service company must be 0-64 characters";
    } else if (mode === PropertiesModalMode.Edit) {
      return "A service company must be 1-64 characters";
    }
  };

  const validRunNumber = () => {
    if (mode === PropertiesModalMode.New) {
      return validText(editableLogObject.runNumber, 0, 16);
    } else if (mode === PropertiesModalMode.Edit) {
      if (logObject.runNumber === null && editableLogObject.runNumber === null)
        return true;
      return validText(editableLogObject.runNumber, 1, 16);
    }
  };

  const getRunNumberHelperText = () => {
    if (mode === PropertiesModalMode.New) {
      return "A run number must be 0-16 characters";
    } else if (mode === PropertiesModalMode.Edit) {
      return "A run number must be 1-16 characters";
    }
  };

  const onSubmit = async (updatedLog: LogObject) => {
    setIsLoading(true);
    if (editMode) {
      const modifyJob = {
        object: { ...updatedLog, objectType: ObjectType.Log },
        objectType: ObjectType.Log
      };
      await JobService.orderJob(JobType.ModifyObjectOnWellbore, modifyJob);
    } else {
      const wellboreLogJob = {
        logObject: updatedLog
      };
      await JobService.orderJob(JobType.CreateLogObject, wellboreLogJob);
    }
    setIsLoading(false);
    dispatchOperation({ type: OperationType.HideModal });
  };

  const onChangeCurve = async (event: any) => {
    const indexCurve =
      event.selectedItems[0] === IndexCurve.Time
        ? IndexCurve.Time
        : IndexCurve.Depth;
    setEditableLogObject({ ...editableLogObject, indexCurve });
  };

  useEffect(() => {
    const isTimeIndexed = logObject.indexType === WITSML_INDEX_TYPE_DATE_TIME;
    setEditableLogObject({
      ...logObject,
      startIndex: isTimeIndexed
        ? formatDateString(logObject.startIndex, timeZone, dateTimeFormat)
        : logObject.startIndex,
      endIndex: isTimeIndexed
        ? formatDateString(logObject.endIndex, timeZone, dateTimeFormat)
        : logObject.endIndex
    });
  }, [logObject]);

  return (
    <>
      {editableLogObject && (
        <ModalDialog
          heading={
            editMode
              ? `Edit properties for ${editableLogObject.name}`
              : `New Log`
          }
          content={
            <>
              <TextField
                id="uid"
                label="uid"
                value={editableLogObject.uid}
                disabled={editMode}
                required
                helperText={
                  editableLogObject.uid.length === 0
                    ? "A wellbore uid must be 1-64 characters"
                    : ""
                }
                variant={validText(editableLogObject.uid) ? undefined : "error"}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEditableLogObject({
                    ...editableLogObject,
                    uid: e.target.value
                  })
                }
              />
              <TextField
                id="name"
                label="name"
                defaultValue={editableLogObject.name}
                helperText={
                  editableLogObject.name.length === 0
                    ? "A log name must be 1-64 characters"
                    : ""
                }
                variant={
                  editableLogObject.name.length === 0 ? "error" : undefined
                }
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEditableLogObject({
                    ...editableLogObject,
                    name: e.target.value
                  })
                }
              />
              <TextField
                disabled
                id="objectGrowing"
                label="object growing"
                defaultValue={
                  editableLogObject.objectGrowing == null
                    ? ""
                    : editableLogObject.objectGrowing
                    ? "true"
                    : "false"
                }
              />
              <TextField
                id="serviceCompany"
                label="service company"
                helperText={
                  validServiceCompany() ? "" : getServiceCompanyHelperText()
                }
                variant={validServiceCompany() ? undefined : "error"}
                defaultValue={editableLogObject.serviceCompany}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEditableLogObject({
                    ...editableLogObject,
                    serviceCompany:
                      e.target.value === "" ? null : e.target.value
                  })
                }
              />
              <TextField
                id="runNumber"
                label="run number"
                helperText={validRunNumber() ? "" : getRunNumberHelperText()}
                variant={validRunNumber() ? undefined : "error"}
                defaultValue={editableLogObject.runNumber}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEditableLogObject({
                    ...editableLogObject,
                    runNumber: e.target.value === "" ? null : e.target.value
                  })
                }
              />
              <TextField
                disabled
                id="startIndex"
                label="start index"
                defaultValue={editableLogObject.startIndex}
              />
              <TextField
                disabled
                id="endIndex"
                label="end index"
                defaultValue={editableLogObject.endIndex}
              />
              <TextField
                disabled
                id="wellUid"
                label="well uid"
                defaultValue={editableLogObject.wellUid}
              />
              <TextField
                disabled
                id="wellName"
                label="well name"
                defaultValue={editableLogObject.wellName}
              />
              <TextField
                disabled
                id="wellboreUid"
                label="wellbore uid"
                defaultValue={editableLogObject.wellboreUid}
              />
              <TextField
                disabled
                id="wellboreName"
                label="wellbore name"
                defaultValue={editableLogObject.wellboreName}
              />
              <Autocomplete
                label="index curve"
                disabled={editMode}
                initialSelectedOptions={[editableLogObject.indexCurve]}
                options={validIndexCurves}
                onOptionsChange={onChangeCurve}
                hideClearButton={true}
              />
              {mode !== PropertiesModalMode.New && (
                <>
                  <TextField
                    disabled
                    id="dTimCreation"
                    label="commonData.dTimCreation"
                    defaultValue={formatDateString(
                      logObject?.commonData?.dTimCreation,
                      timeZone,
                      dateTimeFormat
                    )}
                  />
                  <TextField
                    disabled
                    id="dTimLastChange"
                    label="commonData.dTimLastChange"
                    defaultValue={formatDateString(
                      logObject?.commonData?.dTimLastChange,
                      timeZone,
                      dateTimeFormat
                    )}
                  />
                </>
              )}
            </>
          }
          confirmDisabled={
            !validText(editableLogObject.uid) ||
            !validText(editableLogObject.name) ||
            !validText(editableLogObject.indexCurve) ||
            !validServiceCompany() ||
            !validRunNumber()
          }
          onSubmit={() => onSubmit(editableLogObject)}
          isLoading={isLoading}
        />
      )}
    </>
  );
};

export default LogPropertiesModal;
