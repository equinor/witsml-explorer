import { Divider, Typography } from "@equinor/eds-core-react";
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
import { PropertiesModalMode } from "components/Modals/ModalParts";
import { getWbGeometrySectionProperties } from "components/Modals/PropertiesModal/Properties/WbGeometrySectionProperties";
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
import WbGeometry from "models/wbGeometry";
import WbGeometrySection from "models/wbGeometrySection";
import React from "react";
import JobService, { JobType } from "services/jobService";
import { colors } from "styles/Colors";

export interface WbGeometrySectionContextMenuProps {
  checkedWbGeometrySections: WbGeometrySection[];
  wbGeometry: WbGeometry;
}

const WbGeometrySectionContextMenu = (
  props: WbGeometrySectionContextMenuProps
): React.ReactElement => {
  const { checkedWbGeometrySections, wbGeometry } = props;
  const wbGeometrySectionReferences = useClipboardComponentReferencesOfType(
    ComponentType.WbGeometrySection
  );
  const { dispatchOperation } = useOperationState();
  const { servers } = useGetServers();
  const filteredServers = useServerFilter(servers);
  const { connectedServer } = useConnectedServer();

  const onClickProperties = async () => {
    dispatchOperation({ type: OperationType.HideContextMenu });
    const wbGeometrySectionPropertiesModalProps = {
      title: `Edit properties for ${checkedWbGeometrySections[0].uid}`,
      properties: getWbGeometrySectionProperties(PropertiesModalMode.Edit),
      object: checkedWbGeometrySections[0],
      onSubmit: async (updates: Partial<WbGeometrySection>) => {
        dispatchOperation({ type: OperationType.HideModal });
        const wbGeometryReference: ObjectReference =
          toObjectReference(wbGeometry);
        const modifyWbGeometrySectionJob = {
          wbGeometrySection: {
            ...checkedWbGeometrySections[0],
            ...updates
          },
          wbGeometryReference
        };
        await JobService.orderJob(
          JobType.ModifyWbGeometrySection,
          modifyWbGeometrySectionJob
        );
      }
    };
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: <PropertiesModal {...wbGeometrySectionPropertiesModalProps} />
    });
  };

  const toDelete = createComponentReferences(
    checkedWbGeometrySections.map((wbs) => wbs.uid),
    wbGeometry,
    ComponentType.WbGeometrySection
  );
  return (
    <ContextMenu
      menuItems={[
        <MenuItem
          key={"copy"}
          onClick={() =>
            copyComponents(
              connectedServer,
              checkedWbGeometrySections.map((wbs) => wbs.uid),
              wbGeometry,
              dispatchOperation,
              ComponentType.WbGeometrySection
            )
          }
          disabled={checkedWbGeometrySections.length === 0}
        >
          <StyledIcon name="copy" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>
            {menuItemText(
              "copy",
              "wbGeometry section",
              checkedWbGeometrySections
            )}
          </Typography>
        </MenuItem>,
        <CopyComponentsToServerMenuItem
          key={"copyComponentToServer"}
          componentType={ComponentType.WbGeometrySection}
          componentsToCopy={checkedWbGeometrySections}
          sourceParent={wbGeometry}
        />,
        <MenuItem
          key={"paste"}
          onClick={() =>
            pasteComponents(
              servers,
              wbGeometrySectionReferences,
              dispatchOperation,
              wbGeometry
            )
          }
          disabled={wbGeometrySectionReferences === null}
        >
          <StyledIcon name="paste" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>
            {menuItemText(
              "paste",
              "wbGeometry section",
              wbGeometrySectionReferences?.componentUids
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
          disabled={checkedWbGeometrySections.length === 0}
        >
          <StyledIcon
            name="deleteToTrash"
            color={colors.interactive.primaryResting}
          />
          <Typography color={"primary"}>
            {menuItemText(
              "delete",
              "wbGeometry section",
              checkedWbGeometrySections
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
                    wbGeometry,
                    ObjectType.WbGeometry
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
          disabled={checkedWbGeometrySections.length !== 1}
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

export default WbGeometrySectionContextMenu;
