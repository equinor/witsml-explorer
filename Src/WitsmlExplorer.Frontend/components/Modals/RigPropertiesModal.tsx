import { Autocomplete, TextField } from "@equinor/eds-core-react";
import { DateTimeField } from "components/Modals/DateTimeField";
import ModalDialog from "components/Modals/ModalDialog";
import {
  PropertiesModalMode,
  validFaxNumber,
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
import React, { ChangeEvent, useContext, useState } from "react";
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
    (!rig.yearEntService && !editableRig?.yearEntService) ||
    editableRig?.yearEntService?.length == 4;
  const validTelNumber =
    (!rig.telNumber && !editableRig?.telNumber) ||
    validPhoneNumber(editableRig.telNumber);
  const faxNumberValid =
    (!rig.faxNumber && !editableRig?.faxNumber) ||
    validFaxNumber(editableRig.faxNumber);
  const validEmailAddress =
    (!rig.emailAddress && !editableRig?.emailAddress) ||
    validText(editableRig.emailAddress, 1, 128);
  const validNameContact =
    (!rig.nameContact && !editableRig?.nameContact) ||
    validText(editableRig?.nameContact, 1, 64);

  const validRigUid = validText(editableRig?.uid, 1, 64);
  const validRigName = validText(editableRig?.name, 1, 64);

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
                variant={validRigUid ? undefined : "error"}
                helperText={
                  !validRigUid ? "A rig uid must be 1-64 characters" : ""
                }
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEditableRig({ ...editableRig, uid: e.target.value })
                }
              />
              <TextField
                disabled
                id="wellUid"
                label="well uid"
                defaultValue={editableRig.wellUid}
              />
              <TextField
                disabled
                id="wellName"
                label="well name"
                defaultValue={editableRig.wellName}
              />
              <TextField
                disabled
                id="wellboreUid"
                label="wellbore uid"
                defaultValue={editableRig.wellboreUid}
              />
              <TextField
                disabled
                id="wellboreName"
                label="wellbore name"
                defaultValue={editableRig.wellboreName}
              />
              <TextField
                id={"name"}
                label={"name"}
                required
                value={editableRig.name ? editableRig.name : ""}
                variant={validRigName ? undefined : "error"}
                helperText={
                  !validRigName ? "The rig name must be 1-64 characters" : ""
                }
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
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
                variant={!yearEntServiceValid ? "error" : undefined}
                helperText={
                  !yearEntServiceValid
                    ? "The rig yearEntService must be a 4 digit integer number"
                    : ""
                }
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
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
                variant={!validTelNumber ? "error" : undefined}
                helperText={
                  !validTelNumber
                    ? "telNumber must be an integer of min 8 characters, however whitespace, dash and plus is accepted"
                    : ""
                }
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEditableRig({ ...editableRig, telNumber: e.target.value })
                }
              />
              <TextField
                id={"faxNumber"}
                label={"faxNumber"}
                value={editableRig.faxNumber ? editableRig.faxNumber : ""}
                variant={!faxNumberValid ? "error" : undefined}
                helperText={
                  !faxNumberValid
                    ? "faxNumber must be an integer, however whitespace, dash and plus is accepted"
                    : ""
                }
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEditableRig({ ...editableRig, faxNumber: e.target.value })
                }
              />
              <TextField
                id={"emailAddress"}
                label={"emailAddress"}
                value={editableRig.emailAddress ? editableRig.emailAddress : ""}
                variant={!validEmailAddress ? "error" : undefined}
                helperText={
                  !validEmailAddress
                    ? "The emailAddress must be at least 1 character long"
                    : ""
                }
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
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
                variant={!validNameContact ? "error" : undefined}
                helperText={
                  !validNameContact
                    ? "The nameContact must be at least 1 character long"
                    : ""
                }
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
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
                value={
                  editableRig.ratingDrillDepth
                    ? editableRig.ratingDrillDepth.value
                    : ""
                }
                disabled={!editableRig.ratingDrillDepth}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
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
                value={
                  editableRig.ratingWaterDepth
                    ? editableRig.ratingWaterDepth.value
                    : ""
                }
                disabled={!editableRig.ratingWaterDepth}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
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
                value={editableRig.airGap ? editableRig.airGap.value : ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
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
                value={editableRig.owner ?? ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setEditableRig({
                    ...editableRig,
                    owner: e.target.value
                  });
                }}
              />
              <TextField
                id={"manufacturer"}
                label={"manufacturer"}
                value={editableRig.manufacturer ?? ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setEditableRig({
                    ...editableRig,
                    manufacturer: e.target.value
                  });
                }}
              />
              <TextField
                id={"classRig"}
                label={"classRig"}
                value={editableRig.classRig ?? ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setEditableRig({
                    ...editableRig,
                    classRig: e.target.value
                  });
                }}
              />
              <TextField
                id={"approvals"}
                label={"approvals"}
                value={editableRig.approvals ?? ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setEditableRig({
                    ...editableRig,
                    approvals: e.target.value
                  });
                }}
              />
              <TextField
                id={"registration"}
                label={"registration"}
                value={editableRig.registration ?? ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
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
            !validRigUid ||
            !validRigName ||
            !dTimStartOpValid ||
            !dTimEndOpValid
          }
          onSubmit={() => onSubmit(editableRig)}
          isLoading={isLoading}
        />
      )}
    </>
  );
};

export default RigPropertiesModal;
