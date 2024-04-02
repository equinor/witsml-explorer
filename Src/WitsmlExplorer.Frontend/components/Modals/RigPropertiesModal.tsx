import { Autocomplete } from "@equinor/eds-core-react";
import { TextField } from "@mui/material";
import { DateTimeField } from "components/Modals/DateTimeField";
import ModalDialog from "components/Modals/ModalDialog";
import {
  PropertiesModalMode,
  validPhoneNumber,
  validText
} from "components/Modals/ModalParts";
import OperationContext from "contexts/operationContext";
import { HideModalAction } from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import { itemStateTypes } from "models/itemStateTypes";
import { ObjectType } from "models/objectType";
import Rig from "models/rig";
import { rigType } from "models/rigType";
import React, { useContext, useState } from "react";
import JobService, { JobType } from "services/jobService";

export interface RigPropertiesModalProps {
  mode: PropertiesModalMode;
  rig: Rig;
  dispatchOperation: (action: HideModalAction) => void;
}

const RigPropertiesModal = (
  props: RigPropertiesModalProps
): React.ReactElement => {
  const { mode, rig, dispatchOperation } = props;
  const {
    operationState: { timeZone }
  } = useContext(OperationContext);
  const [editableRig, setEditableRig] = useState<Rig>({ ...rig });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dTimStartOpValid, setDTimStartOpValid] = useState<boolean>(true);
  const [dTimEndOpValid, setDTimEndOpValid] = useState<boolean>(true);
  const editMode = mode === PropertiesModalMode.Edit;

  const onSubmit = async (updatedRig: Rig) => {
    setIsLoading(true);
    if (editMode) {
      const modifyJob = {
        object: { ...updatedRig, objectType: ObjectType.Rig },
        objectType: ObjectType.Rig
      };
      await JobService.orderJob(JobType.ModifyObjectOnWellbore, modifyJob);
    } else {
      const wellboreRigJob = {
        rig: updatedRig
      };
      await JobService.orderJob(JobType.CreateRig, wellboreRigJob);
    }
    setIsLoading(false);
    dispatchOperation({ type: OperationType.HideModal });
  };

  const yearEntServiceValid =
    (rig.yearEntService == null &&
      (editableRig?.yearEntService == null ||
        editableRig?.yearEntService.length == 0)) ||
    editableRig?.yearEntService?.length == 4;
  return (
    <>
      {editableRig && (
        <ModalDialog
          heading={
            editMode ? `Edit properties for ${editableRig.name}` : `New Rig`
          }
          content={
            <>
              <TextField
                disabled={editMode}
                id="uid"
                label="rig uid"
                required
                value={editableRig.uid}
                fullWidth
                error={!validText(editableRig.uid)}
                helperText={
                  editableRig.uid.length === 0
                    ? "A rig uid must be 1-64 characters"
                    : ""
                }
                inputProps={{ minLength: 1, maxLength: 64 }}
                onChange={(e) =>
                  setEditableRig({ ...editableRig, uid: e.target.value })
                }
              />
              <TextField
                disabled
                id="wellUid"
                label="well uid"
                defaultValue={editableRig.wellUid}
                fullWidth
              />
              <TextField
                disabled
                id="wellName"
                label="well name"
                defaultValue={editableRig.wellName}
                fullWidth
              />
              <TextField
                disabled
                id="wellboreUid"
                label="wellbore uid"
                defaultValue={editableRig.wellboreUid}
                fullWidth
              />
              <TextField
                disabled
                id="wellboreName"
                label="wellbore name"
                defaultValue={editableRig.wellboreName}
                fullWidth
              />
              <TextField
                id={"name"}
                label={"name"}
                required
                value={editableRig.name ? editableRig.name : ""}
                error={editableRig.name?.length === 0}
                helperText={
                  editableRig.name?.length === 0
                    ? "The rig name must be 1-64 characters"
                    : ""
                }
                fullWidth
                inputProps={{ minLength: 1, maxLength: 64 }}
                onChange={(e) =>
                  setEditableRig({ ...editableRig, name: e.target.value })
                }
              />
              <Autocomplete
                id="typeRig"
                label="Select a type"
                options={rigType}
                initialSelectedOptions={[editableRig.typeRig]}
                onOptionsChange={({ selectedItems }) => {
                  setEditableRig({ ...editableRig, typeRig: selectedItems[0] });
                }}
              />
              <DateTimeField
                value={editableRig.dTimStartOp}
                label="dTimStartOp"
                updateObject={(dateTime: string, valid: boolean) => {
                  setEditableRig({ ...editableRig, dTimStartOp: dateTime });
                  setDTimStartOpValid(valid);
                }}
                timeZone={timeZone}
              />
              <DateTimeField
                value={editableRig.dTimEndOp}
                label="dTimEndOp"
                updateObject={(dateTime: string, valid: boolean) => {
                  setEditableRig({ ...editableRig, dTimEndOp: dateTime });
                  setDTimEndOpValid(valid);
                }}
                timeZone={timeZone}
              />
              <TextField
                id={"yearEntService"}
                label={"yearEntService"}
                type="number"
                value={
                  editableRig.yearEntService ? editableRig.yearEntService : ""
                }
                error={editMode && !yearEntServiceValid}
                helperText={
                  editMode && !yearEntServiceValid
                    ? "The rig yearEntService must be a 4 digit integer number"
                    : ""
                }
                fullWidth
                inputProps={{ minLength: 4, maxLength: 4 }}
                onChange={(e) =>
                  setEditableRig({
                    ...editableRig,
                    yearEntService: e.target.value
                  })
                }
              />
              <TextField
                id={"telNumber"}
                label={"telNumber"}
                value={editableRig.telNumber ? editableRig.telNumber : ""}
                error={
                  editMode &&
                  (!validPhoneNumber(editableRig.telNumber) ||
                    editableRig.telNumber?.length < 8)
                }
                helperText={
                  editMode &&
                  (!validPhoneNumber(editableRig.telNumber) ||
                  editableRig.telNumber?.length < 8
                    ? "telNumber must be an integer of min 8 characters, however whitespace, dash and plus is accepted"
                    : "")
                }
                fullWidth
                inputProps={{ minLength: 8, maxLength: 16 }}
                onChange={(e) =>
                  setEditableRig({ ...editableRig, telNumber: e.target.value })
                }
              />
              <TextField
                id={"faxNumber"}
                label={"faxNumber"}
                value={editableRig.faxNumber ? editableRig.faxNumber : ""}
                error={editMode && !validPhoneNumber(editableRig.faxNumber)}
                helperText={
                  editMode && !validPhoneNumber(editableRig.faxNumber)
                    ? "faxNumber must be an integer, however whitespace, dash and plus is accepted"
                    : ""
                }
                fullWidth
                inputProps={{ minLength: 0, maxLength: 16 }}
                onChange={(e) =>
                  setEditableRig({ ...editableRig, faxNumber: e.target.value })
                }
              />
              <TextField
                id={"emailAddress"}
                label={"emailAddress"}
                value={editableRig.emailAddress ? editableRig.emailAddress : ""}
                error={editMode && editableRig.emailAddress?.length === 0}
                helperText={
                  editMode && editableRig.emailAddress?.length === 0
                    ? "The emailAddress must be at least 1 character long"
                    : ""
                }
                fullWidth
                inputProps={{ minLength: 0, maxLength: 128 }}
                onChange={(e) =>
                  setEditableRig({
                    ...editableRig,
                    emailAddress: e.target.value
                  })
                }
              />
              <TextField
                id={"nameContact"}
                label={"nameContact"}
                value={editableRig.nameContact ? editableRig.nameContact : ""}
                error={editMode && editableRig.nameContact?.length === 0}
                helperText={
                  editMode && editableRig.nameContact?.length === 0
                    ? "The nameContact must be at least 1 character long"
                    : ""
                }
                fullWidth
                inputProps={{ minLength: 0, maxLength: 128 }}
                onChange={(e) =>
                  setEditableRig({
                    ...editableRig,
                    nameContact: e.target.value
                  })
                }
              />
              <TextField
                id={"ratingDrillDepth"}
                label={"ratingDrillDepth"}
                type="number"
                fullWidth
                value={
                  editableRig.ratingDrillDepth
                    ? editableRig.ratingDrillDepth.value
                    : ""
                }
                disabled={!editableRig.ratingDrillDepth}
                onChange={(e) =>
                  setEditableRig({
                    ...editableRig,
                    ratingDrillDepth: {
                      value: isNaN(parseFloat(e.target.value))
                        ? undefined
                        : parseFloat(e.target.value),
                      uom: editableRig.ratingDrillDepth.uom
                    }
                  })
                }
              />
              <TextField
                id={"ratingWaterDepth"}
                label={"ratingWaterDepth"}
                type="number"
                fullWidth
                value={
                  editableRig.ratingWaterDepth
                    ? editableRig.ratingWaterDepth.value
                    : ""
                }
                disabled={!editableRig.ratingWaterDepth}
                onChange={(e) =>
                  setEditableRig({
                    ...editableRig,
                    ratingWaterDepth: {
                      value: isNaN(parseFloat(e.target.value))
                        ? undefined
                        : parseFloat(e.target.value),
                      uom: editableRig.ratingWaterDepth.uom
                    }
                  })
                }
              />
              <TextField
                id={"airGap"}
                label={"airGap"}
                type="number"
                fullWidth
                value={editableRig.airGap ? editableRig.airGap.value : ""}
                onChange={(e) => {
                  const uom =
                    editableRig.airGap !== null ? editableRig.airGap.uom : "m";
                  setEditableRig({
                    ...editableRig,
                    airGap: {
                      value: isNaN(parseFloat(e.target.value))
                        ? undefined
                        : parseFloat(e.target.value),
                      uom: uom
                    }
                  });
                }}
              />
              <TextField
                id={"owner"}
                label={"owner"}
                fullWidth
                value={editableRig.owner ?? ""}
                onChange={(e) => {
                  setEditableRig({
                    ...editableRig,
                    owner: e.target.value
                  });
                }}
              />
              <TextField
                id={"manufacturer"}
                label={"manufacturer"}
                fullWidth
                value={editableRig.manufacturer ?? ""}
                onChange={(e) => {
                  setEditableRig({
                    ...editableRig,
                    manufacturer: e.target.value
                  });
                }}
              />
              <TextField
                id={"classRig"}
                label={"classRig"}
                fullWidth
                value={editableRig.classRig ?? ""}
                onChange={(e) => {
                  setEditableRig({
                    ...editableRig,
                    classRig: e.target.value
                  });
                }}
              />
              <TextField
                id={"approvals"}
                label={"approvals"}
                fullWidth
                value={editableRig.approvals ?? ""}
                onChange={(e) => {
                  setEditableRig({
                    ...editableRig,
                    approvals: e.target.value
                  });
                }}
              />
              <TextField
                id={"registration"}
                label={"registration"}
                fullWidth
                value={editableRig.registration ?? ""}
                onChange={(e) => {
                  setEditableRig({
                    ...editableRig,
                    registration: e.target.value
                  });
                }}
              />
              <Autocomplete
                id="itemState"
                label="Select an item state"
                options={itemStateTypes}
                initialSelectedOptions={[
                  editableRig.commonData?.itemState
                    ? editableRig.commonData.itemState
                    : ""
                ]}
                onOptionsChange={({ selectedItems }) => {
                  const commonData = {
                    ...editableRig.commonData,
                    itemState: selectedItems[0] ?? null
                  };
                  setEditableRig({ ...editableRig, commonData });
                }}
              />
            </>
          }
          confirmDisabled={
            !validText(editableRig.name) || !dTimStartOpValid || !dTimEndOpValid
          }
          onSubmit={() => onSubmit(editableRig)}
          isLoading={isLoading}
        />
      )}
    </>
  );
};

export default RigPropertiesModal;
