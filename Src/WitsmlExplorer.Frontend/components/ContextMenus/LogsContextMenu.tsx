import { Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import {
  WITSML_INDEX_TYPE,
  WITSML_INDEX_TYPE_DATE_TIME,
  WITSML_INDEX_TYPE_MD
} from "components/Constants";
import {
  StoreFunction,
  TemplateObjects
} from "components/ContentViews/QueryViewUtils";
import ContextMenu from "components/ContextMenus/ContextMenu";
import {
  StyledIcon,
  menuItemText,
  onClickRefresh,
  onClickShowGroupOnServer
} from "components/ContextMenus/ContextMenuUtils";
import { pasteObjectOnWellbore } from "components/ContextMenus/CopyUtils";
import NestedMenuItem from "components/ContextMenus/NestedMenuItem";
import { useClipboardReferencesOfType } from "components/ContextMenus/UseClipboardReferences";
import { PropertiesModalMode } from "components/Modals/ModalParts";
import { openObjectOnWellboreProperties } from "components/Modals/PropertiesModal/openPropertiesHelpers";
import { useConnectedServer } from "contexts/connectedServerContext";
import {
  DisplayModalAction,
  HideContextMenuAction,
  HideModalAction
} from "contexts/operationStateReducer";
import { useOpenInQueryView } from "hooks/useOpenInQueryView";
import { useServerFilter } from "hooks/useServerFilter";
import { IndexCurve } from "models/indexCurve";
import { toWellboreReference } from "models/jobs/wellboreReference";
import LogObject from "models/logObject";
import { ObjectType } from "models/objectType";
import { Server } from "models/server";
import Wellbore from "models/wellbore";
import React from "react";
import { colors } from "styles/Colors";
import { v4 as uuid } from "uuid";

export interface LogsContextMenuProps {
  dispatchOperation: (
    action: DisplayModalAction | HideModalAction | HideContextMenuAction
  ) => void;
  wellbore: Wellbore;
  servers: Server[];
  indexType?: WITSML_INDEX_TYPE;
}

const LogsContextMenu = (props: LogsContextMenuProps): React.ReactElement => {
  const { dispatchOperation, wellbore, servers, indexType } = props;
  const logReferences = useClipboardReferencesOfType(ObjectType.Log);
  const openInQueryView = useOpenInQueryView();
  const { connectedServer } = useConnectedServer();
  const queryClient = useQueryClient();
  const filteredServers = useServerFilter(servers);

  const onClickNewLog = () => {
    const newLog: LogObject = {
      uid: uuid(),
      name: "",
      wellUid: wellbore.wellUid,
      wellName: wellbore.wellName,
      wellboreUid: wellbore.uid,
      wellboreName: wellbore.name,
      indexType: indexType ?? WITSML_INDEX_TYPE_MD,
      indexCurve:
        indexType === WITSML_INDEX_TYPE_DATE_TIME
          ? IndexCurve.Time
          : IndexCurve.Depth
    };
    openObjectOnWellboreProperties(
      ObjectType.Log,
      newLog,
      dispatchOperation,
      PropertiesModalMode.New
    );
  };

  return (
    <ContextMenu
      menuItems={[
        <MenuItem
          key={"refresh"}
          onClick={() =>
            onClickRefresh(
              dispatchOperation,
              queryClient,
              connectedServer?.url,
              wellbore.wellUid,
              wellbore.uid,
              ObjectType.Log
            )
          }
        >
          <StyledIcon
            name="refresh"
            color={colors.interactive.primaryResting}
          />
          <Typography color={"primary"}>{`Refresh Logs`}</Typography>
        </MenuItem>,
        <MenuItem key={"newLog"} onClick={onClickNewLog}>
          <StyledIcon name="add" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>New log</Typography>
        </MenuItem>,
        <MenuItem
          key={"pasteLog"}
          onClick={() =>
            pasteObjectOnWellbore(
              servers,
              logReferences,
              dispatchOperation,
              toWellboreReference(wellbore),
              connectedServer
            )
          }
          disabled={logReferences === null}
        >
          <StyledIcon name="paste" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>
            {menuItemText("paste", "log", logReferences?.objectUids)}
          </Typography>
        </MenuItem>,
        <NestedMenuItem key={"showOnServer"} label={"Show on server"}>
          {filteredServers
            .filter((server: Server) => server.id != connectedServer.id)
            .map((server: Server) => (
              <MenuItem
                key={server.name}
                onClick={() =>
                  onClickShowGroupOnServer(
                    dispatchOperation,
                    server,
                    connectedServer,
                    wellbore,
                    ObjectType.Log,
                    indexType
                  )
                }
              >
                <Typography color={"primary"}>{server.name}</Typography>
              </MenuItem>
            ))}
        </NestedMenuItem>,
        <NestedMenuItem key={"queryItems"} label={"Query"} icon="textField">
          {[
            <MenuItem
              key={"newObject"}
              onClick={() =>
                openInQueryView({
                  templateObject: TemplateObjects.Log,
                  storeFunction: StoreFunction.AddToStore,
                  wellUid: wellbore.wellUid,
                  wellboreUid: wellbore.uid,
                  objectUid: uuid()
                })
              }
            >
              <StyledIcon
                name="add"
                color={colors.interactive.primaryResting}
              />
              <Typography color={"primary"}>New Log</Typography>
            </MenuItem>
          ]}
        </NestedMenuItem>
      ]}
    />
  );
};

export default LogsContextMenu;
