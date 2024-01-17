import { Accordion, TextField, Typography } from "@equinor/eds-core-react";
import { WITSML_INDEX_TYPE_MD } from "components/Constants";
import { StyledAccordionHeader } from "components/Modals/LogComparisonModal";
import { ComponentType } from "models/componentType";
import { createComponentReferences } from "models/jobs/componentReferences";
import { OffsetLogCurveJob } from "models/jobs/offsetLogCurveJob";
import LogCurveInfo from "models/logCurveInfo";
import LogObject from "models/logObject";
import React, { ChangeEvent, ReactElement, useContext, useState } from "react";
import JobService, { JobType } from "services/jobService";
import styled from "styled-components";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import ModalDialog from "./ModalDialog";

export interface OffsetLogCurveModalProps {
  selectedLog: LogObject;
  logCurveInfos: LogCurveInfo[];
}

export const OffsetLogCurveModal = (
  props: OffsetLogCurveModalProps
): React.ReactElement => {
  const { selectedLog, logCurveInfos } = props;
  const { operationState, dispatchOperation } = useContext(OperationContext);
  const { colors } = operationState;
  const isDepthLog = selectedLog.indexType === WITSML_INDEX_TYPE_MD;
  const [offset, setOffset] = useState<string>(isDepthLog ? "0" : "00:00:00");
  const isValidOffset = isDepthLog
    ? isValidDepthOffset(offset)
    : isValidTimeOffset(offset);

  const onSubmit = async () => {
    dispatchOperation({ type: OperationType.HideModal });
    const timeOffsetMilliseconds = isDepthLog
      ? null
      : offsetStringToMilliseconds(offset);
    const depthOffset = isDepthLog ? Number(offset) : null;
    const offsetLogCurveJob: OffsetLogCurveJob = {
      logCurveInfoReferences: createComponentReferences(
        logCurveInfos.map((lci) => lci.uid),
        selectedLog,
        ComponentType.Mnemonic
      ),
      timeOffsetMilliseconds: timeOffsetMilliseconds,
      depthOffset: depthOffset
    };
    await JobService.orderJob(JobType.OffsetLogCurves, offsetLogCurveJob);
  };

  const handleOffsetChange = (event: ChangeEvent<HTMLInputElement>) => {
    setOffset(event.target.value);
  };

  return (
    <ModalDialog
      heading={`Offset Log Curves`}
      content={
        <Layout>
          <Accordion>
            <Accordion.Item>
              <StyledAccordionHeader colors={colors}>
                How are the curves offset?
              </StyledAccordionHeader>
              <Accordion.Panel
                style={{ backgroundColor: colors.ui.backgroundLight }}
              >
                {isDepthLog ? <ExampleDepthOffset /> : <ExampleTimeOffset />}
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
          {isDepthLog ? (
            <TextField
              id={"depthOffset"}
              label="Offset"
              type="number"
              value={offset}
              onChange={handleOffsetChange}
              helperText={
                !isValidOffset
                  ? "The offset must be a number and must not be 0"
                  : null
              }
            />
          ) : (
            <TextField
              id={"timeOffset"}
              label="Offset"
              value={offset}
              onChange={handleOffsetChange}
              placeholder="hh:mm:ss"
              maxLength={9}
              helperText={
                !isValidOffset
                  ? "The offset must be in format +-hh:mm:ss, where hours: 00..23, minutes: 00..59, seconds: 00..59 and must not be 00:00:00"
                  : null
              }
            />
          )}
        </Layout>
      }
      onSubmit={onSubmit}
      isLoading={false}
      confirmText={"Save"}
      confirmDisabled={!isValidOffset}
    />
  );
};

const ExampleDepthOffset = (): ReactElement => {
  return (
    <Typography
      style={{ whiteSpace: "pre-line", fontVariantNumeric: "tabular-nums" }}
    >
      The curves are offset by adding the offset value to the index of each data
      point for the curve.
      <br />
      <br />
      Before: <br />
      Depth | Curve1 <br />
      10.5 | 3.14 <br />
      10.6 | 2.72 <br />
      <br />
      After adding an offset of -1.0: <br />
      Depth | Curve1 <br />
      9.5 | 3.14 <br />
      9.6 | 2.72 <br />
    </Typography>
  );
};

const ExampleTimeOffset = (): ReactElement => {
  return (
    <Typography
      style={{ whiteSpace: "pre-line", fontVariantNumeric: "tabular-nums" }}
    >
      The curves are offset by adding the offset value to the index of each data
      point for the curve.
      <br />
      <br />
      Before: <br />
      Time | Curve1 <br />
      2024-01-16T09:21:30.000Z | 3.14 <br />
      2024-01-16T09:21:45.000Z | 2.72 <br />
      <br />
      After adding an offset of 01:00:00 (1 hour): <br />
      Time | Curve1 <br />
      2024-01-16T10:21:30.000Z | 3.14 <br />
      2024-01-16T10:21:45.000Z | 2.72 <br />
    </Typography>
  );
};

const isValidTimeOffset = (offset: string): boolean => {
  const timePattern = /^[+-]?([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
  const emptyTimePattern = /^[+-]?00:00:00$/;

  return (
    new RegExp(timePattern).test(offset) &&
    !new RegExp(emptyTimePattern).test(offset)
  );
};

const isValidDepthOffset = (offset: string): boolean => {
  const depthPattern = /^[+-]?[0-9]+(\.[0-9]+)?$/;
  const emptyDepthPattern = /^[+-]?0$/;

  return (
    new RegExp(depthPattern).test(offset) &&
    !new RegExp(emptyDepthPattern).test(offset)
  );
};

const offsetStringToMilliseconds = (offset: string): number => {
  const sign = offset.startsWith("-") ? -1 : 1;
  offset = offset.replace(/[+-]/, "");
  const [hours, minutes, seconds] = offset.split(":").map(Number);
  return sign * (hours * 3600 + minutes * 60 + seconds) * 1000;
};

const Layout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;
