import {
  Accordion,
  Autocomplete,
  Icon,
  Typography
} from "@equinor/eds-core-react";
import { StyledAccordionHeader } from "components/Modals/LogComparisonModal";
import {
  objectToProperties,
  selectAllProperties
} from "components/Modals/MissingDataAgentProperties";
import ModalDialog, {
  ModalContentLayout,
  ModalWidth
} from "components/Modals/ModalDialog";
import { ReportModal } from "components/Modals/ReportModal";
import { Button } from "components/StyledComponents/Button";
import OperationType from "contexts/operationType";
import useExport from "hooks/useExport";
import { useLocalStorageState } from "hooks/useLocalStorageState";
import { useOperationState } from "hooks/useOperationState";
import MissingDataJob, { MissingDataCheck } from "models/jobs/missingDataJob";
import WellReference from "models/jobs/wellReference";
import WellboreReference from "models/jobs/wellboreReference";
import { ObjectType } from "models/objectType";
import { useRef, useState } from "react";
import JobService, { JobType } from "services/jobService";
import styled from "styled-components";
import { STORAGE_MISSING_DATA_AGENT_CHECKS_KEY } from "tools/localStorageHelpers";
import { v4 as uuid } from "uuid";
import StyledAccordion from "../StyledComponents/StyledAccordion";

export interface MissingDataAgentModalProps {
  wellReferences: WellReference[];
  wellboreReferences: WellboreReference[];
}

export const missingDataObjectOptions = [
  "Well",
  "Wellbore",
  ...Object.values(ObjectType).filter((o) => o != ObjectType.ChangeLog)
];

