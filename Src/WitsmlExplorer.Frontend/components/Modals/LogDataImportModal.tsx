import {
  Accordion,
  Autocomplete,
  Icon,
  Label,
  List,
  TextField
} from "@equinor/eds-core-react";
import { Button, Tooltip, Typography } from "@mui/material";
import {
  WITSML_INDEX_TYPE_DATE_TIME,
  WITSML_INDEX_TYPE_MD
} from "components/Constants";
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
import { parse } from "date-fns";
import { zonedTimeToUtc } from "date-fns-tz";
import { useGetComponents } from "hooks/query/useGetComponents";
import { useOperationState } from "hooks/useOperationState";
import { countBy, Dictionary } from "lodash";
import { ComponentType } from "models/componentType";
import { IndexRange } from "models/jobs/deleteLogCurveValuesJob";
import ImportLogDataJob from "models/jobs/importLogDataJob";
import ObjectReference from "models/jobs/objectReference";
import LogCurveInfo from "models/logCurveInfo";
import LogObject from "models/logObject";
import { toObjectReference } from "models/objectOnWellbore";
import React, { ChangeEvent, useCallback, useMemo, useState } from "react";
import JobService, { JobType } from "services/jobService";
import styled, { CSSProperties } from "styled-components";
import { Colors } from "styles/Colors";
import {
  extractLASSection,
  parseLASData,
  parseLASHeader
} from "tools/lasFileTools";
import StyledAccordion from "../StyledComponents/StyledAccordion";

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
  const [allUploadedFileData, setAllUploadedFileData] = useState<string[]>([]);
  const [uploadedFileColumns, setUploadedFileColumns] = useState<
    ImportColumn[]
  >([]);
  const [allFileColumns, setAllFileColumns] = useState<ImportColumn[]>([]);
  const [selectedMnemonics, setSelectedMnemonics] = useState<string[]>([]);
  const [allMnemonics, setAllMnemonics] = useState<string[]>([]);
  const [error, setError] = useState<string>("");
  const [duplicityWarning, setDuplicityWarning] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dateTimeFormat, setDateTimeFormat] = useState<string>(null);
  const [contentTableId, setContentTableId] = useState<string>(
    "listOfSelectedMmenomics"
  );
  const separator = ",";

  const validate = (fileColumns: ImportColumn[], parseError?: string) => {
    if (parseError) setError(parseError);
    if (fileColumns.length) {
      if (fileColumns.map((col) => col.name).some((value) => value === ""))
        setError(IMPORT_FORMAT_INVALID);
      if (
        !fileColumns
          .map((col) => col.name.toUpperCase())
          .includes(targetLog.indexCurve.toUpperCase())
      )
        setError(MISSING_INDEX_CURVE);
    }
  };

  const getParsedData = () => {
    if (
      uploadedFileData &&
      uploadedFileColumns &&
      targetLog?.indexType === WITSML_INDEX_TYPE_DATE_TIME
    ) {
      try {
        return parseDateTimeColumn(uploadedFileData, 0, dateTimeFormat);
      } catch (error) {
        validate(
          uploadedFileColumns,
          dateTimeFormat ? `Unable to parse data. ${error}` : null
        );
        return null;
      }
    }
    return uploadedFileData;
  };

  const parsedData = useMemo(
    () => getParsedData(),
    [
      uploadedFileData,
      uploadedFileColumns,
      targetLog,
      dateTimeFormat,
      selectedMnemonics
    ]
  );

  const hasOverlap = checkOverlap(
    targetLog,
    uploadedFileColumns,
    parsedData,
    logCurveInfoList
  );

  const onSubmit = async () => {
    setIsLoading(true);

    const logReference: ObjectReference = toObjectReference(targetLog);
    const job: ImportLogDataJob = {
      targetLog: logReference,
      mnemonics: uploadedFileColumns.map((col) => col.name),
      units: uploadedFileColumns.map((col) => col.unit),
      dataRows:
        parsedData !== null
          ? parsedData.map((line) => line.split(separator))
          : uploadedFileData.map((line) => line.split(separator))
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
      setDuplicityWarning("");

      if (text.startsWith("~V")) {
        // LAS files should start with ~V.
        const curveSection = extractLASSection(
          text,
          "CURVE INFORMATION",
          "Curve"
        );
        const dataSection = extractLASSection(text, "ASCII", "A");
        header = parseLASHeader(curveSection);
        const groupedByNum = countBy(header, "name");
        createWarningOfDuplicities(groupedByNum);
        header = countOccurrences(header, "name");
        validate(header);
        data = parseLASData(dataSection);
        const indexCurveColumn = header.find(
          (x) => x.name.toLowerCase() === targetLog.indexCurve.toLowerCase()
        )?.index;
        header[indexCurveColumn].name = targetLog.indexCurve;
        if (
          targetLog.indexType === WITSML_INDEX_TYPE_DATE_TIME &&
          indexCurveColumn !== null
        ) {
          // las file time
          const dateTimeFormat = findDateTimeFormat(data, indexCurveColumn);
          data = swapFirstColumn(data, indexCurveColumn);
          setUploadedFileData(data);
          setAllUploadedFileData(data);
          swapArrayElements<ImportColumn>(header, 0, indexCurveColumn);
          setDateTimeFormat(dateTimeFormat);
        } else {
          // las file depth
          setUploadedFileData(data);
          setAllUploadedFileData(data);
        }
      } else {
        // csv files
        const headerLine = text.split("\n", 1)[0];
        header = parseCSVHeader(headerLine);
        data = text
          .split("\n")
          .slice(1)
          .filter((row) => row !== "");
        setUploadedFileData(data);
        setAllUploadedFileData(data);
      }
      setUploadedFileColumns(header);
      setAllMnemonics(header.map((col) => col.name));
      setAllFileColumns(header);
      setSelectedMnemonics(header.map((col) => col.name));
      setUploadedFile(file);
    },
    []
  );

  const parseCSVHeader = (headerr: string) => {
    const unitRegex = /(?<=\[)(.*)(?=\]){1}/;
    const fileColumns = headerr.split(separator).map((col, index) => {
      const columnName = col
        .substring(0, col.indexOf("["))
        .replaceAll(" ", "_");
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
      uploadedFileColumns
        .filter((x) => selectedMnemonics.find((y) => y === x.name))
        .map((col) => ({
          col,
          property: col.name,
          label: `${col.name}[${col.unit}]`,
          type: ContentType.String
        })),
    [uploadedFileColumns]
  );

  const onMnemonicsChange = ({
    selectedItems
  }: {
    selectedItems: string[];
  }) => {
    if (
      selectedItems.find(
        (option) => option.toUpperCase() === targetLog.indexCurve.toUpperCase()
      )
    ) {
      setSelectedMnemonics(selectedItems);
      const reducedData = updateColumns(
        allUploadedFileData,
        selectedItems,
        allFileColumns
      );

      const reducedHeader = updateHeader(allFileColumns, selectedItems);
      const timestamp = new Date().getTime();
      setContentTableId(timestamp.toString());
      setUploadedFileColumns(reducedHeader);
      setUploadedFileData(reducedData);
    }
  };

  const countOccurrences = (arr: any[], property: string) => {
    return arr.reduce((acc, obj) => {
      const key = obj[property];
      if (key) {
        acc[key] = (acc[key] || 0) + 1;
        if (acc[key] > 1) obj.name = obj.name + "(" + acc[key] + ")";
      }
      return arr;
    }, {});
  };

  const createWarningOfDuplicities = (mnemonics: Dictionary<number>) => {
    let foundDuplicity = false;
    let warningText = "Found multiple mnemonics with the same name: ";
    for (const key in mnemonics) {
      const value = mnemonics[key];
      if (value > 1) {
        warningText = warningText + key + "(" + mnemonics[key] + ") ";
        foundDuplicity = true;
      }
    }
    if (foundDuplicity) {
      warningText =
        warningText +
        ". Duplicate names were automatically changed by adding numbers as suffix in parenthesis.";
      setDuplicityWarning(warningText);
    }
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
              {uploadedFile && (
                <>
                  <StyledLabel
                    label="You can choose mnemonics for export:"
                    colors={colors}
                  />
                  <StyledAutocomplete
                    id={"mnemonics"}
                    label={""}
                    multiple={true}
                    hideClearButton={true}
                    variant={selectedMnemonics.length === 0 ? "error" : null}
                    options={allMnemonics}
                    selectedOptions={selectedMnemonics}
                    onFocus={(e) => e.preventDefault()}
                    onOptionsChange={onMnemonicsChange}
                    style={
                      {
                        "--eds-input-background": colors.ui.backgroundDefault
                      } as CSSProperties
                    }
                    dropdownHeight={700}
                    colors={colors}
                  />
                </>
              )}
              {targetLog?.indexType === WITSML_INDEX_TYPE_DATE_TIME &&
                !!uploadedFileData?.length && (
                  <TextField
                    id="indexCurveFormat"
                    label="Index Curve Format"
                    value={dateTimeFormat ?? ""}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setDateTimeFormat(e.target.value);
                    }}
                  />
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
                      <List.Item>Supported filetypes: csv, las.</List.Item>
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
                            key={contentTableId}
                            columns={contentTableColumns}
                            showPanel={false}
                            data={getTableData(
                              parsedData !== null
                                ? parsedData
                                : uploadedFileData,
                              uploadedFileColumns,
                              targetLog.indexCurve
                            ).splice(0, 30)}
                          />
                        </div>
                      </Accordion.Panel>
                    </Accordion.Item>
                  )}
              </StyledAccordion>
              {hasOverlap && (
                <WarningBar message="The import data overlaps existing data. Any overlap will be overwritten!" />
              )}
              {duplicityWarning && <WarningBar message={duplicityWarning} />}
            </Container>
          }
          width={ModalWidth.LARGE}
          height="800px"
          minHeight="650px"
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

