import React, { ChangeEvent, useState } from "react";
import ModalDialog from "./ModalDialog.tsx";
import styled from "styled-components";
import { Label, TextField } from "@equinor/eds-core-react";
import JobService, { JobType } from "../../services/jobService.tsx";
import { MinimumDataQcJob } from "../../models/jobs/minimumDataQcJob.tsx";
import LogObject from "../../models/logObject.tsx";
import { useOperationState } from "../../hooks/useOperationState.tsx";
import { Colors } from "../../styles/Colors.tsx";
import {
  WITSML_INDEX_TYPE_MD,
  WITSML_LOG_ORDERTYPE_DECREASING
} from "../Constants.tsx";
import OperationType from "../../contexts/operationType.ts";
import { useGetAgentSettings } from "../../hooks/query/useGetAgentSettings.tsx";
import {
  convertMillisecondsToTimeString,
  convertTimeStringToMilliseconds,
  timePattern
} from "components/TimeConversionUtils.tsx";
import AdjustDateTimeIndexRange from "./TrimLogObject/AdjustDateTimeIndexRange.tsx";
import AdjustDepthIndexRange from "./TrimLogObject/AdjustDepthIndexRange.tsx";
import { indexToNumber } from "../../tools/IndexHelpers.tsx";

export interface MinimumDataQcModalProps {
  logObject: LogObject;
  mnemonics: string[];
}

const MinimumDataQcModal = (
  props: MinimumDataQcModalProps
): React.ReactElement => {
  const { logObject, mnemonics } = props;

  const {
    dispatchOperation,
    operationState: { colors }
  } = useOperationState();

  const { agentSettings, isFetching } = useGetAgentSettings();

  const isDepthLog = logObject.indexType === WITSML_INDEX_TYPE_MD;

  const [depthGapValue, setDepthGapValue] = useState<number>(
    agentSettings?.minimumDataQcDepthGapDefault ?? 0
  );
  const [densityValue, setDensityValue] = useState<number>(
    (isDepthLog
      ? agentSettings?.minimumDataQcDepthDensityDefault
      : agentSettings?.minimumDataQcTimeDensityDefault) ?? 0
  );
  const [isGapSizeValid, setIsGapSizeValid] = useState<boolean>(false);
  const [timeGapValue, setTimeGapValue] = useState<string>(
    convertMillisecondsToTimeString(
      agentSettings?.minimumDataQcTimeGapDefault ?? 0
    )
  );
  const [startIndex, setStartIndex] = useState<string | number>(
    isDepthLog ? indexToNumber(logObject.startIndex) : logObject.startIndex
  );
  const [endIndex, setEndIndex] = useState<string | number>(
    isDepthLog ? indexToNumber(logObject.endIndex) : logObject.endIndex
  );
  const [isIndexRangeValid, setIsIndexRangeValid] = useState<boolean>();

  const toggleIsIndexRangeValid = (isValid: boolean) => {
    setIsIndexRangeValid(!isValid);
  };

  const handleTimeGapSizeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setIsGapSizeValid(new RegExp(timePattern).test(event.target.value));
    if (event.target.value) {
      setTimeGapValue(event.target.value);
      const millisecondsTime = convertTimeStringToMilliseconds(
        event.target.value
      );
      setIsGapSizeValid(millisecondsTime > 0);
    }
  };

  const onSubmit = async () => {
    dispatchOperation({ type: OperationType.HideModal });
    const job = {
      logReference: logObject,
      startIndex: "" + startIndex,
      endIndex: "" + endIndex,
      mnemonics: mnemonics,
      density: densityValue,
      depthGap: depthGapValue,
      timeGap: convertTimeStringToMilliseconds(timeGapValue)
    } as MinimumDataQcJob;

    JobService.orderJob(JobType.MinimumDataQc, job);
  };

  return (
    <>
      <ModalDialog
        heading={`Minimum Data QC Params`}
        confirmText={`Submit`}
        content={
          <ContentLayout colors={colors}>
            {isDepthLog ? (
              <ContentItem>
                <Label label="Gap" />
                <StyledTextField
                  id="depthGap"
                  type="number"
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setDepthGapValue(+e.target.value)
                  }
                  value={depthGapValue}
                  autoComplete={"off"}
                  colors={colors}
                />
              </ContentItem>
            ) : (
              <ContentItem>
                <Label label="Gap" />
                <TextField
                  id={"timeGap"}
                  value={timeGapValue}
                  onChange={handleTimeGapSizeChange}
                  placeholder="hh:mm:ss"
                  maxLength={8}
                  helperText={
                    !isGapSizeValid
                      ? "Gap size time must be in format hh:mm:ss, where hours: 00..23, minutes: 00..59, seconds: 00..59 and must be greater then 00:00:00"
                      : null
                  }
                />
              </ContentItem>
            )}
            <ContentItem>
              {isDepthLog ? (
                <Label label="Density (occurences per unit)" />
              ) : (
                <Label label="Density (occurences per hour)" />
              )}
              <StyledTextField
                id="density"
                type="number"
                step={1}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setDensityValue(+e.target.value)
                }
                value={densityValue}
                autoComplete={"off"}
                colors={colors}
              />
            </ContentItem>
            {isDepthLog ? (
              <ContentItem>
                <AdjustDepthIndexRange
                  minValue={startIndex as number}
                  maxValue={endIndex as number}
                  isDescending={
                    logObject.direction == WITSML_LOG_ORDERTYPE_DECREASING
                  }
                  onStartValueChanged={setStartIndex}
                  onEndValueChanged={setEndIndex}
                  onValidChange={toggleIsIndexRangeValid}
                />
              </ContentItem>
            ) : (
              <ContentItem>
                <AdjustDateTimeIndexRange
                  minDate={startIndex as string}
                  maxDate={endIndex as string}
                  isDescending={
                    logObject.direction == WITSML_LOG_ORDERTYPE_DECREASING
                  }
                  onStartDateChanged={setStartIndex}
                  onEndDateChanged={setEndIndex}
                  onValidChange={toggleIsIndexRangeValid}
                />
              </ContentItem>
            )}
          </ContentLayout>
        }
        onSubmit={onSubmit}
        confirmColor={"primary"}
        confirmDisabled={isIndexRangeValid || (!isDepthLog && !isGapSizeValid)}
        isLoading={isFetching}
      />
    </>
  );
};

const ContentLayout = styled.div<{
  colors: Colors;
}>`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: 22vh;
  label {
    color: ${(props) => props.colors.text.staticTextLabel};
  }
`;

const ContentItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-items: center;
`;

const StyledTextField = styled(TextField)<{ colors: Colors }>`
  label {
    color: ${(props) => props.colors.text.staticTextLabel};
  }

  div {
    background: ${(props) => props.colors.text.staticTextFieldDefault};
  }
`;

export default MinimumDataQcModal;
