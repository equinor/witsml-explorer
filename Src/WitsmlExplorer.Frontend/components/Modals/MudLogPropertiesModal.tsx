import { Autocomplete, TextField } from "@equinor/eds-core-react";
import formatDateString from "components/DateFormatter";
import ModalDialog from "components/Modals/ModalDialog";
import {
  invalidStringInput,
  undefinedOnUnchagedEmptyString
} from "components/Modals/PropertiesModalUtils";
import OperationContext from "contexts/operationContext";
import OperationType from "contexts/operationType";
import { itemStateValues } from "models/commonData";
import MaxLength from "models/maxLength";
import MudLog from "models/mudLog";
import ObjectOnWellbore, { toObjectReference } from "models/objectOnWellbore";
import { ObjectType } from "models/objectType";
import React, { useContext, useEffect, useState } from "react";
import JobService, { JobType } from "services/jobService";
import { Layout } from "../StyledComponents/Layout";

export interface MudLogPropertiesModalProps {
  mudLog: MudLog;
}

interface EditableMudLog extends ObjectOnWellbore {
  mudLogCompany?: string;
  mudLogEngineers?: string;
  itemState?: string;
}

const MudLogPropertiesModal = (
  props: MudLogPropertiesModalProps
): React.ReactElement => {
  const { mudLog } = props;
  const {
    operationState: { timeZone, dateTimeFormat },
    dispatchOperation
  } = useContext(OperationContext);
  const [editableMudLog, setEditableMudLog] = useState<EditableMudLog>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onSubmit = async (updatedMudLog: EditableMudLog) => {
    setIsLoading(true);
    const modifyMudLogJob = {
      object: {
        ...updatedMudLog,
        commonData: updatedMudLog.itemState
          ? { itemState: updatedMudLog.itemState }
          : null,
        objectType: ObjectType.MudLog
      },
      objectType: ObjectType.MudLog
    };
    await JobService.orderJob(JobType.ModifyObjectOnWellbore, modifyMudLogJob);
    setIsLoading(false);
    dispatchOperation({ type: OperationType.HideModal });
  };

  useEffect(() => {
    if (mudLog != null) {
      setEditableMudLog(toObjectReference(mudLog));
    }
  }, [mudLog]);

  const invalidName = invalidStringInput(
    mudLog?.name,
    editableMudLog?.name,
    MaxLength.Name
  );
  const invalidMudLogCompany = invalidStringInput(
    mudLog?.mudLogCompany,
    editableMudLog?.mudLogCompany,
    MaxLength.Name
  );
  const invalidMudLogEngineers = invalidStringInput(
    mudLog?.mudLogEngineers,
    editableMudLog?.mudLogEngineers,
    MaxLength.Description
  );
  return (
    <>
      {editableMudLog && (
        <ModalDialog
          heading={`Edit properties for ${editableMudLog.uid}`}
          content={
            <Layout>
              <EditableTextField
                property="name"
                invalid={invalidName}
                maxLength={MaxLength.Name}
                setter={setEditableMudLog}
                originalObject={mudLog}
                editableObject={editableMudLog}
              />
              <EditableTextField
                property="mudLogCompany"
                invalid={invalidMudLogCompany}
                maxLength={MaxLength.Name}
                setter={setEditableMudLog}
                originalObject={mudLog}
                editableObject={editableMudLog}
              />
              <EditableTextField
                property="mudLogEngineers"
                invalid={invalidMudLogEngineers}
                maxLength={MaxLength.Description}
                setter={setEditableMudLog}
                originalObject={mudLog}
                editableObject={editableMudLog}
              />
              <TextField
                disabled
                id="nameWell"
                label="nameWell"
                defaultValue={mudLog?.wellName}
              />
              <TextField
                disabled
                id="nameWellbore"
                label="nameWellbore"
                defaultValue={mudLog?.wellboreName}
              />
              <TextField
                disabled
                id="objectGrowing"
                label="objectGrowing"
                defaultValue={`${mudLog?.objectGrowing}`}
              />
              <TextField
                id="startMd"
                label="startMd"
                disabled
                defaultValue={mudLog?.startMd?.value}
                unit={mudLog?.startMd?.uom}
              />
              <TextField
                id="endMd"
                label="endMd"
                disabled
                defaultValue={mudLog?.endMd?.value}
                unit={mudLog?.endMd?.uom}
              />
              <TextField
                disabled
                id="dTimCreation"
                label="commonData.dTimCreation"
                defaultValue={formatDateString(
                  mudLog?.commonData?.dTimCreation,
                  timeZone,
                  dateTimeFormat
                )}
              />
              <TextField
                disabled
                id="dTimLastChange"
                label="commonData.dTimLastChange"
                defaultValue={formatDateString(
                  mudLog?.commonData?.dTimCreation,
                  timeZone,
                  dateTimeFormat
                )}
              />
              <Autocomplete
                id="itemState"
                label="commonData.itemState"
                options={itemStateValues}
                initialSelectedOptions={[mudLog?.commonData?.itemState]}
                hideClearButton
                onOptionsChange={({ selectedItems }) => {
                  setEditableMudLog({
                    ...editableMudLog,
                    itemState: selectedItems[0]
                  });
                }}
              />
            </Layout>
          }
          confirmDisabled={
            invalidName || invalidMudLogCompany || invalidMudLogEngineers
          }
          onSubmit={() => onSubmit(editableMudLog)}
          isLoading={isLoading}
        />
      )}
    </>
  );
};

type Key = keyof EditableMudLog & keyof MudLog;
export interface EditableTextFieldProps {
  property: Key;
  invalid: boolean;
  maxLength: number;
  setter: React.Dispatch<React.SetStateAction<EditableMudLog>>;
  originalObject: MudLog;
  editableObject: EditableMudLog;
}

const EditableTextField = (
  props: EditableTextFieldProps
): React.ReactElement => {
  const {
    property,
    invalid,
    maxLength,
    setter,
    originalObject,
    editableObject
  } = props;
  const originalValue = originalObject[property];
  const value = editableObject[property];
  return (
    <TextField
      id={property}
      label={property}
      defaultValue={value != null ? value : originalValue ?? ""}
      variant={invalid ? "error" : undefined}
      helperText={
        invalid ? `${property} must be 1-${maxLength} characters` : ""
      }
      onChange={(e: any) =>
        setter({
          ...editableObject,
          [property]: undefinedOnUnchagedEmptyString(
            originalValue,
            e.target.value
          )
        })
      }
    />
  );
};

export default MudLogPropertiesModal;
