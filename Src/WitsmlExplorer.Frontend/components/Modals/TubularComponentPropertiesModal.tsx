import { Autocomplete, TextField } from "@equinor/eds-core-react";
import ModalDialog from "components/Modals/ModalDialog";
import { validText } from "components/Modals/ModalParts";
import { HideModalAction } from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import { isInteger } from "lodash";
import ObjectReference from "models/jobs/objectReference";
import { toObjectReference } from "models/objectOnWellbore";
import Tubular from "models/tubular";
import TubularComponent from "models/tubularComponent";
import { tubularComponentTypes } from "models/tubularComponentTypes";
import React, { useEffect, useState } from "react";
import JobService, { JobType } from "services/jobService";

export interface TubularComponentPropertiesModalInterface {
  tubularComponent: TubularComponent;
  tubular: Tubular;
  dispatchOperation: (action: HideModalAction) => void;
}

const isInvalidSequence = (sequence: number) => {
  return Number.isNaN(sequence) || sequence < 1 || !isInteger(sequence);
};

const TubularComponentPropertiesModal = (
  props: TubularComponentPropertiesModalInterface
): React.ReactElement => {
  const { tubularComponent, tubular, dispatchOperation } = props;
  const [editableTubularComponent, setEditableTubularComponent] =
    useState<TubularComponent>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onSubmit = async (updatedTubularComponent: TubularComponent) => {
    setIsLoading(true);
    const tubularReference: ObjectReference = toObjectReference(tubular);
    const modifyTubularComponentJob = {
      tubularComponent: updatedTubularComponent,
      tubularReference
    };
    await JobService.orderJob(
      JobType.ModifyTubularComponent,
      modifyTubularComponentJob
    );
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
              <TextField
                disabled
                id="uid"
                label="uid"
                defaultValue={editableTubularComponent.uid}
              />
              <TextField
                id={"sequence"}
                label={"Sequence"}
                type="number"
                defaultValue={editableTubularComponent.sequence}
                onChange={(e: any) =>
                  setEditableTubularComponent({
                    ...editableTubularComponent,
                    sequence: parseFloat(e.target.value)
                  })
                }
                variant={
                  isInvalidSequence(editableTubularComponent.sequence)
                    ? "error"
                    : undefined
                }
                helperText={
                  isInvalidSequence(editableTubularComponent.sequence) &&
                  "Sequence must be a positive non-zero integer"
                }
              />
              <Autocomplete
                label="typeTubularComp"
                initialSelectedOptions={[
                  editableTubularComponent.typeTubularComponent
                ]}
                options={tubularComponentTypes}
                onOptionsChange={({ selectedItems }) => {
                  setEditableTubularComponent({
                    ...editableTubularComponent,
                    typeTubularComponent: selectedItems[0]
                  });
                }}
                hideClearButton={
                  !!editableTubularComponent.typeTubularComponent
                }
              />
              <TextField
                id={"id"}
                label={"id"}
                type="number"
                unit={
                  editableTubularComponent.id
                    ? editableTubularComponent.id.uom
                    : ""
                }
                disabled={!editableTubularComponent.id}
                defaultValue={editableTubularComponent.id?.value}
                onChange={(e: any) =>
                  setEditableTubularComponent({
                    ...editableTubularComponent,
                    id: {
                      value: parseFloat(e.target.value),
                      uom: editableTubularComponent.id.uom
                    }
                  })
                }
              />
              <TextField
                id={"od"}
                label={"od"}
                type="number"
                unit={
                  editableTubularComponent.od
                    ? editableTubularComponent.od.uom
                    : ""
                }
                disabled={!editableTubularComponent.od}
                defaultValue={editableTubularComponent.od?.value}
                onChange={(e: any) =>
                  setEditableTubularComponent({
                    ...editableTubularComponent,
                    od: {
                      value: parseFloat(e.target.value),
                      uom: editableTubularComponent.od.uom
                    }
                  })
                }
              />
              <TextField
                id={"len"}
                label={"len"}
                type="number"
                unit={
                  editableTubularComponent.len
                    ? editableTubularComponent.len.uom
                    : ""
                }
                disabled={!editableTubularComponent.len}
                defaultValue={editableTubularComponent.len?.value}
                onChange={(e: any) =>
                  setEditableTubularComponent({
                    ...editableTubularComponent,
                    len: {
                      value: parseFloat(e.target.value),
                      uom: editableTubularComponent.len.uom
                    }
                  })
                }
              />
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
