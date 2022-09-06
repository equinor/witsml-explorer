import { FormControl, InputAdornment, InputLabel, MenuItem, Select, TextField, Typography } from "@material-ui/core";
import { isInteger } from "lodash";
import React, { useEffect, useState } from "react";
import { HideModalAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import Tubular from "../../models/tubular";
import TubularComponent from "../../models/tubularComponent";
import { tubularComponentTypes } from "../../models/tubularComponentTypes";
import JobService, { JobType } from "../../services/jobService";
import ModalDialog from "./ModalDialog";
import { validText } from "./ModalParts";

export interface TubularComponentPropertiesModalInterface {
  tubularComponent: TubularComponent;
  tubular: Tubular;
  dispatchOperation: (action: HideModalAction) => void;
}

const isInvalidSequence = (sequence: number) => {
  return Number.isNaN(sequence) || sequence < 1 || !isInteger(sequence);
};

const TubularComponentPropertiesModal = (props: TubularComponentPropertiesModalInterface): React.ReactElement => {
  const { tubularComponent, tubular, dispatchOperation } = props;
  const [editableTubularComponent, setEditableTubularComponent] = useState<TubularComponent>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onSubmit = async (updatedTubularComponent: TubularComponent) => {
    setIsLoading(true);
    const wellboreTubularComponentJob = {
      tubularComponent: updatedTubularComponent,
      tubularReference: {
        tubularUid: tubular.uid,
        wellUid: tubular.wellUid,
        wellboreUid: tubular.wellboreUid
      }
    };
    await JobService.orderJob(JobType.ModifyTubularComponent, wellboreTubularComponentJob);
    setIsLoading(false);
    dispatchOperation({ type: OperationType.HideModal });
  };

  useEffect(() => {
    setEditableTubularComponent(tubularComponent);
  }, [tubularComponent]);

  return (
    <>
      {editableTubularComponent && (
        <ModalDialog
          heading={`Edit properties for Sequence ${tubularComponent.sequence} - ${tubularComponent.typeTubularComponent} - ${tubularComponent.uid}`}
          content={
            <>
              <TextField disabled id="uid" label="uid" defaultValue={editableTubularComponent.uid} fullWidth />
              <TextField
                id={"sequence"}
                label={"Sequence"}
                type="number"
                fullWidth
                value={editableTubularComponent.sequence}
                onChange={(e) =>
                  setEditableTubularComponent({
                    ...editableTubularComponent,
                    sequence: parseFloat(e.target.value)
                  })
                }
                error={isInvalidSequence(editableTubularComponent.sequence)}
                helperText={isInvalidSequence(editableTubularComponent.sequence) && "Sequence must be a positive non-zero integer"}
              />
              <FormControl fullWidth>
                <InputLabel id="tubularComponent-type">typeTubularComponent</InputLabel>
                <Select
                  labelId="tubularComponent-type"
                  value={editableTubularComponent.typeTubularComponent}
                  onChange={(e) => {
                    if (typeof e.target.value === "string") setEditableTubularComponent({ ...editableTubularComponent, typeTubularComponent: e.target.value });
                  }}
                >
                  {tubularComponentTypes.map((type) => (
                    <MenuItem value={type} key={type}>
                      <Typography color={"initial"}>{type}</Typography>
                    </MenuItem>
                  ))}
                </Select>
                <TextField
                  id={"id"}
                  label={"id"}
                  type="number"
                  fullWidth
                  InputProps={{
                    startAdornment: <InputAdornment position="start">{editableTubularComponent.id ? editableTubularComponent.id.uom : ""}</InputAdornment>
                  }}
                  disabled={!editableTubularComponent.id}
                  value={editableTubularComponent.id?.value}
                  onChange={(e) =>
                    setEditableTubularComponent({
                      ...editableTubularComponent,
                      id: { value: parseFloat(e.target.value), uom: editableTubularComponent.id.uom }
                    })
                  }
                />
                <TextField
                  id={"od"}
                  label={"od"}
                  type="number"
                  fullWidth
                  InputProps={{
                    startAdornment: <InputAdornment position="start">{editableTubularComponent.od ? editableTubularComponent.od.uom : ""}</InputAdornment>
                  }}
                  disabled={!editableTubularComponent.od}
                  value={editableTubularComponent.od?.value}
                  onChange={(e) =>
                    setEditableTubularComponent({
                      ...editableTubularComponent,
                      od: { value: parseFloat(e.target.value), uom: editableTubularComponent.od.uom }
                    })
                  }
                />
                <TextField
                  id={"len"}
                  label={"len"}
                  type="number"
                  fullWidth
                  InputProps={{
                    startAdornment: <InputAdornment position="start">{editableTubularComponent.len ? editableTubularComponent.len.uom : ""}</InputAdornment>
                  }}
                  disabled={!editableTubularComponent.len}
                  value={editableTubularComponent.len?.value}
                  onChange={(e) =>
                    setEditableTubularComponent({
                      ...editableTubularComponent,
                      len: { value: parseFloat(e.target.value), uom: editableTubularComponent.len.uom }
                    })
                  }
                />
              </FormControl>
            </>
          }
          confirmDisabled={
            !validText(editableTubularComponent.typeTubularComponent) ||
            isInvalidSequence(editableTubularComponent.sequence) ||
            Number.isNaN(editableTubularComponent.id.value) ||
            Number.isNaN(editableTubularComponent.od.value) ||
            Number.isNaN(editableTubularComponent.len.value)
          }
          onSubmit={() => onSubmit(editableTubularComponent)}
          isLoading={isLoading}
        />
      )}
    </>
  );
};

export default TubularComponentPropertiesModal;
