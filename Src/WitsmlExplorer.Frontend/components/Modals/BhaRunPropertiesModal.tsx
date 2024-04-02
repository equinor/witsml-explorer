import { Autocomplete } from "@equinor/eds-core-react";
import { InputAdornment, TextField } from "@mui/material";
import formatDateString from "components/DateFormatter";
import { DateTimeField } from "components/Modals/DateTimeField";
import ModalDialog from "components/Modals/ModalDialog";
import { PropertiesModalMode, validText } from "components/Modals/ModalParts";
import OperationContext from "contexts/operationContext";
import {
  DateTimeFormat,
  HideModalAction
} from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import BhaRun from "models/bhaRun";
import { itemStateTypes } from "models/itemStateTypes";
import { ObjectType } from "models/objectType";
import React, { useContext, useEffect, useState } from "react";
import JobService, { JobType } from "services/jobService";

const typesOfBhaStatus = ["final", "progress", "plan", "unknown"];

export interface BhaRunPropertiesModalProps {
  mode: PropertiesModalMode;
  bhaRun: BhaRun;
  dispatchOperation: (action: HideModalAction) => void;
}

const BhaRunPropertiesModal = (
  props: BhaRunPropertiesModalProps
): React.ReactElement => {
  const { mode, bhaRun, dispatchOperation } = props;
  const {
    operationState: { timeZone }
  } = useContext(OperationContext);
  const [editableBhaRun, setEditableBhaRun] = useState<BhaRun>(null);
  const [dTimStartValid, setDTimStartValid] = useState<boolean>(true);
  const [dTimStopValid, setDTimStopValid] = useState<boolean>(true);
  const [dTimStartDrillingValid, setDTimStartDrillingValid] =
    useState<boolean>(true);
  const [dTimStopDrillingValid, setDTimStopDrillingValid] =
    useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const editMode = mode === PropertiesModalMode.Edit;

  useEffect(() => {
    setEditableBhaRun({
      ...bhaRun,
      dTimStart: bhaRun.dTimStart
        ? formatDateString(bhaRun.dTimStart, timeZone, DateTimeFormat.Raw)
        : null,
      dTimStop: bhaRun.dTimStop
        ? formatDateString(bhaRun.dTimStop, timeZone, DateTimeFormat.Raw)
        : null,
      dTimStartDrilling: bhaRun.dTimStartDrilling
        ? formatDateString(
            bhaRun.dTimStartDrilling,
            timeZone,
            DateTimeFormat.Raw
          )
        : null,
      dTimStopDrilling: bhaRun.dTimStopDrilling
        ? formatDateString(
            bhaRun.dTimStopDrilling,
            timeZone,
            DateTimeFormat.Raw
          )
        : null,
      commonData: {
        ...bhaRun.commonData,
        dTimCreation: bhaRun.commonData.dTimCreation
          ? formatDateString(
              bhaRun.commonData.dTimCreation,
              timeZone,
              DateTimeFormat.Raw
            )
          : null,
        dTimLastChange: bhaRun.commonData.dTimLastChange
          ? formatDateString(
              bhaRun.commonData.dTimLastChange,
              timeZone,
              DateTimeFormat.Raw
            )
          : null
      }
    });
  }, [bhaRun]);

  const onSubmit = async (updatedBhaRun: BhaRun) => {
    setIsLoading(true);
    const modifyJob = {
      object: { ...updatedBhaRun, objectType: ObjectType.BhaRun },
      objectType: ObjectType.BhaRun
    };
    await JobService.orderJob(JobType.ModifyObjectOnWellbore, modifyJob);
    dispatchOperation({ type: OperationType.HideModal });
  };

  return (
    <>
      {editableBhaRun && (
        <ModalDialog
          heading={
            editMode ? `Edit properties for ${editableBhaRun.name}` : `New Log`
          }
          content={
            <>
              <TextField
                disabled
                id="wellUid"
                label="well uid"
                defaultValue={editableBhaRun.wellUid}
                fullWidth
              />
              <TextField
                disabled
                id="wellName"
                label="well name"
                defaultValue={editableBhaRun.wellName}
                fullWidth
              />
              <TextField
                disabled
                id="wellboreUid"
                label="wellbore uid"
                defaultValue={editableBhaRun.wellboreUid}
                fullWidth
              />
              <TextField
                disabled
                id="wellboreName"
                label="wellbore name"
                defaultValue={editableBhaRun.wellboreName}
                fullWidth
              />
              <TextField
                disabled
                id={"uid"}
                label={"uid"}
                required
                defaultValue={editableBhaRun.uid}
                fullWidth
              />
              <TextField
                id={"name"}
                label={"name"}
                required
                value={editableBhaRun.name ?? ""}
                error={!validText(editableBhaRun.name)}
                helperText={
                  !validText(editableBhaRun.name)
                    ? "The bha run name must be 1-64 characters"
                    : ""
                }
                fullWidth
                inputProps={{ minLength: 1, maxLength: 64 }}
                onChange={(e) =>
                  setEditableBhaRun({ ...editableBhaRun, name: e.target.value })
                }
              />
              <TextField
                id={"tubular"}
                label={"tubular"}
                required
                value={editableBhaRun.tubular?.value ?? ""}
                error={editableBhaRun.tubular?.value?.length === 0}
                fullWidth
                onChange={(e) =>
                  setEditableBhaRun({
                    ...editableBhaRun,
                    tubular: {
                      ...editableBhaRun.tubular,
                      value: e.target.value
                    }
                  })
                }
              />
              <TextField
                id={"tubularUidRef"}
                label={"tubularUidRef"}
                required
                value={editableBhaRun.tubular?.uidRef ?? ""}
                error={editableBhaRun.tubular?.uidRef?.length === 0}
                fullWidth
                onChange={(e) =>
                  setEditableBhaRun({
                    ...editableBhaRun,
                    tubular: {
                      ...editableBhaRun.tubular,
                      uidRef: e.target.value
                    }
                  })
                }
              />
              <DateTimeField
                value={editableBhaRun.dTimStart}
                label="dTimStart"
                updateObject={(dateTime: string, valid: boolean) => {
                  setEditableBhaRun({ ...editableBhaRun, dTimStart: dateTime });
                  setDTimStartValid(valid);
                }}
                timeZone={timeZone}
              />
              <DateTimeField
                value={editableBhaRun.dTimStop}
                label="dTimStop"
                updateObject={(dateTime: string, valid: boolean) => {
                  setEditableBhaRun({ ...editableBhaRun, dTimStop: dateTime });
                  setDTimStopValid(valid);
                }}
                timeZone={timeZone}
              />
              <DateTimeField
                value={editableBhaRun.dTimStartDrilling}
                label="dTimStartDrilling"
                updateObject={(dateTime: string, valid: boolean) => {
                  setEditableBhaRun({
                    ...editableBhaRun,
                    dTimStartDrilling: dateTime
                  });
                  setDTimStartDrillingValid(valid);
                }}
                timeZone={timeZone}
              />
              <DateTimeField
                value={editableBhaRun.dTimStopDrilling}
                label="dTimStopDrilling"
                updateObject={(dateTime: string, valid: boolean) => {
                  setEditableBhaRun({
                    ...editableBhaRun,
                    dTimStopDrilling: dateTime
                  });
                  setDTimStopDrillingValid(valid);
                }}
                timeZone={timeZone}
              />
              <TextField
                id={"planDogleg"}
                label={"planDogleg"}
                type="number"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {editableBhaRun.planDogleg
                        ? editableBhaRun.planDogleg.uom
                        : ""}
                    </InputAdornment>
                  )
                }}
                disabled={!editableBhaRun.planDogleg}
                value={editableBhaRun.planDogleg?.value}
                onChange={(e) =>
                  setEditableBhaRun({
                    ...editableBhaRun,
                    planDogleg: {
                      value: isNaN(parseFloat(e.target.value))
                        ? undefined
                        : parseFloat(e.target.value),
                      uom: editableBhaRun.planDogleg.uom
                    }
                  })
                }
              />
              <TextField
                id={"actDogleg"}
                label={"actDogleg"}
                type="number"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {editableBhaRun.actDogleg
                        ? editableBhaRun.actDogleg.uom
                        : ""}
                    </InputAdornment>
                  )
                }}
                disabled={!editableBhaRun.actDogleg}
                value={editableBhaRun.actDogleg?.value}
                onChange={(e) =>
                  setEditableBhaRun({
                    ...editableBhaRun,
                    actDogleg: {
                      value: isNaN(parseFloat(e.target.value))
                        ? undefined
                        : parseFloat(e.target.value),
                      uom: editableBhaRun.actDogleg.uom
                    }
                  })
                }
              />
              <TextField
                id={"actDoglegMx"}
                label={"actDoglegMx"}
                type="number"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {editableBhaRun.actDoglegMx
                        ? editableBhaRun.actDoglegMx.uom
                        : ""}
                    </InputAdornment>
                  )
                }}
                disabled={!editableBhaRun.actDoglegMx}
                value={editableBhaRun.actDoglegMx?.value}
                onChange={(e) =>
                  setEditableBhaRun({
                    ...editableBhaRun,
                    actDoglegMx: {
                      value: isNaN(parseFloat(e.target.value))
                        ? undefined
                        : parseFloat(e.target.value),
                      uom: editableBhaRun.actDoglegMx.uom
                    }
                  })
                }
              />
              <Autocomplete
                id="statusBha"
                label="Select a bha status"
                options={typesOfBhaStatus}
                initialSelectedOptions={[editableBhaRun.statusBha]}
                onOptionsChange={({ selectedItems }) => {
                  setEditableBhaRun({
                    ...editableBhaRun,
                    statusBha: selectedItems[0]
                  });
                }}
              />
              <TextField
                id={"numBitRun"}
                label={"numBitRun"}
                value={editableBhaRun.numBitRun ?? ""}
                fullWidth
                onChange={(e) =>
                  setEditableBhaRun({
                    ...editableBhaRun,
                    numBitRun: e.target.value
                  })
                }
              />
              <TextField
                id={"numStringRun"}
                type="number"
                label={"numStringRun"}
                value={editableBhaRun.numStringRun ?? ""}
                fullWidth
                onChange={(e) =>
                  setEditableBhaRun({
                    ...editableBhaRun,
                    numStringRun: e.target.value
                  })
                }
              />
              <TextField
                id={"reasonTrip"}
                label={"reasonTrip"}
                value={editableBhaRun.reasonTrip ?? ""}
                fullWidth
                onChange={(e) =>
                  setEditableBhaRun({
                    ...editableBhaRun,
                    reasonTrip: e.target.value
                  })
                }
              />
              <TextField
                id={"objectiveBha"}
                label={"objectiveBha"}
                value={editableBhaRun.objectiveBha ?? ""}
                fullWidth
                onChange={(e) =>
                  setEditableBhaRun({
                    ...editableBhaRun,
                    objectiveBha: e.target.value
                  })
                }
              />
              <Autocomplete
                id="itemState"
                label="Select an item state"
                options={itemStateTypes}
                initialSelectedOptions={[
                  editableBhaRun.commonData.itemState ?? ""
                ]}
                onOptionsChange={({ selectedItems }) => {
                  const commonData = {
                    ...editableBhaRun.commonData,
                    itemState: selectedItems[0] ?? null
                  };
                  setEditableBhaRun({ ...editableBhaRun, commonData });
                }}
              />
              <TextField
                disabled
                id="dateTimeCreation"
                label="created"
                defaultValue={editableBhaRun.commonData.dTimCreation}
                fullWidth
              />
              <TextField
                disabled
                id="dateTimeLastChange"
                label="last changed"
                defaultValue={editableBhaRun.commonData.dTimLastChange}
                fullWidth
              />
              <TextField
                id="sourceName"
                label="sourceName"
                value={editableBhaRun.commonData.sourceName ?? ""}
                fullWidth
                onChange={(e) => {
                  const commonData = {
                    ...editableBhaRun.commonData,
                    sourceName: e.target.value
                  };
                  setEditableBhaRun({ ...editableBhaRun, commonData });
                }}
              />
              <TextField
                id="serviceCategory"
                label="serviceCategory"
                value={editableBhaRun.commonData.serviceCategory ?? ""}
                fullWidth
                onChange={(e) => {
                  const commonData = {
                    ...editableBhaRun.commonData,
                    serviceCategory: e.target.value
                  };
                  setEditableBhaRun({ ...editableBhaRun, commonData });
                }}
              />
              <TextField
                id="comments"
                label="comments"
                value={editableBhaRun.commonData.comments ?? ""}
                fullWidth
                onChange={(e) => {
                  const commonData = {
                    ...editableBhaRun.commonData,
                    comments: e.target.value
                  };
                  setEditableBhaRun({ ...editableBhaRun, commonData });
                }}
              />
              <TextField
                id="defaultDatum"
                label="defaultDatum"
                value={editableBhaRun.commonData.defaultDatum ?? ""}
                fullWidth
                onChange={(e) => {
                  const commonData = {
                    ...editableBhaRun.commonData,
                    defaultDatum: e.target.value
                  };
                  setEditableBhaRun({ ...editableBhaRun, commonData });
                }}
              />
            </>
          }
          confirmDisabled={
            !validText(editableBhaRun.name) ||
            !dTimStopValid ||
            !dTimStartValid ||
            !dTimStartDrillingValid ||
            !dTimStopDrillingValid
          }
          onSubmit={() => onSubmit(editableBhaRun)}
          isLoading={isLoading}
        />
      )}
    </>
  );
};

export default BhaRunPropertiesModal;
