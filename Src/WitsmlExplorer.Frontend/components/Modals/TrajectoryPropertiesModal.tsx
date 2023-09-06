import { TextField } from "@material-ui/core";
import React, { useContext, useEffect, useState } from "react";
import OperationContext from "../../contexts/operationContext";
import { HideModalAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import Trajectory from "../../models/trajectory";
import JobService, { JobType } from "../../services/jobService";
import { DateTimeField } from "./DateTimeField";
import ModalDialog from "./ModalDialog";
import { PropertiesModalMode, validText } from "./ModalParts";
export interface TrajectoryPropertiesModalProps {
  mode: PropertiesModalMode;
  trajectory: Trajectory;
  dispatchOperation: (action: HideModalAction) => void;
}

const TrajectoryPropertiesModal = (props: TrajectoryPropertiesModalProps): React.ReactElement => {
  const { mode, trajectory, dispatchOperation } = props;
  const {
    operationState: { timeZone, dateTimeFormat }
  } = useContext(OperationContext);
  const [editableTrajectory, setEditableTrajectory] = useState<Trajectory>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [, setDTimTrajStartValid] = useState<boolean>(true);
  const [, setDTimTrajEndValid] = useState<boolean>(true);
  const editMode = mode === PropertiesModalMode.Edit;

  useEffect(() => {
    setEditableTrajectory({
      ...trajectory
    });
  }, [trajectory]);

  const onSubmit = async (updatedTrajectory: Trajectory) => {
    setIsLoading(true);
    const wellboreTrajectoryJob = {
      trajectory: updatedTrajectory
    };
    await JobService.orderJob(editMode ? JobType.ModifyTrajectory : JobType.CreateTrajectory, wellboreTrajectoryJob);
    setIsLoading(false);
    dispatchOperation({ type: OperationType.HideModal });
  };

  return (
    <>
      {editableTrajectory && (
        <ModalDialog
          heading={editMode ? `Edit properties for ${editableTrajectory.name}` : `New Trajectory`}
          content={
            <>
              <TextField
                disabled={editMode}
                id="uid"
                label="trajectory uid"
                required
                value={editableTrajectory.uid}
                fullWidth
                error={!validText(editableTrajectory.uid)}
                helperText={editableTrajectory.uid.length === 0 ? "A trajectory uid must be 1-64 characters" : ""}
                inputProps={{ minLength: 1, maxLength: 64 }}
                onChange={(e) => setEditableTrajectory({ ...editableTrajectory, uid: e.target.value })}
              />
              <TextField disabled id="wellUid" label="well uid" defaultValue={editableTrajectory.wellUid} fullWidth />
              <TextField disabled id="wellName" label="well name" defaultValue={editableTrajectory.wellName} fullWidth />
              <TextField disabled id="wellboreUid" label="wellbore uid" defaultValue={editableTrajectory.wellboreUid} fullWidth />
              <TextField disabled id="wellboreName" label="wellbore name" defaultValue={editableTrajectory.wellboreName} fullWidth />
              <TextField
                id={"name"}
                label={"name"}
                required
                value={editableTrajectory.name ?? ""}
                error={editableTrajectory.name?.length === 0}
                helperText={editableTrajectory.name?.length === 0 ? "The trajectory name must be 1-64 characters" : ""}
                fullWidth
                inputProps={{ minLength: 1, maxLength: 64 }}
                onChange={(e) => setEditableTrajectory({ ...editableTrajectory, name: e.target.value })}
              />
              <DateTimeField
                value={editableTrajectory.dTimTrajStart}
                label="dTimTrajStart"
                updateObject={(dateTime: string, valid: boolean) => {
                  setEditableTrajectory({ ...editableTrajectory, dTimTrajStart: dateTime });
                  setDTimTrajStartValid(valid);
                }}
                timeZone={timeZone}
                dateTimeFormat={dateTimeFormat}
              />
              <DateTimeField
                value={editableTrajectory.dTimTrajEnd}
                label="dTimTrajEnd"
                updateObject={(dateTime: string, valid: boolean) => {
                  setEditableTrajectory({ ...editableTrajectory, dTimTrajEnd: dateTime });
                  setDTimTrajEndValid(valid);
                }}
                timeZone={timeZone}
                dateTimeFormat={dateTimeFormat}
              />
              <TextField
                id={"serviceCompany"}
                label={"serviceCompany"}
                value={editableTrajectory.serviceCompany ? editableTrajectory.serviceCompany : ""}
                error={editMode && editableTrajectory.serviceCompany?.length === 0}
                helperText={editMode && editableTrajectory.serviceCompany?.length === 0 ? "The service company must be 1-64 characters" : ""}
                fullWidth
                inputProps={{ minLength: 1, maxLength: 64 }}
                onChange={(e) => setEditableTrajectory({ ...editableTrajectory, serviceCompany: e.target.value })}
              />
              <TextField
                id={"mdMin"}
                label={"mdMin"}
                type="number"
                fullWidth
                value={editableTrajectory.mdMin}
                disabled={!editableTrajectory.mdMin}
                onChange={(e) =>
                  setEditableTrajectory({
                    ...editableTrajectory,
                    mdMin: isNaN(parseFloat(e.target.value)) ? undefined : parseFloat(e.target.value)
                  })
                }
              />
              <TextField
                id={"mdMax"}
                label={"mdMax"}
                type="number"
                fullWidth
                value={editableTrajectory.mdMax}
                disabled={!editableTrajectory.mdMax}
                onChange={(e) =>
                  setEditableTrajectory({
                    ...editableTrajectory,
                    mdMax: isNaN(parseFloat(e.target.value)) ? undefined : parseFloat(e.target.value)
                  })
                }
              />
              <TextField
                id={"aziRef"}
                label={"aziRef"}
                value={editableTrajectory.aziRef ?? ""}
                disabled={!editMode}
                error={editMode && editableTrajectory.aziRef?.length === 0}
                helperText={editMode && editableTrajectory.aziRef?.length === 0 ? "The aziRef must have value." : ""}
                fullWidth
                onChange={(e) => setEditableTrajectory({ ...editableTrajectory, aziRef: e.target.value })}
              />
            </>
          }
          confirmDisabled={!validText(editableTrajectory.uid) || !validText(editableTrajectory.name)}
          onSubmit={() => onSubmit(editableTrajectory)}
          isLoading={isLoading}
        />
      )}
    </>
  );
};

export default TrajectoryPropertiesModal;
