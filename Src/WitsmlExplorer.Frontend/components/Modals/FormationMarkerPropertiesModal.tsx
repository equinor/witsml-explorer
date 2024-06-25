import { Autocomplete, TextField } from "@equinor/eds-core-react";
import ModalDialog from "components/Modals/ModalDialog";
import {
  invalidMeasureInput,
  invalidStringInput,
  undefinedOnUnchagedEmptyString
} from "components/Modals/PropertiesModalUtils";
import OperationType from "contexts/operationType";
import { useOperationState } from "hooks/useOperationState";
import FormationMarker from "models/formationMarker";
import { itemStateTypes } from "models/itemStateTypes";
import MaxLength from "models/maxLength";
import Measure from "models/measure";
import MeasureWithDatum from "models/measureWithDatum";
import { ObjectType } from "models/objectType";
import StratigraphicStruct from "models/stratigraphicStruct";
import React, { ChangeEvent, Dispatch, SetStateAction, useState } from "react";
import JobService, { JobType } from "services/jobService";
import { Layout } from "../StyledComponents/Layout";

export interface FormationMarkerPropertiesModalProps {
  formationMarker: FormationMarker;
}

type PropertyFlags<Type> = {
  [Property in keyof Type]: boolean;
};

interface EditableFormationMarker {
  name?: string;
  mdPrognosed?: MeasureWithDatum;
  tvdPrognosed?: MeasureWithDatum;
  mdTopSample?: MeasureWithDatum;
  tvdTopSample?: MeasureWithDatum;
  thicknessBed?: Measure;
  thicknessApparent?: Measure;
  thicknessPerpen?: Measure;
  mdLogSample?: MeasureWithDatum;
  tvdLogSample?: MeasureWithDatum;
  dip?: Measure;
  dipDirection?: Measure;
  lithostratigraphic?: StratigraphicStruct;
  chronostratigraphic?: StratigraphicStruct;
  description?: string;
  commonData?: {
    itemState: string;
  };
}

type InvalidProperties = PropertyFlags<EditableFormationMarker>;

/**
 * Takes in the input to modify a formation marker by filling out an EditableFormationMarker object.
 * For strings, an empty string represents an invalid value (on deletion of existing value), while undefined represents no change when the value was empty to begin with.
 * For Measures, measure.value being NaN represents an invalid value. Only existing measures can be edited.
 * @param props FormationMarker to modify
 * @returns
 */
