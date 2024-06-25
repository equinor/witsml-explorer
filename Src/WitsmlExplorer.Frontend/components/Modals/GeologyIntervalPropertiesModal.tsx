import { Autocomplete, TextField } from "@equinor/eds-core-react";
import { Typography } from "@mui/material";
import ModalDialog from "components/Modals/ModalDialog";
import {
  invalidMeasureInput,
  invalidNumberInput,
  invalidStringInput,
  undefinedOnUnchagedEmptyString
} from "components/Modals/PropertiesModalUtils";
import OperationType from "contexts/operationType";
import { useOperationState } from "hooks/useOperationState";
import GeologyInterval from "models/geologyInterval";
import ObjectReference from "models/jobs/objectReference";
import { lithologySources } from "models/lithologySources";
import { lithologyTypes } from "models/lithologyTypes";
import MaxLength from "models/maxLength";
import Measure from "models/measure";
import MeasureWithDatum from "models/measureWithDatum";
import MudLog from "models/mudLog";
import { toObjectReference } from "models/objectOnWellbore";
import React, {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useEffect,
  useState
} from "react";
import JobService, { JobType } from "services/jobService";
import { Layout } from "../StyledComponents/Layout";

export interface GeologyIntervalPropertiesModalInterface {
  geologyInterval: GeologyInterval;
  mudLog: MudLog;
}

type PropertyFlags<Type> = {
  [Property in keyof Type]: boolean;
};

interface EditableLithology {
  type?: string;
  codeLith?: string;
  lithPc?: number;
}

interface EditableGeologyInterval {
  typeLithology?: string;
  description?: string;
  mdTop?: MeasureWithDatum;
  mdBottom?: MeasureWithDatum;
  tvdTop?: MeasureWithDatum;
  tvdBase?: MeasureWithDatum;
  ropAv?: Measure;
  wobAv?: Measure;
  tqAv?: Measure;
  currentAv?: Measure;
  rpmAv?: Measure;
  wtMudAv?: Measure;
  ecdTdAv?: Measure;
  dxcAv?: number;
}

type InvalidProperties = PropertyFlags<EditableGeologyInterval>;

/**
 * Takes in the input to modify a geology interval by filling out an EditableGeologyInterval object.
 * For strings, an empty string represents an invalid value (on deletion of existing value), while undefined represents no change when the value was empty to begin with.
 * For Measures, measure.value being NaN represents an invalid value. Only existing measures can be edited.
 * For numbers, NaN represents an invalid value (empty input field on deletion).
 * @param props GeologyInterval to modify
 * @returns
 */
