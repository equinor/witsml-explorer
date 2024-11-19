import { Typography } from "@equinor/eds-core-react";
import { Divider, MenuItem } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { TubularComponentRow } from "components/ContentViews/TubularView";
import ContextMenu from "components/ContextMenus/ContextMenu";
import {
  StyledIcon,
  menuItemText,
  onClickDeleteComponents,
  onClickRefreshObject,
  onClickShowObjectOnServer
} from "components/ContextMenus/ContextMenuUtils";
import { CopyComponentsToServerMenuItem } from "components/ContextMenus/CopyComponentsToServer";
import {
  copyComponents,
  pasteComponents
} from "components/ContextMenus/CopyUtils";
import NestedMenuItem from "components/ContextMenus/NestedMenuItem";
import { useClipboardComponentReferencesOfType } from "components/ContextMenus/UseClipboardComponentReferences";
import { PropertiesModalMode } from "components/Modals/ModalParts";
import { getTubularComponentProperties } from "components/Modals/PropertiesModal/Properties/TubularComponentProperties";
import { PropertiesModal } from "components/Modals/PropertiesModal/PropertiesModal";
import { useConnectedServer } from "contexts/connectedServerContext";
import OperationType from "contexts/operationType";
import { useGetServers } from "hooks/query/useGetServers";
import { useOperationState } from "hooks/useOperationState";
import { useServerFilter } from "hooks/useServerFilter";
import { ComponentType } from "models/componentType";
import { createComponentReferences } from "models/jobs/componentReferences";
import ObjectReference from "models/jobs/objectReference";
import { toObjectReference } from "models/objectOnWellbore";
import { ObjectType } from "models/objectType";
import { Server } from "models/server";
import Tubular from "models/tubular";
import TubularComponent from "models/tubularComponent";
import React from "react";
import JobService, { JobType } from "services/jobService";
import { colors } from "styles/Colors";

export interface TubularComponentContextMenuProps {
  checkedTubularComponents: TubularComponentRow[];
  tubular: Tubular;
}

const TubularComponentContextMenu = (
  props: TubularComponentContextMenuProps
): React.ReactElement => {
  const { checkedTubularComponents, tubular } = props;
  const { servers } = useGetServers();
  const filteredServers = useServerFilter(servers);
  const { dispatchOperation } = useOperationState();
  const tubularComponentReferences = useClipboardComponentReferencesOfType(
    ComponentType.TubularComponent
  );
  const { connectedServer } = useConnectedServer();
  const queryClient = useQueryClient();

  const onClickProperties = async () => {
    dispatchOperation({ type: OperationType.HideContextMenu });
    const tubularComponent = checkedTubularComponents[0].tubularComponent;
    const tubularComponentPropertiesModalProps = {
      title: `Edit properties for Sequence ${tubularComponent.sequence} - ${tubularComponent.typeTubularComponent} - ${tubularComponent.uid}`,
      properties: getTubularComponentProperties(PropertiesModalMode.Edit),
      object: tubularComponent,
      onSubmit: async (updates: Partial<TubularComponent>) => {
        dispatchOperation({ type: OperationType.HideModal });
        const tubularReference: ObjectReference = toObjectReference(tubular);
        const modifyTubularComponentJob = {
          tubularComponent: {
            ...tubularComponent,
            ...updates
          },
          tubularReference
        };
        await JobService.orderJob(
          JobType.ModifyTubularComponent,
          modifyTubularComponentJob
        );
      }
    };
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: <PropertiesModal {...tubularComponentPropertiesModalProps} />
    });
  };

  const toDelete = createComponentReferences(
    checkedTubularComponents.map((tc) => tc.uid),
    tubular,
    ComponentType.TubularComponent
  );
  return (
    <ContextMenu
      menuItems={[
        <MenuItem
          key={"refresh"}
          onClick={() =>
            onClickRefreshObject(
              dispatchOperation,
              queryClient,
              connectedServer?.url,
              tubular.wellUid,
              tubular.wellboreUid,
              ObjectType.Tubular
            )
          }
        >
          <StyledIcon
            name="refresh"
            color={colors.interactive.primaryResting}
          />
          <Typography color={"primary"}>
            Refresh all tubular components
          </Typography>
        </MenuItem>,
        <MenuItem
          key={"copy"}
          onClick={() =>
            copyComponents(
              connectedServer,
              checkedTubularComponents.map((ts) => ts.uid),
              tubular,
              dispatchOperation,
              ComponentType.TubularComponent
            )
          }
          disabled={checkedTubularComponents.length === 0}
        >
          <StyledIcon name="copy" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>
            {menuItemText(
              "copy",
              "tubular component",
              checkedTubularComponents
            )}
          </Typography>
        </MenuItem>,
        <CopyComponentsToServerMenuItem
          key={"copyComponentToServer"}
          componentType={ComponentType.TubularComponent}
          componentsToCopy={checkedTubularComponents}
          sourceParent={tubular}
        />,
        <MenuItem
          key={"paste"}
          onClick={() =>
            pasteComponents(
              servers,
              tubularComponentReferences,
              dispatchOperation,
              tubular
            )
          }
          disabled={tubularComponentReferences === null}
        >
          <StyledIcon name="paste" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>
            {menuItemText(
              "paste",
              "tubular component",
              tubularComponentReferences?.componentUids
            )}
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
          disabled={checkedTubularComponents.length === 0}
        >
          <StyledIcon
            name="deleteToTrash"
            color={colors.interactive.primaryResting}
          />
          <Typography color={"primary"}>
            {menuItemText(
              "delete",
              "tubular component",
              checkedTubularComponents
            )}
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
                    tubular,
                    ObjectType.Tubular
                  )
                }
              >
                <Typography color={"primary"}>{server.name}</Typography>
              </MenuItem>
            ))}
        </NestedMenuItem>,
        <Divider key={"divider"} />,
        <MenuItem
          key={"properties"}
          onClick={onClickProperties}
          disabled={checkedTubularComponents.length !== 1}
        >
          <StyledIcon
            name="settings"
            color={colors.interactive.primaryResting}
          />
          <Typography color={"primary"}>Properties</Typography>
        </MenuItem>
      ]}
    />
  );
};

export default TubularComponentContextMenu;