const FormationMarkerPropertiesModal = (
  props: FormationMarkerPropertiesModalProps
): React.ReactElement => {
  const { formationMarker } = props;
  const { dispatchOperation } = useOperationState();
  const [editable, setEditable] = useState<EditableFormationMarker>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onSubmit = async () => {
    setIsLoading(true);
    const modifyJob = {
      object: {
        ...editable,
        uid: formationMarker.uid,
        wellboreUid: formationMarker.wellboreUid,
        wellUid: formationMarker.wellUid,
        objectType: ObjectType.FormationMarker
      },
      objectType: ObjectType.FormationMarker
    };
    await JobService.orderJob(JobType.ModifyObjectOnWellbore, modifyJob);
    setIsLoading(false);
    dispatchOperation({ type: OperationType.HideModal });
  };

  const invalid: InvalidProperties = {
    name: invalidStringInput(
      formationMarker?.name,
      editable.name,
      MaxLength.Name
    ),
    mdPrognosed: invalidMeasureInput(editable.mdPrognosed),
    tvdPrognosed: invalidMeasureInput(editable.tvdPrognosed),
    mdTopSample: invalidMeasureInput(editable.mdTopSample),
    tvdTopSample: invalidMeasureInput(editable.tvdTopSample),
    thicknessBed: invalidMeasureInput(editable.thicknessBed),
    thicknessApparent: invalidMeasureInput(editable.thicknessApparent),
    thicknessPerpen: invalidMeasureInput(editable.thicknessPerpen),
    mdLogSample: invalidMeasureInput(editable.mdLogSample),
    tvdLogSample: invalidMeasureInput(editable.tvdLogSample),
    dip: invalidMeasureInput(editable.dip),
    dipDirection: invalidMeasureInput(editable.dipDirection),
    lithostratigraphic: invalidStringInput(
      formationMarker?.lithostratigraphic?.value,
      editable.lithostratigraphic?.value,
      MaxLength.Name
    ),
    chronostratigraphic: invalidStringInput(
      formationMarker?.chronostratigraphic?.value,
      editable.chronostratigraphic?.value,
      MaxLength.Name
    ),
    description: invalidStringInput(
      formationMarker?.description,
      editable.description,
      MaxLength.Comment
    )
  };

  return (
    <>
      {editable && (
        <ModalDialog
          heading={`Edit properties for ${formationMarker.uid}`}
          content={
            <Layout>
              <TextField
                disabled
                id="uid"
                label="uid"
                defaultValue={formationMarker.uid}
              />
              <TextField
                id="name"
                label="name"
                defaultValue={formationMarker.name ?? ""}
                variant={invalid.name ? "error" : undefined}
                helperText={
                  invalid.name
                    ? `name must be 1-${MaxLength.Name} characters`
                    : ""
                }
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEditable({ ...editable, name: e.target.value })
                }
              />
              <Autocomplete
                id="itemState"
                label="commonData.itemState"
                options={itemStateTypes}
                initialSelectedOptions={[
                  formationMarker.commonData.itemState ?? ""
                ]}
                onOptionsChange={({ selectedItems }) => {
                  setEditable({
                    ...editable,
                    commonData: { itemState: selectedItems[0] }
                  });
                }}
                hideClearButton={true}
              />
              <MeasureField
                editable={editable}
                originalMeasure={formationMarker?.mdPrognosed}
                invalid={invalid}
                property="mdPrognosed"
                setResult={setEditable}
              />
              <MeasureField
                editable={editable}
                originalMeasure={formationMarker?.tvdPrognosed}
                invalid={invalid}
                property="tvdPrognosed"
                setResult={setEditable}
              />
              <MeasureField
                editable={editable}
                originalMeasure={formationMarker?.mdTopSample}
                invalid={invalid}
                property="mdTopSample"
                setResult={setEditable}
              />
              <MeasureField
                editable={editable}
                originalMeasure={formationMarker?.tvdTopSample}
                invalid={invalid}
                property="tvdTopSample"
                setResult={setEditable}
              />
              <MeasureField
                editable={editable}
                originalMeasure={formationMarker?.thicknessBed}
                invalid={invalid}
                property="thicknessBed"
                setResult={setEditable}
              />
              <MeasureField
                editable={editable}
                originalMeasure={formationMarker?.thicknessApparent}
                invalid={invalid}
                property="thicknessApparent"
                setResult={setEditable}
              />
              <MeasureField
                editable={editable}
                originalMeasure={formationMarker?.thicknessPerpen}
                invalid={invalid}
                property="thicknessPerpen"
                setResult={setEditable}
              />
              <MeasureField
                editable={editable}
                originalMeasure={formationMarker?.mdLogSample}
                invalid={invalid}
                property="mdLogSample"
                setResult={setEditable}
              />
              <MeasureField
                editable={editable}
                originalMeasure={formationMarker?.tvdLogSample}
                invalid={invalid}
                property="tvdLogSample"
                setResult={setEditable}
              />
              <MeasureField
                editable={editable}
                originalMeasure={formationMarker?.dip}
                invalid={invalid}
                property="dip"
                setResult={setEditable}
              />
              <MeasureField
                editable={editable}
                originalMeasure={formationMarker?.dipDirection}
                invalid={invalid}
                property="dipDirection"
                setResult={setEditable}
              />
              <StratigraphicField
                editable={editable}
                originalStruct={formationMarker?.lithostratigraphic}
                invalid={invalid}
                property="lithostratigraphic"
                setResult={setEditable}
              />
              <StratigraphicField
                editable={editable}
                originalStruct={formationMarker?.chronostratigraphic}
                invalid={invalid}
                property="chronostratigraphic"
                setResult={setEditable}
              />
              <TextField
                id="description"
                label="description"
                defaultValue={formationMarker.description ?? ""}
                variant={invalid.description ? "error" : undefined}
                helperText={
                  invalid.description
                    ? `description must be 1-${MaxLength.Comment} characters`
                    : ""
                }
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEditable({
                    ...editable,
                    description: undefinedOnUnchagedEmptyString(
                      formationMarker.description,
                      e.target.value
                    )
                  })
                }
                multiline
              />
            </Layout>
          }
          confirmDisabled={
            Object.values(invalid).findIndex((value) => value === true) !== -1
          }
          onSubmit={() => onSubmit()}
          isLoading={isLoading}
        />
      )}
    </>
  );
};

interface StratigraphicFieldProps {
  editable: EditableFormationMarker;
  originalStruct: StratigraphicStruct;
  invalid: InvalidProperties;
  property: keyof InvalidProperties & keyof EditableFormationMarker;
  setResult: Dispatch<SetStateAction<EditableFormationMarker>>;
}

const StratigraphicField = (
  props: StratigraphicFieldProps
): React.ReactElement => {
  const { editable, originalStruct, invalid, property, setResult } = props;
  return (
    <TextField
      id={property}
      label={property}
      disabled={originalStruct == null}
      defaultValue={originalStruct?.value}
      unit={originalStruct?.kind}
      helperText={invalid[property] ? `${property} cannot be empty` : ""}
      variant={invalid[property] ? "error" : undefined}
      onChange={(e: ChangeEvent<HTMLInputElement>) => {
        setResult({
          ...editable,
          [property]: {
            ...originalStruct,
            value: e.target.value
          }
        });
      }}
    />
  );
};

interface MeasureFieldProps {
  editable: EditableFormationMarker;
  originalMeasure: Measure;
  invalid: InvalidProperties;
  property: keyof InvalidProperties & keyof EditableFormationMarker;
  setResult: Dispatch<SetStateAction<EditableFormationMarker>>;
}

const MeasureField = (props: MeasureFieldProps): React.ReactElement => {
  const { editable, originalMeasure, invalid, property, setResult } = props;
  return (
    <TextField
      id={property}
      label={property}
      type="number"
      disabled={originalMeasure == null}
      defaultValue={originalMeasure?.value}
      unit={originalMeasure?.uom}
      helperText={invalid[property] ? `${property} cannot be empty` : ""}
      variant={invalid[property] ? "error" : undefined}
      onChange={(e: ChangeEvent<HTMLInputElement>) => {
        setResult({
          ...editable,
          [property]: {
            ...originalMeasure,
            value: parseFloat(e.target.value)
          }
        });
      }}
    />
  );
};

export default FormationMarkerPropertiesModal;
