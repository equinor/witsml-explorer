import { Autocomplete } from "@equinor/eds-core-react";
import { TextField } from "@material-ui/core";
import React, { useContext, useEffect, useState } from "react";
import OperationContext from "../../contexts/operationContext";
import { HideModalAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import { itemStateTypes } from "../../models/itemStateTypes";
import Rig from "../../models/rig";
import { rigType } from "../../models/rigType";
import JobService, { JobType } from "../../services/jobService";
import { DateTimeField } from "./DateTimeField";
import ModalDialog from "./ModalDialog";
import { PropertiesModalMode, validPhoneNumber, validText } from "./ModalParts";

export interface RigPropertiesModalProps {
  mode: PropertiesModalMode;
  rig: Rig;
  dispatchOperation: (action: HideModalAction) => void;
}

const RigPropertiesModal = (props: RigPropertiesModalProps): React.ReactElement => {
  const { mode, rig, dispatchOperation } = props;
  const {
    operationState: { timeZone }
  } = useContext(OperationContext);
  const [editableRig, setEditableRig] = useState<Rig>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dTimStartOpValid, setDTimStartOpValid] = useState<boolean>(true);
  const [dTimEndOpValid, setDTimEndOpValid] = useState<boolean>(true);
  const editMode = mode === PropertiesModalMode.Edit;

  useEffect(() => {
    setEditableRig({
      ...rig
    });
  }, [rig]);

  const onSubmit = async (updatedRig: Rig) => {
    setIsLoading(true);
    const wellboreRigJob = {
      rig: updatedRig
    };
    await JobService.orderJob(JobType.ModifyRig, wellboreRigJob);
    setIsLoading(false);
    dispatchOperation({ type: OperationType.HideModal });
  };

  const yearEntServiceValid =
    (rig.yearEntService == null && (editableRig?.yearEntService == null || editableRig?.yearEntService.length == 0)) || editableRig?.yearEntService?.length == 4;
  return (
    <>
      {editableRig && (
        <ModalDialog
          heading={editMode ? `Edit properties for ${editableRig.name}` : `New Log`}
          content={
            <>
              <TextField disabled id="wellUid" label="well uid" defaultValue={editableRig.wellUid} fullWidth />
              <TextField disabled id="wellName" label="well name" defaultValue={editableRig.wellName} fullWidth />
              <TextField disabled id="wellboreUid" label="wellbore uid" defaultValue={editableRig.wellboreUid} fullWidth />
              <TextField disabled id="wellboreName" label="wellbore name" defaultValue={editableRig.wellboreName} fullWidth />
              <TextField disabled id="uid" label="rig uid" required defaultValue={editableRig.uid} fullWidth />
              <TextField
                id={"name"}
                label={"name"}
                required
                value={editableRig.name ? editableRig.name : ""}
                error={editableRig.name?.length === 0}
                helperText={editableRig.name?.length === 0 ? "The rig name must be 1-64 characters" : ""}
                fullWidth
                inputProps={{ minLength: 1, maxLength: 64 }}
                onChange={(e) => setEditableRig({ ...editableRig, name: e.target.value })}
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
                value={editableRig.yearEntService ? editableRig.yearEntService : ""}
                error={!yearEntServiceValid}
                helperText={!yearEntServiceValid ? "The rig yearEntService must be a 4 digit integer number" : ""}
                fullWidth
                inputProps={{ minLength: 4, maxLength: 4 }}
                onChange={(e) => setEditableRig({ ...editableRig, yearEntService: e.target.value })}
              />
              <TextField
                id={"telNumber"}
                label={"telNumber"}
                value={editableRig.telNumber ? editableRig.telNumber : ""}
                error={!validPhoneNumber(editableRig.telNumber) || editableRig.telNumber?.length < 8}
                helperText={
                  !validPhoneNumber(editableRig.telNumber) || editableRig.telNumber?.length < 8
                    ? "telNumber must be an integer of min 8 characters, however whitespace, dash and plus is accepted"
                    : ""
                }
                fullWidth
                inputProps={{ minLength: 8, maxLength: 16 }}
                onChange={(e) => setEditableRig({ ...editableRig, telNumber: e.target.value })}
              />
              <TextField
                id={"faxNumber"}
                label={"faxNumber"}
                value={editableRig.faxNumber ? editableRig.faxNumber : ""}
                error={!validPhoneNumber(editableRig.faxNumber)}
                helperText={!validPhoneNumber(editableRig.faxNumber) ? "faxNumber must be an integer, however whitespace, dash and plus is accepted" : ""}
                fullWidth
                inputProps={{ minLength: 0, maxLength: 16 }}
                onChange={(e) => setEditableRig({ ...editableRig, faxNumber: e.target.value })}
              />
              <TextField
                id={"emailAddress"}
                label={"emailAddress"}
                value={editableRig.emailAddress ? editableRig.emailAddress : ""}
                error={editableRig.emailAddress?.length === 0}
                helperText={editableRig.emailAddress?.length === 0 ? "The emailAddress must be at least 1 character long" : ""}
                fullWidth
                inputProps={{ minLength: 0, maxLength: 128 }}
                onChange={(e) => setEditableRig({ ...editableRig, emailAddress: e.target.value })}
              />
              <TextField
                id={"nameContact"}
                label={"nameContact"}
                value={editableRig.nameContact ? editableRig.nameContact : ""}
                error={editableRig.nameContact?.length === 0}
                helperText={editableRig.nameContact?.length === 0 ? "The nameContact must be at least 1 character long" : ""}
                fullWidth
                inputProps={{ minLength: 0, maxLength: 128 }}
                onChange={(e) => setEditableRig({ ...editableRig, nameContact: e.target.value })}
              />
              <TextField
                id={"RatingDrillDepth"}
                label={"RatingDrillDepth"}
                type="number"
                fullWidth
                value={editableRig.ratingDrillDepth ? editableRig.ratingDrillDepth.value : ""}
                disabled={!editableRig.ratingDrillDepth}
                onChange={(e) =>
                  setEditableRig({
                    ...editableRig,
                    ratingDrillDepth: { value: isNaN(parseFloat(e.target.value)) ? undefined : parseFloat(e.target.value), uom: editableRig.ratingDrillDepth.uom }
                  })
                }
              />
              <TextField
                id={"ratingWaterDepth"}
                label={"ratingWaterDepth"}
                type="number"
                fullWidth
                value={editableRig.ratingWaterDepth ? editableRig.ratingWaterDepth.value : ""}
                disabled={!editableRig.ratingWaterDepth}
                onChange={(e) =>
                  setEditableRig({
                    ...editableRig,
                    ratingWaterDepth: { value: isNaN(parseFloat(e.target.value)) ? undefined : parseFloat(e.target.value), uom: editableRig.ratingWaterDepth.uom }
                  })
                }
              />
              <TextField
                id={"airGap"}
                label={"airGap"}
                type="number"
                fullWidth
                value={editableRig.airGap ? editableRig.airGap.value : ""}
                disabled={!editableRig.airGap}
                onChange={(e) =>
                  setEditableRig({ ...editableRig, airGap: { value: isNaN(parseFloat(e.target.value)) ? undefined : parseFloat(e.target.value), uom: editableRig.airGap.uom } })
                }
              />
              <Autocomplete
                id="itemState"
                label="Select an item state"
                options={itemStateTypes}
                initialSelectedOptions={[editableRig.commonData?.itemState ? editableRig.commonData.itemState : ""]}
                onOptionsChange={({ selectedItems }) => {
                  const commonData = { ...editableRig.commonData, itemState: selectedItems[0] ?? null };
                  setEditableRig({ ...editableRig, commonData });
                }}
              />
            </>
          }
          confirmDisabled={!validText(editableRig.name) || !dTimStartOpValid || !dTimEndOpValid || !yearEntServiceValid}
          onSubmit={() => onSubmit(editableRig)}
          isLoading={isLoading}
        />
      )}
    </>
  );
};

export default RigPropertiesModal;
