import { Divider, Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@material-ui/core";
import React from "react";
import { DisplayModalAction, HideContextMenuAction, HideModalAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import { ComponentType } from "../../models/componentType";
import { Server } from "../../models/server";
import WbGeometry from "../../models/wbGeometry";
import WbGeometrySection from "../../models/wbGeometrySection";
import { JobType } from "../../services/jobService";
import { colors } from "../../styles/Colors";
import WbGeometrySectionPropertiesModal from "../Modals/WbGeometrySectionPropertiesModal";
import ContextMenu from "./ContextMenu";
import { menuItemText, StyledIcon } from "./ContextMenuUtils";
import { copyComponents, pasteComponents } from "./CopyUtils";
import { useClipboardComponentReferencesOfType } from "./UseClipboardComponentReferences";

export interface WbGeometrySectionContextMenuProps {
  checkedWbGeometrySections: WbGeometrySection[];
  dispatchOperation: (action: DisplayModalAction | HideContextMenuAction | HideModalAction) => void;
  wbGeometry: WbGeometry;
  selectedServer: Server;
  servers: Server[];
}

const WbGeometrySectionContextMenu = (props: WbGeometrySectionContextMenuProps): React.ReactElement => {
  const { checkedWbGeometrySections, dispatchOperation, wbGeometry, selectedServer, servers } = props;
  const wbGeometrySectionReferences = useClipboardComponentReferencesOfType(ComponentType.WbGeometrySection);

  const onClickProperties = async () => {
    const wbGeometrySectionPropertiesModalProps = { wbGeometrySection: checkedWbGeometrySections[0], wbGeometry, dispatchOperation };
    dispatchOperation({ type: OperationType.DisplayModal, payload: <WbGeometrySectionPropertiesModal {...wbGeometrySectionPropertiesModalProps} /> });
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  return (
    <ContextMenu
      menuItems={[
        <MenuItem
          key={"copy"}
          onClick={() =>
            copyComponents(
              selectedServer,
              checkedWbGeometrySections.map((wbs) => wbs.uid),
              wbGeometry,
              dispatchOperation,
              ComponentType.WbGeometrySection
            )
          }
          disabled={checkedWbGeometrySections.length === 0}
        >
          <StyledIcon name="copy" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>{menuItemText("copy", "wbGeometry Section", checkedWbGeometrySections)}</Typography>
        </MenuItem>,
        <MenuItem
          key={"paste"}
          onClick={() => pasteComponents(servers, wbGeometrySectionReferences, dispatchOperation, wbGeometry, JobType.CopyWbGeometrySections)}
          disabled={wbGeometrySectionReferences === null}
        >
          <StyledIcon name="paste" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>{menuItemText("paste", "wbGeometry Section", wbGeometrySectionReferences?.componentUids)}</Typography>
        </MenuItem>,
        <Divider key={"divider"} />,
        <MenuItem key={"properties"} onClick={onClickProperties} disabled={checkedWbGeometrySections.length !== 1}>
          <StyledIcon name="settings" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Properties</Typography>
        </MenuItem>
      ]}
    />
  );
};

export default WbGeometrySectionContextMenu;
