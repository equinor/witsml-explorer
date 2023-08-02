import { Button, Tooltip, Typography } from "@material-ui/core";
import { CloudUpload } from "@material-ui/icons";
import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
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
import Icon from "../../styles/Icons";
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
const MISSING_INDEX_CURVE = "The target index curve needs to be present in the csv";
const UNITLESS_UNIT = "unitless";

const LogDataImportModal = (props: LogDataImportModalProps): React.ReactElement => {
  const { targetLog, dispatchOperation } = props;
  const [uploadedFile, setUploadedFile] = useState<File>(null);
  const [uploadedFileData, setUploadedFileData] = useState<string[]>([]);
  const [uploadedFileColumns, setUploadedFileColumns] = useState<ImportColumn[]>([]);
  const [targetLogCurveInfos, setTargetLogCurveInfos] = useState<LogCurveInfo[]>([]);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const separator = ",";

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
    setError("");
    if (uploadedFileColumns.length) {
      if (uploadedFileColumns.map((col) => col.name).some((value) => value === "")) setError(IMPORT_FORMAT_INVALID);
      if (!uploadedFileColumns.map((col) => col.name).includes(targetLog.indexCurve)) setError(MISSING_INDEX_CURVE);
    }
  }, [uploadedFileColumns, targetLogCurveInfos]);

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

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files.item(0);
    if (!file) return;

    const text = await file.text();
    const header = text.split("\n", 1)[0];
    const data = text.split("\n").slice(1);

    setUploadedFile(file);
    updateUploadedFileColumns(header);
    setUploadedFileData(data);
  }, []);

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
  };

  return (
    <>
      {
        <ModalDialog
          heading={`Import data into "${targetLog.name}"`}
          content={
            <FileContainer>
              <Button
                variant="contained"
                color={"primary"}
                component="label"
                startIcon={<CloudUpload />}
                endIcon={
                  <Tooltip
                    placement="right"
                    title={
                      <div>
                        Currently, only double values are supported as TypeLogData.
                        <br />
                        The csv is expected to have this format:
                        <br />
                        IndexCurve[unit],Curve1[unit],Curve2[unit]
                        <br />
                        195.99,,2500
                        <br />
                        196.00,1,2501
                      </div>
                    }
                  >
                    <Icon name="infoCircle" size={18} />
                  </Tooltip>
                }
              >
                <Typography noWrap>Upload File</Typography>
                <input type="file" accept=".csv,text/csv" hidden onChange={handleFileChange} />
              </Button>
              <Tooltip placement={"top"} title={uploadedFile?.name ?? ""}>
                <Typography noWrap>{uploadedFile?.name ?? "No file chosen"}</Typography>
              </Tooltip>
            </FileContainer>
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

export default LogDataImportModal;
