import {
  Autocomplete,
  Radio,
  TextField,
  Typography
} from "@equinor/eds-core-react";
import { useClipboardMixedObjectsReferences } from "components/ContextMenus/UseClipboardReferences";
import ModalDialog, {
  ModalContentLayout,
  ModalWidth
} from "components/Modals/ModalDialog";
import { Button } from "components/StyledComponents/Button";
import { Checkbox } from "components/StyledComponents/Checkbox";
import WarningBar from "components/WarningBar";
import { useConnectedServer } from "contexts/connectedServerContext";
import OperationType from "contexts/operationType";
import { useGetServers } from "hooks/query/useGetServers";
import { useOperationState } from "hooks/useOperationState";
import { useServerFilter } from "hooks/useServerFilter";
import WellboreReference from "models/jobs/wellboreReference";
import WellboreSubObjectsComparisonJob from "models/jobs/wellboreSubObjectsComparisonJob";
import MaxLength from "models/maxLength";
import { Server } from "models/server";
import Wellbore from "models/wellbore";
import { ChangeEvent, CSSProperties, useState } from "react";
import JobService, { JobType } from "services/jobService";
import WellboreService from "services/wellboreService";
import styled from "styled-components";
import { ReportModal } from "./ReportModal";

export interface WellborePickerProps {
  selectedWellbore: Wellbore;
}

enum CheckOptions {
  CompareNumberOfDataPointsPerMnemonic = "CompareNumberOfDataPointsPerMnemonic",
  CompareValuesOfDataPointsPerMnemonic = "CompareValuesOfDataPointsPerMnemonic",
  None = "None"
}

