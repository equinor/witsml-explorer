import React from "react";
import ContextMenu from "./ContextMenu";
import { Divider, MenuItem } from "@material-ui/core";
import Tubular from "../../models/tubular";
import Icon from "../../styles/Icons";
import { colors } from "../../styles/Colors";
import { DisplayModalAction, HideContextMenuAction, HideModalAction } from "../../contexts/operationStateReducer";
import { Server } from "../../models/server";
import { Typography } from "@equinor/eds-core-react";
import styled from "styled-components";
import { UpdateWellboreTubularAction } from "../../contexts/navigationStateReducer";
import { onClickCopy, onClickDelete } from "./TubularContextMenuUtils";
import TubularPropertiesModal from "../Modals/TubularPropertiesModal";
import { PropertiesModalMode } from "../Modals/ModalParts";
import OperationType from "../../contexts/operationType";
import { onClickPaste, useClipboardTubularComponentReferences } from "./TubularComponentContextMenuUtils";

export interface TubularSidebarContextMenuProps {
  dispatchNavigation: (action: UpdateWellboreTubularAction) => void;
  dispatchOperation: (action: HideModalAction | HideContextMenuAction | DisplayModalAction) => void;
  tubular: Tubular;
  selectedServer: Server;
  servers: Server[];
}

const TubularSidebarContextMenu = (props: TubularSidebarContextMenuProps): React.ReactElement => {
  const { dispatchNavigation, dispatchOperation, tubular, selectedServer, servers } = props;
  const [tubularComponentReferences] = useClipboardTubularComponentReferences();

  const onClickProperties = async () => {
    const tubularPropertiesModalProps = { mode: PropertiesModalMode.Edit, tubular, dispatchOperation };
    dispatchOperation({ type: OperationType.DisplayModal, payload: <TubularPropertiesModal {...tubularPropertiesModalProps} /> });
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  return (
    <ContextMenu
      menuItems={[
        <MenuItem key={"copy"} onClick={() => onClickCopy(selectedServer, [tubular], dispatchOperation)}>
          <StyledIcon name="copy" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Copy tubular</Typography>
        </MenuItem>,
        <MenuItem key={"paste"} onClick={() => onClickPaste(servers, dispatchOperation, tubular, tubularComponentReferences)} disabled={tubularComponentReferences === null}>
          <StyledIcon name="paste" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Paste tubular component{tubularComponentReferences?.tubularComponentUids.length > 1 && "s"}</Typography>
        </MenuItem>,
        <MenuItem key={"delete"} onClick={() => onClickDelete([tubular], dispatchOperation, dispatchNavigation)}>
          <StyledIcon name="deleteToTrash" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Delete tubular</Typography>
        </MenuItem>,
        <Divider key={"divider"} />,
        <MenuItem key={"properties"} onClick={onClickProperties}>
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

export default TubularSidebarContextMenu;
