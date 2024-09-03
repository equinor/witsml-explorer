import { Accordion, Icon, List } from "@equinor/eds-core-react";
import { Button, Tooltip, Typography } from "@mui/material";
import { WITSML_INDEX_TYPE_MD } from "components/Constants";
import {
  ContentTable,
  ContentTableColumn,
  ContentTableRow,
  ContentType
} from "components/ContentViews/table";
import { StyledAccordionHeader } from "components/Modals/LogComparisonModal";
import ModalDialog, { ModalWidth } from "components/Modals/ModalDialog";
import WarningBar from "components/WarningBar";
import { useConnectedServer } from "contexts/connectedServerContext";
import OperationType from "contexts/operationType";
import { useGetComponents } from "hooks/query/useGetComponents";
import { useOperationState } from "hooks/useOperationState";
import { ComponentType } from "models/componentType";
import { IndexRange } from "models/jobs/deleteLogCurveValuesJob";
import ImportLogDataJob from "models/jobs/importLogDataJob";
import ObjectReference from "models/jobs/objectReference";
import LogCurveInfo from "models/logCurveInfo";
import LogObject from "models/logObject";
import { toObjectReference } from "models/objectOnWellbore";
import React, { useCallback, useMemo, useState } from "react";
import JobService, { JobType } from "services/jobService";
import styled from "styled-components";
import {
  extractLASSection,
  parseLASData,
  parseLASHeader
} from "tools/lasFileTools";

export interface LogDataImportModalProps {
  targetLog: LogObject;
}
interface ImportColumn {
  index: number;
  name: string;
  unit: string;
}

interface ContentTableCustomRow extends ContentTableRow {
  [key: string]: any;
}

const IMPORT_FORMAT_INVALID =
  "Can't recognize every column, the file format may be invalid.";
const MISSING_INDEX_CURVE =
  "The target index curve needs to be present in the file";
const UNITLESS_UNIT = "unitless";

const LogDataImportModal = (
  props: LogDataImportModalProps
): React.ReactElement => {
  const { targetLog } = props;
  const { connectedServer } = useConnectedServer();
  const {
    dispatchOperation,
    operationState: { colors }
  } = useOperationState();
  const { components: logCurveInfoList, isFetching: isFetchingLogCurveInfo } =
    useGetComponents(
      connectedServer,
      targetLog.wellUid,
      targetLog.wellboreUid,
      targetLog.uid,
      ComponentType.Mnemonic
    );
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

  const hasOverlap = checkOverlap(
    targetLog,
    uploadedFileColumns,
    uploadedFileData,
    logCurveInfoList
  );

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

      let header: ImportColumn[] = null;
      let data: string[] = null;

      if (text.startsWith("~V")) {
        // LAS files should start with ~V.
        const curveSection = extractLASSection(
          text,
          "CURVE INFORMATION",
          "Curve"
        );
        const dataSection = extractLASSection(text, "ASCII", "A");
        header = parseLASHeader(curveSection);
        data = parseLASData(dataSection);
      } else {
        const headerLine = text.split("\n", 1)[0];
        header = parseCSVHeader(headerLine);
        data = text.split("\n").slice(1);
      }
      validate(header);
      setUploadedFile(file);
      setUploadedFileColumns(header);
      setUploadedFileData(data);
    },
    []
  );

  const parseCSVHeader = (header: string) => {
    const unitRegex = /(?<=\[)(.*)(?=\]){1}/;
    const fileColumns = header.split(separator).map((col, index) => {
      const columnName = col.substring(0, col.indexOf("["));
      return {
        index: index,
        name: columnName ? columnName : col,
        unit: unitRegex.exec(col) ? unitRegex.exec(col)[0] : UNITLESS_UNIT
      };
    });
    return fileColumns;
  };

  const contentTableColumns: ContentTableColumn[] = useMemo(
    () =>
      uploadedFileColumns.map((col) => ({
        property: col.name,
        label: `${col.name}[${col.unit}]`,
        type: ContentType.String
      })),
    [uploadedFileColumns]
  );

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
                    accept=".csv,text/csv,.las,.txt"
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
                      <List.Item>Supported filetypes: csv, las.</List.Item>
                      <List.Item>
                        Supported logs: depth (csv + las), time (csv).
                      </List.Item>
                      <List.Item>
                        Only curve names, units and data is imported.
                      </List.Item>
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
                      <List.Item>
                        The las is expected to have these sections:
                        <List>
                          <List.Item>
                            ~CURVE INFORMATION (or ~C)
                            <br />
                            [...]
                            <br />
                            IndexCurve .unit [...]
                            <br />
                            Curve1 .unit [...]
                            <br />
                            [...]
                            <br />
                            ~ASCII (or ~A)
                            <br />
                            195.99 -999.25 2500
                            <br />
                            196.00 1 2501
                          </List.Item>
                        </List>
                      </List.Item>
                    </List>
                  </Accordion.Panel>
                </Accordion.Item>
                {uploadedFileColumns?.length &&
                  uploadedFileData?.length &&
                  targetLog?.indexCurve &&
                  !error && (
                    <Accordion.Item>
                      <StyledAccordionHeader colors={colors}>
                        Preview
                      </StyledAccordionHeader>
                      <Accordion.Panel
                        style={{
                          backgroundColor: colors.ui.backgroundLight,
                          padding: 0
                        }}
                      >
                        <div style={{ height: "300px" }}>
                          <ContentTable
                            showPanel={false}
                            columns={contentTableColumns}
                            data={getTableData(
                              uploadedFileData,
                              uploadedFileColumns,
                              targetLog.indexCurve
                            )}
                          />
                        </div>
                      </Accordion.Panel>
                    </Accordion.Item>
                  )}
              </Accordion>
              {hasOverlap && (
                <WarningBar message="The import data overlaps existing data. Any overlap will be overwritten!" />
              )}
            </Container>
          }
          width={ModalWidth.LARGE}
          confirmDisabled={!uploadedFile || !!error || isFetchingLogCurveInfo}
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

