import {
  Accordion,
  Autocomplete,
  TextField,
  Typography
} from "@equinor/eds-core-react";
import ModalDialog, {
  ModalContentLayout,
  ModalWidth
} from "components/Modals/ModalDialog";
import { Checkbox } from "components/StyledComponents/Checkbox";
import { StyledNativeSelect } from "components/Select";
import { useConnectedServer } from "contexts/connectedServerContext";
import OperationType from "contexts/operationType";
import { useGetServers } from "hooks/query/useGetServers";
import { useGetWells } from "hooks/query/useGetWells";
import { useOperationState } from "hooks/useOperationState";
import { DecimalPreference } from "contexts/operationStateReducer";
import { useServerFilter } from "hooks/useServerFilter";
import CompareWellJob from "models/jobs/compareWellJob";
import WellReference from "models/jobs/wellReference";
import {
  DecimalComparisonMode,
  TimezoneComparisonMode
} from "models/jobs/wellboreSubObjectsComparisonJob";
import MaxLength from "models/maxLength";
import { Server } from "models/server";
import Well from "models/well";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import JobService, { JobType } from "services/jobService";
import styled from "styled-components";
import { ReportModal } from "./ReportModal";
import StyledAccordion from "../StyledComponents/StyledAccordion";
import { StyledAccordionHeader } from "./LogComparisonModal";

export interface WellPickerProps {
  selectedWell: Well;
}

