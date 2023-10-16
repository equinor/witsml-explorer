import { TextField, Typography } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { HideModalAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import RenameMnemonicJob from "../../models/jobs/renameMnemonicJob";
import LogCurveInfo from "../../models/logCurveInfo";
import LogObject from "../../models/logObject";
import { toObjectReference } from "../../models/objectOnWellbore";
import JobService, { JobType } from "../../services/jobService";
import ModalDialog from "./ModalDialog";

export interface LogCurveInfoPropertiesModalProps {
  logCurveInfo: LogCurveInfo;
  dispatchOperation: (action: HideModalAction) => void;
  selectedLog: LogObject;
}

const LogCurveInfoPropertiesModal = (props: LogCurveInfoPropertiesModalProps): React.ReactElement => {
  const { logCurveInfo, dispatchOperation, selectedLog } = props;
  const [editableLogCurveInfo, setEditableLogCurveInfo] = useState<LogCurveInfo>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onSubmit = async () => {
    setIsLoading(true);
    const job: RenameMnemonicJob = {
      logReference: toObjectReference(selectedLog),
      mnemonic: logCurveInfo.mnemonic,
      newMnemonic: editableLogCurveInfo.mnemonic
    };
    await JobService.orderJob(JobType.RenameMnemonic, job);
    setIsLoading(false);
    dispatchOperation({ type: OperationType.HideModal });
  };

  useEffect(() => {
    setEditableLogCurveInfo(logCurveInfo);
  }, [logCurveInfo]);

  return (
    <>
      {editableLogCurveInfo && (
        <ModalDialog
          confirmDisabled={logCurveInfo.mnemonic == editableLogCurveInfo.mnemonic}
          heading={`Edit properties for LogCurve: ${editableLogCurveInfo.mnemonic}`}
          content={
            <Layout>
              <TextField disabled id="uid" label="uid" defaultValue={editableLogCurveInfo.uid} fullWidth />
              <TextField
                id="mnemonic"
                label="mnemonic"
                defaultValue={editableLogCurveInfo.mnemonic}
                error={editableLogCurveInfo.mnemonic.length === 0}
                helperText={editableLogCurveInfo.mnemonic.length === 0 ? "A logCurveInfo mnemonic must be 1-64 characters" : ""}
                fullWidth
                inputProps={{ minLength: 1, maxLength: 64 }}
                onChange={(e) => setEditableLogCurveInfo({ ...editableLogCurveInfo, mnemonic: e.target.value })}
              />
              {logCurveInfo?.axisDefinitions?.map((axisDefinition) => {
                return (
                  <React.Fragment key={axisDefinition.uid}>
                    <Typography style={{ paddingTop: "0.5rem" }}>AxisDefinition {axisDefinition.uid}</Typography>
                    <TextField disabled fullWidth id="order" label="order" defaultValue={axisDefinition.order ?? ""} />
                    <TextField disabled fullWidth id="count" label="count" defaultValue={axisDefinition.count ?? ""} />
                    <TextField disabled fullWidth id="doubleValues" label="doubleValues" defaultValue={axisDefinition.doubleValues ?? ""} />
                  </React.Fragment>
                );
              })}
            </Layout>
          }
          onSubmit={() => onSubmit()}
          isLoading={isLoading}
        />
      )}
    </>
  );
};

const Layout = styled.div`
  display: grid;
  grid-template-columns: repeat(1, auto);
  gap: 1rem;
`;

export default LogCurveInfoPropertiesModal;
