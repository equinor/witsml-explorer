import { PropertiesModalMode, validText } from "./ModalParts";
import { HideModalAction } from "../../contexts/operationStateReducer";
import React, { useEffect, useState } from "react";
import ModalDialog from "./ModalDialog";
import { InputAdornment, TextField } from "@material-ui/core";
import JobService, { JobType } from "../../services/jobService";
import OperationType from "../../contexts/operationType";
import moment from "moment";
import { Autocomplete } from "@equinor/eds-core-react";
import { itemStateTypes } from "../../models/itemStateTypes";
import BhaRun from "../../models/bhaRun";
import { UpdateWellboreBhaRunsAction } from "../../contexts/navigationStateReducer";
import ModificationType from "../../contexts/modificationType";
import BhaRunService from "../../services/bhaRunService";

const typesOfBhaStatus = ["final", "progress", "plan", "unknown"];

export interface BhaRunPropertiesModalProps {
  dispatchNavigation: (action: UpdateWellboreBhaRunsAction) => void;
  mode: PropertiesModalMode;
  bhaRun: BhaRun;
  dispatchOperation: (action: HideModalAction) => void;
}

const BhaRunPropertiesModal = (props: BhaRunPropertiesModalProps): React.ReactElement => {
  const { mode, bhaRun, dispatchOperation, dispatchNavigation } = props;
  const [editableBhaRun, setEditableBhaRun] = useState<BhaRun>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const editMode = mode === PropertiesModalMode.Edit;

  useEffect(() => {
    setEditableBhaRun(bhaRun);
  }, [bhaRun]);

  const onSubmit = async (updatedBhaRun: BhaRun) => {
    setIsLoading(true);
    const wellboreBhaRunJob = {
      bhaRun: updatedBhaRun
    };
    await JobService.orderJob(JobType.ModifyBhaRun, wellboreBhaRunJob);
    const freshBhaRuns = await BhaRunService.getBhaRuns(bhaRun.wellUid, bhaRun.wellboreUid);
    dispatchNavigation({
      type: ModificationType.UpdateBhaRuns,
      payload: {
        wellUid: bhaRun.wellUid,
        wellboreUid: bhaRun.wellboreUid,
        bhaRuns: freshBhaRuns
      }
    });
    setIsLoading(false);
    dispatchOperation({ type: OperationType.HideModal });
  };

  return (
    <>
      {editableBhaRun && (
        <ModalDialog
          heading={editMode ? `Edit properties for ${editableBhaRun.name}` : `New Log`}
          content={
            <>
              <TextField disabled id="wellUid" label="well uid" defaultValue={editableBhaRun.wellUid} fullWidth />
              <TextField disabled id="wellName" label="well name" defaultValue={editableBhaRun.wellName} fullWidth />
              <TextField disabled id="wellboreUid" label="wellbore uid" defaultValue={editableBhaRun.wellboreUid} fullWidth />
              <TextField disabled id="wellboreName" label="wellbore name" defaultValue={editableBhaRun.wellboreName} fullWidth />
              <TextField disabled id={"uid"} label={"uid"} required defaultValue={editableBhaRun.uid} fullWidth />
              <TextField
                id={"name"}
                label={"name"}
                required
                value={editableBhaRun.name ?? ""}
                error={!validText(editableBhaRun.name)}
                helperText={!validText(editableBhaRun.name) ? "The bha run name must be 1-64 characters" : ""}
                fullWidth
                inputProps={{ minLength: 1, maxLength: 64 }}
                onChange={(e) => setEditableBhaRun({ ...editableBhaRun, name: e.target.value })}
              />
              <TextField
                id={"tubular"}
                label={"tubular"}
                required
                value={editableBhaRun.tubular ?? ""}
                error={editableBhaRun.tubular?.length === 0}
                fullWidth
                onChange={(e) => setEditableBhaRun({ ...editableBhaRun, tubular: e.target.value })}
              />
              <TextField
                id={"tubularUidRef"}
                label={"tubularUidRef"}
                required
                value={editableBhaRun.tubularUidRef ?? ""}
                error={editableBhaRun.tubularUidRef?.length === 0}
                fullWidth
                onChange={(e) => setEditableBhaRun({ ...editableBhaRun, tubularUidRef: e.target.value })}
              />
              <TextField
                id="dTimStart"
                label="dTimStart"
                type="datetime-local"
                fullWidth
                InputLabelProps={{
                  shrink: true
                }}
                disabled={!editableBhaRun.dTimStart}
                value={editableBhaRun.dTimStart ? moment(editableBhaRun.dTimStart).format("YYYY-MM-DDTHH:MM") : undefined}
                onChange={(e) => setEditableBhaRun({ ...editableBhaRun, dTimStart: new Date(e.target.value) })}
              />
              <TextField
                id={"dTimStop"}
                label={"dTimStop"}
                fullWidth
                type="datetime-local"
                InputLabelProps={{
                  shrink: true
                }}
                disabled={!editableBhaRun.dTimStop}
                value={editableBhaRun.dTimStop ? moment(editableBhaRun.dTimStop).format("YYYY-MM-DDTHH:MM") : undefined}
                onChange={(e) => setEditableBhaRun({ ...editableBhaRun, dTimStop: new Date(e.target.value) })}
              />
              <TextField
                id="dTimStartDrilling"
                label="dTimStartDrilling"
                type="datetime-local"
                fullWidth
                InputLabelProps={{
                  shrink: true
                }}
                disabled={!editableBhaRun.dTimStartDrilling}
                value={editableBhaRun.dTimStartDrilling ? moment(editableBhaRun.dTimStartDrilling).format("YYYY-MM-DDTHH:MM") : undefined}
                onChange={(e) => setEditableBhaRun({ ...editableBhaRun, dTimStartDrilling: new Date(e.target.value) })}
              />
              <TextField
                id={"dTimStopDrilling"}
                label={"dTimStopDrilling"}
                fullWidth
                type="datetime-local"
                InputLabelProps={{
                  shrink: true
                }}
                disabled={!editableBhaRun.dTimStopDrilling}
                value={editableBhaRun.dTimStopDrilling ? moment(editableBhaRun.dTimStopDrilling).format("YYYY-MM-DDTHH:MM") : undefined}
                onChange={(e) => setEditableBhaRun({ ...editableBhaRun, dTimStopDrilling: new Date(e.target.value) })}
              />
              <TextField
                id={"planDogleg"}
                label={"planDogleg"}
                type="number"
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start">{editableBhaRun.planDogleg ? editableBhaRun.planDogleg.uom : ""}</InputAdornment>
                }}
                disabled={!editableBhaRun.planDogleg}
                value={editableBhaRun.planDogleg?.value}
                onChange={(e) =>
                  setEditableBhaRun({
                    ...editableBhaRun,
                    planDogleg: { value: isNaN(parseFloat(e.target.value)) ? undefined : parseFloat(e.target.value), uom: editableBhaRun.planDogleg.uom }
                  })
                }
              />
              <TextField
                id={"actDogleg"}
                label={"actDogleg"}
                type="number"
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start">{editableBhaRun.actDogleg ? editableBhaRun.actDogleg.uom : ""}</InputAdornment>
                }}
                disabled={!editableBhaRun.actDogleg}
                value={editableBhaRun.actDogleg?.value}
                onChange={(e) =>
                  setEditableBhaRun({
                    ...editableBhaRun,
                    actDogleg: { value: isNaN(parseFloat(e.target.value)) ? undefined : parseFloat(e.target.value), uom: editableBhaRun.actDogleg.uom }
                  })
                }
              />
              <TextField
                id={"actDoglegMx"}
                label={"actDoglegMx"}
                type="number"
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start">{editableBhaRun.actDoglegMx ? editableBhaRun.actDoglegMx.uom : ""}</InputAdornment>
                }}
                disabled={!editableBhaRun.actDoglegMx}
                value={editableBhaRun.actDoglegMx?.value}
                onChange={(e) =>
                  setEditableBhaRun({
                    ...editableBhaRun,
                    actDoglegMx: { value: isNaN(parseFloat(e.target.value)) ? undefined : parseFloat(e.target.value), uom: editableBhaRun.actDoglegMx.uom }
                  })
                }
              />
              <Autocomplete
                id="statusBha"
                label="Select a bha status"
                options={typesOfBhaStatus}
                initialSelectedOptions={[editableBhaRun.statusBha]}
                onOptionsChange={({ selectedItems }) => {
                  setEditableBhaRun({ ...editableBhaRun, statusBha: selectedItems[0] });
                }}
              />
              <TextField
                id={"numBitRun"}
                label={"numBitRun"}
                value={editableBhaRun.numBitRun ?? ""}
                fullWidth
                onChange={(e) => setEditableBhaRun({ ...editableBhaRun, numBitRun: e.target.value })}
              />
              <TextField
                id={"numStringRun"}
                type="number"
                label={"numStringRun"}
                value={editableBhaRun.numStringRun ?? ""}
                fullWidth
                onChange={(e) => setEditableBhaRun({ ...editableBhaRun, numStringRun: e.target.value })}
              />
              <TextField
                id={"reasonTrip"}
                label={"reasonTrip"}
                value={editableBhaRun.reasonTrip ?? ""}
                fullWidth
                onChange={(e) => setEditableBhaRun({ ...editableBhaRun, reasonTrip: e.target.value })}
              />
              <TextField
                id={"objectiveBha"}
                label={"objectiveBha"}
                value={editableBhaRun.objectiveBha ?? ""}
                fullWidth
                onChange={(e) => setEditableBhaRun({ ...editableBhaRun, objectiveBha: e.target.value })}
              />
              <Autocomplete
                id="itemState"
                label="Select an item state"
                options={itemStateTypes}
                initialSelectedOptions={[editableBhaRun.commonData.itemState ?? ""]}
                onOptionsChange={({ selectedItems }) => {
                  const commonData = { ...editableBhaRun.commonData, itemState: selectedItems[0] ?? null };
                  setEditableBhaRun({ ...editableBhaRun, commonData });
                }}
              />
              <TextField disabled id="dateTimeCreation" label="created" defaultValue={editableBhaRun.commonData.dTimCreation} fullWidth />
              <TextField disabled id="dateTimeLastChange" label="last changed" defaultValue={editableBhaRun.commonData.dTimLastChange} fullWidth />
              <TextField
                id="sourceName"
                label="sourceName"
                value={editableBhaRun.commonData.sourceName ?? ""}
                fullWidth
                onChange={(e) => {
                  const commonData = { ...editableBhaRun.commonData, sourceName: e.target.value };
                  setEditableBhaRun({ ...editableBhaRun, commonData });
                }}
              />
              <TextField
                id="serviceCategory"
                label="serviceCategory"
                value={editableBhaRun.commonData.serviceCategory ?? ""}
                fullWidth
                onChange={(e) => {
                  const commonData = { ...editableBhaRun.commonData, serviceCategory: e.target.value };
                  setEditableBhaRun({ ...editableBhaRun, commonData });
                }}
              />
              <TextField
                id="comments"
                label="comments"
                value={editableBhaRun.commonData.comments ?? ""}
                fullWidth
                onChange={(e) => {
                  const commonData = { ...editableBhaRun.commonData, comments: e.target.value };
                  setEditableBhaRun({ ...editableBhaRun, commonData });
                }}
              />
              <TextField
                id="defaultDatum"
                label="defaultDatum"
                value={editableBhaRun.commonData.defaultDatum ?? ""}
                fullWidth
                onChange={(e) => {
                  const commonData = { ...editableBhaRun.commonData, defaultDatum: e.target.value };
                  setEditableBhaRun({ ...editableBhaRun, commonData });
                }}
              />
            </>
          }
          confirmDisabled={!validText(editableBhaRun.name)}
          onSubmit={() => onSubmit(editableBhaRun)}
          isLoading={isLoading}
        />
      )}
    </>
  );
};

export default BhaRunPropertiesModal;
