import { Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@material-ui/core";
import React, { useContext } from "react";
import { v4 as uuid } from "uuid";
import NavigationContext from "../../contexts/navigationContext";
import { DisplayModalAction, HideContextMenuAction, HideModalAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import LogObject from "../../models/logObject";
import { ObjectType } from "../../models/objectType";
import { Server } from "../../models/server";
import Wellbore from "../../models/wellbore";
import { colors } from "../../styles/Colors";
import LogPropertiesModal, { IndexCurve, LogPropertiesModalInterface } from "../Modals/LogPropertiesModal";
import { PropertiesModalMode } from "../Modals/ModalParts";
import ContextMenu from "./ContextMenu";
import { StyledIcon, menuItemText, onClickRefresh } from "./ContextMenuUtils";
import { pasteObjectOnWellbore } from "./CopyUtils";
import { useClipboardReferencesOfType } from "./UseClipboardReferences";

export interface LogsContextMenuProps {
  dispatchOperation: (action: DisplayModalAction | HideModalAction | HideContextMenuAction) => void;
  wellbore: Wellbore;
  servers: Server[];
  indexCurve: IndexCurve;
  setIsLoading?: (arg: boolean) => void;
}

const LogsContextMenu = (props: LogsContextMenuProps): React.ReactElement => {
  const { dispatchOperation, wellbore, servers, indexCurve, setIsLoading } = props;
  const { dispatchNavigation } = useContext(NavigationContext);
  const logReferences = useClipboardReferencesOfType(ObjectType.Log);

  const onClickNewLog = () => {
    const newLog: LogObject = {
      uid: uuid(),
      name: "",
      wellUid: wellbore.wellUid,
      wellName: wellbore.wellName,
      wellboreUid: wellbore.uid,
      wellboreName: wellbore.name,
      indexCurve: indexCurve === IndexCurve.Time ? IndexCurve.Time : IndexCurve.Depth
    };
    const logPropertiesModalProps: LogPropertiesModalInterface = { mode: PropertiesModalMode.New, logObject: newLog, dispatchOperation };
    const action: DisplayModalAction = { type: OperationType.DisplayModal, payload: <LogPropertiesModal {...logPropertiesModalProps} /> };
    dispatchOperation(action);
  };

  return (
    <ContextMenu
      menuItems={[
        setIsLoading ? (
          <MenuItem key={"refresh"} onClick={() => onClickRefresh(dispatchOperation, dispatchNavigation, wellbore.wellUid, wellbore.uid, ObjectType.Log, setIsLoading)}>
            <StyledIcon name="refresh" color={colors.interactive.primaryResting} />
            <Typography color={"primary"}>{`Refresh Logs`}</Typography>
          </MenuItem>
        ) : null,
        <MenuItem key={"newLog"} onClick={onClickNewLog}>
          <StyledIcon name="add" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>New log</Typography>
        </MenuItem>,
        <MenuItem key={"pasteLog"} onClick={() => pasteObjectOnWellbore(servers, logReferences, dispatchOperation, wellbore)} disabled={logReferences === null}>
          <StyledIcon name="paste" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>{menuItemText("paste", "log", logReferences?.objectUids)}</Typography>
        </MenuItem>
      ]}
    />
  );
};

export default LogsContextMenu;
