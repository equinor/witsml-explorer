import { Autocomplete, TextField } from "@equinor/eds-core-react";
import ModalDialog from "components/Modals/ModalDialog";
import { HideModalAction } from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import { holeCasingTypes } from "models/holeCasingTypes";
import ObjectReference from "models/jobs/objectReference";
import Measure from "models/measure";
import { toObjectReference } from "models/objectOnWellbore";
import WbGeometryObject from "models/wbGeometry";
import WbGeometrySection from "models/wbGeometrySection";
import React, {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useEffect,
  useState
} from "react";
import JobService, { JobType } from "services/jobService";
import styled from "styled-components";

export interface WbGeometrySectionPropertiesModalInterface {
  wbGeometrySection: WbGeometrySection;
  dispatchOperation: (action: HideModalAction) => void;
  wbGeometry: WbGeometryObject;
}

const WbGeometrySectionPropertiesModal = (
  props: WbGeometrySectionPropertiesModalInterface
): React.ReactElement => {
  const { wbGeometrySection, dispatchOperation, wbGeometry } = props;
  const [editableWbgs, setEditableWbGeometrySection] =
    useState<WbGeometrySection>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onSubmit = async (updatedWbGeometrySection: WbGeometrySection) => {
    setIsLoading(true);
    const wbGeometryReference: ObjectReference = toObjectReference(wbGeometry);
    const modifyWbGeometrySectionJob = {
      wbGeometrySection: updatedWbGeometrySection,
      wbGeometryReference
    };
    await JobService.orderJob(
      JobType.ModifyWbGeometrySection,
      modifyWbGeometrySectionJob
    );
    setIsLoading(false);
    dispatchOperation({ type: OperationType.HideModal });
  };

  useEffect(() => {
    setEditableWbGeometrySection(JSON.parse(JSON.stringify(wbGeometrySection))); //deep copy
  }, [wbGeometrySection]);

  const invalidGrade =
    errorOnDeletion(wbGeometrySection.grade, editableWbgs?.grade) ||
    editableWbgs?.grade?.length > 32;
  const invalidMdTop =
    wbGeometrySection.mdTop && editableWbgs?.mdTop.value == undefined;
  const invalidMdBottom =
    wbGeometrySection.mdBottom && editableWbgs?.mdBottom.value == undefined;
  const invalidTvdTop =
    wbGeometrySection.tvdTop && editableWbgs?.tvdTop.value == undefined;
  const invalidTvdBottom =
    wbGeometrySection.tvdBottom && editableWbgs?.tvdBottom.value == undefined;
  const invalidIdSection =
    wbGeometrySection.idSection && editableWbgs?.idSection.value == undefined;
  const invalidOdSection =
    wbGeometrySection.odSection && editableWbgs?.odSection.value == undefined;
  const invalidWtPerLen =
    wbGeometrySection.wtPerLen && editableWbgs?.wtPerLen.value == undefined;
  const invalidDiaDrift =
    wbGeometrySection.diaDrift && editableWbgs?.diaDrift.value == undefined;
  const invalidFactFric =
    wbGeometrySection.factFric != null && editableWbgs?.factFric == undefined;
  return (
    <>
      {editableWbgs && (
        <ModalDialog
          heading={`Edit properties for ${editableWbgs.uid}`}
          content={
            <Layout>
              <TextField
                disabled
                id="uid"
                label="uid"
                defaultValue={editableWbgs.uid}
              />
              <Autocomplete
                id="typeHoleCasing"
                label="typeHoleCasing"
                options={holeCasingTypes}
                initialSelectedOptions={[wbGeometrySection.typeHoleCasing]}
                onOptionsChange={({ selectedItems }) => {
                  setEditableWbGeometrySection({
                    ...editableWbgs,
                    typeHoleCasing: selectedItems[0]
                  });
                }}
                hideClearButton={!!wbGeometrySection.typeHoleCasing}
                onFocus={(e) => e.preventDefault()}
              />
              <MeasureField
                measure={editableWbgs.mdTop}
                editableWbgs={editableWbgs}
                invalid={invalidMdTop}
                name="mdTop"
                setResult={setEditableWbGeometrySection}
              />
              <MeasureField
                measure={editableWbgs.mdBottom}
                editableWbgs={editableWbgs}
                invalid={invalidMdBottom}
                name="mdBottom"
                setResult={setEditableWbGeometrySection}
              />
              <MeasureField
                measure={editableWbgs.tvdTop}
                editableWbgs={editableWbgs}
                invalid={invalidTvdTop}
                name="tvdTop"
                setResult={setEditableWbGeometrySection}
              />
              <MeasureField
                measure={editableWbgs.tvdBottom}
                editableWbgs={editableWbgs}
                invalid={invalidTvdBottom}
                name="tvdBottom"
                setResult={setEditableWbGeometrySection}
              />
              <MeasureField
                measure={editableWbgs.idSection}
                editableWbgs={editableWbgs}
                invalid={invalidIdSection}
                name="idSection"
                setResult={setEditableWbGeometrySection}
              />
              <MeasureField
                measure={editableWbgs.odSection}
                editableWbgs={editableWbgs}
                invalid={invalidOdSection}
                name="odSection"
                setResult={setEditableWbGeometrySection}
              />
              <MeasureField
                measure={editableWbgs.wtPerLen}
                editableWbgs={editableWbgs}
                invalid={invalidWtPerLen}
                name="wtPerLen"
                setResult={setEditableWbGeometrySection}
              />
              <Autocomplete
                id="curveConductor"
                label="curveConductor"
                options={["false", "true"]}
                initialSelectedOptions={[
                  wbGeometrySection.curveConductor == null
                    ? null
                    : wbGeometrySection
                    ? "true"
                    : "false"
                ]}
                onOptionsChange={({ selectedItems }) => {
                  setEditableWbGeometrySection({
                    ...editableWbgs,
                    curveConductor: selectedItems[0] == "false" ? false : true
                  });
                }}
                hideClearButton={wbGeometrySection.curveConductor != null}
              />
              <MeasureField
                measure={editableWbgs.diaDrift}
                editableWbgs={editableWbgs}
                invalid={invalidDiaDrift}
                name="diaDrift"
                setResult={setEditableWbGeometrySection}
              />
              <TextField
                id="grade"
                label="grade"
                defaultValue={editableWbgs?.grade}
                variant={invalidGrade ? "error" : undefined}
                helperText={invalidGrade ? "Grade must be 1-32 characters" : ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEditableWbGeometrySection({
                    ...editableWbgs,
                    grade: e.target.value
                  })
                }
              />
              <TextField
                id="factFric"
                label="factFric"
                type="number"
                defaultValue={editableWbgs?.factFric}
                helperText={invalidFactFric ? `FactFric cannot be empty` : ""}
                variant={invalidFactFric ? "error" : undefined}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setEditableWbGeometrySection({
                    ...editableWbgs,
                    factFric: isNaN(parseFloat(e.target.value))
                      ? undefined
                      : parseFloat(e.target.value)
                  });
                }}
              />
            </Layout>
          }
          confirmDisabled={
            invalidGrade ||
            invalidMdTop ||
            invalidMdBottom ||
            invalidTvdTop ||
            invalidTvdBottom ||
            invalidIdSection ||
            invalidOdSection ||
            invalidWtPerLen ||
            invalidDiaDrift ||
            invalidFactFric
          }
          onSubmit={() => onSubmit(editableWbgs)}
          isLoading={isLoading}
        />
      )}
    </>
  );
};

interface MeasureFieldProps {
  measure: Measure;
  editableWbgs: WbGeometrySection;
  invalid: boolean;
  name: string;
  setResult: Dispatch<SetStateAction<WbGeometrySection>>;
}

const MeasureField = (props: MeasureFieldProps): React.ReactElement => {
  const { measure, editableWbgs, invalid, name, setResult } = props;
  return (
    <TextField
      id={name}
      label={name}
      type="number"
      disabled={!measure}
      defaultValue={measure?.value}
      unit={measure?.uom}
      helperText={invalid ? `${name} cannot be empty` : ""}
      variant={invalid ? "error" : undefined}
      onChange={(e: ChangeEvent<HTMLInputElement>) => {
        measure.value = isNaN(parseFloat(e.target.value))
          ? undefined
          : parseFloat(e.target.value);
        setResult({
          ...editableWbgs
        });
      }}
    />
  );
};

const errorOnDeletion = (original?: string, edited?: string): boolean => {
  if (!original) {
    return false;
  }
  return edited == null || edited.length == 0;
};

const Layout = styled.div`
  display: grid;
  grid-template-columns: repeat(2, auto);
  gap: 1rem;
`;

export default WbGeometrySectionPropertiesModal;