const GeologyIntervalPropertiesModal = (
  props: GeologyIntervalPropertiesModalInterface
): React.ReactElement => {
  const { geologyInterval, mudLog: selectedMudLog } = props;
  const { dispatchOperation } = useOperationState();
  const [editable, setEditable] = useState<EditableGeologyInterval>({});
  const [editableLithologies, setEditableLithologies] = useState<
    Record<string, EditableLithology>
  >({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (geologyInterval != null) {
      //the following properties are required by WITSML to be included in the update geology interval query
      setEditable({
        typeLithology: geologyInterval.typeLithology,
        mdTop: { ...geologyInterval.mdTop },
        mdBottom: { ...geologyInterval.mdBottom }
      });
    }
  }, [geologyInterval]);

  const onSubmit = async () => {
    setIsLoading(true);
    const mudLogReference: ObjectReference = toObjectReference(selectedMudLog);
    const modifyGeologyIntervalJob = {
      geologyInterval: {
        ...editable,
        uid: geologyInterval.uid,
        dxcAv: editable.dxcAv?.toString(),
        lithologies: Object.entries(editableLithologies).map((entry) => {
          return {
            ...entry[1],
            uid: entry[0],
            lithPc: entry[1].lithPc?.toString()
          };
        })
      },
      mudLogReference
    };
    await JobService.orderJob(
      JobType.ModifyGeologyInterval,
      modifyGeologyIntervalJob
    );
    setIsLoading(false);
    dispatchOperation({ type: OperationType.HideModal });
  };

  const invalid: InvalidProperties = {
    description: invalidStringInput(
      geologyInterval?.description,
      editable.description,
      MaxLength.Comment
    ),
    mdTop: invalidMeasureInput(editable.mdTop),
    mdBottom: invalidMeasureInput(editable.mdBottom),
    tvdTop: invalidMeasureInput(editable.tvdTop),
    tvdBase: invalidMeasureInput(editable.tvdBase),
    ropAv: invalidMeasureInput(editable.ropAv),
    wobAv: invalidMeasureInput(editable.wobAv),
    tqAv: invalidMeasureInput(editable.tqAv),
    currentAv: invalidMeasureInput(editable.currentAv),
    rpmAv: invalidMeasureInput(editable.rpmAv),
    wtMudAv: invalidMeasureInput(editable.wtMudAv),
    ecdTdAv: invalidMeasureInput(editable.ecdTdAv),
    dxcAv: invalidNumberInput(geologyInterval?.dxcAv, editable.dxcAv)
  };

  const invalidLithologies: Record<
    string,
    { lithPc: boolean; codeLith: boolean }
  > = {};
  Object.entries(editableLithologies).forEach((entry) => {
    const lithUid = entry[0];
    const lithology = entry[1];
    const originalLithology = geologyInterval.lithologies.find(
      (lith) => lith.uid == lithUid
    );
    invalidLithologies[lithUid] = {
      lithPc: invalidNumberInput(originalLithology.lithPc, lithology.lithPc),
      codeLith: invalidStringInput(
        originalLithology.codeLith,
        lithology.codeLith,
        MaxLength.Str16
      )
    };
  });

  const setLithology = (
    value: any,
    property: keyof EditableLithology,
    uid: string
  ) => {
    const editableLithology =
      editableLithologies[uid] == null
        ? {
            type: geologyInterval.lithologies.find((lith) => lith.uid === uid)
              .type
          } // lithology.type is required by update query
        : editableLithologies[uid];
    setEditableLithologies({
      ...editableLithologies,
      [uid]: {
        ...editableLithology,
        [property]: value
      }
    });
  };

  return (
    <>
      {editable && (
        <ModalDialog
          heading={`Edit properties for ${geologyInterval.uid}`}
          content={
            <Layout>
              <TextField
                disabled
                id="uid"
                label="uid"
                defaultValue={geologyInterval.uid}
              />
              <Autocomplete
                id="typeLithology"
                label="typeLithology"
                options={lithologySources}
                initialSelectedOptions={[geologyInterval.typeLithology]}
                onOptionsChange={({ selectedItems }) => {
                  setEditable({ ...editable, typeLithology: selectedItems[0] });
                }}
                hideClearButton={true}
                onFocus={(e) => e.preventDefault()}
              />
              <TextField
                id="description"
                label="description"
                defaultValue={geologyInterval.description ?? ""}
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
                      geologyInterval.description,
                      e.target.value
                    )
                  })
                }
                multiline
              />
              <MeasureField
                editable={editable}
                originalMeasure={geologyInterval?.mdTop}
                invalid={invalid}
                property="mdTop"
                setResult={setEditable}
              />
              <MeasureField
                editable={editable}
                originalMeasure={geologyInterval?.mdBottom}
                invalid={invalid}
                property="mdBottom"
                setResult={setEditable}
              />
              <MeasureField
                editable={editable}
                originalMeasure={geologyInterval?.tvdTop}
                invalid={invalid}
                property="tvdTop"
                setResult={setEditable}
              />
              <MeasureField
                editable={editable}
                originalMeasure={geologyInterval?.tvdBase}
                invalid={invalid}
                property="tvdBase"
                setResult={setEditable}
              />
              <MeasureField
                editable={editable}
                originalMeasure={geologyInterval?.ropAv}
                invalid={invalid}
                property="ropAv"
                setResult={setEditable}
              />
              <MeasureField
                editable={editable}
                originalMeasure={geologyInterval?.wobAv}
                invalid={invalid}
                property="wobAv"
                setResult={setEditable}
              />
              <MeasureField
                editable={editable}
                originalMeasure={geologyInterval?.tqAv}
                invalid={invalid}
                property="tqAv"
                setResult={setEditable}
              />
              <MeasureField
                editable={editable}
                originalMeasure={geologyInterval?.currentAv}
                invalid={invalid}
                property="currentAv"
                setResult={setEditable}
              />
              <MeasureField
                editable={editable}
                originalMeasure={geologyInterval?.rpmAv}
                invalid={invalid}
                property="rpmAv"
                setResult={setEditable}
              />
              <MeasureField
                editable={editable}
                originalMeasure={geologyInterval?.wtMudAv}
                invalid={invalid}
                property="wtMudAv"
                setResult={setEditable}
              />
              <MeasureField
                editable={editable}
                originalMeasure={geologyInterval?.ecdTdAv}
                invalid={invalid}
                property="ecdTdAv"
                setResult={setEditable}
              />
              <TextField
                id="dxcAv"
                label="dxcAv"
                type="number"
                defaultValue={geologyInterval?.dxcAv}
                helperText={invalid.dxcAv ? `dxcAv cannot be empty` : ""}
                variant={invalid.dxcAv ? "error" : undefined}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEditable({
                    ...editable,
                    dxcAv: parseFloat(e.target.value)
                  })
                }
              />
              {geologyInterval?.lithologies?.map((lithology) => {
                return (
                  <React.Fragment key={lithology.uid}>
                    <Typography style={{ paddingTop: "0.5rem" }}>
                      Lithology {lithology.uid}
                    </Typography>
                    <Autocomplete
                      id="type"
                      label="type"
                      options={lithologyTypes}
                      initialSelectedOptions={[lithology.type]}
                      onOptionsChange={({ selectedItems }) =>
                        setLithology(selectedItems[0], "type", lithology.uid)
                      }
                      hideClearButton={true}
                    />
                    <TextField
                      id="codeLith"
                      label="codeLith"
                      defaultValue={lithology.codeLith ?? ""}
                      variant={
                        invalidLithologies[lithology.uid]?.codeLith
                          ? "error"
                          : undefined
                      }
                      helperText={
                        invalidLithologies[lithology.uid]?.codeLith
                          ? `codeLith must be 1-${MaxLength.Str16} characters`
                          : ""
                      }
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setLithology(e.target.value, "codeLith", lithology.uid)
                      }
                    />
                    <TextField
                      id="lithPc"
                      label="lithPc"
                      type="number"
                      disabled={lithology.lithPc == null}
                      defaultValue={lithology.lithPc}
                      unit="%"
                      helperText={
                        invalidLithologies[lithology.uid]?.lithPc
                          ? `lithPc cannot be empty`
                          : ""
                      }
                      variant={
                        invalidLithologies[lithology.uid]?.lithPc
                          ? "error"
                          : undefined
                      }
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setLithology(
                          parseFloat(e.target.value),
                          "lithPc",
                          lithology.uid
                        )
                      }
                    />
                  </React.Fragment>
                );
              })}
            </Layout>
          }
          confirmDisabled={
            Object.values(invalid).findIndex((value) => value === true) !==
              -1 ||
            Object.values(invalidLithologies).findIndex(
              (l) => l.lithPc || l.codeLith
            ) !== -1
          }
          onSubmit={() => onSubmit()}
          isLoading={isLoading}
        />
      )}
    </>
  );
};

interface MeasureFieldProps {
  editable: EditableGeologyInterval;
  originalMeasure: Measure;
  invalid: InvalidProperties;
  property: keyof InvalidProperties & keyof EditableGeologyInterval;
  setResult: Dispatch<SetStateAction<EditableGeologyInterval>>;
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

export default GeologyIntervalPropertiesModal;
