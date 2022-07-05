import { PropertiesModalMode, validText } from "./ModalParts";
import { HideModalAction } from "../../contexts/operationStateReducer";
import RiskObject from "../../models/riskObject";
import React, { useEffect, useState } from "react";
import ModalDialog from "./ModalDialog";
import { TextField } from "@material-ui/core";
import JobService, { JobType } from "../../services/jobService";
import OperationType from "../../contexts/operationType";
import moment from "moment";

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
  //TODO: affected personnel
  return (
    <>
      {editableRiskObject && (
        <ModalDialog
          heading={editMode ? `Edit properties for ${editableRiskObject.name}` : `New Log`}
          content={
            <>
              <TextField disabled id="dateTimeCreation" label="created" defaultValue={editableRiskObject.dTimCreation} fullWidth />
              <TextField disabled id="dateTimeLastChange" label="last changed" defaultValue={editableRiskObject.dTimLastChange} fullWidth />
              <TextField disabled id="uid" label="risk uid" defaultValue={editableRiskObject.uid} fullWidth />
              <TextField
                id="name"
                label="name"
                required
                defaultValue={editableRiskObject.name}
                error={editableRiskObject.name.length === 0}
                helperText={editableRiskObject.name.length === 0 ? "The risk name must be 1-64 characters" : ""}
                fullWidth
                inputProps={{ minLength: 1, maxLength: 64 }}
                onChange={(e) => setEditableRiskObject({ ...editableRiskObject, name: e.target.value })}
              />
              <TextField
                id="type"
                label="type"
                required
                defaultValue={editableRiskObject.type}
                error={editableRiskObject.type.length === 0}
                helperText={editableRiskObject.type.length === 0 ? "The risk extendCategory must be at least 1 character" : ""}
                fullWidth
                inputProps={{ minLength: 1 }}
                onChange={(e) => setEditableRiskObject({ ...editableRiskObject, type: e.target.value })}
              />
              <TextField
                id="category"
                label="category"
                required
                defaultValue={editableRiskObject.category}
                error={editableRiskObject.category.length === 0}
                helperText={editableRiskObject.category.length === 0 ? "The risk extendCategory must be at least 1 character" : ""}
                fullWidth
                inputProps={{ minLength: 1 }}
                onChange={(e) => setEditableRiskObject({ ...editableRiskObject, category: e.target.value })}
              />
              <TextField
                id="subCategory"
                label="subCategory"
                required
                defaultValue={editableRiskObject.subCategory}
                error={editableRiskObject.subCategory.length === 0}
                helperText={editableRiskObject.subCategory.length === 0 ? "The risk extendCategory must be at least 1 character" : ""}
                fullWidth
                inputProps={{ minLength: 1 }}
                onChange={(e) => setEditableRiskObject({ ...editableRiskObject, subCategory: e.target.value })}
              />
              <TextField
                id="extendCategory"
                label="extendCategory"
                required
                defaultValue={editableRiskObject.extendCategory}
                error={editableRiskObject.extendCategory.length === 0}
                helperText={editableRiskObject.extendCategory.length === 0 ? "The risk extendCategory must be at least 1 character" : ""}
                fullWidth
                inputProps={{ minLength: 1 }}
                onChange={(e) => setEditableRiskObject({ ...editableRiskObject, extendCategory: e.target.value })}
              />
              <TextField
                id="affectedPersonnel"
                label="affectedPersonnel"
                required
                defaultValue={editableRiskObject.affectedPersonnel}
                error={editableRiskObject.affectedPersonnel.length === 0}
                helperText={editableRiskObject.affectedPersonnel.length === 0 ? "The risk extendCategory must be at least 1 character" : ""}
                fullWidth
                inputProps={{ minLength: 1 }}
                onChange={(e) => setEditableRiskObject({ ...editableRiskObject, extendCategory: e.target.value })}
              />
              <TextField
                id="dTimStart"
                label="dTimStart"
                type="datetime-local"
                defaultValue={editableRiskObject.dTimStart}
                fullWidth
                value={editableRiskObject.dTimStart ? moment(editableRiskObject.dTimStart).format("YYYY-MM-DDTHH:MM") : undefined}
                onChange={(e) => setEditableRiskObject({ ...editableRiskObject, dTimStart: new Date(e.target.value) })}
              />
              <TextField
                id="dTimEnd"
                label="dTimEnd"
                type="datetime-local"
                defaultValue={editableRiskObject.dTimEnd}
                fullWidth
                value={editableRiskObject.dTimEnd ? moment(editableRiskObject.dTimEnd).format("YYYY-MM-DDTHH:MM") : undefined}
                onChange={(e) => setEditableRiskObject({ ...editableRiskObject, dTimEnd: new Date(e.target.value) })}
              />
              <TextField
                id="mdBitStart"
                label="mdBitStart"
                required
                defaultValue={editableRiskObject.mdBitStart}
                error={editableRiskObject.mdBitStart.length === 0}
                helperText={editableRiskObject.mdBitStart.length === 0 ? "The risk mdBitStart must be at least 1 character" : ""}
                fullWidth
                inputProps={{ minLength: 1 }}
                onChange={(e) => setEditableRiskObject({ ...editableRiskObject, mdBitStart: e.target.value })}
              />
              <TextField
                id="mdBitEnd"
                label="mdBitEnd"
                required
                defaultValue={editableRiskObject.mdBitEnd}
                error={editableRiskObject.mdBitEnd.length === 0}
                helperText={editableRiskObject.mdBitEnd.length === 0 ? "The risk mdBitEnd must be at least 1 character" : ""}
                fullWidth
                inputProps={{ minLength: 1 }}
                onChange={(e) => setEditableRiskObject({ ...editableRiskObject, mdBitEnd: e.target.value })}
              />
              <TextField
                id="severityLevel"
                label="severityLevel"
                required
                defaultValue={editableRiskObject.severityLevel}
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
                defaultValue={editableRiskObject.probabilityLevel}
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
                defaultValue={editableRiskObject.summary}
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
                defaultValue={editableRiskObject.details}
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
                defaultValue={editableRiskObject.sourceName}
                error={editableRiskObject.sourceName.length === 0}
                helperText={editableRiskObject.sourceName.length === 0 ? "The risk sourceName must be at least 1 character" : ""}
                fullWidth
                inputProps={{ minLength: 1 }}
                onChange={(e) => setEditableRiskObject({ ...editableRiskObject, sourceName: e.target.value })}
              />
              <TextField
                id="itemState"
                label="itemState"
                required
                defaultValue={editableRiskObject.itemState}
                error={editableRiskObject.itemState.length === 0}
                helperText={editableRiskObject.itemState.length === 0 ? "The risk itemState must be at least 1 character" : ""}
                fullWidth
                inputProps={{ minLength: 1 }}
                onChange={(e) => setEditableRiskObject({ ...editableRiskObject, itemState: e.target.value })}
              />
              <TextField disabled id="wellUid" label="well uid" defaultValue={editableRiskObject.wellUid} fullWidth />
              <TextField disabled id="wellName" label="well name" defaultValue={editableRiskObject.wellName} fullWidth />
              <TextField disabled id="wellboreUid" label="wellbore uid" defaultValue={editableRiskObject.wellboreUid} fullWidth />
              <TextField disabled id="wellboreName" label="wellbore name" defaultValue={editableRiskObject.wellboreName} fullWidth />
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
