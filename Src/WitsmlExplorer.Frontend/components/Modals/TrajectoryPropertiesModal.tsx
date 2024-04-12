import { Autocomplete, TextField } from "@equinor/eds-core-react";
import { DateTimeField } from "components/Modals/DateTimeField";
import ModalDialog from "components/Modals/ModalDialog";
import { PropertiesModalMode, validText } from "components/Modals/ModalParts";
import OperationContext from "contexts/operationContext";
import { HideModalAction } from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import { ObjectType } from "models/objectType";
import Trajectory, { aziRefValues } from "models/trajectory";
import React, { ChangeEvent, useContext, useEffect, useState } from "react";
import JobService, { JobType } from "services/jobService";
import { itemStateTypes } from "../../models/itemStateTypes";
export interface TrajectoryPropertiesModalProps {
  mode: PropertiesModalMode;
  trajectory: Trajectory;
  dispatchOperation: (action: HideModalAction) => void;
}

const TrajectoryPropertiesModal = (
  props: TrajectoryPropertiesModalProps
): React.ReactElement => {
  const { mode, trajectory, dispatchOperation } = props;
  const {
    operationState: { timeZone }
  } = useContext(OperationContext);
  const [editableTrajectory, setEditableTrajectory] =
    useState<Trajectory>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [, setDTimTrajStartValid] = useState<boolean>(true);
  const [, setDTimTrajEndValid] = useState<boolean>(true);
  const editMode = mode === PropertiesModalMode.Edit;

  useEffect(() => {
    setEditableTrajectory({
      ...trajectory,
      commonData: {
        ...trajectory.commonData
      }
    });
  }, [trajectory]);

  const onSubmit = async (updatedTrajectory: Trajectory) => {
    setIsLoading(true);
    if (editMode) {
      const modifyJob = {
        object: { ...updatedTrajectory, objectType: ObjectType.Trajectory },
        objectType: ObjectType.Trajectory
      };
      await JobService.orderJob(JobType.ModifyObjectOnWellbore, modifyJob);
    } else {
      const wellboreTrajectoryJob = {
        trajectory: updatedTrajectory
      };
      await JobService.orderJob(
        JobType.CreateTrajectory,
        wellboreTrajectoryJob
      );
    }
    setIsLoading(false);
    dispatchOperation({ type: OperationType.HideModal });
  };

  const validTrajectoryUid = validText(editableTrajectory?.uid, 1, 64);
  const validTrajectoryName = validText(editableTrajectory?.name, 1, 64);
  const validTrajectoryServiceCompany = editMode
    ? validText(editableTrajectory?.serviceCompany, 1, 64)
    : validText(editableTrajectory?.serviceCompany, 0, 64);

  return (
    <>
      {editableTrajectory && (
        <ModalDialog
          heading={
            editMode
              ? `Edit properties for ${editableTrajectory.name}`
              : `New Trajectory`
          }
          content={
            <>
              <TextField
                disabled={editMode}
                id="uid"
                label="trajectory uid"
                required
                value={editableTrajectory.uid}
                variant={validTrajectoryUid ? undefined : "error"}
                helperText={
                  !validTrajectoryUid
                    ? "A trajectory uid must be 1-64 characters"
                    : ""
                }
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEditableTrajectory({
                    ...editableTrajectory,
                    uid: e.target.value
                  })
                }
              />
              <TextField
                disabled
                id="wellUid"
                label="well uid"
                defaultValue={editableTrajectory.wellUid}
              />
              <TextField
                disabled
                id="wellName"
                label="well name"
                defaultValue={editableTrajectory.wellName}
              />
              <TextField
                disabled
                id="wellboreUid"
                label="wellbore uid"
                defaultValue={editableTrajectory.wellboreUid}
              />
              <TextField
                disabled
                id="wellboreName"
                label="wellbore name"
                defaultValue={editableTrajectory.wellboreName}
              />
              <TextField
                id={"name"}
                label={"name"}
                required
                value={editableTrajectory.name ?? ""}
                variant={validTrajectoryName ? undefined : "error"}
                helperText={
                  !validTrajectoryName
                    ? "The trajectory name must be 1-64 characters"
                    : ""
                }
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEditableTrajectory({
                    ...editableTrajectory,
                    name: e.target.value
                  })
                }
              />
              <DateTimeField
                value={editableTrajectory.dTimTrajStart}
                label="dTimTrajStart"
                updateObject={(dateTime: string, valid: boolean) => {
                  setEditableTrajectory({
                    ...editableTrajectory,
                    dTimTrajStart: dateTime
                  });
                  setDTimTrajStartValid(valid);
                }}
                timeZone={timeZone}
                disabled={editMode}
              />
              <DateTimeField
                value={editableTrajectory.dTimTrajEnd}
                label="dTimTrajEnd"
                updateObject={(dateTime: string, valid: boolean) => {
                  setEditableTrajectory({
                    ...editableTrajectory,
                    dTimTrajEnd: dateTime
                  });
                  setDTimTrajEndValid(valid);
                }}
                timeZone={timeZone}
                disabled={editMode}
              />
              <TextField
                id={"serviceCompany"}
                label={"serviceCompany"}
                value={
                  editableTrajectory.serviceCompany
                    ? editableTrajectory.serviceCompany
                    : ""
                }
                variant={validTrajectoryServiceCompany ? undefined : "error"}
                helperText={
                  !validTrajectoryServiceCompany
                    ? `The service company must be ${
                        editMode ? "1" : "0"
                      }-64 characters`
                    : ""
                }
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEditableTrajectory({
                    ...editableTrajectory,
                    serviceCompany: e.target.value
                  })
                }
              />
              <TextField
                id={"mdMin"}
                label={"mdMin"}
                type="number"
                disabled
                value={editableTrajectory.mdMin?.value ?? ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEditableTrajectory({
                    ...editableTrajectory,
                    mdMin: {
                      ...editableTrajectory.mdMin,
                      value: isNaN(parseFloat(e.target.value))
                        ? undefined
                        : parseFloat(e.target.value)
                    }
                  })
                }
              />
              <TextField
                id={"mdMax"}
                label={"mdMax"}
                type="number"
                disabled
                value={editableTrajectory.mdMax?.value ?? ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEditableTrajectory({
                    ...editableTrajectory,
                    mdMax: {
                      ...editableTrajectory.mdMax,
                      value: isNaN(parseFloat(e.target.value))
                        ? undefined
                        : parseFloat(e.target.value)
                    }
                  })
                }
              />
              <Autocomplete
                id="aziRef"
                label="aziRef"
                options={aziRefValues}
                initialSelectedOptions={[editableTrajectory.aziRef]}
                hideClearButton
                onOptionsChange={({ selectedItems }) => {
                  setEditableTrajectory({
                    ...editableTrajectory,
                    aziRef: selectedItems[0]
                  });
                }}
                onFocus={(e) => e.preventDefault()}
              />
              <TextField
                id="sourceName"
                label="sourceName"
                value={editableTrajectory.commonData.sourceName ?? ""}
                disabled={!editMode}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const commonData = {
                    ...editableTrajectory.commonData,
                    sourceName: e.target.value
                  };
                  setEditableTrajectory({ ...editableTrajectory, commonData });
                }}
              />
              <Autocomplete
                id="itemState"
                label="Select an item state"
                options={itemStateTypes}
                hideClearButton
                initialSelectedOptions={[
                  editableTrajectory.commonData.itemState ?? ""
                ]}
                onOptionsChange={({ selectedItems }) => {
                  const commonData = {
                    ...editableTrajectory.commonData,
                    itemState: selectedItems[0] ?? null
                  };
                  setEditableTrajectory({ ...editableTrajectory, commonData });
                }}
              />
            </>
          }
          confirmDisabled={
            !validTrajectoryUid ||
            !validTrajectoryName ||
            !validTrajectoryServiceCompany
          }
          onSubmit={() => onSubmit(editableTrajectory)}
          isLoading={isLoading}
        />
      )}
    </>
  );
};

export default TrajectoryPropertiesModal;
