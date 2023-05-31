import { Box, Button, Grid, Tooltip, Typography } from "@material-ui/core";
import { CloudUpload } from "@material-ui/icons";
import React, { useCallback, useEffect, useState } from "react";
import { HideModalAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import { ComponentType } from "../../models/componentType";
import ImportLogDataJob from "../../models/jobs/importLogDataJob";
import ObjectReference from "../../models/jobs/objectReference";
import LogCurveInfo from "../../models/logCurveInfo";
import LogObject from "../../models/logObject";
import { toObjectReference } from "../../models/objectOnWellbore";
import { truncateAbortHandler } from "../../services/apiClient";
import ComponentService from "../../services/componentService";
import JobService, { JobType } from "../../services/jobService";
import ModalDialog from "./ModalDialog";

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
  const [uploadedFileText, setUploadedFileText] = useState<string>("");
  const [targetLogCurveInfos, setTargetLogCurveInfos] = useState<LogCurveInfo[]>([]);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const separator = ",";

  const columnsAreValid = useCallback((): boolean => {
    const curveInfos = new Set(targetLogCurveInfos.map((curve) => curve.mnemonic));
    return uploadedFileColumns.map((col) => col.name).every((value) => curveInfos.has(value));
  }, [uploadedFileHeader, uploadedFileColumns, targetLogCurveInfos]);

  useEffect(() => {
    setIsLoading(true);
    const controller = new AbortController();

    const getLogCurveInfo = async () => {
      const logCurveInfos = await ComponentService.getComponents(targetLog.wellUid, targetLog.wellboreUid, targetLog.uid, ComponentType.Mnemonic, undefined, controller.signal);
      setTargetLogCurveInfos(logCurveInfos);
      setIsLoading(false);
    };

    getLogCurveInfo().catch(truncateAbortHandler);

    return () => {
      controller.abort();
    };
  }, [targetLog]);

  useEffect(() => {
    if (error || !uploadedFile) setIsValidData(false);
    else setIsValidData(true);
  }, [error, uploadedFile]);

  useEffect(() => {
    setError("");
    if (uploadedFileColumns.length) {
      if (uploadedFileColumns.map((col) => col.name).some((value) => value === "")) setError(IMPORT_FORMAT_INVALID);
      if (!columnsAreValid()) setError("Uploaded file mnemonics are not matching.");
    }
  }, [uploadedFileColumns, targetLogCurveInfos]);

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
      })();
    }
  }, [uploadedFile]);

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

export default LogDataImportModal;
