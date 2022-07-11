import React, { useEffect, useState } from "react";
import { TextField } from "@material-ui/core";
import ModalDialog from "./ModalDialog";
import JobService, { JobType } from "../../services/jobService";
import OperationType from "../../contexts/operationType";
import { HideModalAction } from "../../contexts/operationStateReducer";
import Trajectory from "../../models/trajectory";
import TrajectoryStation from "../../models/trajectoryStation";

export interface TrajectoryStationPropertiesModalInterface {
  trajectoryStation: TrajectoryStation;
  trajectory: Trajectory;
  dispatchOperation: (action: HideModalAction) => void;
}

const TrajectoryStationPropertiesModal = (props: TrajectoryStationPropertiesModalInterface): React.ReactElement => {
  const { trajectoryStation, trajectory, dispatchOperation } = props;
  const [editableTrajectoryStation, setEditableTrajectoryStation] = useState<TrajectoryStation>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onSubmit = async (updatedTrajectoryStation: TrajectoryStation) => {
    setIsLoading(true);
    const wellboreTrajectoryStationJob = {
      trajectoryStation: updatedTrajectoryStation,
      trajectoryReference: {
        trajectoryUid: trajectory.uid,
        wellUid: trajectory.wellUid,
        wellboreUid: trajectory.wellboreUid
      }
    };
    await JobService.orderJob(JobType.ModifyTrajectoryStation, wellboreTrajectoryStationJob);
    setIsLoading(false);
    dispatchOperation({ type: OperationType.HideModal });
  };

  useEffect(() => {
    setEditableTrajectoryStation(trajectoryStation);
  }, [trajectoryStation]);
  //TODO: edit heading? ADD THE OTHER FIELDS
  return (
    <>
      {editableTrajectoryStation && (
        <ModalDialog
          heading={`Edit properties for Trajectory Station`}
          content={
            <>
              <TextField disabled id="uid" label="uid" defaultValue={editableTrajectoryStation.uid} fullWidth />
              <TextField disabled id="typeTrajStation" label="type trajectory station" defaultValue={editableTrajectoryStation.typeTrajStation} fullWidth />
            </>
          }
          onSubmit={() => onSubmit(editableTrajectoryStation)}
          isLoading={isLoading}
        />
      )}
    </>
  );
};

export default TrajectoryStationPropertiesModal;
