import { Accordion, List, TextField } from "@equinor/eds-core-react";
import * as Papa from "papaparse";
import React, { ChangeEvent, useState } from "react";
import { useCSVReader } from "react-papaparse";
import styled from "styled-components";
import OperationType from "../../contexts/operationType.ts";
import { useOperationState } from "../../hooks/useOperationState.tsx";
import MnemonicsMappingJob from "../../models/jobs/mnemonicsMappingJob.tsx";
import JobService, { JobType } from "../../services/jobService.tsx";
import { Button } from "../StyledComponents/Button.tsx";
import { Checkbox } from "../StyledComponents/Checkbox.tsx";
import StyledAccordion from "../StyledComponents/StyledAccordion";
import { Typography } from "../StyledComponents/Typography.tsx";
import { StyledAccordionHeader } from "./LogComparisonModal.tsx";
import ModalDialog from "./ModalDialog.tsx";

const MnemonicsMappingUploadModal = (): React.ReactElement => {
  const {
    operationState: { colors },
    dispatchOperation
  } = useOperationState();

  const { CSVReader } = useCSVReader();

  const [vendorName, setVendorName] = useState<string>("");
  const [csvParseResult, setCsvParseResult] =
    useState<Papa.ParseResult<string[]>>(undefined);
  const [isFileInvalid, setIsFileInvalid] = useState<boolean>(false);
  const [checkedOverwrite, setCheckedOverwrite] = useState(false);

  const validateParseResult = (parseResult: Papa.ParseResult<string[]>) => {
    return (
      parseResult.errors?.length == 0 &&
      parseResult.data?.length > 1 &&
      parseResult.data[0].length == 2 &&
      parseResult.data[0][0] == "Vendor Mnemonic" &&
      parseResult.data[0][1] == "Global Mnemonic"
    );
  };

  const onSubmit = async () => {
    dispatchOperation({ type: OperationType.HideModal });

    const job: MnemonicsMappingJob = {
      vendorName: vendorName,
      overwrite: checkedOverwrite,
      mappings: csvParseResult.data
    };

    await JobService.orderJob(JobType.MnemonicsMapping, job);
  };

  return (
    <>
      <ModalDialog
        heading={"Mnemonics Mapping Upload"}
        confirmText={"Confirm"}
        content={
          <ContentLayout>
            <TextField
              id="vendorName"
              label="Vendor name"
              value={vendorName}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setVendorName(e.target.value);
              }}
            />
            <Checkbox
              colors={colors}
              label="Overwrite data for vendor"
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setCheckedOverwrite(e.target.checked);
              }}
              checked={checkedOverwrite}
            />
            <CSVReader
              onUploadAccepted={(parseResult: Papa.ParseResult<string[]>) => {
                if (!validateParseResult(parseResult)) {
                  setIsFileInvalid(true);
                  setCsvParseResult(undefined);
                } else {
                  setIsFileInvalid(false);
                  setCsvParseResult(parseResult);
                }
              }}
            >
              {({ acceptedFile, getRootProps }: any) => (
                <Button {...getRootProps()}>
                  {!acceptedFile
                    ? "Select CSV file to upload"
                    : "Selected File: " + acceptedFile.name}
                </Button>
              )}
            </CSVReader>
            {isFileInvalid && (
              <Typography style={{ color: colors.interactive.dangerText }}>
                File is not in proper format! CSV file should contain "Vendor
                Mnemonic" and "Global Mnemonic" column headers.
              </Typography>
            )}
            <StyledAccordion>
              <Accordion.Item>
                <StyledAccordionHeader colors={colors}>
                  Limitations
                </StyledAccordionHeader>
                <Accordion.Panel
                  style={{ backgroundColor: colors.ui.backgroundLight }}
                >
                  <List>
                    <List.Item>
                      What it does:
                      <List>
                        <List.Item>
                          Adds a translation table between vendor mnemonics and
                          global mnemonics.
                          <br />
                          This resolves naming differences across vendors.
                        </List.Item>
                      </List>
                    </List.Item>
                    <List.Item>Supported filetype: csv</List.Item>
                    <List.Item>
                      The csv is expected to have this format:
                      <List>
                        <List.Item>
                          Vendor Mnemonic,Global Mnemonic
                          <br />
                          BTCS-T,RT_AC
                          <br />
                          XBC1-T,RT_AC
                        </List.Item>
                      </List>
                    </List.Item>
                    <List.Item>
                      How it is used in WEx
                      <List>
                        <List.Item>
                          Used for multi-log / multi-target comparisons to match
                          mnemonics across servers and wellbores with consistent
                          names.
                        </List.Item>
                      </List>
                    </List.Item>
                  </List>
                </Accordion.Panel>
              </Accordion.Item>
            </StyledAccordion>
          </ContentLayout>
        }
        onSubmit={() => onSubmit()}
        confirmDisabled={
          vendorName?.length == 0 || !csvParseResult || isFileInvalid
        }
        isLoading={false}
      />
    </>
  );
};

const ContentLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  height: 65vh;
`;

export default MnemonicsMappingUploadModal;
