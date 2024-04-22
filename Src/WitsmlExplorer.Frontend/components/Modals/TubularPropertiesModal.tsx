import { Autocomplete, TextField } from "@equinor/eds-core-react";
import ModalDialog from "components/Modals/ModalDialog";
import { validText } from "components/Modals/ModalParts";
import { HideModalAction } from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import { ObjectType } from "models/objectType";
import Tubular from "models/tubular";
import React, { ChangeEvent, useEffect, useState } from "react";
import JobService, { JobType } from "services/jobService";

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

const TubularPropertiesModal = (
  props: TubularPropertiesModalInterface
): React.ReactElement => {
  const { tubular, dispatchOperation } = props;
  const [editableTubular, setEditableTubular] = useState<Tubular>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onSubmit = async (updatedTubular: Tubular) => {
    setIsLoading(true);
    const wellboreTubularJob = {
      object: { ...updatedTubular, objectType: ObjectType.Tubular },
      objectType: ObjectType.Tubular
    };
    await JobService.orderJob(
      JobType.ModifyObjectOnWellbore,
      wellboreTubularJob
    );
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
              <TextField
                disabled
                id="uid"
                label="uid"
                defaultValue={editableTubular.uid}
              />
              <TextField
                id="name"
                label="name"
                defaultValue={editableTubular.name}
                helperText={
                  editableTubular.name.length === 0
                    ? "A tubular name must be 1-64 characters"
                    : ""
                }
                variant={
                  editableTubular.name.length === 0 ? "error" : undefined
                }
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEditableTubular({
                    ...editableTubular,
                    name: e.target.value
                  })
                }
              />
              <Autocomplete
                label="typeTubularAssy"
                initialSelectedOptions={[editableTubular.typeTubularAssy]}
                options={typeTubularAssy}
                onOptionsChange={({ selectedItems }) => {
                  setEditableTubular({
                    ...editableTubular,
                    typeTubularAssy: selectedItems[0]
                  });
                }}
                hideClearButton={true}
              />
            </>
          }
          confirmDisabled={
            !validText(editableTubular.uid) ||
            !validText(editableTubular.name) ||
            !validText(editableTubular.typeTubularAssy)
          }
          onSubmit={() => onSubmit(editableTubular)}
          isLoading={isLoading}
        />
      )}
    </>
  );
};

export default TubularPropertiesModal;