const StyledAutocomplete = styled(Autocomplete)<{ colors: Colors }>`
  button {
    color: ${(props) => props.colors.infographic.primaryMossGreen};
  }
`;

const StyledLabel = styled(Label)<{ colors: Colors }>`
  color: ${(props) => props.colors.infographic.primaryMossGreen};
  white-space: nowrap;
  align-items: center;
  font-style: italic;
`;

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
  const indexCurveColumn = columns.find(
    (col) => col.name.toUpperCase() === indexCurve.toUpperCase()
  );
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

function swapColumns(
  matrix: string[][],
  col1: number,
  col2: number
): string[][] {
  for (const row of matrix) {
    [row[col1], row[col2]] = [row[col2], row[col1]];
  }
  return matrix;
}

const swapFirstColumn = (data: string[], selectedColumn: number) => {
  const splitData = data.map((obj) => obj.split(","));
  const tempData = swapColumns(splitData, 0, selectedColumn);
  const result = tempData.map((obj) => obj.join(","));
  return result;
};

const updateColumns = (
  data: string[],
  mnemonics: string[],
  allMnemonics: ImportColumn[]
) => {
  let splitData = data.map((obj) => obj.split(","));

  for (let i = allMnemonics.length - 1; i >= 0; i--) {
    const toRemove = allMnemonics[i];
    if (mnemonics.indexOf(toRemove.name) === -1) {
      splitData = removeColumn(splitData, i);
    }
  }
  return splitData.map((obj) => obj.join(","));
};

