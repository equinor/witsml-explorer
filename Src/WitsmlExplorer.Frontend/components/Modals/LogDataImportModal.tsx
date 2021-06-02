import React, { useCallback, useEffect, useState } from "react";
import { HideModalAction } from "../../contexts/operationStateReducer";
import ModalDialog from "./ModalDialog";
import { Box, Button, Grid, List, ListItem, MenuItem, Select, TextField, Tooltip, Typography } from "@material-ui/core";
import OperationType from "../../contexts/operationType";
import JobService, { JobType } from "../../services/jobService";
import LogObject from "../../models/logObject";
import { CloudUpload } from "@material-ui/icons";
import LogObjectService from "../../services/logObjectService";
import LogCurveInfo from "../../models/logCurveInfo";
import { truncateAbortHandler } from "../../services/apiClient";
import styled from "styled-components";
import { Autocomplete } from "@material-ui/lab";
import ImportLogDataJob from "../../models/jobs/importLogDataJob";

export interface LogDataImportModalProps {
  targetLog: LogObject;
  dispatchOperation: (action: HideModalAction) => void;
}
interface ImportColumn {
  index: number;
  name: string;
  unit: string;
}

const IMPORT_FORMAT_INVALID = "Can't recognize every column, the csv format may be invalid.";
const UNITLESS_UNIT = "unitless";

