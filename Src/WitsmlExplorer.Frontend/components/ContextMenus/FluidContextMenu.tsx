import { Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@material-ui/core";
import React, { useContext } from "react";
import NavigationContext from "../../contexts/navigationContext";
import OperationContext from "../../contexts/operationContext";
import { ComponentType } from "../../models/componentType";
import Fluid from "../../models/fluid";
import FluidsReport from "../../models/fluidsReport";
import { createComponentReferences } from "../../models/jobs/componentReferences";
import { ObjectType } from "../../models/objectType";
import { Server } from "../../models/server";
import { JobType } from "../../services/jobService";
import { colors } from "../../styles/Colors";
import ContextMenu from "./ContextMenu";
import {
  StyledIcon,
  menuItemText,
  onClickDeleteComponents,
  onClickShowObjectOnServer
} from "./ContextMenuUtils";
import { CopyComponentsToServerMenuItem } from "./CopyComponentsToServer";
import { copyComponents, pasteComponents } from "./CopyUtils";
import NestedMenuItem from "./NestedMenuItem";
import { useClipboardComponentReferencesOfType } from "./UseClipboardComponentReferences";

export interface FluidContextMenuProps {
  checkedFluids: Fluid[];
}

const FluidContextMenu = (props: FluidContextMenuProps): React.ReactElement => {
  const { checkedFluids } = props;
  const { dispatchOperation } = useContext(OperationContext);
  const {
    navigationState: { selectedServer, selectedObject, servers }
  } = useContext(NavigationContext);
  const fluidReferences = useClipboardComponentReferencesOfType(
    ComponentType.Fluid
  );
  const selectedFluidsReport = selectedObject as FluidsReport;

  const toDelete = createComponentReferences(
    checkedFluids.map((fluid) => fluid.uid),
    selectedFluidsReport,
    ComponentType.Fluid
  );

  return (
    <ContextMenu
      menuItems={[
        <MenuItem
          key={"copy"}
          onClick={() =>
            copyComponents(
              selectedServer,
              checkedFluids.map((fluid) => fluid.uid),
              selectedFluidsReport,
              dispatchOperation,
              ComponentType.Fluid
            )
          }
          disabled={checkedFluids.length === 0}
        >
          <StyledIcon name="copy" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>
            {menuItemText("copy", "fluid", checkedFluids)}
          </Typography>
        </MenuItem>,
        <CopyComponentsToServerMenuItem
          key={"copyComponentToServer"}
          componentType={ComponentType.Fluid}
          componentsToCopy={checkedFluids}
          sourceParent={selectedFluidsReport}
        />,
        <MenuItem
          key={"paste"}
          onClick={() =>
            pasteComponents(
              servers,
              fluidReferences,
              dispatchOperation,
              selectedFluidsReport
            )
          }
          disabled={fluidReferences === null}
        >
          <StyledIcon name="paste" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>
            {menuItemText("paste", "fluid", fluidReferences?.componentUids)}
          </Typography>
        </MenuItem>,
        <MenuItem
          key={"delete"}
          onClick={() =>
            onClickDeleteComponents(
              dispatchOperation,
              toDelete,
              JobType.DeleteComponents
            )
          }
          disabled={checkedFluids.length === 0}
        >
          <StyledIcon
            name="deleteToTrash"
            color={colors.interactive.primaryResting}
          />
          <Typography color={"primary"}>
            {menuItemText("delete", "fluid", checkedFluids)}
          </Typography>
        </MenuItem>,
        <NestedMenuItem key={"showOnServer"} label={"Show on server"}>
          {servers.map((server: Server) => (
            <MenuItem
              key={server.name}
              onClick={() =>
                onClickShowObjectOnServer(
                  dispatchOperation,
                  server,
                  selectedFluidsReport,
                  ObjectType.FluidsReport
                )
              }
            >
              <Typography color={"primary"}>{server.name}</Typography>
            </MenuItem>
          ))}
        </NestedMenuItem>
      ]}
    />
  );
};

export default FluidContextMenu;