const WellPickerModal = ({
  selectedWell
}: WellPickerProps): React.ReactElement => {
  const { servers } = useGetServers();
  const filteredServers = useServerFilter(servers);
  const [targetServer, setTargetServer] = useState<Server>();
  const [wellUid, setWellUid] = useState<string>(selectedWell.uid);
  const [wellName, setWellName] = useState<string>(selectedWell.name);
  const [compareWellboreObjects, setCompareWellboreObjects] =
    useState<boolean>(false);
  const [matchByNameIfUidDiffers, setMatchByNameIfUidDiffers] =
    useState<boolean>(false);
  const [omitCustomData, setOmitCustomData] = useState<boolean>(true);
  const [omitTimestamps, setOmitTimestamps] = useState<boolean>(true);
  const [decimalMode, setDecimalMode] = useState<DecimalComparisonMode>(
    DecimalComparisonMode.ServerSettings
  );
  const [customDecimalPlaces, setCustomDecimalPlaces] = useState<number>(3);
  const [timezoneMode, setTimezoneMode] = useState<TimezoneComparisonMode>(
    TimezoneComparisonMode.Utc
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string>("");

  const {
    operationState: { colors, decimals, timeZone },
    dispatchOperation
  } = useOperationState();
  const { connectedServer } = useConnectedServer();

  const { wells: targetWells, isFetching: isFetchingWells } = useGetWells(
    targetServer,
    {
      placeholderData: []
    }
  );

  // Auto-select well on target server if matching UID or name exists
  useEffect(() => {
    if (targetWells && targetWells.length > 0) {
      const match =
        targetWells.find(
          (w) =>
            w.uid.toLowerCase() === selectedWell.uid.toLowerCase() ||
            w.name.toLowerCase() === selectedWell.name.toLowerCase()
        ) || targetWells[0];
      if (match) {
        setWellUid(match.uid);
        setWellName(match.name);
      }
    }
  }, [targetWells, selectedWell]);

  const targetWell = useMemo(() => {
    return targetWells?.find(
      (w) =>
        w.uid.toLowerCase() === wellUid.toLowerCase() ||
        w.name.toLowerCase() === wellName.toLowerCase()
    );
  }, [targetWells, wellUid, wellName]);

  const invalidUid = (value: string): boolean => {
    return !value || value.length === 0 || value.length > MaxLength.Uid;
  };

  const onSubmit = async () => {
    setIsLoading(true);
    setFetchError("");

    try {
      const sourceWellReference: WellReference = {
        wellUid: selectedWell.uid,
        wellName: selectedWell.name
      };

      const targetWellReference: WellReference = {
        wellUid: wellUid,
        wellName: targetWell?.name || wellName
      };

      dispatchOperation({ type: OperationType.HideModal });

      const job: CompareWellJob = {
        sourceWell: sourceWellReference,
        targetWell: targetWellReference,
        compareWellboreObjects,
        deepCompareObjects: true,
        matchByNameIfUidDiffers,
        omitCustomData,
        omitTimestamps,
        decimalMode:
          decimalMode === DecimalComparisonMode.AppSettings &&
          decimals === DecimalPreference.Raw
            ? DecimalComparisonMode.Raw
            : decimalMode,
        customDecimalPlaces:
          decimalMode === DecimalComparisonMode.Custom
            ? customDecimalPlaces
            : decimalMode === DecimalComparisonMode.AppSettings &&
              typeof decimals === "number"
            ? decimals
            : undefined,
        timezoneMode,
        timezone:
          timezoneMode === TimezoneComparisonMode.AppSettings &&
          timeZone !== "Raw"
            ? timeZone
            : undefined
      };

      const jobId = await JobService.orderJobAtServer(
        JobType.CompareWell,
        job,
        connectedServer,
        targetServer
      );

      if (jobId) {
        const reportModalProps = { jobId };
        dispatchOperation({
          type: OperationType.DisplayModal,
          payload: <ReportModal {...reportModalProps} />
        });
      }
    } catch (e) {
      console.error(e);
      setFetchError("Failed to initiate well comparison job.");
    } finally {
      setIsLoading(false);
    }
  };

  const validate = (): boolean => {
    if (!targetServer || invalidUid(wellUid)) {
      return true;
    }
    if (
      decimalMode === DecimalComparisonMode.Custom &&
      (customDecimalPlaces < 0 ||
        customDecimalPlaces > 10 ||
        isNaN(customDecimalPlaces))
    ) {
      return true;
    }
    return false;
  };

  return (
    <ModalDialog
      heading="Compare well with"
      onSubmit={onSubmit}
      confirmColor="primary"
      confirmDisabled={validate()}
      confirmText="Compare"
      showCancelButton={true}
      width={ModalWidth.LARGE}
      isLoading={isLoading || isFetchingWells}
      errorMessage={fetchError}
      content={
        <ModalContentLayout>
          <TargetInfoContainer colors={colors}>
            <Typography variant="body_short" bold>
              Source Well (Server: {connectedServer?.name}):
            </Typography>
            <Typography variant="caption">
              Name: {selectedWell.name} | UID: {selectedWell.uid}
              {selectedWell.field ? ` | Field: ${selectedWell.field}` : ""}
              {selectedWell.operator
                ? ` | Operator: ${selectedWell.operator}`
                : ""}
            </Typography>
          </TargetInfoContainer>

          <Autocomplete
            id="server"
            label="Target server to compare against"
            options={filteredServers}
            optionLabel={(server: Server) => server.name}
            onOptionsChange={({ selectedItems }) => {
              setTargetServer(selectedItems[0]);
            }}
            style={{
              paddingBottom: "16px"
            }}
          />

          <Autocomplete
            id="wellSelection"
            label="Target Well (search by name or UID)"
            options={targetWells || []}
            optionLabel={(w: Well) => `${w.name} (${w.uid})`}
            onOptionsChange={({ selectedItems }) => {
              if (selectedItems.length > 0) {
                setWellUid(selectedItems[0].uid);
                setWellName(selectedItems[0].name);
              }
            }}
            style={{
              paddingBottom: "16px"
            }}
          />

          <TextField
            id="welluid"
            label="Target Well UID"
            value={wellUid}
            variant={invalidUid(wellUid) ? "error" : undefined}
            helperText={
              invalidUid(wellUid)
                ? `Well UID must be 1-${MaxLength.Uid} characters`
                : ""
            }
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setWellUid(e.target.value)
            }
            style={{
              paddingBottom: invalidUid(wellUid) ? 0 : "16px"
            }}
          />

          {targetWell && (
            <TargetInfoContainer
              colors={colors}
              style={{ marginBottom: "16px" }}
            >
              <Typography variant="body_short" bold>
                Target Well Details:
              </Typography>
              <Typography variant="caption">
                Name: {targetWell.name} | UID: {targetWell.uid}
                {targetWell.field ? ` | Field: ${targetWell.field}` : ""}
                {targetWell.operator
                  ? ` | Operator: ${targetWell.operator}`
                  : ""}
              </Typography>
            </TargetInfoContainer>
          )}

          <StyledAccordion>
            <Accordion.Item>
              <StyledAccordionHeader colors={colors}>
                1. Comparison Scope
              </StyledAccordionHeader>
              <Accordion.Panel
                style={{ backgroundColor: colors.ui.backgroundLight }}
              >
                <Checkbox
                  id="compareWellOnly"
                  label="Deep compare Well object (all standard WITSML 1.4.1.1 elements: metadata, datums, locations, CRSs, elevations)"
                  checked={true}
                  disabled={true}
                  colors={colors}
                />
                <Checkbox
                  id="compareWellbores"
                  label="Also compare child wellbores (detects missing wellbores and compares wellbore objects)"
                  checked={compareWellboreObjects}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setCompareWellboreObjects(e.target.checked)
                  }
                  colors={colors}
                />
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item>
              <StyledAccordionHeader colors={colors}>
                2. Deep Comparison Rules & Normalization
              </StyledAccordionHeader>
              <Accordion.Panel
                style={{ backgroundColor: colors.ui.backgroundLight }}
              >
                <Checkbox
                  id="matchByNameIfUidDiffers"
                  label="Match child objects by name if UID differs"
                  checked={matchByNameIfUidDiffers}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setMatchByNameIfUidDiffers(e.target.checked)
                  }
                  colors={colors}
                />
                <Checkbox
                  id="omitTimestamps"
                  label="Omit timestamps (ignore creation and modification timestamps)"
                  checked={omitTimestamps}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setOmitTimestamps(e.target.checked)
                  }
                  colors={colors}
                />
                <Checkbox
                  id="omitCustomData"
                  label="Omit custom data (ignore customData element)"
                  checked={omitCustomData}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setOmitCustomData(e.target.checked)
                  }
                  colors={colors}
                />

                <div style={{ marginTop: "16px", marginBottom: "16px" }}>
                  <Typography variant="body_short" bold>
                    Decimal Comparison Mode
                  </Typography>
                  <StyledNativeSelect
                    value={decimalMode}
                    colors={colors}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                      setDecimalMode(e.target.value as DecimalComparisonMode)
                    }
                    style={{ width: "100%", marginTop: "8px" }}
                  >
                    <option value={DecimalComparisonMode.ServerSettings}>
                      Server Settings (Tolerance based on server capabilities)
                    </option>
                    <option value={DecimalComparisonMode.AppSettings}>
                      App Settings (Follows application decimal preference)
                    </option>
                    <option value={DecimalComparisonMode.Custom}>
                      Custom Decimal Places
                    </option>
                    <option value={DecimalComparisonMode.Raw}>
                      Raw (Compare using available decimal places without any
                      adjustment)
                    </option>
                  </StyledNativeSelect>
                </div>

                {decimalMode === DecimalComparisonMode.Custom && (
                  <TextField
                    id="customDecimalPlaces"
                    label="Decimal Places (0-10)"
                    type="number"
                    value={customDecimalPlaces}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setCustomDecimalPlaces(parseInt(e.target.value, 10))
                    }
                    style={{ marginBottom: "16px" }}
                  />
                )}

                <div style={{ marginBottom: "16px" }}>
                  <Typography variant="body_short" bold>
                    Timezone Comparison Mode
                  </Typography>
                  <StyledNativeSelect
                    value={timezoneMode}
                    colors={colors}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                      setTimezoneMode(e.target.value as TimezoneComparisonMode)
                    }
                    style={{ width: "100%", marginTop: "8px" }}
                  >
                    <option value={TimezoneComparisonMode.Utc}>
                      UTC (Convert all timestamps to UTC)
                    </option>
                    <option value={TimezoneComparisonMode.AppSettings}>
                      App Settings (Use application timezone)
                    </option>
                    <option value={TimezoneComparisonMode.Raw}>
                      Raw (Exact timezone representation)
                    </option>
                  </StyledNativeSelect>
                </div>
              </Accordion.Panel>
            </Accordion.Item>
          </StyledAccordion>
        </ModalContentLayout>
      }
    />
  );
};

const TargetInfoContainer = styled.div<{ colors: any }>`
  padding: 12px;
  background-color: ${(props) => props.colors.ui.backgroundLight};
  border-radius: 4px;
  border-left: 4px solid ${(props) => props.colors.interactive.primaryResting};
  margin-bottom: 16px;
`;

export default WellPickerModal;
