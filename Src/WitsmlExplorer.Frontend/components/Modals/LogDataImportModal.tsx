import { Accordion, Icon, List } from "@equinor/eds-core-react";
import { Button, Tooltip, Typography } from "@mui/material";
import { StyledAccordionHeader } from "components/Modals/LogComparisonModal";
import ModalDialog from "components/Modals/ModalDialog";
import OperationContext from "contexts/operationContext";
import OperationType from "contexts/operationType";
import ImportLogDataJob from "models/jobs/importLogDataJob";
import ObjectReference from "models/jobs/objectReference";
import LogObject from "models/logObject";
import { toObjectReference } from "models/objectOnWellbore";
import React, { useCallback, useContext, useState } from "react";
import JobService, { JobType } from "services/jobService";
import styled from "styled-components";

export interface LogDataImportModalProps {
  targetLog: LogObject;
}
interface ImportColumn {
  index: number;
  name: string;
  unit: string;
}

const IMPORT_FORMAT_INVALID =
  "Can't recognize every column, the csv format may be invalid.";
const MISSING_INDEX_CURVE =
  "The target index curve needs to be present in the csv";
const UNITLESS_UNIT = "unitless";

const LogDataImportModal = (
  props: LogDataImportModalProps
): React.ReactElement => {
  const { targetLog } = props;
  const {
    dispatchOperation,
    operationState: { colors }
  } = useContext(OperationContext);
  const [uploadedFile, setUploadedFile] = useState<File>(null);
  const [uploadedFileData, setUploadedFileData] = useState<string[]>([]);
  const [uploadedFileColumns, setUploadedFileColumns] = useState<
    ImportColumn[]
  >([]);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const separator = ",";

  const validate = (fileColumns: ImportColumn[]) => {
    setError("");
    if (fileColumns.length) {
      if (fileColumns.map((col) => col.name).some((value) => value === ""))
        setError(IMPORT_FORMAT_INVALID);
      if (!fileColumns.map((col) => col.name).includes(targetLog.indexCurve))
        setError(MISSING_INDEX_CURVE);
    }
  };

  const onSubmit = async () => {
    setIsLoading(true);

    const logReference: ObjectReference = toObjectReference(targetLog);
    const job: ImportLogDataJob = {
      targetLog: logReference,
      mnemonics: uploadedFileColumns.map((col) => col.name),
      units: uploadedFileColumns.map((col) => col.unit),
      dataRows: uploadedFileData.map((line) => line.split(separator))
    };

    await JobService.orderJob(JobType.ImportLogData, job);
    setIsLoading(false);
    dispatchOperation({ type: OperationType.HideModal });
  };

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
      const file = e.target.files.item(0);
      if (!file) return;

      const text = await file.text();
      const header = text.split("\n", 1)[0];
      const data = text.split("\n").slice(1);

      setUploadedFile(file);
      updateUploadedFileColumns(header);
      setUploadedFileData(data);
    },
    []
  );

  const updateUploadedFileColumns = (header: string): void => {
    const unitRegex = /(?<=\[)(.*)(?=\]){1}/;
    const fileColumns = header.split(separator).map((col, index) => {
      const columnName = col.substring(0, col.indexOf("["));
      return {
        index: index,
        name: columnName ? columnName : col,
        unit: unitRegex.exec(col) ? unitRegex.exec(col)[0] : UNITLESS_UNIT
      };
    });
    setUploadedFileColumns(fileColumns);
    validate(fileColumns);
  };

  return (
    <>
      {
        <ModalDialog
          heading={`Import data into "${targetLog.name}"`}
          content={
            <Container>
              <FileContainer>
                <Button
                  variant="contained"
                  color={"primary"}
                  component="label"
                  startIcon={<Icon name="cloudUpload" />}
                >
                  <Typography noWrap>Upload File</Typography>
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    hidden
                    onChange={handleFileChange}
                  />
                </Button>
                <Tooltip placement={"top"} title={uploadedFile?.name ?? ""}>
                  <Typography noWrap>
                    {uploadedFile?.name ?? "No file chosen"}
                  </Typography>
                </Tooltip>
              </FileContainer>
              <Accordion>
                <Accordion.Item>
                  <StyledAccordionHeader colors={colors}>
                    Limitations
                  </StyledAccordionHeader>
                  <Accordion.Panel
                    style={{ backgroundColor: colors.ui.backgroundLight }}
                  >
                    <List>
                      <List.Item>
                        Currently, only double values are supported as
                        TypeLogData.
                      </List.Item>
                      <List.Item>
                        The csv is expected to have this format:
                        <List>
                          <List.Item>
                            IndexCurve[unit],Curve1[unit],Curve2[unit]
                            <br />
                            195.99,,2500
                            <br />
                            196.00,1,2501
                          </List.Item>
                        </List>
                      </List.Item>
                    </List>
                  </Accordion.Panel>
                </Accordion.Item>
              </Accordion>
            </Container>
          }
          confirmDisabled={!uploadedFile || !!error}
          confirmText={"Import"}
          onSubmit={() => onSubmit()}
          isLoading={isLoading}
          errorMessage={error}
        />
      }
    </>
  );
};

const FileContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 1rem;
  align-items: center;
  .MuiButton-root {
    min-width: 160px;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export default LogDataImportModal;
