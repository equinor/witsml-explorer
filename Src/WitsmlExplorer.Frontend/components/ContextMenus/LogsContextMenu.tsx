import { Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@material-ui/core";
import { useQueryClient } from "@tanstack/react-query";
import React from "react";
import { v4 as uuid } from "uuid";
import { useAuthorizationState } from "../../contexts/authorizationStateContext";
import {
  DisplayModalAction,
  HideContextMenuAction,
  HideModalAction
} from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import { useOpenInQueryView } from "../../hooks/useOpenInQueryView";
import LogObject from "../../models/logObject";
import { ObjectType } from "../../models/objectType";
import { Server } from "../../models/server";
import Wellbore from "../../models/wellbore";
import { colors } from "../../styles/Colors";
import { StoreFunction, TemplateObjects } from "../ContentViews/QueryViewUtils";
import LogPropertiesModal, {
  IndexCurve,
  LogPropertiesModalInterface
} from "../Modals/LogPropertiesModal";
import { PropertiesModalMode } from "../Modals/ModalParts";
import ContextMenu from "./ContextMenu";
import { StyledIcon, menuItemText, onClickRefresh } from "./ContextMenuUtils";
import { pasteObjectOnWellbore } from "./CopyUtils";
import NestedMenuItem from "./NestedMenuItem";
import { useClipboardReferencesOfType } from "./UseClipboardReferences";

export interface LogsContextMenuProps {
  dispatchOperation: (
    action: DisplayModalAction | HideModalAction | HideContextMenuAction
  ) => void;
  wellbore: Wellbore;
  servers: Server[];
  indexCurve: IndexCurve;
}

const LogsContextMenu = (props: LogsContextMenuProps): React.ReactElement => {
  const { dispatchOperation, wellbore, servers, indexCurve } = props;
  const logReferences = useClipboardReferencesOfType(ObjectType.Log);
  const openInQueryView = useOpenInQueryView();
  const { authorizationState } = useAuthorizationState();
  const queryClient = useQueryClient();

  const onClickNewLog = () => {
    const newLog: LogObject = {
      uid: uuid(),
      name: "",
      wellUid: wellbore.wellUid,
      wellName: wellbore.wellName,
      wellboreUid: wellbore.uid,
      wellboreName: wellbore.name,
      indexCurve:
        indexCurve === IndexCurve.Time ? IndexCurve.Time : IndexCurve.Depth
    };
    const logPropertiesModalProps: LogPropertiesModalInterface = {
      mode: PropertiesModalMode.New,
      logObject: newLog,
      dispatchOperation
    };
    const action: DisplayModalAction = {
      type: OperationType.DisplayModal,
      payload: <LogPropertiesModal {...logPropertiesModalProps} />
    };
    dispatchOperation(action);
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
              authorizationState?.server?.url,
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
              wellbore
            )
          }
          disabled={logReferences === null}
        >
          <StyledIcon name="paste" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>
            {menuItemText("paste", "log", logReferences?.objectUids)}
          </Typography>
        </MenuItem>,
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
