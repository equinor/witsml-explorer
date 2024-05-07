import { Autocomplete, TextField } from "@equinor/eds-core-react";
import ModalDialog from "components/Modals/ModalDialog";
import { validText } from "components/Modals/ModalParts";
import { HideModalAction } from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import { isInteger } from "lodash";
import { boxPinConfigTypes } from "models/boxPinConfigTypes";
import ObjectReference from "models/jobs/objectReference";
import { materialTypes } from "models/materialTypes";
import MaxLength from "models/maxLength";
import { toObjectReference } from "models/objectOnWellbore";
import Tubular from "models/tubular";
import TubularComponent from "models/tubularComponent";
import { tubularComponentTypes } from "models/tubularComponentTypes";
import React, { ChangeEvent, useEffect, useState } from "react";
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
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
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
              <TextField
                id="description"
                label="description"
                defaultValue={editableTubularComponent.description ?? ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEditableTubularComponent({
                    ...editableTubularComponent,
                    description: e.target.value
                  })
                }
                variant={
                  tubularComponent.description &&
                  !validText(
                    editableTubularComponent.description,
                    1,
                    MaxLength.Comment
                  )
                    ? "error"
                    : undefined
                }
                helperText={
                  tubularComponent.description &&
                  !validText(
                    editableTubularComponent.description,
                    1,
                    MaxLength.Comment
                  ) &&
                  `Description must be 1-${MaxLength.Comment} characters`
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
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
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
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
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
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEditableTubularComponent({
                    ...editableTubularComponent,
                    len: {
                      value: parseFloat(e.target.value),
                      uom: editableTubularComponent.len.uom
                    }
                  })
                }
              />
              <TextField
                id={"wtPerLen"}
                label={"wtPerLen"}
                type="number"
                unit={
                  editableTubularComponent.wtPerLen
                    ? editableTubularComponent.wtPerLen.uom
                    : ""
                }
                disabled={!editableTubularComponent.wtPerLen}
                defaultValue={editableTubularComponent.wtPerLen?.value}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEditableTubularComponent({
                    ...editableTubularComponent,
                    wtPerLen: {
                      value: parseFloat(e.target.value),
                      uom: editableTubularComponent.wtPerLen.uom
                    }
                  })
                }
              />
              <TextField
                id={"numJointStand"}
                label={"numJointStand"}
                type="number"
                defaultValue={editableTubularComponent.numJointStand}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEditableTubularComponent({
                    ...editableTubularComponent,
                    numJointStand: parseFloat(e.target.value)
                  })
                }
                variant={
                  Number.isNaN(editableTubularComponent.numJointStand)
                    ? "error"
                    : undefined
                }
                helperText={
                  Number.isNaN(editableTubularComponent.numJointStand) &&
                  "numJointStand must be a positive non-zero integer"
                }
              />
              <Autocomplete
                label="configCon"
                initialSelectedOptions={[editableTubularComponent.configCon]}
                options={boxPinConfigTypes}
                onOptionsChange={({ selectedItems }) => {
                  setEditableTubularComponent({
                    ...editableTubularComponent,
                    configCon: selectedItems[0]
                  });
                }}
                hideClearButton={!!editableTubularComponent.configCon}
              />
              <Autocomplete
                label="typeMaterial"
                initialSelectedOptions={[editableTubularComponent.typeMaterial]}
                options={materialTypes}
                onOptionsChange={({ selectedItems }) => {
                  setEditableTubularComponent({
                    ...editableTubularComponent,
                    typeMaterial: selectedItems[0]
                  });
                }}
                hideClearButton={!!editableTubularComponent.typeMaterial}
              />
              <TextField
                id="vendor"
                label="vendor"
                defaultValue={editableTubularComponent.vendor ?? ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEditableTubularComponent({
                    ...editableTubularComponent,
                    vendor: e.target.value
                  })
                }
                variant={
                  tubularComponent.vendor &&
                  !validText(editableTubularComponent.vendor, 1, MaxLength.Name)
                    ? "error"
                    : undefined
                }
                helperText={
                  tubularComponent.vendor &&
                  !validText(
                    editableTubularComponent.vendor,
                    1,
                    MaxLength.Name
                  ) &&
                  `Vendor must be 1-${MaxLength.Name} characters`
                }
              />
              <TextField
                id="model"
                label="model"
                defaultValue={editableTubularComponent.model ?? ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEditableTubularComponent({
                    ...editableTubularComponent,
                    model: e.target.value
                  })
                }
                variant={
                  tubularComponent.model &&
                  !validText(editableTubularComponent.model, 1, MaxLength.Name)
                    ? "error"
                    : undefined
                }
                helperText={
                  tubularComponent.model &&
                  !validText(
                    editableTubularComponent.model,
                    1,
                    MaxLength.Name
                  ) &&
                  `Model must be 1-${MaxLength.Name} characters`
                }
              />
            </>
          }
          confirmDisabled={
            !validText(editableTubularComponent.typeTubularComponent) ||
            isInvalidSequence(editableTubularComponent.sequence) ||
            Number.isNaN(editableTubularComponent.numJointStand) ||
            Number.isNaN(editableTubularComponent.id.value) ||
            Number.isNaN(editableTubularComponent.od.value) ||
            Number.isNaN(editableTubularComponent.len.value) ||
            Number.isNaN(editableTubularComponent.wtPerLen.value) ||
            (tubularComponent.description &&
              !validText(
                editableTubularComponent.description,
                1,
                MaxLength.Comment
              )) ||
            (tubularComponent.configCon &&
              !validText(
                editableTubularComponent.configCon,
                1,
                MaxLength.Enum
              )) ||
            (tubularComponent.typeMaterial &&
              !validText(
                editableTubularComponent.typeMaterial,
                1,
                MaxLength.Enum
              )) ||
            (tubularComponent.vendor &&
              !validText(editableTubularComponent.vendor, 1, MaxLength.Name)) ||
            (tubularComponent.model &&
              !validText(editableTubularComponent.model, 1, MaxLength.Name))
          }
          onSubmit={() => onSubmit(editableTubularComponent)}
          isLoading={isLoading}
        />
      )}
    </>
  );
};

export default TubularComponentPropertiesModal;
