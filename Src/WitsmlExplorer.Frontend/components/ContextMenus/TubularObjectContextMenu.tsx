import React from "react";
import ContextMenu from "./ContextMenu";
import { MenuItem } from "@material-ui/core";
import OperationType from "../../contexts/operationType";
import Tubular from "../../models/tubular";
import ConfirmModal from "../Modals/ConfirmModal";
import Icon from "../../styles/Icons";
import { colors } from "../../styles/Colors";
import { DisplayModalAction, HideContextMenuAction, HideModalAction } from "../../contexts/operationStateReducer";
import { Server } from "../../models/server";
import { Typography } from "@equinor/eds-core-react";
import TubularReference from "../../models/jobs/tubularReference";
import styled from "styled-components";
import JobService, { JobType } from "../../services/jobService";
import Wellbore from "../../models/wellbore";
import TubularService from "../../services/tubularService";
import { UpdateWellboreTubularAction } from "../../contexts/navigationStateReducer";
import ModificationType from "../../contexts/modificationType";
import { onClickPaste, useClipboardTubularReference } from "./TubularContextMenuUtils";

export interface TubularObjectContextMenuProps {
  dispatchNavigation: (action: UpdateWellboreTubularAction) => void;
  dispatchOperation: (action: HideModalAction | HideContextMenuAction | DisplayModalAction) => void;
  tubular: Tubular;
  selectedServer: Server;
  wellbore: Wellbore;
  servers?: Server[];
}

const TubularObjectContextMenu = (props: TubularObjectContextMenuProps): React.ReactElement => {
  const { dispatchNavigation, dispatchOperation, tubular, selectedServer, wellbore, servers } = props;
  const [tubularReference, setTubularReference] = useClipboardTubularReference();

  const deleteTubular = async () => {
    dispatchOperation({ type: OperationType.HideModal });
    const job = {
      tubularReference: {
        wellUid: tubular.wellUid,
        wellboreUid: tubular.wellboreUid,
        tubularUid: tubular.uid
      }
    };
    await JobService.orderJob(JobType.DeleteTubular, job);
    const freshTubulars = await TubularService.getTubulars(job.tubularReference.wellUid, job.tubularReference.wellboreUid);
    dispatchNavigation({
      type: ModificationType.UpdateTubularOnWellbore,
      payload: {
        wellUid: job.tubularReference.wellUid,
        wellboreUid: job.tubularReference.wellboreUid,
        tubulars: freshTubulars
      }
    });
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  const onClickCopy = async () => {
    const tubularReference: TubularReference = {
      serverUrl: selectedServer.url,
      tubularUid: tubular.uid,
      wellUid: tubular.wellUid,
      wellboreUid: tubular.wellboreUid
    };
    await navigator.clipboard.writeText(JSON.stringify(tubularReference));
    setTubularReference(tubularReference);
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  const onClickDelete = async () => {
    const confirmation = (
      <ConfirmModal
        heading={"Delete tubular?"}
        content={
          <span>
            This will permanently delete <strong>{tubular.name}</strong>
          </span>
        }
        onConfirm={deleteTubular}
        confirmColor={"secondary"}
        switchButtonPlaces={true}
      />
    );
    dispatchOperation({ type: OperationType.DisplayModal, payload: confirmation });
  };

  return (
    <ContextMenu
      menuItems={[
        <MenuItem key={"copy"} onClick={onClickCopy}>
          <StyledIcon name="copy" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Copy tubular</Typography>
        </MenuItem>,
        <MenuItem key={"paste"} onClick={() => onClickPaste(servers, dispatchOperation, wellbore, tubularReference)} disabled={tubularReference === null}>
          <StyledIcon name="paste" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Paste tubular</Typography>
        </MenuItem>,
        <MenuItem key={"delete"} onClick={onClickDelete}>
          <StyledIcon name="deleteToTrash" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Delete tubular</Typography>
        </MenuItem>
      ]}
    />
  );
};

const StyledIcon = styled(Icon)`
  && {
    margin-right: 5px;
  }
`;

export default TubularObjectContextMenu;
