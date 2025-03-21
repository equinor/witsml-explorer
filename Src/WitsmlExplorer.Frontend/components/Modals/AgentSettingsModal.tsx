import React, { ChangeEvent, useState } from "react";
import { useOperationState } from "../../hooks/useOperationState.tsx";
import styled from "styled-components";
import OperationType from "../../contexts/operationType.ts";
import ModalDialog from "./ModalDialog.tsx";
import { Colors } from "../../styles/Colors.tsx";
import { Accordion, Label, TextField, Tooltip } from "@equinor/eds-core-react";
import { useQueryClient } from "@tanstack/react-query";
import { refreshAgentSettings } from "../../hooks/query/queryRefreshHelpers.tsx";
import { useGetAgentSettings } from "../../hooks/query/useGetAgentSettings.tsx";
import { AgentSettings } from "../../models/AgentSettings.tsx";
import AgentSettingsService from "../../services/agentSettingsService.tsx";
import {
  convertMillisecondsToTimeString,
  convertTimeStringToMilliseconds,
  timePattern
} from "components/TimeConversionUtils.tsx";

const AgentSettingsModal = (): React.ReactElement => {
  const queryClient = useQueryClient();
  const {
    dispatchOperation,
    operationState: { colors }
  } = useOperationState();

  const { agentSettings, isFetching } = useGetAgentSettings();

  const [minQcDataTtlValue, setMinQcDataTtlValue] = useState<number>(
    agentSettings?.minimumDataQcTimeoutDefault ?? 8
  );
  const [minQcDepthGapValue, setMinQcDepthGapValue] = useState<number>(
    agentSettings?.minimumDataQcDepthGapDefault ?? 0
  );
  const [minQcTimeGapValue, setMinQcTimeGapValue] = useState<string>(
    convertMillisecondsToTimeString(
      agentSettings?.minimumDataQcTimeGapDefault ?? 0
    )
  );
  const [minQcTimeDensityValue, setMinQcTimeDensityValue] = useState<number>(
    agentSettings?.minimumDataQcTimeDensityDefault ?? 0
  );
  const [minQcDepthDensityValue, setMinQcDepthDensityValue] = useState<number>(
    agentSettings?.minimumDataQcDepthDensityDefault ?? 0
  );
  const [minQcGapSizeIsValid, setMinQcGapSizeIsValid] =
    useState<boolean>(false);

  const handleTimeGapSizeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setMinQcGapSizeIsValid(new RegExp(timePattern).test(event.target.value));
    if (event.target.value) {
      setMinQcTimeGapValue(event.target.value);
      const millisecondsTime = convertTimeStringToMilliseconds(
        event.target.value
      );
      setMinQcGapSizeIsValid(millisecondsTime > 0);
    }
  };

  const onSubmit = async () => {
    dispatchOperation({ type: OperationType.HideModal });

    const newAgentSettings = {
      minimumDataQcTimeoutDefault: minQcDataTtlValue,
      minimumDataQcDepthDensityDefault: minQcDepthDensityValue,
      minimumDataQcDepthGapDefault: minQcDepthGapValue,
      minimumDataQcTimeDensityDefault: minQcTimeDensityValue,
      minimumDataQcTimeGapDefault:
        convertTimeStringToMilliseconds(minQcTimeGapValue)
    } as AgentSettings;

    if (agentSettings) {
      await AgentSettingsService.updateAgentSettings(newAgentSettings);
    } else {
      await AgentSettingsService.addAgentSettings(newAgentSettings);
    }

    refreshAgentSettings(queryClient);
  };

  return (
    <>
      <ModalDialog
        heading={`Agent Settings`}
        confirmText={`Submit`}
        content={
          <ContentLayout>
            <Accordion>
              <Accordion.Item isExpanded={true}>
                <Accordion.Header>Minimum Data QC</Accordion.Header>
                <Accordion.Panel>
                  <AccordionPanelContent>
                    <AccordionPanelItem>
                      <Tooltip title="Time before minumum data QC job will run again when swich is flipped on in log view.">
                        <Label label="QC Data TTL (hours)" />
                      </Tooltip>
                      <StyledTextField
                        id="dataTtl"
                        type="number"
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          setMinQcDataTtlValue(+e.target.value)
                        }
                        value={minQcDataTtlValue}
                        autoComplete={"off"}
                        colors={colors}
                      />
                    </AccordionPanelItem>
                    <AccordionPanelItem>
                      <Label label="Default Depth Gap (meters or feet)" />
                      <StyledTextField
                        id="depthGap"
                        type="number"
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          setMinQcDepthGapValue(+e.target.value)
                        }
                        value={minQcDepthGapValue}
                        autoComplete={"off"}
                        colors={colors}
                      />
                    </AccordionPanelItem>
                    <AccordionPanelItem>
                      <Label label="Default Time Gap" />
                      <TextField
                        id={"timeGap"}
                        value={minQcTimeGapValue}
                        onChange={handleTimeGapSizeChange}
                        placeholder="hh:mm:ss"
                        maxLength={8}
                        helperText={
                          !minQcGapSizeIsValid
                            ? "Gap size time must be in format hh:mm:ss, where hours: 00..23, minutes: 00..59, seconds: 00..59 and must be greater then 00:00:00"
                            : null
                        }
                      />
                    </AccordionPanelItem>
                    <AccordionPanelItem>
                      <Label label="Default Depth Density (occurences per meters or feet)" />
                      <StyledTextField
                        id="density"
                        type="number"
                        step={1}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          setMinQcDepthDensityValue(+e.target.value)
                        }
                        value={minQcDepthDensityValue}
                        autoComplete={"off"}
                        colors={colors}
                      />
                    </AccordionPanelItem>
                    <AccordionPanelItem>
                      <Label label="Default Time Density (occurences per hour)" />
                      <StyledTextField
                        id="density"
                        type="number"
                        step={1}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          setMinQcTimeDensityValue(+e.target.value)
                        }
                        value={minQcTimeDensityValue}
                        autoComplete={"off"}
                        colors={colors}
                      />
                    </AccordionPanelItem>
                  </AccordionPanelContent>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
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

const AccordionPanelContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: stretch;
`;

const AccordionPanelItem = styled.div`
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

export default AgentSettingsModal;