const WellborePickerModal = ({
  selectedWellbore
}: WellborePickerProps): React.ReactElement => {
  const { servers } = useGetServers();
  const filteredServers = useServerFilter(servers);
  const [targetServer, setTargetServer] = useState<Server>();
  const [wellUid, setWellUid] = useState<string>(selectedWellbore.wellUid);
  const [wellboreUid, setWellboreUid] = useState<string>(selectedWellbore.uid);
  const [selectedCheckOption, setSelectedCheckOption] = useState<CheckOptions>(
    CheckOptions.None
  );

  const wellboreWithMixedObjectsReference =
    useClipboardMixedObjectsReferences();

  const { connectedServer } = useConnectedServer();

  const {
    operationState: { colors },
    dispatchOperation
  } = useOperationState();

  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [performDeepLogComparison, setPerformDeepLogComparison] =
    useState(false);
  const [
    compareNumbersOfDataPointsForDepth,
    setCompareNumbersOfDataPointsForDepth
  ] = useState(false);
  const [
    compareNumbersOfDataPointsForTime,
    setCompareNumbersOfDataPointsForTime
  ] = useState(false);
  const [
    compareValuesOfDataPointsForDepth,
    setCompareValuesOfDataPointsForDepth
  ] = useState(false);
  const [
    compareValuesOfDataPointsForTime,
    setCompareValuesOfDataPointsForTime
  ] = useState(false);

  const onClear = () => {
    setWellUid("");
    setWellboreUid("");
  };

  const onReset = () => {
    setWellUid(selectedWellbore.wellUid);
    setWellboreUid(selectedWellbore.uid);
  };

  const onPaste = () => {
    setWellUid(wellboreWithMixedObjectsReference.wellboreReference.wellUid);
    setWellboreUid(
      wellboreWithMixedObjectsReference.wellboreReference.wellboreUid
    );
  };

  const onSubmit = async () => {
    setIsLoading(true);
    setFetchError("");
    const targetWellbore = await WellboreService.getWellbore(
      wellUid,
      wellboreUid,
      null,
      targetServer
    );

    try {
      const selectedWellboreReference: WellboreReference = {
        wellUid: selectedWellbore.wellUid,
        wellboreUid: selectedWellbore.uid,
        wellboreName: selectedWellbore.name,
        wellName: selectedWellbore.wellName
      };
      const sourceWellboreReference: WellboreReference = {
        wellUid: targetWellbore.wellUid,
        wellboreUid: targetWellbore.uid,
        wellboreName: targetWellbore.name,
        wellName: targetWellbore.wellName
      };
      dispatchOperation({ type: OperationType.HideModal });
      const job: WellboreSubObjectsComparisonJob = {
        sourceWellbore: sourceWellboreReference,
        targetWellbore: selectedWellboreReference,
        countLogsData:
          performDeepLogComparison &&
          selectedCheckOption ===
            CheckOptions.CompareNumberOfDataPointsPerMnemonic,
        checkLogsData:
          performDeepLogComparison &&
          selectedCheckOption ===
            CheckOptions.CompareValuesOfDataPointsPerMnemonic,
        checkTimeBasedLogsData:
          (selectedCheckOption ===
            CheckOptions.CompareNumberOfDataPointsPerMnemonic &&
            compareNumbersOfDataPointsForTime) ||
          (selectedCheckOption ===
            CheckOptions.CompareValuesOfDataPointsPerMnemonic &&
            compareValuesOfDataPointsForTime),
        checkDepthBasedLogsData:
          (selectedCheckOption ===
            CheckOptions.CompareNumberOfDataPointsPerMnemonic &&
            compareNumbersOfDataPointsForDepth) ||
          (selectedCheckOption ===
            CheckOptions.CompareValuesOfDataPointsPerMnemonic &&
            compareValuesOfDataPointsForDepth)
      };
      const jobId = await JobService.orderJobAtServer(
        JobType.WellboreSubObjectsComparison,
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
      const message = !targetWellbore
        ? "Target wellbore not found"
        : "Failed to fetch";
      setFetchError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const validate = (): boolean => {
    return (
      (performDeepLogComparison && selectedCheckOption === CheckOptions.None) ||
      (performDeepLogComparison &&
        selectedCheckOption ===
          CheckOptions.CompareNumberOfDataPointsPerMnemonic &&
        !compareNumbersOfDataPointsForDepth &&
        !compareNumbersOfDataPointsForTime) ||
      (performDeepLogComparison &&
        selectedCheckOption ===
          CheckOptions.CompareValuesOfDataPointsPerMnemonic &&
        !compareValuesOfDataPointsForDepth &&
        !compareValuesOfDataPointsForTime)
    );
  };

  return (
    <ModalDialog
      heading={`Compare wellbore with`}
      onSubmit={onSubmit}
      confirmColor={"primary"}
      confirmDisabled={
        validate() ||
        invalidUid(wellUid) ||
        invalidUid(wellboreUid) ||
        targetServer == null
      }
      confirmText={`OK`}
      showCancelButton={true}
      width={ModalWidth.MEDIUM}
      isLoading={isLoading}
      errorMessage={fetchError}
      content={
        <ModalContentLayout>
          <Autocomplete
            id="server"
            label={`Compare to server ${targetServer?.name ?? ""}`}
            options={filteredServers}
            optionLabel={(server: Server) => server.name}
            onOptionsChange={({ selectedItems }) => {
              setTargetServer(selectedItems[0]);
            }}
            style={{
              paddingBottom: "24px"
            }}
          />
          <TextField
            id="welluid"
            label="Well UID"
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
              paddingBottom: invalidUid(wellUid) ? 0 : "24px"
            }}
          />
          <TextField
            id="wellboreuid"
            label="Wellbore UID"
            value={wellboreUid}
            variant={invalidUid(wellboreUid) ? "error" : undefined}
            helperText={
              invalidUid(wellboreUid)
                ? `Wellbore UID must be 1-${MaxLength.Uid} characters`
                : ""
            }
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setWellboreUid(e.target.value)
            }
            style={{
              paddingBottom: invalidUid(wellboreUid) ? 0 : "24px"
            }}
          />
          <Checkbox
            label={`Perform deep log comparison`}
            checked={performDeepLogComparison}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setPerformDeepLogComparison(e.target.checked);
              if (!e.target.checked) {
                setCompareValuesOfDataPointsForDepth(false);
                setCompareValuesOfDataPointsForTime(false);
                setCompareNumbersOfDataPointsForDepth(false);
                setCompareNumbersOfDataPointsForTime(false);
              }
            }}
            colors={colors}
          />
          <label style={alignLayout}>
            <Radio
              name="group"
              disabled={!performDeepLogComparison}
              checked={
                selectedCheckOption ===
                CheckOptions.CompareNumberOfDataPointsPerMnemonic
              }
              onChange={() => {
                setSelectedCheckOption(
                  CheckOptions.CompareNumberOfDataPointsPerMnemonic
                );
                setCompareValuesOfDataPointsForDepth(false);
                setCompareValuesOfDataPointsForTime(false);
              }}
            />
            <Typography>Compare number of data points per mnemonic</Typography>
          </label>
          <Checkbox
            style={checkboxStyle}
            label={`Check depth domain`}
            checked={compareNumbersOfDataPointsForDepth}
            disabled={
              selectedCheckOption !==
              CheckOptions.CompareNumberOfDataPointsPerMnemonic
            }
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setCompareNumbersOfDataPointsForDepth(e.target.checked);
            }}
            colors={colors}
          />
          <Checkbox
            style={checkboxStyle}
            label={`Check time domain`}
            disabled={
              selectedCheckOption !==
              CheckOptions.CompareNumberOfDataPointsPerMnemonic
            }
            checked={compareNumbersOfDataPointsForTime}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setCompareNumbersOfDataPointsForTime(e.target.checked);
            }}
            colors={colors}
          />
          <label style={alignLayout}>
            <Radio
              name="group"
              disabled={!performDeepLogComparison}
              checked={
                selectedCheckOption ===
                CheckOptions.CompareValuesOfDataPointsPerMnemonic
              }
              onChange={() => {
                setSelectedCheckOption(
                  CheckOptions.CompareValuesOfDataPointsPerMnemonic
                );
                setCompareNumbersOfDataPointsForDepth(false);
                setCompareNumbersOfDataPointsForTime(false);
              }}
            />
            <Typography>Compare values of data points per mnemonic</Typography>
          </label>

          <Checkbox
            style={checkboxStyle}
            label={`Check depth domain`}
            disabled={
              selectedCheckOption !==
              CheckOptions.CompareValuesOfDataPointsPerMnemonic
            }
            checked={compareValuesOfDataPointsForDepth}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setCompareValuesOfDataPointsForDepth(e.target.checked);
            }}
            colors={colors}
          />
          <Checkbox
            style={checkboxStyle}
            label={`Check time domain`}
            disabled={
              selectedCheckOption !==
              CheckOptions.CompareValuesOfDataPointsPerMnemonic
            }
            checked={compareValuesOfDataPointsForTime}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setCompareValuesOfDataPointsForTime(e.target.checked);
            }}
            colors={colors}
          />
          {(compareNumbersOfDataPointsForTime ||
            compareValuesOfDataPointsForTime) &&
            performDeepLogComparison && (
              <WarningBar message="Deep comparison of time logs could be time consuming." />
            )}

          <ButtonsContainer>
            <Button onClick={onClear}>Clear</Button>
            <Button onClick={onReset}>Reset</Button>
            <Button
              onClick={onPaste}
              disabled={wellboreWithMixedObjectsReference == null}
            >
              Paste
            </Button>
            <></>
          </ButtonsContainer>
        </ModalContentLayout>
      }
    />
  );
};

const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
  padding-left: 0.5rem;
  padding-bottom: 1rem;
`;

const alignLayout: CSSProperties = {
  display: "flex",
  alignItems: "center",
  paddingLeft: "24px"
};

const checkboxStyle: CSSProperties = {
  paddingLeft: "48px"
};

const invalidUid = (uid: string) => {
  return uid == null || uid.length == 0 || uid.length > MaxLength.Uid;
};

export default WellborePickerModal;
