import { FormControl, InputLabel, MenuItem, Select, TextField, Typography } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { HideModalAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import Tubular from "../../models/tubular";
import JobService, { JobType } from "../../services/jobService";
import ModalDialog from "./ModalDialog";
import { validText } from "./ModalParts";

const typeTubularAssy = [
  "drilling",
  "directional drilling",
  "fishing",
  "condition mud",
  "tubing conveyed logging",
  "cementing",
  "casing",
  "clean out",
  "completion or testing",
  "coring",
  "hole opening or underreaming",
  "milling or dressing or cutting",
  "wiper or check or reaming",
  "unknown"
];

export interface TubularPropertiesModalInterface {
  tubular: Tubular;
  dispatchOperation: (action: HideModalAction) => void;
}

const TubularPropertiesModal = (props: TubularPropertiesModalInterface): React.ReactElement => {
  const { tubular, dispatchOperation } = props;
  const [editableTubular, setEditableTubular] = useState<Tubular>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onSubmit = async (updatedTubular: Tubular) => {
    setIsLoading(true);
    const wellboreTubularJob = {
      tubular: updatedTubular
    };
    await JobService.orderJob(JobType.ModifyTubular, wellboreTubularJob);
    setIsLoading(false);
    dispatchOperation({ type: OperationType.HideModal });
  };

  useEffect(() => {
    setEditableTubular(tubular);
  }, [tubular]);

  return (
    <>
      {editableTubular && (
        <ModalDialog
          heading={`Edit properties for ${editableTubular.name}`}
          content={
            <>
              <TextField disabled id="uid" label="uid" defaultValue={editableTubular.uid} fullWidth />
              <TextField
                id="name"
                label="name"
                defaultValue={editableTubular.name}
                error={editableTubular.name.length === 0}
                helperText={editableTubular.name.length === 0 ? "A tubular name must be 1-64 characters" : ""}
                fullWidth
                inputProps={{ minLength: 1, maxLength: 64 }}
                onChange={(e) => setEditableTubular({ ...editableTubular, name: e.target.value })}
              />
              <FormControl fullWidth>
                <InputLabel id="tubular-type">typeTubularAssy</InputLabel>
                <Select
                  labelId="tubular-type"
                  value={editableTubular.typeTubularAssy}
                  onChange={(e) => {
                    if (typeof e.target.value === "string") setEditableTubular({ ...editableTubular, typeTubularAssy: e.target.value });
                  }}
                >
                  {typeTubularAssy.map((type) => (
                    <MenuItem value={type} key={type}>
                      <Typography color={"initial"}>{type}</Typography>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          }
          confirmDisabled={!validText(editableTubular.uid) || !validText(editableTubular.name) || !validText(editableTubular.typeTubularAssy)}
          onSubmit={() => onSubmit(editableTubular)}
          isLoading={isLoading}
        />
      )}
    </>
  );
};

export default TubularPropertiesModal;
