import { Typography } from "@equinor/eds-core-react";
import { Divider, MenuItem } from "@material-ui/core";
import { useQueryClient } from "@tanstack/react-query";
import React, { useContext } from "react";
import { useAuthorizationState } from "../../contexts/authorizationStateContext";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import { useGetServers } from "../../hooks/query/useGetServers";
import { ComponentType } from "../../models/componentType";
import { createComponentReferences } from "../../models/jobs/componentReferences";
import { ObjectType } from "../../models/objectType";
import { Server } from "../../models/server";
import Tubular from "../../models/tubular";
import { JobType } from "../../services/jobService";
import { colors } from "../../styles/Colors";
import { TubularComponentRow } from "../ContentViews/TubularView";
import TubularComponentPropertiesModal from "../Modals/TubularComponentPropertiesModal";
import ContextMenu from "./ContextMenu";
import {
  StyledIcon,
  menuItemText,
  onClickDeleteComponents,
  onClickRefreshObject,
  onClickShowObjectOnServer
} from "./ContextMenuUtils";
import { CopyComponentsToServerMenuItem } from "./CopyComponentsToServer";
import { copyComponents, pasteComponents } from "./CopyUtils";
import NestedMenuItem from "./NestedMenuItem";
import { useClipboardComponentReferencesOfType } from "./UseClipboardComponentReferences";

export interface TubularComponentContextMenuProps {
  checkedTubularComponents: TubularComponentRow[];
  tubular: Tubular;
}

const TubularComponentContextMenu = (
  props: TubularComponentContextMenuProps
): React.ReactElement => {
  const { checkedTubularComponents, tubular } = props;
  const { servers } = useGetServers();
  const { dispatchOperation } = useContext(OperationContext);
  const tubularComponentReferences = useClipboardComponentReferencesOfType(
    ComponentType.TubularComponent
  );
  const { authorizationState } = useAuthorizationState();
  const queryClient = useQueryClient();

  const onClickProperties = async () => {
    const tubularComponentPropertiesModalProps = {
      tubularComponent: checkedTubularComponents[0].tubularComponent,
      tubular,
      dispatchOperation
    };
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: (
        <TubularComponentPropertiesModal
          {...tubularComponentPropertiesModalProps}
        />
      )
    });
    dispatchOperation({ type: OperationType.HideContextMenu });
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
              authorizationState?.server?.url,
              tubular.wellUid,
              tubular.wellboreUid,
              ObjectType.Tubular,
              tubular.uid
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
              authorizationState?.server,
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
          {servers.map((server: Server) => (
            <MenuItem
              key={server.name}
              onClick={() =>
                onClickShowObjectOnServer(
                  dispatchOperation,
                  server,
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
