import { TextField, Typography } from "@material-ui/core";
import ModalDialog from "components/Modals/ModalDialog";
import { HideModalAction } from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import ModifyLogCurveInfoJob from "models/jobs/modifyLogCurveInfoJob";
import LogCurveInfo from "models/logCurveInfo";
import LogObject from "models/logObject";
import { toObjectReference } from "models/objectOnWellbore";
import React, { useEffect, useState } from "react";
import JobService, { JobType } from "services/jobService";
import { Layout } from "../StyledComponents/Layout";

export interface LogCurveInfoPropertiesModalProps {
  logCurveInfo: LogCurveInfo;
  dispatchOperation: (action: HideModalAction) => void;
  selectedLog: LogObject;
}

const LogCurveInfoPropertiesModal = (
  props: LogCurveInfoPropertiesModalProps
): React.ReactElement => {
  const { logCurveInfo, dispatchOperation, selectedLog } = props;
  const [editableLogCurveInfo, setEditableLogCurveInfo] =
    useState<LogCurveInfo>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const isIndexCurve = logCurveInfo?.mnemonic === selectedLog?.indexCurve;

  const onSubmit = async () => {
    setIsLoading(true);
    const job: ModifyLogCurveInfoJob = {
      logReference: toObjectReference(selectedLog),
      logCurveInfo: editableLogCurveInfo
    };
    await JobService.orderJob(JobType.ModifyLogCurveInfo, job);
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
          heading={`Edit properties for LogCurve: ${editableLogCurveInfo.mnemonic}`}
          content={
            <Layout>
              <TextField
                disabled
                id="uid"
                label="uid"
                defaultValue={editableLogCurveInfo.uid}
                fullWidth
              />
              <TextField
                id="mnemonic"
                label="mnemonic"
                defaultValue={editableLogCurveInfo.mnemonic}
                error={editableLogCurveInfo.mnemonic.length === 0}
                helperText={
                  editableLogCurveInfo.mnemonic.length === 0
                    ? "A logCurveInfo mnemonic cannot be empty. Size must be 1 to 64 characters."
                    : ""
                }
                fullWidth
                disabled={isIndexCurve}
                inputProps={{ minLength: 1, maxLength: 64 }}
                onChange={(e) =>
                  setEditableLogCurveInfo({
                    ...editableLogCurveInfo,
                    mnemonic: e.target.value
                  })
                }
              />
              <TextField
                id="unit"
                label="unit"
                defaultValue={editableLogCurveInfo.unit}
                error={
                  editableLogCurveInfo.unit == null ||
                  editableLogCurveInfo.unit.length === 0
                }
                helperText={
                  editableLogCurveInfo.unit == null ||
                  editableLogCurveInfo.unit.length === 0
                    ? "A unit cannot be empty. Size must be 1 to 64 characters."
                    : ""
                }
                inputProps={{ minLength: 1, maxLength: 64 }}
                onChange={(e) =>
                  setEditableLogCurveInfo({
                    ...editableLogCurveInfo,
                    unit: e.target.value
                  })
                }
              />
              <TextField
                id="curveDescription"
                label="curveDescription"
                defaultValue={editableLogCurveInfo.curveDescription}
                onChange={(e) =>
                  setEditableLogCurveInfo({
                    ...editableLogCurveInfo,
                    curveDescription: e.target.value
                  })
                }
              />
              <TextField
                disabled
                id="typeLogData"
                label="typeLogData"
                defaultValue={editableLogCurveInfo.typeLogData}
                fullWidth
              />
              <TextField
                disabled
                id="mnemAlias"
                label="mnemAlias"
                defaultValue={editableLogCurveInfo.mnemAlias}
                fullWidth
              />
              {logCurveInfo?.axisDefinitions?.map((axisDefinition) => {
                return (
                  <React.Fragment key={axisDefinition.uid}>
                    <Typography style={{ paddingTop: "0.5rem" }}>
                      AxisDefinition {axisDefinition.uid}
                    </Typography>
                    <TextField
                      disabled
                      fullWidth
                      id="order"
                      label="order"
                      defaultValue={axisDefinition.order ?? ""}
                    />
                    <TextField
                      disabled
                      fullWidth
                      id="count"
                      label="count"
                      defaultValue={axisDefinition.count ?? ""}
                    />
                    <TextField
                      disabled
                      fullWidth
                      id="doubleValues"
                      label="doubleValues"
                      defaultValue={axisDefinition.doubleValues ?? ""}
                    />
                  </React.Fragment>
                );
              })}
            </Layout>
          }
          confirmDisabled={
            logCurveInfo.mnemonic == editableLogCurveInfo.mnemonic &&
            logCurveInfo.unit == editableLogCurveInfo.unit &&
            logCurveInfo.curveDescription ==
              editableLogCurveInfo.curveDescription
          }
          onSubmit={() => onSubmit()}
          isLoading={isLoading}
        />
      )}
    </>
  );
};

export default LogCurveInfoPropertiesModal;
