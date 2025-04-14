import { TextField } from "@equinor/eds-core-react";
import OperationType from "contexts/operationType";
import { ModalContentLayout } from "../StyledComponents/ModalContentLayout";
import AuthorizationService from "services/authorizationService";
import { useOperationState } from "../../hooks/useOperationState";
import { validText } from "./ModalParts";
import JobService, { JobType } from "../../services/jobService";
import {
  createCopyWellboreWithObjectsJob,
  onClickPaste
} from "../ContextMenus/CopyUtils";
import { Server } from "../../models/server";
import WellboreReference from "models/jobs/wellboreReference";
import WellReference from "models/jobs/wellReference";
import ModalDialog from "./ModalDialog";
import { ChangeEvent, useState } from "react";

export interface ChangeWellboreUidModalProps {
  servers: Server[];
  sourceWellbore: WellboreReference;
  targetWell: WellReference;
}

const ChangeWellboreUidModal = (
  props: ChangeWellboreUidModalProps
): React.ReactElement => {
  const { dispatchOperation } = useOperationState();

  const [wellboreName, setWellboreName] = useState<string>(
    props.sourceWellbore.wellboreName
  );

  const [wellboreUid, setWellboreUid] = useState<string>(
    props.sourceWellbore.wellboreUid
  );

  const onConfirm = async () => {
    dispatchOperation({ type: OperationType.HideModal });

    const target: WellboreReference = {
      wellUid: props.targetWell.wellUid,
      wellName: props.targetWell.wellName,
      wellboreName: wellboreName,
      wellboreUid: wellboreUid
    };
    const orderCopyJob = () => {
      const copyJob = createCopyWellboreWithObjectsJob(
        props.sourceWellbore,
        target
      );
      JobService.orderJob(JobType.CopyWellboreWithObjects, copyJob);
    };
    onClickPaste(props.servers, props.sourceWellbore.serverUrl, orderCopyJob);
  };

  return (
    <ModalDialog
      heading={`Confirm Paste Details`}
      confirmText={`Paste`}
      cancelText={`Cancel`}
      confirmDisabled={
        !validText(wellboreName, 1, 64) || !validText(wellboreUid, 1, 64)
      }
      onSubmit={onConfirm}
      switchButtonPlaces={true}
      isLoading={false}
      content={
        <ModalContentLayout>
          <TextField
            readOnly
            id="server"
            label="Server"
            defaultValue={AuthorizationService.selectedServer?.name}
            tabIndex={-1}
          />

          <TextField
            id={"wellboreUid"}
            label={"Wellbore UID"}
            required
            value={wellboreUid}
            variant={validText(wellboreUid, 1, 64) ? undefined : "error"}
            helperText={
              !validText(wellboreUid, 1, 64)
                ? "The UID must be 1-64 characters"
                : ""
            }
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setWellboreUid(e.target.value)
            }
          />
          <TextField
            id={"wellboreName"}
            label={"Wellbore Name"}
            required
            value={wellboreName}
            variant={validText(wellboreName, 1, 64) ? undefined : "error"}
            helperText={
              !validText(wellboreName, 1, 64)
                ? "The name must be 1-64 characters"
                : ""
            }
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setWellboreName(e.target.value)
            }
          />
        </ModalContentLayout>
      }
    />
  );
};

export default ChangeWellboreUidModal;