const updateHeader = (columns: ImportColumn[], mnemonics: string[]) => {
  const output = columns.filter((x) => mnemonics.indexOf(x.name) > -1);
  return output;
};

function removeColumn(arr: any[][], colIndex: number): any[][] {
  return arr.map((row) => row.filter((_, index) => index !== colIndex));
}

function swapArrayElements<T>(arr: T[], i: number, j: number): void {
  [arr[i], arr[j]] = [arr[j], arr[i]];
}

const inputDateFormats: string[] = [
  "YYYY-MM-DDTHH:mm:ss.sssZ", // ISO 8601 format
  "HH:mm:ss/dd-MMM-yyyy"
];

const findDateTimeFormat = (
  data: string[],
  selectedColumn: number
): string | null => {
  const dateString = data[0].split(",")[selectedColumn];
  for (const format of inputDateFormats) {
    try {
      parseDateFromFormat(dateString, format);
      return format;
    } catch {
      // Ignore error, try next format.
    }
  }
  return null;
};

const parseDateTimeColumn = (
  data: string[],
  selectedColumn: number,
  inputFormat: string
) => {
  const dataWithISOTimeColumn = data.map((dataRow) => {
    const rowValues = dataRow.split(",");
    rowValues[selectedColumn] = parseDateFromFormat(
      rowValues[selectedColumn],
      inputFormat
    );
    return rowValues.join(",");
  });
  return dataWithISOTimeColumn;
};

const parseDateFromFormat = (dateString: string, format: string) => {
  const parsed = parse(dateString, format, new Date());
  if (parsed.toString() === "Invalid Date")
    throw new Error(`Unable to parse date ${dateString} with format ${format}`);
  return zonedTimeToUtc(parsed, "UTC").toISOString();
};

export default LogDataImportModal;