const checkOverlap = (
  targetLog: LogObject,
  columns: ImportColumn[],
  data: string[],
  logCurveInfoList: LogCurveInfo[]
) => {
  if (!columns || !data || !logCurveInfoList) return false;
  const importDataRanges = getDataRanges(targetLog, columns, data);

  for (let index = 1; index < columns.length; index++) {
    const mnemonic = columns[index].name;
    const logCurveInfo = logCurveInfoList.find(
      (lci) => lci.mnemonic === mnemonic
    );
    const importDataRange = importDataRanges[index];
    if (logCurveInfo && importDataRange.startIndex) {
      if (targetLog.indexType === WITSML_INDEX_TYPE_MD) {
        if (
          Math.max(
            parseFloat(importDataRange.startIndex),
            parseFloat(logCurveInfo.minDepthIndex)
          ) <=
          Math.min(
            parseFloat(importDataRange.endIndex),
            parseFloat(logCurveInfo.maxDepthIndex)
          )
        ) {
          return true;
        }
      } else {
        if (
          Math.max(
            new Date(importDataRange.startIndex).valueOf(),
            new Date(logCurveInfo.minDateTimeIndex).valueOf()
          ) <=
          Math.min(
            new Date(importDataRange.endIndex).valueOf(),
            new Date(logCurveInfo.maxDateTimeIndex).valueOf()
          )
        ) {
          return true;
        }
      }
    }
  }
  return false;
};

const getDataRanges = (
  targetLog: LogObject,
  columns: ImportColumn[],
  data: string[]
): IndexRange[] => {
  const dataRanges: IndexRange[] = [];
  const indexCurveColumn = columns.find(
    (col) => col.name === targetLog.indexCurve
  )?.index;

  for (let index = 0; index < columns.length; index++) {
    const firstRowWithData = data.find((dataRow) => {
      const data = dataRow.split(",")[index];
      if (data) return true;
    });

    const lastRowWithData = data.findLast((dataRow) => {
      const data = dataRow.split(",")[index];
      if (data) return true;
    });

    const firstRowWithDataIndex =
      firstRowWithData?.split(",")[indexCurveColumn];
    const lastRowWithDataIndex = lastRowWithData?.split(",")[indexCurveColumn];

    if (
      targetLog.indexType === WITSML_INDEX_TYPE_MD &&
      parseFloat(firstRowWithDataIndex) > parseFloat(lastRowWithDataIndex)
    ) {
      dataRanges.push({
        startIndex: lastRowWithDataIndex,
        endIndex: firstRowWithDataIndex
      });
    } else {
      dataRanges.push({
        startIndex: firstRowWithDataIndex,
        endIndex: lastRowWithDataIndex
      });
    }
  }

  return dataRanges;
};

const getTableData = (
  data: string[],
  columns: ImportColumn[],
  indexCurve: string
): ContentTableCustomRow[] => {
  const indexCurveColumn = columns.find((col) => col.name === indexCurve);
  if (!indexCurveColumn) return [];
  return data?.map((dataLine) => {
    const dataCells = dataLine.split(",");
    const result: ContentTableCustomRow = {
      id: dataCells[indexCurveColumn.index]
    };
    columns.forEach((col, i) => {
      result[col.name] = dataCells[i];
    });
    return result;
  });
};

export default LogDataImportModal;
