import { Typography } from "@equinor/eds-core-react";
import { Divider, MenuItem } from "@material-ui/core";
import React from "react";
import { UpdateWellboreTubularAction } from "../../contexts/navigationStateReducer";
import { DisplayModalAction, HideContextMenuAction, HideModalAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import { createTubularComponentReferences } from "../../models/jobs/copyTubularComponentJob";
import { DeleteTubularComponentsJob } from "../../models/jobs/deleteJobs";
import { Server } from "../../models/server";
import Tubular from "../../models/tubular";
import JobService, { JobType } from "../../services/jobService";
import { colors } from "../../styles/Colors";
import { TubularComponentRow } from "../ContentViews/TubularView";
import ConfirmModal from "../Modals/ConfirmModal";
import TubularComponentPropertiesModal from "../Modals/TubularComponentPropertiesModal";
import ContextMenu from "./ContextMenu";
import { StyledIcon } from "./ContextMenuUtils";
import { onClickPaste } from "./CopyUtils";
import NestedMenuItem from "./NestedMenuItem";
import { orderCopyTubularComponentsJob, useClipboardTubularComponentReferences } from "./TubularComponentContextMenuUtils";
import { onClickRefresh, onClickShowOnServer } from "./TubularContextMenuUtils";

export interface TubularComponentContextMenuProps {
  checkedTubularComponents: TubularComponentRow[];
  dispatchNavigation: (action: UpdateWellboreTubularAction) => void;
  dispatchOperation: (action: DisplayModalAction | HideContextMenuAction | HideModalAction) => void;
  tubular: Tubular;
  selectedServer: Server;
  servers: Server[];
}

const TubularComponentContextMenu = (props: TubularComponentContextMenuProps): React.ReactElement => {
  const { checkedTubularComponents, dispatchNavigation, dispatchOperation, tubular, selectedServer, servers } = props;
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
      toDelete: {
        tubularReference: {
          wellUid,
          wellboreUid,
          tubularUid: uid
        },
        tubularComponentUids: checkedTubularComponents.map((item) => item.uid)
      }
    };
    await JobService.orderJob(JobType.DeleteTubularComponents, job);
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  const onClickProperties = async () => {
    const tubularComponentPropertiesModalProps = { tubularComponent: checkedTubularComponents[0].tubularComponent, tubular, dispatchOperation };
    dispatchOperation({ type: OperationType.DisplayModal, payload: <TubularComponentPropertiesModal {...tubularComponentPropertiesModalProps} /> });
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  const serverUrl = tubularComponentReferences?.serverUrl;
  const orderCopy = () => orderCopyTubularComponentsJob(tubular, tubularComponentReferences, dispatchOperation);
  return (
    <ContextMenu
      menuItems={[
        <MenuItem key={"refresh"} onClick={() => onClickRefresh(tubular, dispatchOperation, dispatchNavigation)}>
          <StyledIcon name="refresh" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Refresh all tubular components</Typography>
        </MenuItem>,
        <MenuItem key={"copy"} onClick={onClickCopy} disabled={checkedTubularComponents.length === 0}>
          <StyledIcon name="copy" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Copy tubular component{checkedTubularComponents?.length > 1 && "s"}</Typography>
        </MenuItem>,
        <MenuItem key={"paste"} onClick={() => onClickPaste(servers, serverUrl, dispatchOperation, orderCopy)} disabled={tubularComponentReferences === null}>
          <StyledIcon name="paste" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Paste tubular component{tubularComponentReferences?.tubularComponentUids.length > 1 && "s"}</Typography>
        </MenuItem>,
        <MenuItem key={"delete"} onClick={onClickDelete} disabled={checkedTubularComponents.length === 0}>
          <StyledIcon name="deleteToTrash" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Delete</Typography>
        </MenuItem>,
        <NestedMenuItem key={"showOnServer"} label={"Show on server"}>
          {servers.map((server: Server) => (
            <MenuItem key={server.name} onClick={() => onClickShowOnServer(dispatchOperation, server, tubular.wellUid, tubular.wellboreUid, tubular.uid)}>
              <Typography color={"primary"}>{server.name}</Typography>
            </MenuItem>
          ))}
        </NestedMenuItem>,
        <Divider key={"divider"} />,
        <MenuItem key={"properties"} onClick={onClickProperties} disabled={checkedTubularComponents.length !== 1}>
          <StyledIcon name="settings" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Properties</Typography>
        </MenuItem>
      ]}
    />
  );
};

export default TubularComponentContextMenu;
