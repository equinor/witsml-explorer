import { Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@mui/material";
import ContextMenu from "components/ContextMenus/ContextMenu";
import {
  StyledIcon,
  menuItemText,
  onClickDeleteComponents,
  onClickShowObjectOnServer
} from "components/ContextMenus/ContextMenuUtils";
import { CopyComponentsToServerMenuItem } from "components/ContextMenus/CopyComponentsToServer";
import {
  copyComponents,
  pasteComponents
} from "components/ContextMenus/CopyUtils";
import NestedMenuItem from "components/ContextMenus/NestedMenuItem";
import { useClipboardComponentReferencesOfType } from "components/ContextMenus/UseClipboardComponentReferences";
import { useConnectedServer } from "contexts/connectedServerContext";
import { useGetServers } from "hooks/query/useGetServers";
import { useOperationState } from "hooks/useOperationState";
import { useServerFilter } from "hooks/useServerFilter";
import { ComponentType } from "models/componentType";
import Fluid from "models/fluid";
import FluidsReport from "models/fluidsReport";
import { createComponentReferences } from "models/jobs/componentReferences";
import { ObjectType } from "models/objectType";
import { Server } from "models/server";
import React from "react";
import { JobType } from "services/jobService";
import { colors } from "styles/Colors";

export interface FluidContextMenuProps {
  checkedFluids: Fluid[];
  fluidsReport: FluidsReport;
}

const FluidContextMenu = (props: FluidContextMenuProps): React.ReactElement => {
  const { checkedFluids, fluidsReport } = props;
  const { dispatchOperation } = useOperationState();
  const fluidReferences = useClipboardComponentReferencesOfType(
    ComponentType.Fluid
  );
  const { connectedServer } = useConnectedServer();
  const { servers } = useGetServers();
  const filteredServers = useServerFilter(servers);

  const toDelete = createComponentReferences(
    checkedFluids.map((fluid) => fluid.uid),
    fluidsReport,
    ComponentType.Fluid
  );

  return (
    <ContextMenu
      menuItems={[
        <MenuItem
          key={"copy"}
          onClick={() =>
            copyComponents(
              connectedServer,
              checkedFluids.map((fluid) => fluid.uid),
              fluidsReport,
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
          sourceParent={fluidsReport}
        />,
        <MenuItem
          key={"paste"}
          onClick={() =>
            pasteComponents(
              servers,
              fluidReferences,
              dispatchOperation,
              fluidsReport
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
          {filteredServers
            .filter((server: Server) => server.id != connectedServer.id)
            .map((server: Server) => (
              <MenuItem
                key={server.name}
                onClick={() =>
                  onClickShowObjectOnServer(
                    dispatchOperation,
                    server,
                    connectedServer,
                    fluidsReport,
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
