import {
  Accordion,
  Icon,
  TextField,
  Tooltip,
  Typography
} from "@equinor/eds-core-react";
import {
  WITSML_INDEX_TYPE_MD,
  WITSML_LOG_ORDERTYPE_DECREASING
} from "components/Constants";
import { StyledAccordionHeader } from "components/Modals/LogComparisonModal";
import AdjustDateTimeIndexRange from "./TrimLogObject/AdjustDateTimeIndexRange.tsx";
import AdjustDepthIndexRange from "./TrimLogObject/AdjustDepthIndexRange.tsx";
import { Checkbox } from "components/StyledComponents/Checkbox";
import WarningBar from "components/WarningBar";
import { useConnectedServer } from "contexts/connectedServerContext";
import { useOperationState } from "hooks/useOperationState";
import { ComponentType } from "models/componentType";
import { createComponentReferences } from "models/jobs/componentReferences";
import { OffsetLogCurveJob } from "models/jobs/offsetLogCurveJob";
import LogObject from "models/logObject";
import React, { ChangeEvent, ReactElement, useState } from "react";
import JobService, { JobType } from "services/jobService";
import styled from "styled-components";
import { indexToNumber } from "tools/IndexHelpers";
import OperationType from "../../contexts/operationType";
import ModalDialog from "./ModalDialog";
import StyledAccordion from "../StyledComponents/StyledAccordion";

export interface OffsetLogCurveModalProps {
  selectedLog: LogObject;
  mnemonics: string[];
  startIndex: string;
  endIndex: string;
}

export const OffsetLogCurveModal = (
  props: OffsetLogCurveModalProps
): React.ReactElement => {
  const {
    selectedLog,
    mnemonics,
    startIndex: initialStartIndex,
    endIndex: initialEndIndex
  } = props;
  const { connectedServer } = useConnectedServer();
  const { operationState, dispatchOperation } = useOperationState();
  const { colors } = operationState;
  const isDepthLog = selectedLog.indexType === WITSML_INDEX_TYPE_MD;
  const [isValidInterval, setIsValidInterval] = useState<boolean>();
  const [startIndex, setStartIndex] = useState<string | number>(
    isDepthLog ? indexToNumber(initialStartIndex) : initialStartIndex
  );
  const [endIndex, setEndIndex] = useState<string | number>(
    isDepthLog ? indexToNumber(initialEndIndex) : initialEndIndex
  );
  const [offset, setOffset] = useState<string>(isDepthLog ? "0" : "00:00:00");
  const [useBackup, setUseBackup] = useState<boolean>(true);
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
        mnemonics,
        selectedLog,
        ComponentType.Mnemonic
      ),
      timeOffsetMilliseconds: timeOffsetMilliseconds,
      depthOffset: depthOffset,
      startIndex: startIndex.toString(),
      endIndex: endIndex.toString(),
      useBackup
    };
    await JobService.orderJobAtServer(
      JobType.OffsetLogCurves,
      offsetLogCurveJob,
      connectedServer,
      connectedServer // Set both source and target servers so the backup is created on the same server.
    );
  };

  const handleOffsetChange = (event: ChangeEvent<HTMLInputElement>) => {
    setOffset(event.target.value);
  };

  return (
    <ModalDialog
      heading={`Offset Log Curves`}
      content={
        <Layout>
          <StyledAccordion>
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
          </StyledAccordion>
          {isDepthLog ? (
            <>
              <AdjustDepthIndexRange
                minValue={indexToNumber(initialStartIndex)}
                maxValue={indexToNumber(initialEndIndex)}
                isDescending={
                  selectedLog.direction == WITSML_LOG_ORDERTYPE_DECREASING
                }
                onStartValueChanged={setStartIndex}
                onEndValueChanged={setEndIndex}
                onValidChange={(isValid: boolean) =>
                  setIsValidInterval(isValid)
                }
              />
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
            </>
          ) : (
            <>
              <AdjustDateTimeIndexRange
                minDate={initialStartIndex}
                maxDate={initialEndIndex}
                isDescending={
                  selectedLog.direction == WITSML_LOG_ORDERTYPE_DECREASING
                }
                onStartDateChanged={setStartIndex}
                onEndDateChanged={setEndIndex}
                onValidChange={(isValid: boolean) =>
                  setIsValidInterval(isValid)
                }
              />
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
            </>
          )}
          <div style={{ display: "flex", flexDirection: "row" }}>
            <Checkbox
              color={"primary"}
              checked={useBackup}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setUseBackup(event.target.checked)
              }
              label={"Use temporary backup"}
              colors={colors}
            />
            <Tooltip title="This will create a temporary log with the data you are offsetting. If the job succeeds, it will be deleted afterwards. If the job fails, you can use it to restore any deleted data.">
              <Icon
                style={{ alignSelf: "center", marginLeft: "8px" }}
                name="infoCircle"
                color={colors.interactive.primaryResting}
                size={18}
              />
            </Tooltip>
          </div>
          <WarningBar message="Data within the specified range will be deleted before attempting to write the new data with the offset. If writing the offset data fails, the original data will be lost! Make sure 'Use temporary backup' is enabled to create a backup if something goes wrong." />
        </Layout>
      }
      onSubmit={onSubmit}
      isLoading={false}
      confirmText={"Save"}
      confirmDisabled={!isValidOffset || !isValidInterval}
    />
  );
};

const ExampleDepthOffset = (): ReactElement => {
  return (
    <Typography
      style={{ whiteSpace: "pre-line", fontVariantNumeric: "tabular-nums" }}
    >
      The curves are offset by adding the offset value to the index of each data
      point for the curve. Data in the target range will be overwritten.
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
      point for the curve. Data in the target range will be overwritten.
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
