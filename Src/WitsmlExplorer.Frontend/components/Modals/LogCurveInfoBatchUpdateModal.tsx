import { Grid } from "@material-ui/core";
import React, { useContext, useState } from "react";
import styled from "styled-components";
import LogCurveInfo, { EmptyLogCurveInfo } from "../../models/logCurveInfo";
import LogObject from "../../models/logObject";
import { toObjectReference } from "../../models/objectOnWellbore";
import JobService, { JobType } from "../../services/jobService";
import ModalDialog from "./ModalDialog";
import { LogCurveInfoRow } from "../ContentViews/LogCurveInfoListView";
import { Autocomplete, TextField } from "@equinor/eds-core-react";
import { logTraceState } from "../../models/logTraceState";
import { unitType } from "../../models/unitType";
import { validText } from "./ModalParts";
import Measure from "../../models/measure";
import BatchModifyLogCurveInfoJob from "../../models/jobs/batchModifyLogCurveInfoJob";
import OperationType from "../../contexts/operationType";
import { ReportModal } from "./ReportModal";
import OperationContext from "../../contexts/operationContext";

export interface LogCurveInfoBatchUpdateModalProps {
  logCurveInfoRows: LogCurveInfoRow[];
  selectedLog: LogObject;
}

const LogCurveInfoBatchUpdateModal = (
  props: LogCurveInfoBatchUpdateModalProps
): React.ReactElement => {
  const { logCurveInfoRows, selectedLog } = props;
  const { dispatchOperation } = useContext(OperationContext);
  const [editableLogCurveInfo, setEditableLogCurveInfo] =
    useState<LogCurveInfo>(EmptyLogCurveInfo);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onSubmit = async () => {
    setIsLoading(true);
    const job: BatchModifyLogCurveInfoJob = {
      wellboreReference: toObjectReference(selectedLog),
      editedLogCurveInfo: editableLogCurveInfo,
      logCurveInfoBatchItems: logCurveInfoRows.map(
        (logCurveInfoRow: LogCurveInfoRow) => {
          return {
            logUid: logCurveInfoRow.logUid,
            logCurveInfoUid: logCurveInfoRow.logCurveInfo.uid
          };
        }
      )
    };
    const jobId = await JobService.orderJob(
      JobType.BatchModifyLogCurveInfo,
      job
    );
    setIsLoading(false);
    dispatchOperation({ type: OperationType.HideModal });
    if (jobId) {
      const reportModalProps = { jobId };
      dispatchOperation({
        type: OperationType.DisplayModal,
        payload: <ReportModal {...reportModalProps} />
      });
    }
  };

  const validateSensorOffset = (edited: Measure): boolean => {
    return (
      edited?.value !== undefined &&
      edited?.uom !== undefined &&
      !isNaN(edited?.value) &&
      validText(edited?.uom)
    );
  };

  const isSensorOffsetValid = validateSensorOffset(
    editableLogCurveInfo.sensorOffset
  );

  const validateSensorOffsetWithValueInvalid = (sensorOffset: Measure) =>
    (sensorOffset?.value !== undefined || sensorOffset?.uom !== undefined) &&
    !isSensorOffsetValid;

  const isSensorOffsetWithValueInvalid = validateSensorOffsetWithValueInvalid(
    editableLogCurveInfo.sensorOffset
  );

  return (
    <>
      {editableLogCurveInfo && (
        <ModalDialog
          heading={`Batch update ${logCurveInfoRows.length} LogCurveInfos`}
          content={
            <Layout>
              <Autocomplete
                id="logTraceState"
                label="Select a traceState"
                options={logTraceState}
                initialSelectedOptions={[editableLogCurveInfo.traceState]}
                onOptionsChange={({ selectedItems }) => {
                  setEditableLogCurveInfo({
                    ...editableLogCurveInfo,
                    traceState: selectedItems[0]
                  });
                }}
              />

              <Grid container>
                <Grid item xs={9}>
                  <TextField
                    id={"sensorOffsetValue"}
                    label={"SensorOffset value"}
                    type="number"
                    value={editableLogCurveInfo.sensorOffset?.value}
                    onChange={(e: any) =>
                      setEditableLogCurveInfo({
                        ...editableLogCurveInfo,
                        sensorOffset: {
                          value: isNaN(parseFloat(e.target.value))
                            ? undefined
                            : parseFloat(e.target.value),
                          uom: editableLogCurveInfo.sensorOffset?.uom
                        }
                      })
                    }
                  />
                </Grid>
                <Grid item xs={3}>
                  <Autocomplete
                    id="sensorOffsetUom"
                    label={"SensorOffset unit"}
                    options={unitType}
                    initialSelectedOptions={[
                      editableLogCurveInfo.sensorOffset?.uom
                    ]}
                    onOptionsChange={({ selectedItems }) => {
                      setEditableLogCurveInfo({
                        ...editableLogCurveInfo,
                        sensorOffset: {
                          value: editableLogCurveInfo.sensorOffset?.value,
                          uom: selectedItems[0]
                        }
                      });
                    }}
                  />
                </Grid>
              </Grid>

              <TextField
                id={"nullValue"}
                label={"NullValue"}
                type="number"
                value={editableLogCurveInfo.nullValue}
                onChange={(e: any) =>
                  setEditableLogCurveInfo({
                    ...editableLogCurveInfo,
                    nullValue: e.target.value
                  })
                }
              />
            </Layout>
          }
          confirmDisabled={
            (!validText(editableLogCurveInfo.traceState) &&
              !validText(editableLogCurveInfo.nullValue) &&
              !isSensorOffsetValid) ||
            isSensorOffsetWithValueInvalid
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

export default LogCurveInfoBatchUpdateModal;
