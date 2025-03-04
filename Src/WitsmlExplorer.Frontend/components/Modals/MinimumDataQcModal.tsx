import React, { ChangeEvent, useState } from "react";
import ModalDialog from "./ModalDialog.tsx";
import styled from "styled-components";
import { Label, TextField } from "@equinor/eds-core-react";
import JobService, { JobType } from "../../services/jobService.tsx";
import { MinimumDataQcJob } from "../../models/jobs/minimumDataQcJob.tsx";
import LogObject from "../../models/logObject.tsx";
import { useOperationState } from "../../hooks/useOperationState.tsx";
import { Colors } from "../../styles/Colors.tsx";
import { WITSML_INDEX_TYPE_MD } from "../Constants.tsx";
import OperationType from "../../contexts/operationType.ts";
import { useGetAgentSettings } from "../../hooks/query/useGetAgentSettings.tsx";

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
  const timePattern = /^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;

  const convertMillisecondsToTimeString = (ms: number): string => {
    const date = new Date(ms);
    return (
      ("" + date.getUTCHours()).padStart(2, "0") +
      ":" +
      ("" + date.getUTCMinutes()).padStart(2, "0") +
      ":" +
      ("" + date.getUTCSeconds()).padStart(2, "0")
    );
  };

  const convertToMilliseconds = (time: string): number => {
    const [hours, minutes, seconds] = time.split(":").map(Number);
    return (hours * 3600 + minutes * 60 + seconds) * 1000;
  };

  const [depthGapValue, setDepthGapValue] = useState<number>(
    agentSettings?.minimumDataQcDepthGapDefault ?? 0
  );
  const [densityValue, setDensityValue] = useState<number>(
    (isDepthLog
      ? agentSettings?.minimumDataQcDepthDensityDefault
      : agentSettings?.minimumDataQcTimeDensityDefault) ?? 0
  );
  const [gapSizeIsValid, setGapSizeIsValid] = useState<boolean>(false);
  const [timeGapValue, setTimeGapValue] = useState<string>(
    convertMillisecondsToTimeString(
      agentSettings?.minimumDataQcTimeGapDefault ?? 0
    )
  );

  const handleTimeGapSizeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setGapSizeIsValid(new RegExp(timePattern).test(event.target.value));
    if (event.target.value) {
      setTimeGapValue(event.target.value);
      const millisecondsTime = convertToMilliseconds(event.target.value);
      setGapSizeIsValid(millisecondsTime > 0);
    }
  };

  const onSubmit = async () => {
    dispatchOperation({ type: OperationType.HideModal });
    const job = {
      logReference: logObject,
      mnemonics: mnemonics,
      density: densityValue,
      depthGap: depthGapValue,
      timeGap: convertToMilliseconds(timeGapValue)
    } as MinimumDataQcJob;

    JobService.orderJob(JobType.MinimumDataQc, job);
  };

  return (
    <>
      <ModalDialog
        heading={`Minimum Data QC Params`}
        confirmText={`Submit`}
        content={
          <ContentLayout>
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
                    !gapSizeIsValid
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
          </ContentLayout>
        }
        onSubmit={onSubmit}
        isLoading={isFetching}
      />
    </>
  );
};

const ContentLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-height: 22vh;
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
