import { Autocomplete } from "@equinor/eds-core-react";
import { InputAdornment, TextField } from "@mui/material";
import formatDateString from "components/DateFormatter";
import ModalDialog from "components/Modals/ModalDialog";
import { PropertiesModalMode, validText } from "components/Modals/ModalParts";
import OperationContext from "contexts/operationContext";
import { HideModalAction } from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import { itemStateTypes } from "models/itemStateTypes";
import { ObjectType } from "models/objectType";
import WbGeometryObject from "models/wbGeometry";
import React, { useContext, useEffect, useState } from "react";
import JobService, { JobType } from "services/jobService";

export interface WbGeometryPropertiesModalProps {
  mode: PropertiesModalMode;
  wbGeometryObject: WbGeometryObject;
  dispatchOperation: (action: HideModalAction) => void;
}

const WbGeometryPropertiesModal = (
  props: WbGeometryPropertiesModalProps
): React.ReactElement => {
  const { mode, wbGeometryObject, dispatchOperation } = props;
  const {
    operationState: { timeZone, dateTimeFormat }
  } = useContext(OperationContext);
  const [editableWbGeometryObject, setEditableWbGeometryObject] =
    useState<WbGeometryObject>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const editMode = mode === PropertiesModalMode.Edit;

  useEffect(() => {
    setEditableWbGeometryObject({
      ...wbGeometryObject,
      dTimReport: formatDateString(
        wbGeometryObject.dTimReport,
        timeZone,
        dateTimeFormat
      ),
      commonData: {
        ...wbGeometryObject.commonData,
        dTimCreation: formatDateString(
          wbGeometryObject.commonData.dTimCreation,
          timeZone,
          dateTimeFormat
        ),
        dTimLastChange: formatDateString(
          wbGeometryObject.commonData.dTimLastChange,
          timeZone,
          dateTimeFormat
        )
      }
    });
  }, [wbGeometryObject]);

  const onSubmit = async (updatedWbGeometry: WbGeometryObject) => {
    setIsLoading(true);
    const wellboreWbGeometryJob = {
      object: { ...updatedWbGeometry, objectType: ObjectType.WbGeometry },
      objectType: ObjectType.WbGeometry
    };
    await JobService.orderJob(
      JobType.ModifyObjectOnWellbore,
      wellboreWbGeometryJob
    );
    setIsLoading(false);
    dispatchOperation({ type: OperationType.HideModal });
  };

  return (
    <>
      {editableWbGeometryObject && (
        <ModalDialog
          heading={
            editMode
              ? `Edit properties for ${editableWbGeometryObject.name}`
              : `New Log`
          }
          content={
            <>
              <TextField
                disabled
                id="wellUid"
                label="well uid"
                defaultValue={editableWbGeometryObject.wellUid}
                fullWidth
              />
              <TextField
                disabled
                id="wellName"
                label="well name"
                defaultValue={editableWbGeometryObject.wellName}
                fullWidth
              />
              <TextField
                disabled
                id="wellboreUid"
                label="wellbore uid"
                defaultValue={editableWbGeometryObject.wellboreUid}
                fullWidth
              />
              <TextField
                disabled
                id="wellboreName"
                label="wellbore name"
                defaultValue={editableWbGeometryObject.wellboreName}
                fullWidth
              />
              <TextField
                disabled
                id="dateTimeCreation"
                label="created"
                defaultValue={editableWbGeometryObject.commonData.dTimCreation}
                fullWidth
              />
              <TextField
                disabled
                id="dateTimeLastChange"
                label="last changed"
                defaultValue={
                  editableWbGeometryObject.commonData.dTimLastChange
                }
                fullWidth
              />
              <TextField
                disabled
                id="dateTimeReport"
                label="time of report"
                defaultValue={editableWbGeometryObject.dTimReport}
                fullWidth
              />
              <TextField
                disabled
                id="sourceName"
                label="source name"
                defaultValue={editableWbGeometryObject.commonData.sourceName}
                fullWidth
              />
              <TextField
                disabled
                id={"uid"}
                label={"wbGeometry uid"}
                required
                defaultValue={editableWbGeometryObject.uid}
                fullWidth
              />
              <TextField
                id={"name"}
                label={"name"}
                required
                value={
                  editableWbGeometryObject.name
                    ? editableWbGeometryObject.name
                    : ""
                }
                error={editableWbGeometryObject.name.length === 0}
                helperText={
                  editableWbGeometryObject.name.length === 0
                    ? "The wbGeometry name must be 1-64 characters"
                    : ""
                }
                fullWidth
                inputProps={{ minLength: 1, maxLength: 64 }}
                onChange={(e) =>
                  setEditableWbGeometryObject({
                    ...editableWbGeometryObject,
                    name: e.target.value
                  })
                }
              />
              <TextField
                id={"mdBottom"}
                label={"mdBottom"}
                type="number"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {editableWbGeometryObject.mdBottom
                        ? editableWbGeometryObject.mdBottom.uom
                        : ""}
                    </InputAdornment>
                  )
                }}
                disabled={!editableWbGeometryObject.mdBottom}
                value={editableWbGeometryObject.mdBottom?.value}
                onChange={(e) =>
                  setEditableWbGeometryObject({
                    ...editableWbGeometryObject,
                    mdBottom: {
                      value: isNaN(parseFloat(e.target.value))
                        ? undefined
                        : parseFloat(e.target.value),
                      uom: editableWbGeometryObject.mdBottom.uom
                    }
                  })
                }
              />
              <TextField
                id={"gapAir"}
                label={"gapAir"}
                type="number"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {editableWbGeometryObject.gapAir
                        ? editableWbGeometryObject.gapAir.uom
                        : ""}
                    </InputAdornment>
                  )
                }}
                disabled={!editableWbGeometryObject.gapAir}
                value={editableWbGeometryObject.gapAir?.value}
                onChange={(e) =>
                  setEditableWbGeometryObject({
                    ...editableWbGeometryObject,
                    gapAir: {
                      value: isNaN(parseFloat(e.target.value))
                        ? undefined
                        : parseFloat(e.target.value),
                      uom: editableWbGeometryObject.gapAir.uom
                    }
                  })
                }
              />
              <TextField
                id={"depthWaterMean"}
                label={"depthWaterMean"}
                type="number"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {editableWbGeometryObject.depthWaterMean
                        ? editableWbGeometryObject.depthWaterMean.uom
                        : ""}
                    </InputAdornment>
                  )
                }}
                disabled={!editableWbGeometryObject.depthWaterMean}
                value={editableWbGeometryObject.depthWaterMean?.value}
                onChange={(e) =>
                  setEditableWbGeometryObject({
                    ...editableWbGeometryObject,
                    depthWaterMean: {
                      value: isNaN(parseFloat(e.target.value))
                        ? undefined
                        : parseFloat(e.target.value),
                      uom: editableWbGeometryObject.depthWaterMean.uom
                    }
                  })
                }
              />
              <TextField
                id="comments"
                label="comments"
                required
                value={
                  editableWbGeometryObject.commonData.comments
                    ? editableWbGeometryObject.commonData.comments
                    : ""
                }
                fullWidth
                onChange={(e) => {
                  const commonData = {
                    ...editableWbGeometryObject.commonData,
                    comments: e.target.value
                  };
                  setEditableWbGeometryObject({
                    ...editableWbGeometryObject,
                    commonData
                  });
                }}
              />
              <Autocomplete
                id="itemState"
                label="Select an item state"
                options={itemStateTypes}
                initialSelectedOptions={[
                  editableWbGeometryObject.commonData.itemState
                    ? editableWbGeometryObject.commonData.itemState
                    : ""
                ]}
                onOptionsChange={({ selectedItems }) => {
                  const commonData = {
                    ...editableWbGeometryObject.commonData,
                    itemState: selectedItems[0] ?? null
                  };
                  setEditableWbGeometryObject({
                    ...editableWbGeometryObject,
                    commonData
                  });
                }}
              />
            </>
          }
          confirmDisabled={!validText(editableWbGeometryObject.name)}
          onSubmit={() => onSubmit(editableWbGeometryObject)}
          isLoading={isLoading}
        />
      )}
    </>
  );
};

export default WbGeometryPropertiesModal;