const LogDataImportModal = (props: LogDataImportModalProps): React.ReactElement => {
  const { targetLog, dispatchOperation } = props;
  const [isValidData, setIsValidData] = useState<boolean>(false);
  const [uploadedFile, setUploadedFile] = useState<File>(null);
  const [uploadedFileHeader, setUploadedFileHeader] = useState<string>("");
  const [uploadedFileData, setUploadedFileData] = useState<string[]>([]);
  const [uploadedFileColumns, setUploadedFileColumns] = useState<ImportColumn[]>([]);
  const [curveInfoToUploadedFileColumn, setCurveInfoToUploadedFileColumn] = useState<Map<LogCurveInfo, ImportColumn>>(new Map());
  const [uploadedFileText, setUploadedFileText] = useState<string>("");
  const [targetLogCurveInfos, setTargetLogCurveInfos] = useState<LogCurveInfo[]>([]);
  const [availableUnits, setAvailableUnits] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const separator = ",";

  useEffect(() => {
    console.log(uploadedFileData)
  }, [uploadedFileData]);

  useEffect(() => {
    setAvailableUnits(new Set(targetLogCurveInfos.map((curveInfo) => curveInfo.unit)).add(UNITLESS_UNIT));
  }, [targetLogCurveInfos]);

  useEffect(() => {
    if (uploadedFileColumns.length > 0) {
      const map = new Map<LogCurveInfo, ImportColumn>();
      for (let index = 0; index < targetLogCurveInfos.length; index++) {
        const curveInfo = targetLogCurveInfos[index];
        map.set(
          curveInfo,
          uploadedFileColumns.find((col) => col.name === curveInfo.mnemonic)
        );
      }
      setCurveInfoToUploadedFileColumn(map);
    }
  }, [uploadedFileColumns, targetLogCurveInfos]);

  useEffect(() => {
    setIsLoading(true);
    const controller = new AbortController();
    //Todo: get witsml server capabilities to determine the maximum datapoints per update
    const getLogCurveInfo = async () => {
      const logCurveInfos = await LogObjectService.getLogCurveInfo(targetLog.wellUid, targetLog.wellboreUid, targetLog.uid, controller.signal);
      setTargetLogCurveInfos(logCurveInfos);
      setIsLoading(false);
    };

    getLogCurveInfo().catch(truncateAbortHandler);

    return () => {
      controller.abort();
    };
  }, [targetLog]);

  useEffect(() => {
    if (uploadedFileHeader) {
      const unitRegex = /(?<=\[)(.*)(?=\]){1}/;
      const fileColumns = uploadedFileHeader.split(separator).map((col, index) => {
        const columnName = col.substring(0, col.indexOf("["));
        return {
          index: index,
          name: columnName ? columnName : col,
          unit: unitRegex.exec(col) ? unitRegex.exec(col)[0] : UNITLESS_UNIT
        };
      });
      if (fileColumns.map((col) => col.name).some((value) => value === "")) setError(IMPORT_FORMAT_INVALID);
      else setError("");
      setUploadedFileColumns(fileColumns);
    }
  }, [uploadedFileHeader]);

  useEffect(() => {
    setUploadedFileHeader(uploadedFileText.split("\n", 1)[0]);
    setUploadedFileData(uploadedFileText.split("\n").slice(1));
  }, [uploadedFileText]);

  useEffect(() => {
    if (uploadedFile) {
      (async () => {
        setUploadedFileText(await uploadedFile.text());
        setIsValidData(true);
      })();
    }
  }, [uploadedFile]);

  const onSubmit = async () => {
    setIsLoading(true);

    const logReference = {
      wellUid: targetLog.wellUid,
      wellboreUid: targetLog.wellboreUid,
      logUid: targetLog.uid
    };

    const job: ImportLogDataJob = {
      targetLog: logReference,
      mnemonics: uploadedFileColumns.map(col => col.name),
      units: uploadedFileColumns.map(col => col.unit),
      dataRows: uploadedFileData.map(line => line.split(separator))
    };

    await JobService.orderJob(JobType.ImportLogData, job);
    setIsLoading(false);
    dispatchOperation({ type: OperationType.HideModal });
  };

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    setUploadedFile(e.target.files.item(0));
  }, []);

  return (
    <>
      {
        <ModalDialog
          heading={`Import data into "${targetLog.name}"`}
          content={
            <Box>
              <Grid container spacing={1} direction={"row"} wrap="nowrap" alignItems={"center"}>
                <Grid item>
                  <Button variant="contained" color={"primary"} component="label" startIcon={<CloudUpload />}>
                    <Typography noWrap>Upload File</Typography>
                    <input type="file" accept=".csv,text/csv" hidden onChange={handleFileChange} />
                  </Button>
                </Grid>
                {uploadedFile && (
                  <Grid item style={{ overflow: "hidden" }}>
                    <Tooltip placement={"top"} title={uploadedFile.name}>
                      <Typography noWrap>{uploadedFile.name}</Typography>
                    </Tooltip>
                  </Grid>
                )}
              </Grid>
              {/* <Typography>Column mapping:</Typography>
              <List dense>
                {uploadedFileColumns.length > 0 &&
                  targetLogCurveInfos.map((curveInfo) => (
                    <ListItem key={curveInfo.uid}>
                      <Grid container justify={"flex-start"}>
                        <Grid item xs>
                          {curveInfo.mnemonic}:
                        </Grid>
                        <Grid item xs>
                          <ImportMapSelect variant={"outlined"} value={curveInfoToUploadedFileColumn.get(curveInfo)?.name ?? ""}>
                            {uploadedFileColumns.map((col) => (
                              <MenuItem key={col.index} value={col.name}>
                                {col.name}
                              </MenuItem>
                            ))}
                          </ImportMapSelect>
                        </Grid>
                        <Grid item xs>
                          <ImportAutocompleteUnitSelector
                            freeSolo
                            value={curveInfoToUploadedFileColumn.get(curveInfo)?.unit ?? ""}
                            defaultValue={UNITLESS_UNIT}
                            options={Array.from(availableUnits)}
                            renderInput={(params) => <TextField {...params} variant={"outlined"} margin="none" />}
                          />
                        </Grid>
                      </Grid>
                    </ListItem>
                  ))}
              </List> */}
            </Box>
          }
          confirmDisabled={!isValidData}
          confirmText={"Import"}
          onSubmit={() => onSubmit()}
          isLoading={isLoading}
          errorMessage={error}
        />
      }
    </>
  );
};

const ImportMapSelect = styled(Select)`
  min-width: 100px;
  width: 100%;
  margin-left:-5px;
`;
const ImportAutocompleteUnitSelector = styled(Autocomplete)`
  min-width: 100px;
`;

export default LogDataImportModal;
