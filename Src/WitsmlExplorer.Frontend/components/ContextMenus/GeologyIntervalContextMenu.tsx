import { Divider, Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@mui/material";
import ContextMenu from "components/ContextMenus/ContextMenu";
import {
  StyledIcon,
  menuItemText,
  onClickDeleteComponents
} from "components/ContextMenus/ContextMenuUtils";
import { CopyComponentsToServerMenuItem } from "components/ContextMenus/CopyComponentsToServer";
import {
  copyComponents,
  pasteComponents
} from "components/ContextMenus/CopyUtils";
import { useClipboardComponentReferencesOfType } from "components/ContextMenus/UseClipboardComponentReferences";
import { PropertiesModalMode } from "components/Modals/ModalParts";
import { getGeologyIntervalProperties } from "components/Modals/PropertiesModal/Properties/GeologyIntervalProperties";
import {
  PropertiesModal,
  PropertiesModalProps
} from "components/Modals/PropertiesModal/PropertiesModal";
import { useConnectedServer } from "contexts/connectedServerContext";
import OperationType from "contexts/operationType";
import { useGetServers } from "hooks/query/useGetServers";
import { useOperationState } from "hooks/useOperationState";
import { ComponentType } from "models/componentType";
import GeologyInterval from "models/geologyInterval";
import { createComponentReferences } from "models/jobs/componentReferences";
import ObjectReference from "models/jobs/objectReference";
import MudLog from "models/mudLog";
import { toObjectReference } from "models/objectOnWellbore";
import React from "react";
import JobService, { JobType } from "services/jobService";
import { colors } from "styles/Colors";

export interface GeologyIntervalContextMenuProps {
  checkedGeologyIntervals: GeologyInterval[];
  mudLog: MudLog;
}

const GeologyIntervalContextMenu = (
  props: GeologyIntervalContextMenuProps
): React.ReactElement => {
  const { checkedGeologyIntervals, mudLog } = props;
  const { dispatchOperation } = useOperationState();
  const { servers } = useGetServers();
  const { connectedServer } = useConnectedServer();
  const geologyIntervalReferences = useClipboardComponentReferencesOfType(
    ComponentType.GeologyInterval
  );

  const onClickProperties = async () => {
    dispatchOperation({ type: OperationType.HideContextMenu });
    const geologyIntervalPropertiesModalProps: PropertiesModalProps<GeologyInterval> =
      {
        title: `Edit properties for ${checkedGeologyIntervals[0].uid}`,
        object: checkedGeologyIntervals[0],
        properties: getGeologyIntervalProperties(PropertiesModalMode.Edit),
        onSubmit: async (updates: Partial<GeologyInterval>) => {
          dispatchOperation({ type: OperationType.HideModal });
          const mudLogReference: ObjectReference = toObjectReference(mudLog);
          const modifyGeologyIntervalJob = {
            geologyInterval: {
              uid: checkedGeologyIntervals[0].uid,
              ...updates
            },
            mudLogReference
          };
          await JobService.orderJob(
            JobType.ModifyGeologyInterval,
            modifyGeologyIntervalJob
          );
        }
      };
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: <PropertiesModal {...geologyIntervalPropertiesModalProps} />
    });
  };

  const toDelete = createComponentReferences(
    checkedGeologyIntervals.map((gi) => gi.uid),
    mudLog,
    ComponentType.GeologyInterval
  );
  return (
    <ContextMenu
      menuItems={[
        <MenuItem
          key={"copy"}
          onClick={() =>
            copyComponents(
              connectedServer,
              checkedGeologyIntervals.map((gi) => gi.uid),
              mudLog,
              dispatchOperation,
              ComponentType.GeologyInterval
            )
          }
          disabled={checkedGeologyIntervals.length === 0}
        >
          <StyledIcon name="copy" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>
            {menuItemText("copy", "geology interval", checkedGeologyIntervals)}
          </Typography>
        </MenuItem>,
        <CopyComponentsToServerMenuItem
          key={"copyComponentToServer"}
          componentType={ComponentType.GeologyInterval}
          componentsToCopy={checkedGeologyIntervals}
          sourceParent={mudLog}
        />,
        <MenuItem
          key={"paste"}
          onClick={() =>
            pasteComponents(
              servers,
              geologyIntervalReferences,
              dispatchOperation,
              mudLog
            )
          }
          disabled={geologyIntervalReferences === null}
        >
          <StyledIcon name="paste" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>
            {menuItemText(
              "paste",
              "geology interval",
              geologyIntervalReferences?.componentUids
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
          disabled={checkedGeologyIntervals.length === 0}
        >
          <StyledIcon
            name="deleteToTrash"
            color={colors.interactive.primaryResting}
          />
          <Typography color={"primary"}>
            {menuItemText(
              "delete",
              "geology interval",
              checkedGeologyIntervals
            )}
          </Typography>
        </MenuItem>,
        <Divider key={"divider"} />,
        <MenuItem
          key={"properties"}
          onClick={onClickProperties}
          disabled={checkedGeologyIntervals.length !== 1}
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

export default GeologyIntervalContextMenu;
