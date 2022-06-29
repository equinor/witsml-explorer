import React from "react";
import ContextMenu from "./ContextMenu";
import { ListItemIcon, MenuItem } from "@material-ui/core";
import OperationType from "../../contexts/operationType";
import Icon from "../../styles/Icons";
import { colors } from "../../styles/Colors";
import ConfirmModal from "../Modals/ConfirmModal";
import JobService, { JobType } from "../../services/jobService";
import DeleteTubularComponentsJob from "../../models/jobs/deleteTubularComponentsJob";
import { DisplayModalAction, HideContextMenuAction, HideModalAction } from "../../contexts/operationStateReducer";
import { Server } from "../../models/server";
import { Typography } from "@equinor/eds-core-react";
import styled from "styled-components";
import { createTubularComponentReferences } from "../../models/jobs/copyTubularComponentJob";
import Tubular from "../../models/tubular";
import { onClickPaste, useClipboardTubularComponentReferences } from "./TubularComponentContextMenuUtils";
import TubularComponentPropertiesModal from "../Modals/TubularComponentPropertiesModal";
import { TubularComponentRow } from "../ContentViews/TubularView";

export interface TubularComponentContextMenuProps {
  checkedTubularComponents: TubularComponentRow[];
  dispatchOperation: (action: DisplayModalAction | HideContextMenuAction | HideModalAction) => void;
  tubular: Tubular;
  selectedServer: Server;
  servers: Server[];
}

const TubularComponentContextMenu = (props: TubularComponentContextMenuProps): React.ReactElement => {
  const { checkedTubularComponents, dispatchOperation, tubular, selectedServer, servers } = props;
  const [tubularComponentReferences] = useClipboardTubularComponentReferences();

  const onClickCopy = async () => {
    const tubularComponentReferences = createTubularComponentReferences(checkedTubularComponents, tubular, selectedServer.url);
    await navigator.clipboard.writeText(JSON.stringify(tubularComponentReferences));
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  const onClickDelete = async () => {
    const confirmation = (
      <ConfirmModal
        heading={"Delete selected tubular components?"}
        content={
          <span>
            This will permanently delete the selected tubular components: <strong>{checkedTubularComponents.map((item) => item.uid).join(", ")}</strong>
          </span>
        }
        onConfirm={onConfirmDelete}
        confirmColor={"secondary"}
        switchButtonPlaces={true}
      />
    );
    dispatchOperation({ type: OperationType.DisplayModal, payload: confirmation });
  };

  const onConfirmDelete = async () => {
    dispatchOperation({ type: OperationType.HideModal });
    const { wellUid, wellboreUid, uid } = tubular;
    const job: DeleteTubularComponentsJob = {
      tubular: {
        wellUid,
        wellboreUid,
        tubularUid: uid
      },
      uids: checkedTubularComponents.map((item) => item.uid)
    };
    await JobService.orderJob(JobType.DeleteTubularComponents, job);
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  const onClickProperties = async () => {
    const tubularComponentPropertiesModalProps = { tubularComponent: checkedTubularComponents[0].tubularComponent, tubular, dispatchOperation };
    dispatchOperation({ type: OperationType.DisplayModal, payload: <TubularComponentPropertiesModal {...tubularComponentPropertiesModalProps} /> });
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  return (
    <ContextMenu
      menuItems={[
        <MenuItem key={"copy"} onClick={onClickCopy} disabled={checkedTubularComponents.length === 0}>
          <StyledIcon name="copy" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Copy tubular component{checkedTubularComponents?.length > 1 && "s"}</Typography>
        </MenuItem>,
        <MenuItem key={"paste"} onClick={() => onClickPaste(servers, dispatchOperation, tubular, tubularComponentReferences)} disabled={tubularComponentReferences === null}>
          <StyledIcon name="paste" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Paste tubular component{tubularComponentReferences?.tubularComponentUids.length > 1 && "s"}</Typography>
        </MenuItem>,
        <MenuItem key={"delete"} onClick={onClickDelete} disabled={checkedTubularComponents.length === 0}>
          <ListItemIcon>
            <StyledIcon name="deleteToTrash" color={colors.interactive.primaryResting} />
          </ListItemIcon>
          <Typography color={"primary"}>Delete</Typography>
        </MenuItem>,
        <MenuItem key={"properties"} onClick={onClickProperties} disabled={checkedTubularComponents.length !== 1}>
          <StyledIcon name="settings" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Properties</Typography>
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

export default TubularComponentContextMenu;
