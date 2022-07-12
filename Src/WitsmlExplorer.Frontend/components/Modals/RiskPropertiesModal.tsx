import { PropertiesModalMode, validText } from "./ModalParts";
import { HideModalAction } from "../../contexts/operationStateReducer";
import RiskObject from "../../models/riskObject";
import React, { useEffect, useState } from "react";
import ModalDialog from "./ModalDialog";
import { TextField } from "@material-ui/core";
import JobService, { JobType } from "../../services/jobService";
import OperationType from "../../contexts/operationType";
import moment from "moment";
import { Autocomplete } from "@equinor/eds-core-react";
import { riskAffectedPersonnel } from "../../models/riskAffectedPersonnel";
import { riskCategory } from "../../models/riskCategory";
import { riskSubCategory } from "../../models/riskSubCategory";
import { riskType } from "../../models/riskType";
import { itemStateTypes } from "../../models/itemStateTypes";

export interface RiskPropertiesModalProps {
  mode: PropertiesModalMode;
  riskObject: RiskObject;
  dispatchOperation: (action: HideModalAction) => void;
}

const RiskPropertiesModal = (props: RiskPropertiesModalProps): React.ReactElement => {
  const { mode, riskObject, dispatchOperation } = props;
  const [editableRiskObject, setEditableRiskObject] = useState<RiskObject>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const editMode = mode === PropertiesModalMode.Edit;

  useEffect(() => {
    setEditableRiskObject(riskObject);
  }, [riskObject]);

  const onSubmit = async (updatedRisk: RiskObject) => {
    setIsLoading(true);
    const wellboreRiskJob = {
      risk: updatedRisk
    };
    await JobService.orderJob(JobType.ModifyRisk, wellboreRiskJob);
    setIsLoading(false);
    dispatchOperation({ type: OperationType.HideModal });
  };

  return (
    <>
      {editableRiskObject && (
        <ModalDialog
          heading={editMode ? `Edit properties for ${editableRiskObject.name}` : `New Log`}
          content={
            <>
              <TextField disabled id="wellUid" label="well uid" defaultValue={editableRiskObject.wellUid} fullWidth />
              <TextField disabled id="wellName" label="well name" defaultValue={editableRiskObject.wellName} fullWidth />
              <TextField disabled id="wellboreUid" label="wellbore uid" defaultValue={editableRiskObject.wellboreUid} fullWidth />
              <TextField disabled id="wellboreName" label="wellbore name" defaultValue={editableRiskObject.wellboreName} fullWidth />
              <TextField disabled id="dateTimeCreation" label="created" defaultValue={editableRiskObject.commonData.dTimCreation} fullWidth />
              <TextField disabled id="dateTimeLastChange" label="last changed" defaultValue={editableRiskObject.commonData.dTimLastChange} fullWidth />
              <TextField disabled id={"uid"} label={"risk uid"} required defaultValue={editableRiskObject.uid} fullWidth />
              <TextField
                id={"name"}
                label={"name"}
                required
                value={editableRiskObject.name ? editableRiskObject.name : ""}
                error={editableRiskObject.name.length === 0}
                helperText={editableRiskObject.name.length === 0 ? "The risk name must be 1-64 characters" : ""}
                fullWidth
                inputProps={{ minLength: 1, maxLength: 64 }}
                onChange={(e) => setEditableRiskObject({ ...editableRiskObject, name: e.target.value })}
              />
              <Autocomplete
                id="type"
                label="Select a type"
                options={riskType}
                initialSelectedOptions={[editableRiskObject.type]}
                onOptionsChange={({ selectedItems }) => {
                  setEditableRiskObject({ ...editableRiskObject, type: selectedItems[0] });
                }}
              />
              <Autocomplete
                id="category"
                label="Select a category"
                options={riskCategory}
                initialSelectedOptions={[editableRiskObject.category]}
                onOptionsChange={({ selectedItems }) => {
                  setEditableRiskObject({ ...editableRiskObject, category: selectedItems[0] });
                }}
              />

              <Autocomplete
                id="subCategory"
                label="Select a sub category"
                options={riskSubCategory}
                initialSelectedOptions={[editableRiskObject.subCategory]}
                onOptionsChange={({ selectedItems }) => {
                  setEditableRiskObject({ ...editableRiskObject, subCategory: selectedItems[0] });
                }}
              />
              <TextField
                id="extendCategory"
                label="extendCategory"
                required
                value={editableRiskObject.extendCategory ? editableRiskObject.extendCategory : ""}
                fullWidth
                inputProps={{ minLength: 1 }}
                onChange={(e) => setEditableRiskObject({ ...editableRiskObject, extendCategory: e.target.value })}
              />
              <Autocomplete
                id="affectedPersonnel"
                label="Select multiple affected personnel"
                selectedOptions={editableRiskObject.affectedPersonnel ? editableRiskObject.affectedPersonnel.split(", ") : []}
                options={riskAffectedPersonnel}
                multiple
                onOptionsChange={({ selectedItems }) => {
                  setEditableRiskObject({ ...editableRiskObject, affectedPersonnel: selectedItems.join(", ") });
                }}
              />
              <TextField
                id="dTimStart"
                label="dTimStart"
                type="datetime-local"
                fullWidth
                InputLabelProps={{
                  shrink: true
                }}
                disabled={!editableRiskObject.dTimEnd}
                value={editableRiskObject.dTimStart ? moment(editableRiskObject.dTimStart).format("YYYY-MM-DDTHH:MM") : undefined}
                onChange={(e) => setEditableRiskObject({ ...editableRiskObject, dTimStart: new Date(e.target.value) })}
              />
              <TextField
                id={"dTimEnd"}
                label={"dTimEnd"}
                fullWidth
                type="datetime-local"
                InputLabelProps={{
                  shrink: true
                }}
                disabled={!editableRiskObject.dTimEnd}
                value={editableRiskObject.dTimEnd ? moment(editableRiskObject.dTimEnd).format("YYYY-MM-DDTHH:MM") : undefined}
                onChange={(e) => setEditableRiskObject({ ...editableRiskObject, dTimEnd: new Date(e.target.value) })}
              />
              <TextField
                id="severityLevel"
                label="severityLevel"
                required
                value={editableRiskObject.severityLevel ? editableRiskObject.severityLevel : ""}
                error={editableRiskObject.severityLevel.length === 0}
                helperText={editableRiskObject.severityLevel.length === 0 ? "The risk severityLevel must be at least 1 character" : ""}
                fullWidth
                inputProps={{ minLength: 1 }}
                onChange={(e) => setEditableRiskObject({ ...editableRiskObject, severityLevel: e.target.value })}
              />
              <TextField
                id="probabilityLevel"
                label="probabilityLevel"
                required
                value={editableRiskObject.probabilityLevel ? editableRiskObject.probabilityLevel : ""}
                error={editableRiskObject.probabilityLevel.length === 0}
                helperText={editableRiskObject.probabilityLevel.length === 0 ? "The risk probabilityLevel must be at least 1 character" : ""}
                fullWidth
                inputProps={{ minLength: 1 }}
                onChange={(e) => setEditableRiskObject({ ...editableRiskObject, probabilityLevel: e.target.value })}
              />
              <TextField
                id="summary"
                label="summary"
                required
                value={editableRiskObject.summary ? editableRiskObject.summary : ""}
                error={editableRiskObject.summary.length === 0}
                helperText={editableRiskObject.summary.length === 0 ? "The risk summary must be at least 1 character" : ""}
                fullWidth
                inputProps={{ minLength: 1 }}
                onChange={(e) => setEditableRiskObject({ ...editableRiskObject, summary: e.target.value })}
              />
              <TextField
                id="details"
                label="details"
                required
                value={editableRiskObject.details ? editableRiskObject.details : ""}
                error={editableRiskObject.details.length === 0}
                helperText={editableRiskObject.details.length === 0 ? "The risk details must be at least 1 character" : ""}
                fullWidth
                inputProps={{ minLength: 1 }}
                onChange={(e) => setEditableRiskObject({ ...editableRiskObject, details: e.target.value })}
              />
              <TextField
                id="sourceName"
                label="sourceName"
                required
                value={editableRiskObject.commonData.sourceName ? editableRiskObject.commonData.sourceName : ""}
                fullWidth
                onChange={(e) => {
                  const commonData = { ...editableRiskObject.commonData, sourceName: e.target.value };
                  setEditableRiskObject({ ...editableRiskObject, commonData });
                }}
              />
              <Autocomplete
                id="itemState"
                label="Select an item state"
                options={itemStateTypes}
                initialSelectedOptions={[editableRiskObject.commonData.itemState ? editableRiskObject.commonData.itemState : ""]}
                onOptionsChange={({ selectedItems }) => {
                  const commonData = { ...editableRiskObject.commonData, itemState: selectedItems[0] ?? null };
                  setEditableRiskObject({ ...editableRiskObject, commonData });
                }}
              />
            </>
          }
          confirmDisabled={!validText(editableRiskObject.name)}
          onSubmit={() => onSubmit(editableRiskObject)}
          isLoading={isLoading}
        />
      )}
    </>
  );
};

export default RiskPropertiesModal;