const MissingDataAgentModal = (
  props: MissingDataAgentModalProps
): React.ReactElement => {
  const { wellReferences, wellboreReferences } = props;
  const {
    dispatchOperation,
    operationState: { colors }
  } = useOperationState();
  const [missingDataChecks, setMissingDataChecks] = useLocalStorageState<
    MissingDataCheck[]
  >(STORAGE_MISSING_DATA_AGENT_CHECKS_KEY, {
    defaultValue: [{ id: uuid() } as MissingDataCheck],
    valueVerifier: verifyObjectIsChecks,
    storageTransformer: (checks) =>
      checks.map((check) => ({ ...check, id: uuid() }))
  });
  const [errors, setErrors] = useState<string[]>([]);
  const { exportData, exportOptions } = useExport();
  const inputFileRef = useRef<HTMLInputElement>(null);

  const stringToChecks = (checkString: string): MissingDataCheck[] => {
    try {
      const checksObj = JSON.parse(checkString);
      const checks: MissingDataCheck[] = verifyObjectIsChecks(checksObj)
        ? checksObj
        : [];
      return checks.map((check) => ({ ...check, id: uuid() }));
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  const validateChecks = (): boolean => {
    const updatedErrors = [];

    if (!missingDataChecks.some((check) => Boolean(check.objectType)))
      updatedErrors.push("No objects are selected!");
    if (
      missingDataChecks.some(
        (check) => check.objectType == "Well" && check.properties.length == 0
      )
    )
      updatedErrors.push("Selecting properties is required for Wells.");
    if (
      missingDataChecks.some(
        (check) =>
          check.objectType == "Wellbore" &&
          check.properties.length == 0 &&
          wellReferences.length == 0
      )
    )
      updatedErrors.push(
        "Selecting properties is required for Wellbores when running Missing Data Agent on wellbores."
      );

    if (updatedErrors) setErrors(updatedErrors);

    return updatedErrors.length == 0;
  };

  const onSubmit = async () => {
    if (!validateChecks()) return;
    dispatchOperation({ type: OperationType.HideModal });
    const filteredChecks = missingDataChecks
      .map((check) => ({
        ...check,
        properties: check.properties?.filter((p) => p !== selectAllProperties)
      }))
      .filter((check) => check.objectType != null);
    const missingDataJob: MissingDataJob = {
      wellReferences: wellReferences,
      wellboreReferences: wellboreReferences,
      missingDataChecks: filteredChecks
    };
    const jobId = await JobService.orderJob(
      JobType.MissingData,
      missingDataJob
    );
    if (jobId) {
      const reportModalProps = { jobId };
      dispatchOperation({
        type: OperationType.DisplayModal,
        payload: <ReportModal {...reportModalProps} />
      });
    }
  };

  const addCheck = () => {
    setMissingDataChecks([
      ...missingDataChecks,
      { id: uuid() } as MissingDataCheck
    ]);
  };

  const removeCheck = (id: string) => {
    setMissingDataChecks([
      ...missingDataChecks.filter((check) => check.id != id)
    ]);
  };

  const onObjectsChange = (
    selectedItems: string[],
    missingDataCheck: MissingDataCheck
  ) => {
    setMissingDataChecks(
      missingDataChecks.map((oldCheck) =>
        oldCheck.id == missingDataCheck.id
          ? { ...oldCheck, objectType: selectedItems[0], properties: [] }
          : oldCheck
      )
    );
  };

  const onPropertiesChange = (
    selectedItems: string[],
    missingDataCheck: MissingDataCheck
  ) => {
    let newSelectedItems = selectedItems;
    if (
      selectedItems.includes(selectAllProperties) !=
      missingDataCheck.properties.includes(selectAllProperties)
    ) {
      if (
        missingDataCheck.properties.length <
        objectToProperties[missingDataCheck.objectType].length
      ) {
        newSelectedItems = objectToProperties[missingDataCheck.objectType];
      } else {
        newSelectedItems = [];
      }
    }
    setMissingDataChecks(
      missingDataChecks.map((oldCheck) =>
        oldCheck.id == missingDataCheck.id
          ? { ...oldCheck, properties: newSelectedItems }
          : oldCheck
      )
    );
  };

  const getPropertyLabel = (missingDataCheck: MissingDataCheck) => {
    const requiredString =
      missingDataCheck.objectType === "Well" ||
      (missingDataCheck.objectType === "Wellbore" &&
        wellboreReferences.length > 0)
        ? " (required)"
        : missingDataCheck.objectType
        ? " (optional)"
        : "";

    return `Select properties${requiredString}`;
  };

  const onClear = () => {
    setMissingDataChecks([{ id: uuid() } as MissingDataCheck]);
  };

  const onImport = () => {
    // Open file picker
    inputFileRef.current.click();
  };

  const onImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files.item(0);
    if (!file) return;
    const checkString = await file.text();
    const checks = stringToChecks(checkString);
    if (checks.length > 0) {
      setErrors([]);
      setMissingDataChecks(checks);
    } else {
      setErrors([
        ...errors,
        `Could not recognise the format of the imported data from ${file.name}.`
      ]);
    }
  };

  const onExport = () => {
    const json = JSON.stringify(missingDataChecks, (k, v) =>
      k == "id" ? undefined : v
    );
    exportOptions.fileExtension = ".json";
    exportOptions.appendDateTime = false;
    exportData("missingDataAgentChecks", "", json);
  };

  return (
    <ModalDialog
      heading="Missing Data Agent"
      onSubmit={onSubmit}
      confirmColor={"primary"}
      errorMessage={errors.join(" ")}
      confirmText={`OK`}
      showCancelButton={true}
      width={ModalWidth.MEDIUM}
      height="800px"
      minHeight="650px"
      isLoading={false}
      content={
        <ModalContentLayout>
          <StyledAccordion style={{ paddingBottom: "30px" }}>
            <Accordion.Item>
              <StyledAccordionHeader colors={colors}>
                Missing Data Agent
              </StyledAccordionHeader>
              <Accordion.Panel
                style={{ backgroundColor: colors.ui.backgroundLight }}
              >
                <Typography style={{ whiteSpace: "pre-line" }}>
                  The missing data agent can be used to check if there are data
                  in the selected objects or properties.
                  <br />
                  <br />
                  When leaving the properties field empty, the agent will check
                  if the object is present.
                </Typography>
              </Accordion.Panel>
            </Accordion.Item>
          </StyledAccordion>
          {missingDataChecks.map((missingDataCheck) => (
            <CheckLayout key={missingDataCheck.id}>
              <Autocomplete
                dropdownHeight={300}
                id={`object${missingDataCheck.id}`}
                label="Select object"
                options={missingDataObjectOptions}
                placeholder={missingDataCheck.objectType || ""}
                onFocus={(e) => e.preventDefault()}
                onOptionsChange={({ selectedItems }) =>
                  onObjectsChange(selectedItems, missingDataCheck)
                }
              />
              <Autocomplete
                dropdownHeight={300}
                id={`properties${missingDataCheck.id}`}
                disabled={
                  !missingDataObjectOptions.includes(
                    missingDataCheck.objectType
                  )
                }
                label={getPropertyLabel(missingDataCheck)}
                multiple={true}
                placeholder={
                  missingDataCheck.properties
                    ?.filter((p) => p != selectAllProperties)
                    .join(", ") || ""
                }
                options={objectToProperties[missingDataCheck.objectType]}
                selectedOptions={missingDataCheck.properties || []}
                onFocus={(e) => e.preventDefault()}
                onOptionsChange={({ selectedItems }) =>
                  onPropertiesChange(selectedItems, missingDataCheck)
                }
              />
              <Button
                variant="ghost_icon"
                style={{ alignSelf: "end" }}
                onClick={() => removeCheck(missingDataCheck.id)}
              >
                <Icon name="deleteToTrash" />
              </Button>
            </CheckLayout>
          ))}
          <Button
            style={{ alignSelf: "center" }}
            variant="contained_icon"
            onClick={addCheck}
          >
            <Icon name="add" />
          </Button>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "1rem",
              paddingTop: "1rem",
              paddingLeft: "0.5rem"
            }}
          >
            <Button onClick={onClear} variant="outlined">
              Clear
            </Button>
            <Button onClick={onImport} variant="outlined">
              <Icon name="cloudUpload" />
              Import
              <input
                ref={inputFileRef}
                type="file"
                accept=".json,text/json"
                onChange={onImportFile}
                hidden
              />
            </Button>
            <Button onClick={onExport} variant="outlined">
              Export
            </Button>
          </div>
        </ModalContentLayout>
      }
    />
  );
};

const verifyObjectIsChecks = (obj: any): boolean => {
  if (!Array.isArray(obj)) return false;
  return obj.every(
    (check) =>
      typeof check === "object" &&
      (!("objectType" in check) ||
        missingDataObjectOptions.includes(check.objectType)) &&
      (!("properties" in check) ||
        ("objectType" in check &&
          Array.isArray(check.properties) &&
          check.properties.every(
            (property: any) =>
              typeof property === "string" &&
              objectToProperties[check.objectType].includes(property)
          )))
  );
};

export default MissingDataAgentModal;

const CheckLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr 0.2fr;
  gap: 10px;
`;
