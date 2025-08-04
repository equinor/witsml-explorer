import { Autocomplete, TextField } from "@equinor/eds-core-react";
import ModalDialog, {
  ModalContentLayout,
  ModalWidth
} from "components/Modals/ModalDialog";
import { Button } from "components/StyledComponents/Button";
import OperationType from "contexts/operationType";
import { useGetServers } from "hooks/query/useGetServers";
import { useOperationState } from "hooks/useOperationState";
import { useServerFilter } from "hooks/useServerFilter";
import WellboreReference from "models/jobs/wellboreReference";
import WellboreSubObjectsComparisonJob from "models/jobs/wellboreSubObjectsComparisonJob";
import MaxLength from "models/maxLength";
import { Server } from "models/server";
import { ChangeEvent, useState } from "react";
import JobService, { JobType } from "services/jobService";
import WellboreService from "services/wellboreService";
import styled from "styled-components";
import { useConnectedServer } from "contexts/connectedServerContext";
import { ReportModal } from "./ReportModal";
import Wellbore from "models/wellbore";
import { useClipboardMixedObjectsReferences } from "components/ContextMenus/UseClipboardReferences";

export interface WellborePickerProps {
  selectedWellbore: Wellbore;
}

const WellborePickerModal = ({
  selectedWellbore
}: WellborePickerProps): React.ReactElement => {
  const { servers } = useGetServers();
  const filteredServers = useServerFilter(servers);
  const [targetServer, setTargetServer] = useState<Server>();
  const [wellUid, setWellUid] = useState<string>(selectedWellbore.wellUid);
  const [wellboreUid, setWellboreUid] = useState<string>(selectedWellbore.uid);

  const wellboreWithMixedObjectsReference =
    useClipboardMixedObjectsReferences();

  const { connectedServer } = useConnectedServer();

  const { dispatchOperation } = useOperationState();

  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");

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
      const sourceWellboreReference: WellboreReference = {
        wellUid: selectedWellbore.wellUid,
        wellboreUid: selectedWellbore.uid,
        wellboreName: selectedWellbore.name,
        wellName: selectedWellbore.wellName
      };
      const targetWellboreReference: WellboreReference = {
        wellUid: targetWellbore.wellUid,
        wellboreUid: targetWellbore.uid,
        wellboreName: targetWellbore.name,
        wellName: targetWellbore.wellName
      };
      dispatchOperation({ type: OperationType.HideModal });
      const job: WellboreSubObjectsComparisonJob = {
        sourceWellbore: sourceWellboreReference,
        targetWellbore: targetWellboreReference
      };
      const jobId = await JobService.orderJobAtServer(
        JobType.WellboreSubObjectsComparison,
        job,
        targetServer,
        connectedServer
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
      setFetchError("Failed to fetch");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ModalDialog
      heading={`Compare wellbore with`}
      onSubmit={onSubmit}
      confirmColor={"primary"}
      confirmDisabled={
        invalidUid(wellUid) || invalidUid(wellboreUid) || targetServer == null
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

const invalidUid = (uid: string) => {
  return uid == null || uid.length == 0 || uid.length > MaxLength.Uid;
};

export default WellborePickerModal;
