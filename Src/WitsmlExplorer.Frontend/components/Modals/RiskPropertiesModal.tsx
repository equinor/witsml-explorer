import { Autocomplete } from "@equinor/eds-core-react";
import { InputAdornment, TextField } from "@material-ui/core";
import formatDateString from "components/DateFormatter";
import { DateTimeField } from "components/Modals/DateTimeField";
import ModalDialog from "components/Modals/ModalDialog";
import { PropertiesModalMode, validText } from "components/Modals/ModalParts";
import OperationContext from "contexts/operationContext";
import { HideModalAction } from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import { itemStateTypes } from "models/itemStateTypes";
import { ObjectType } from "models/objectType";
import { riskAffectedPersonnel } from "models/riskAffectedPersonnel";
import { riskCategory } from "models/riskCategory";
import RiskObject from "models/riskObject";
import { riskSubCategory } from "models/riskSubCategory";
import { riskType } from "models/riskType";
import React, { useContext, useEffect, useState } from "react";
import JobService, { JobType } from "services/jobService";

export interface RiskPropertiesModalProps {
  mode: PropertiesModalMode;
  riskObject: RiskObject;
  dispatchOperation: (action: HideModalAction) => void;
}

const RiskPropertiesModal = (
  props: RiskPropertiesModalProps
): React.ReactElement => {
  const { mode, riskObject, dispatchOperation } = props;
  const {
    operationState: { timeZone, dateTimeFormat }
  } = useContext(OperationContext);
  const [editableRiskObject, setEditableRiskObject] =
    useState<RiskObject>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dTimStartValid, setDTimStartValid] = useState<boolean>(true);
  const [dTimEndValid, setDTimEndValid] = useState<boolean>(true);
  const editMode = mode === PropertiesModalMode.Edit;

  useEffect(() => {
    setEditableRiskObject({
      ...riskObject,
      dTimStart: formatDateString(
        riskObject.dTimStart,
        timeZone,
        dateTimeFormat
      ),
      dTimEnd: formatDateString(riskObject.dTimEnd, timeZone, dateTimeFormat),
      commonData: {
        ...riskObject.commonData,
        dTimCreation: formatDateString(
          riskObject.commonData.dTimCreation,
          timeZone,
          dateTimeFormat
        ),
        dTimLastChange: formatDateString(
          riskObject.commonData.dTimLastChange,
          timeZone,
          dateTimeFormat
        )
      }
    });
  }, [riskObject]);

  const onSubmit = async (updatedRisk: RiskObject) => {
    setIsLoading(true);
    const modifyJob = {
      object: { ...updatedRisk, objectType: ObjectType.Risk },
      objectType: ObjectType.Risk
    };
    await JobService.orderJob(JobType.ModifyObjectOnWellbore, modifyJob);
    setIsLoading(false);
    dispatchOperation({ type: OperationType.HideModal });
  };

  return (
    <>
      {editableRiskObject && (
        <ModalDialog
          heading={
            editMode
              ? `Edit properties for ${editableRiskObject.name}`
              : `New Log`
          }
          content={
            <>
              <TextField
                disabled
                id="wellUid"
                label="well uid"
                defaultValue={editableRiskObject.wellUid}
                fullWidth
              />
              <TextField
                disabled
                id="wellName"
                label="well name"
                defaultValue={editableRiskObject.wellName}
                fullWidth
              />
              <TextField
                disabled
                id="wellboreUid"
                label="wellbore uid"
                defaultValue={editableRiskObject.wellboreUid}
                fullWidth
              />
              <TextField
                disabled
                id="wellboreName"
                label="wellbore name"
                defaultValue={editableRiskObject.wellboreName}
                fullWidth
              />
              <TextField
                disabled
                id="dateTimeCreation"
                label="created"
                defaultValue={editableRiskObject.commonData.dTimCreation}
                fullWidth
              />
              <TextField
                disabled
                id="dateTimeLastChange"
                label="last changed"
                defaultValue={editableRiskObject.commonData.dTimLastChange}
                fullWidth
              />
              <TextField
                disabled
                id={"uid"}
                label={"risk uid"}
                required
                defaultValue={editableRiskObject.uid}
                fullWidth
              />
              <TextField
                id={"name"}
                label={"name"}
                required
                value={editableRiskObject.name ? editableRiskObject.name : ""}
                error={editableRiskObject.name.length === 0}
                helperText={
                  editableRiskObject.name.length === 0
                    ? "The risk name must be 1-64 characters"
                    : ""
                }
                fullWidth
                inputProps={{ minLength: 1, maxLength: 64 }}
                onChange={(e) =>
                  setEditableRiskObject({
                    ...editableRiskObject,
                    name: e.target.value
                  })
                }
              />
              <Autocomplete
                id="type"
                label="Select a type"
                options={riskType}
                initialSelectedOptions={[editableRiskObject.type]}
                onOptionsChange={({ selectedItems }) => {
                  setEditableRiskObject({
                    ...editableRiskObject,
                    type: selectedItems[0]
                  });
                }}
              />
              <Autocomplete
                id="category"
                label="Select a category"
                options={riskCategory}
                initialSelectedOptions={[editableRiskObject.category]}
                onOptionsChange={({ selectedItems }) => {
                  setEditableRiskObject({
                    ...editableRiskObject,
                    category: selectedItems[0]
                  });
                }}
              />

              <Autocomplete
                id="subCategory"
                label="Select a sub category"
                options={riskSubCategory}
                initialSelectedOptions={[editableRiskObject.subCategory]}
                onOptionsChange={({ selectedItems }) => {
                  setEditableRiskObject({
                    ...editableRiskObject,
                    subCategory: selectedItems[0]
                  });
                }}
              />
              <TextField
                id="extendCategory"
                label="extendCategory"
                value={
                  editableRiskObject.extendCategory
                    ? editableRiskObject.extendCategory
                    : ""
                }
                fullWidth
                inputProps={{ minLength: 1 }}
                onChange={(e) =>
                  setEditableRiskObject({
                    ...editableRiskObject,
                    extendCategory: e.target.value
                  })
                }
              />
              <Autocomplete
                id="affectedPersonnel"
                label="Select multiple affected personnel"
                selectedOptions={
                  editableRiskObject.affectedPersonnel
                    ? editableRiskObject.affectedPersonnel.split(", ")
                    : []
                }
                options={riskAffectedPersonnel}
                multiple
                onOptionsChange={({ selectedItems }) => {
                  setEditableRiskObject({
                    ...editableRiskObject,
                    affectedPersonnel: selectedItems.join(", ")
                  });
                }}
              />
              <DateTimeField
                value={editableRiskObject.dTimStart}
                label="dTimStart"
                updateObject={(dateTime: string, valid: boolean) => {
                  setEditableRiskObject({
                    ...editableRiskObject,
                    dTimStart: dateTime
                  });
                  setDTimStartValid(valid);
                }}
                timeZone={timeZone}
              />
              <DateTimeField
                value={editableRiskObject.dTimEnd}
                label="dTimEnd"
                updateObject={(dateTime: string, valid: boolean) => {
                  setEditableRiskObject({
                    ...editableRiskObject,
                    dTimEnd: dateTime
                  });
                  setDTimEndValid(valid);
                }}
                timeZone={timeZone}
              />
              <TextField
                id={"mdBitStart"}
                label={"mdBitStart"}
                type="number"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {editableRiskObject.mdBitStart
                        ? editableRiskObject.mdBitStart.uom
                        : ""}
                    </InputAdornment>
                  )
                }}
                disabled={!editableRiskObject.mdBitStart}
                value={editableRiskObject.mdBitStart?.value}
                onChange={(e) =>
                  setEditableRiskObject({
                    ...editableRiskObject,
                    mdBitStart: {
                      value: isNaN(parseFloat(e.target.value))
                        ? undefined
                        : parseFloat(e.target.value),
                      uom: editableRiskObject.mdBitStart.uom
                    }
                  })
                }
              />
              <TextField
                id={"mdBitEnd"}
                label={"mdBitEnd"}
                type="number"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {editableRiskObject.mdBitEnd
                        ? editableRiskObject.mdBitEnd.uom
                        : ""}
                    </InputAdornment>
                  )
                }}
                disabled={!editableRiskObject.mdBitEnd}
                value={editableRiskObject.mdBitEnd?.value}
                onChange={(e) =>
                  setEditableRiskObject({
                    ...editableRiskObject,
                    mdBitEnd: {
                      value: isNaN(parseFloat(e.target.value))
                        ? undefined
                        : parseFloat(e.target.value),
                      uom: editableRiskObject.mdBitEnd.uom
                    }
                  })
                }
              />
              <TextField
                id="severityLevel"
                label="severityLevel"
                value={
                  editableRiskObject.severityLevel
                    ? editableRiskObject.severityLevel
                    : ""
                }
                error={editableRiskObject.severityLevel?.length === 0}
                helperText={
                  editableRiskObject.severityLevel?.length === 0
                    ? "The risk severityLevel must be at least 1 character"
                    : ""
                }
                fullWidth
                inputProps={{ minLength: 1 }}
                onChange={(e) =>
                  setEditableRiskObject({
                    ...editableRiskObject,
                    severityLevel: e.target.value
                  })
                }
              />
              <TextField
                id="probabilityLevel"
                label="probabilityLevel"
                value={
                  editableRiskObject.probabilityLevel
                    ? editableRiskObject.probabilityLevel
                    : ""
                }
                error={editableRiskObject.probabilityLevel?.length === 0}
                helperText={
                  editableRiskObject.probabilityLevel?.length === 0
                    ? "The risk probabilityLevel must be at least 1 character"
                    : ""
                }
                fullWidth
                inputProps={{ minLength: 1 }}
                onChange={(e) =>
                  setEditableRiskObject({
                    ...editableRiskObject,
                    probabilityLevel: e.target.value
                  })
                }
              />
              <TextField
                id="summary"
                label="summary"
                required
                value={
                  editableRiskObject.summary ? editableRiskObject.summary : ""
                }
                error={editableRiskObject.summary?.length === 0}
                helperText={
                  editableRiskObject.summary?.length === 0
                    ? "The risk summary must be at least 1 character"
                    : ""
                }
                fullWidth
                inputProps={{ minLength: 1 }}
                onChange={(e) =>
                  setEditableRiskObject({
                    ...editableRiskObject,
                    summary: e.target.value
                  })
                }
              />
              <TextField
                id="details"
                label="details"
                value={
                  editableRiskObject.details ? editableRiskObject.details : ""
                }
                error={editableRiskObject.details?.length === 0}
                multiline
                helperText={
                  editableRiskObject.details?.length === 0
                    ? "The risk details must be between 1 and 256 characters"
                    : ""
                }
                fullWidth
                inputProps={{ minLength: 1, maxLength: 256 }}
                onChange={(e) =>
                  setEditableRiskObject({
                    ...editableRiskObject,
                    details: e.target.value
                  })
                }
              />
              <TextField
                id="sourceName"
                label="sourceName"
                value={
                  editableRiskObject.commonData.sourceName
                    ? editableRiskObject.commonData.sourceName
                    : ""
                }
                fullWidth
                onChange={(e) => {
                  const commonData = {
                    ...editableRiskObject.commonData,
                    sourceName: e.target.value
                  };
                  setEditableRiskObject({ ...editableRiskObject, commonData });
                }}
              />
              <Autocomplete
                id="itemState"
                label="Select an item state"
                options={itemStateTypes}
                initialSelectedOptions={[
                  editableRiskObject.commonData.itemState
                    ? editableRiskObject.commonData.itemState
                    : ""
                ]}
                onOptionsChange={({ selectedItems }) => {
                  const commonData = {
                    ...editableRiskObject.commonData,
                    itemState: selectedItems[0] ?? null
                  };
                  setEditableRiskObject({ ...editableRiskObject, commonData });
                }}
              />
            </>
          }
          confirmDisabled={
            !validText(editableRiskObject.name) ||
            !dTimStartValid ||
            !dTimEndValid
          }
          onSubmit={() => onSubmit(editableRiskObject)}
          isLoading={isLoading}
        />
      )}
    </>
  );
};

export default RiskPropertiesModal;
