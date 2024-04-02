import { InputAdornment, TextField } from "@mui/material";
import formatDateString from "components/DateFormatter";
import { DateTimeField } from "components/Modals/DateTimeField";
import ModalDialog from "components/Modals/ModalDialog";
import OperationContext from "contexts/operationContext";
import { HideModalAction } from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import ObjectReference from "models/jobs/objectReference";
import { measureToString } from "models/measure";
import { toObjectReference } from "models/objectOnWellbore";
import Trajectory from "models/trajectory";
import TrajectoryStation from "models/trajectoryStation";
import React, { useContext, useEffect, useState } from "react";
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
  } = useContext(OperationContext);
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
                fullWidth
              />
              <TextField
                disabled
                id="typeTrajStation"
                label="type trajectory station"
                defaultValue={editableTrajectoryStation.typeTrajStation}
                fullWidth
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
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {editableTrajectoryStation.md
                        ? editableTrajectoryStation.md.uom
                        : ""}
                    </InputAdornment>
                  )
                }}
                disabled={!editableTrajectoryStation.md}
                value={editableTrajectoryStation.md?.value}
                onChange={(e) =>
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
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {editableTrajectoryStation.tvd
                        ? editableTrajectoryStation.tvd.uom
                        : ""}
                    </InputAdornment>
                  )
                }}
                disabled={!editableTrajectoryStation.tvd}
                value={editableTrajectoryStation.tvd?.value}
                onChange={(e) =>
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
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {editableTrajectoryStation.azi
                        ? editableTrajectoryStation.azi.uom
                        : ""}
                    </InputAdornment>
                  )
                }}
                disabled={!editableTrajectoryStation.azi}
                value={editableTrajectoryStation.azi?.value}
                onChange={(e) =>
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
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {editableTrajectoryStation.incl
                        ? editableTrajectoryStation.incl.uom
                        : ""}
                    </InputAdornment>
                  )
                }}
                disabled={!editableTrajectoryStation.incl}
                value={editableTrajectoryStation.incl?.value}
                onChange={(e) =>
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
                fullWidth
              />
              <TextField
                disabled
                id="gtf"
                label="gtf"
                defaultValue={measureToString(editableTrajectoryStation.gtf)}
                fullWidth
              />
              <TextField
                disabled
                id="dispNs"
                label="dispNs"
                defaultValue={measureToString(editableTrajectoryStation.dispNs)}
                fullWidth
              />
              <TextField
                disabled
                id="dispEw"
                label="dispEw"
                defaultValue={measureToString(editableTrajectoryStation.dispEw)}
                fullWidth
              />
              <TextField
                disabled
                id="vertSect"
                label="vertSect"
                defaultValue={measureToString(
                  editableTrajectoryStation.vertSect
                )}
                fullWidth
              />
              <TextField
                disabled
                id="dls"
                label="dls"
                defaultValue={measureToString(editableTrajectoryStation.dls)}
                fullWidth
              />
              <TextField
                disabled
                id="rateTurn"
                label="rateTurn"
                defaultValue={measureToString(
                  editableTrajectoryStation.rateTurn
                )}
                fullWidth
              />
              <TextField
                disabled
                id="rateBuild"
                label="rateBuild"
                defaultValue={measureToString(
                  editableTrajectoryStation.rateBuild
                )}
                fullWidth
              />
              <TextField
                disabled
                id="gravTotalUncert"
                label="gravTotalUncert"
                defaultValue={measureToString(
                  editableTrajectoryStation.gravTotalUncert
                )}
                fullWidth
              />
              <TextField
                disabled
                id="dipAngleUncert"
                label="dipAngleUncert"
                defaultValue={measureToString(
                  editableTrajectoryStation.dipAngleUncert
                )}
                fullWidth
              />
              <TextField
                disabled
                id="magTotalUncert"
                label="magTotalUncert"
                defaultValue={measureToString(
                  editableTrajectoryStation.magTotalUncert
                )}
                fullWidth
              />
              <TextField
                disabled
                id="gravTotalFieldReference"
                label="gravTotalFieldReference"
                defaultValue={measureToString(
                  editableTrajectoryStation.gravTotalFieldReference
                )}
                fullWidth
              />
              <TextField
                disabled
                id="magTotalFieldReference"
                label="magTotalFieldReference"
                defaultValue={measureToString(
                  editableTrajectoryStation.magTotalFieldReference
                )}
                fullWidth
              />
              <TextField
                disabled
                id="magDipAngleReference"
                label="magDipAngleReference"
                defaultValue={measureToString(
                  editableTrajectoryStation.magDipAngleReference
                )}
                fullWidth
              />
              <TextField
                disabled
                id="statusTrajStation"
                label="statusTrajStation"
                defaultValue={editableTrajectoryStation.statusTrajStation}
                fullWidth
              />
              <TextField
                disabled
                id="gravAxialRaw"
                label="gravAxialRaw"
                defaultValue={measureToString(
                  editableTrajectoryStation.gravAxialRaw
                )}
                fullWidth
              />
              <TextField
                disabled
                id="gravTran1Raw"
                label="gravTran1Raw"
                defaultValue={measureToString(
                  editableTrajectoryStation.gravTran1Raw
                )}
                fullWidth
              />
              <TextField
                disabled
                id="gravTran2Raw"
                label="gravTran2Raw"
                defaultValue={measureToString(
                  editableTrajectoryStation.gravTran2Raw
                )}
                fullWidth
              />
              <TextField
                disabled
                id="magAxialRaw"
                label="magAxialRaw"
                defaultValue={measureToString(
                  editableTrajectoryStation.magAxialRaw
                )}
                fullWidth
              />
              <TextField
                disabled
                id="magTran1Raw"
                label="magTran1Raw"
                defaultValue={measureToString(
                  editableTrajectoryStation.rawData.magTran1Raw
                )}
                fullWidth
              />
              <TextField
                disabled
                id="magTran2Raw"
                label="magTran2Raw"
                defaultValue={measureToString(
                  editableTrajectoryStation.rawData.magTran2Raw
                )}
                fullWidth
              />
              <TextField
                disabled
                id="gravAxialAccelCor"
                label="gravAxialAccelCor"
                defaultValue={measureToString(
                  editableTrajectoryStation.corUsed.gravAxialAccelCor
                )}
                fullWidth
              />
              <TextField
                disabled
                id="gravTran1AccelCor"
                label="gravTran1AccelCor"
                defaultValue={measureToString(
                  editableTrajectoryStation.corUsed.gravTran1AccelCor
                )}
                fullWidth
              />
              <TextField
                disabled
                id="gravTran2AccelCor"
                label="gravTran2AccelCor"
                defaultValue={measureToString(
                  editableTrajectoryStation.corUsed.gravTran2AccelCor
                )}
                fullWidth
              />
              <TextField
                disabled
                id="magAxialDrlstrCor"
                label="magAxialDrlstrCor"
                defaultValue={measureToString(
                  editableTrajectoryStation.corUsed.magAxialDrlstrCor
                )}
                fullWidth
              />
              <TextField
                disabled
                id="magTran1DrlstrCor"
                label="magTran1DrlstrCor"
                defaultValue={measureToString(
                  editableTrajectoryStation.corUsed.magTran1DrlstrCor
                )}
                fullWidth
              />
              <TextField
                disabled
                id="magTran2DrlstrCor"
                label="magTran2DrlstrCor"
                defaultValue={measureToString(
                  editableTrajectoryStation.corUsed.magTran2DrlstrCor
                )}
                fullWidth
              />
              <TextField
                disabled
                id="sagIncCor"
                label="sagIncCor"
                defaultValue={measureToString(
                  editableTrajectoryStation.corUsed.sagIncCor
                )}
                fullWidth
              />
              <TextField
                disabled
                id="stnMagDeclUsed"
                label="stnMagDeclUsed"
                defaultValue={measureToString(
                  editableTrajectoryStation.corUsed.stnMagDeclUsed
                )}
                fullWidth
              />
              <TextField
                disabled
                id="stnGridCorUsed"
                label="stnGridCorUsed"
                defaultValue={measureToString(
                  editableTrajectoryStation.corUsed.stnGridCorUsed
                )}
                fullWidth
              />
              <TextField
                disabled
                id="dirSensorOffset"
                label="dirSensorOffset"
                defaultValue={measureToString(
                  editableTrajectoryStation.corUsed.dirSensorOffset
                )}
                fullWidth
              />
              <TextField
                disabled
                id="magTotalFieldCalc"
                label="magTotalFieldCalc"
                defaultValue={measureToString(
                  editableTrajectoryStation.valid.magTotalFieldCalc
                )}
                fullWidth
              />
              <TextField
                disabled
                id="magDipAngleCalc"
                label="magDipAngleCalc"
                defaultValue={measureToString(
                  editableTrajectoryStation.valid.magDipAngleCalc
                )}
                fullWidth
              />
              <TextField
                disabled
                id="gravTotalFieldCalc"
                label="gravTotalFieldCalc"
                defaultValue={measureToString(
                  editableTrajectoryStation.valid.gravTotalFieldCalc
                )}
                fullWidth
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
