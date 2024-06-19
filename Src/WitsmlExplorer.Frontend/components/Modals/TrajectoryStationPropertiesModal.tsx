import { TextField } from "@equinor/eds-core-react";
import formatDateString from "components/DateFormatter";
import { DateTimeField } from "components/Modals/DateTimeField";
import ModalDialog from "components/Modals/ModalDialog";
import { HideModalAction } from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import { useOperationState } from "hooks/useOperationState";
import ObjectReference from "models/jobs/objectReference";
import { measureToString } from "models/measure";
import { toObjectReference } from "models/objectOnWellbore";
import Trajectory from "models/trajectory";
import TrajectoryStation from "models/trajectoryStation";
import React, { ChangeEvent, useEffect, useState } from "react";
import JobService, { JobType } from "services/jobService";

export interface TrajectoryStationPropertiesModalInterface {
  trajectoryStation: TrajectoryStation;
  trajectory: Trajectory;
  dispatchOperation: (action: HideModalAction) => void;
}

const TrajectoryStationPropertiesModal = (
  props: TrajectoryStationPropertiesModalInterface
): React.ReactElement => {
  const { trajectoryStation, trajectory, dispatchOperation } = props;
  const {
    operationState: { timeZone, dateTimeFormat }
  } = useOperationState();
  const [editableTrajectoryStation, setEditableTrajectoryStation] =
    useState<TrajectoryStation>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dTimStnValid, setDTimStnValid] = useState<boolean>(true);

  const onSubmit = async (updatedTrajectoryStation: TrajectoryStation) => {
    setIsLoading(true);
    const trajectoryReference: ObjectReference = toObjectReference(trajectory);
    const modifyTrajectoryStationJob = {
      trajectoryStation: updatedTrajectoryStation,
      trajectoryReference
    };
    await JobService.orderJob(
      JobType.ModifyTrajectoryStation,
      modifyTrajectoryStationJob
    );
    setIsLoading(false);
    dispatchOperation({ type: OperationType.HideModal });
  };

  useEffect(() => {
    setEditableTrajectoryStation({
      ...trajectoryStation,
      dTimStn: formatDateString(
        trajectoryStation.dTimStn,
        timeZone,
        dateTimeFormat
      )
    });
  }, [trajectoryStation]);
  return (
    <>
      {editableTrajectoryStation && (
        <ModalDialog
          heading={`Edit properties for Trajectory Station for Trajectory ${trajectoryStation.uid} - ${trajectoryStation.typeTrajStation} `}
          content={
            <>
              <TextField
                disabled
                id="uid"
                label="uid"
                defaultValue={editableTrajectoryStation.uid}
              />
              <TextField
                disabled
                id="typeTrajStation"
                label="type trajectory station"
                defaultValue={editableTrajectoryStation.typeTrajStation}
              />
              <DateTimeField
                value={editableTrajectoryStation.dTimStn}
                label="dTimStn"
                updateObject={(dateTime: string, valid: boolean) => {
                  setEditableTrajectoryStation({
                    ...editableTrajectoryStation,
                    dTimStn: dateTime
                  });
                  setDTimStnValid(valid);
                }}
                timeZone={timeZone}
              />
              <TextField
                id={"md"}
                label={"md"}
                type="number"
                unit={
                  editableTrajectoryStation.md
                    ? editableTrajectoryStation.md.uom
                    : ""
                }
                disabled={!editableTrajectoryStation.md}
                value={editableTrajectoryStation.md?.value}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEditableTrajectoryStation({
                    ...editableTrajectoryStation,
                    md: {
                      value: isNaN(parseFloat(e.target.value))
                        ? undefined
                        : parseFloat(e.target.value),
                      uom: editableTrajectoryStation.md.uom
                    }
                  })
                }
              />
              <TextField
                id={"tvd"}
                label={"tvd"}
                type="number"
                unit={
                  editableTrajectoryStation.tvd
                    ? editableTrajectoryStation.tvd.uom
                    : ""
                }
                disabled={!editableTrajectoryStation.tvd}
                value={editableTrajectoryStation.tvd?.value}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEditableTrajectoryStation({
                    ...editableTrajectoryStation,
                    tvd: {
                      value: isNaN(parseFloat(e.target.value))
                        ? undefined
                        : parseFloat(e.target.value),
                      uom: editableTrajectoryStation.tvd.uom
                    }
                  })
                }
              />
              <TextField
                id={"azi"}
                label={"azi"}
                type="number"
                unit={
                  editableTrajectoryStation.azi
                    ? editableTrajectoryStation.azi.uom
                    : ""
                }
                disabled={!editableTrajectoryStation.azi}
                value={editableTrajectoryStation.azi?.value}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEditableTrajectoryStation({
                    ...editableTrajectoryStation,
                    azi: {
                      value: isNaN(parseFloat(e.target.value))
                        ? undefined
                        : parseFloat(e.target.value),
                      uom: editableTrajectoryStation.azi.uom
                    }
                  })
                }
              />
              <TextField
                id={"incl"}
                label={"incl"}
                type="number"
                unit={
                  editableTrajectoryStation.incl
                    ? editableTrajectoryStation.incl.uom
                    : ""
                }
                disabled={!editableTrajectoryStation.incl}
                value={editableTrajectoryStation.incl?.value}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEditableTrajectoryStation({
                    ...editableTrajectoryStation,
                    incl: {
                      value: isNaN(parseFloat(e.target.value))
                        ? undefined
                        : parseFloat(e.target.value),
                      uom: editableTrajectoryStation.incl.uom
                    }
                  })
                }
              />
              <TextField
                disabled
                id="mtf"
                label="mtf"
                defaultValue={measureToString(editableTrajectoryStation.mtf)}
              />
              <TextField
                disabled
                id="gtf"
                label="gtf"
                defaultValue={measureToString(editableTrajectoryStation.gtf)}
              />
              <TextField
                disabled
                id="dispNs"
                label="dispNs"
                defaultValue={measureToString(editableTrajectoryStation.dispNs)}
              />
              <TextField
                disabled
                id="dispEw"
                label="dispEw"
                defaultValue={measureToString(editableTrajectoryStation.dispEw)}
              />
              <TextField
                disabled
                id="vertSect"
                label="vertSect"
                defaultValue={measureToString(
                  editableTrajectoryStation.vertSect
                )}
              />
              <TextField
                disabled
                id="dls"
                label="dls"
                defaultValue={measureToString(editableTrajectoryStation.dls)}
              />
              <TextField
                disabled
                id="rateTurn"
                label="rateTurn"
                defaultValue={measureToString(
                  editableTrajectoryStation.rateTurn
                )}
              />
              <TextField
                disabled
                id="rateBuild"
                label="rateBuild"
                defaultValue={measureToString(
                  editableTrajectoryStation.rateBuild
                )}
              />
              <TextField
                disabled
                id="gravTotalUncert"
                label="gravTotalUncert"
                defaultValue={measureToString(
                  editableTrajectoryStation.gravTotalUncert
                )}
              />
              <TextField
                disabled
                id="dipAngleUncert"
                label="dipAngleUncert"
                defaultValue={measureToString(
                  editableTrajectoryStation.dipAngleUncert
                )}
              />
              <TextField
                disabled
                id="magTotalUncert"
                label="magTotalUncert"
                defaultValue={measureToString(
                  editableTrajectoryStation.magTotalUncert
                )}
              />
              <TextField
                disabled
                id="gravTotalFieldReference"
                label="gravTotalFieldReference"
                defaultValue={measureToString(
                  editableTrajectoryStation.gravTotalFieldReference
                )}
              />
              <TextField
                disabled
                id="magTotalFieldReference"
                label="magTotalFieldReference"
                defaultValue={measureToString(
                  editableTrajectoryStation.magTotalFieldReference
                )}
              />
              <TextField
                disabled
                id="magDipAngleReference"
                label="magDipAngleReference"
                defaultValue={measureToString(
                  editableTrajectoryStation.magDipAngleReference
                )}
              />
              <TextField
                disabled
                id="statusTrajStation"
                label="statusTrajStation"
                defaultValue={editableTrajectoryStation.statusTrajStation}
              />
              <TextField
                disabled
                id="gravAxialRaw"
                label="gravAxialRaw"
                defaultValue={measureToString(
                  editableTrajectoryStation.gravAxialRaw
                )}
              />
              <TextField
                disabled
                id="gravTran1Raw"
                label="gravTran1Raw"
                defaultValue={measureToString(
                  editableTrajectoryStation.gravTran1Raw
                )}
              />
              <TextField
                disabled
                id="gravTran2Raw"
                label="gravTran2Raw"
                defaultValue={measureToString(
                  editableTrajectoryStation.gravTran2Raw
                )}
              />
              <TextField
                disabled
                id="magAxialRaw"
                label="magAxialRaw"
                defaultValue={measureToString(
                  editableTrajectoryStation.magAxialRaw
                )}
              />
              <TextField
                disabled
                id="magTran1Raw"
                label="magTran1Raw"
                defaultValue={measureToString(
                  editableTrajectoryStation.rawData.magTran1Raw
                )}
              />
              <TextField
                disabled
                id="magTran2Raw"
                label="magTran2Raw"
                defaultValue={measureToString(
                  editableTrajectoryStation.rawData.magTran2Raw
                )}
              />
              <TextField
                disabled
                id="gravAxialAccelCor"
                label="gravAxialAccelCor"
                defaultValue={measureToString(
                  editableTrajectoryStation.corUsed.gravAxialAccelCor
                )}
              />
              <TextField
                disabled
                id="gravTran1AccelCor"
                label="gravTran1AccelCor"
                defaultValue={measureToString(
                  editableTrajectoryStation.corUsed.gravTran1AccelCor
                )}
              />
              <TextField
                disabled
                id="gravTran2AccelCor"
                label="gravTran2AccelCor"
                defaultValue={measureToString(
                  editableTrajectoryStation.corUsed.gravTran2AccelCor
                )}
              />
              <TextField
                disabled
                id="magAxialDrlstrCor"
                label="magAxialDrlstrCor"
                defaultValue={measureToString(
                  editableTrajectoryStation.corUsed.magAxialDrlstrCor
                )}
              />
              <TextField
                disabled
                id="magTran1DrlstrCor"
                label="magTran1DrlstrCor"
                defaultValue={measureToString(
                  editableTrajectoryStation.corUsed.magTran1DrlstrCor
                )}
              />
              <TextField
                disabled
                id="magTran2DrlstrCor"
                label="magTran2DrlstrCor"
                defaultValue={measureToString(
                  editableTrajectoryStation.corUsed.magTran2DrlstrCor
                )}
              />
              <TextField
                disabled
                id="sagIncCor"
                label="sagIncCor"
                defaultValue={measureToString(
                  editableTrajectoryStation.corUsed.sagIncCor
                )}
              />
              <TextField
                disabled
                id="stnMagDeclUsed"
                label="stnMagDeclUsed"
                defaultValue={measureToString(
                  editableTrajectoryStation.corUsed.stnMagDeclUsed
                )}
              />
              <TextField
                disabled
                id="stnGridCorUsed"
                label="stnGridCorUsed"
                defaultValue={measureToString(
                  editableTrajectoryStation.corUsed.stnGridCorUsed
                )}
              />
              <TextField
                disabled
                id="dirSensorOffset"
                label="dirSensorOffset"
                defaultValue={measureToString(
                  editableTrajectoryStation.corUsed.dirSensorOffset
                )}
              />
              <TextField
                disabled
                id="magTotalFieldCalc"
                label="magTotalFieldCalc"
                defaultValue={measureToString(
                  editableTrajectoryStation.valid.magTotalFieldCalc
                )}
              />
              <TextField
                disabled
                id="magDipAngleCalc"
                label="magDipAngleCalc"
                defaultValue={measureToString(
                  editableTrajectoryStation.valid.magDipAngleCalc
                )}
              />
              <TextField
                disabled
                id="gravTotalFieldCalc"
                label="gravTotalFieldCalc"
                defaultValue={measureToString(
                  editableTrajectoryStation.valid.gravTotalFieldCalc
                )}
              />
            </>
          }
          confirmDisabled={!dTimStnValid}
          onSubmit={() => onSubmit(editableTrajectoryStation)}
          isLoading={isLoading}
        />
      )}
    </>
  );
};

export default TrajectoryStationPropertiesModal;
