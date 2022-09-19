import { Typography } from "@equinor/eds-core-react";
import { Divider, MenuItem } from "@material-ui/core";
import React from "react";
import { UpdateWellboreTubularAction, UpdateWellboreTubularsAction } from "../../contexts/navigationStateReducer";
import { DisplayModalAction, HideContextMenuAction, HideModalAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import { ObjectType } from "../../models/objectType";
import { Server } from "../../models/server";
import Tubular from "../../models/tubular";
import Wellbore from "../../models/wellbore";
import { JobType } from "../../services/jobService";
import { colors } from "../../styles/Colors";
import { PropertiesModalMode } from "../Modals/ModalParts";
import TubularPropertiesModal from "../Modals/TubularPropertiesModal";
import ContextMenu from "./ContextMenu";
import { StyledIcon } from "./ContextMenuUtils";
import { onClickPaste, orderCopyJob } from "./CopyUtils";
import NestedMenuItem from "./NestedMenuItem";
import { onClickCopy, onClickDelete, onClickRefresh, onClickShowOnServer } from "./TubularContextMenuUtils";
import { useClipboardReferencesOfType } from "./UseClipboardReferences";

export interface TubularObjectContextMenuProps {
  dispatchNavigation: (action: UpdateWellboreTubularsAction | UpdateWellboreTubularAction) => void;
  dispatchOperation: (action: HideModalAction | HideContextMenuAction | DisplayModalAction) => void;
  tubulars: Tubular[];
  selectedServer: Server;
  wellbore: Wellbore;
  servers: Server[];
}

const TubularObjectContextMenu = (props: TubularObjectContextMenuProps): React.ReactElement => {
  const { dispatchNavigation, dispatchOperation, tubulars, selectedServer, wellbore, servers } = props;
  const tubularReferences = useClipboardReferencesOfType(ObjectType.Tubular);

  const onClickProperties = async () => {
    const tubularPropertiesModalProps = { mode: PropertiesModalMode.Edit, tubular: tubulars[0], dispatchOperation };
    dispatchOperation({ type: OperationType.DisplayModal, payload: <TubularPropertiesModal {...tubularPropertiesModalProps} /> });
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  return (
    <ContextMenu
      menuItems={[
        <MenuItem key={"refresh"} onClick={() => onClickRefresh(tubulars[0], dispatchOperation, dispatchNavigation)} disabled={tubulars.length !== 1}>
          <StyledIcon name="refresh" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Refresh tubular</Typography>
        </MenuItem>,
        <MenuItem key={"copy"} onClick={() => onClickCopy(selectedServer, tubulars, dispatchOperation)} disabled={tubulars.length === 0}>
          <StyledIcon name="copy" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Copy tubular{tubulars?.length > 1 && "s"}</Typography>
        </MenuItem>,
        <MenuItem
          key={"paste"}
          onClick={() =>
            onClickPaste(servers, tubularReferences?.serverUrl, dispatchOperation, () => orderCopyJob(wellbore, tubularReferences, dispatchOperation, JobType.CopyTubular))
          }
          disabled={tubularReferences === null}
        >
          <StyledIcon name="paste" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Paste tubular{tubularReferences?.objectUids.length > 1 && "s"}</Typography>
        </MenuItem>,
        <MenuItem key={"delete"} onClick={() => onClickDelete(tubulars, dispatchOperation)} disabled={tubulars.length === 0}>
          <StyledIcon name="deleteToTrash" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Delete tubular{tubulars?.length > 1 && "s"}</Typography>
        </MenuItem>,
        <NestedMenuItem key={"showOnServer"} label={"Show on server"} disabled={tubulars.length !== 1}>
          {servers.map((server: Server) => (
            <MenuItem
              key={server.name}
              onClick={() => onClickShowOnServer(dispatchOperation, server, tubulars[0].wellUid, tubulars[0].wellboreUid, tubulars[0].uid)}
              disabled={tubulars.length !== 1}
            >
              <Typography color={"primary"}>{server.name}</Typography>
            </MenuItem>
          ))}
        </NestedMenuItem>,
        <Divider key={"divider"} />,
        <MenuItem key={"properties"} onClick={onClickProperties} disabled={tubulars.length !== 1}>
          <StyledIcon name="settings" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Properties</Typography>
        </MenuItem>
      ]}
    />
  );
};

export default TubularObjectContextMenu;
