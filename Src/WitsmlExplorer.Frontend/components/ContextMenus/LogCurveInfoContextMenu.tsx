import { Divider, Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@material-ui/core";
import React from "react";
import { SelectLogCurveInfoAction } from "../../contexts/navigationActions";
import { DisplayModalAction, HideContextMenuAction, HideModalAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import { ComponentType } from "../../models/componentType";
import { createComponentReferences } from "../../models/jobs/componentReferences";
import LogObject from "../../models/logObject";
import { ObjectType } from "../../models/objectType";
import { Server } from "../../models/server";
import { JobType } from "../../services/jobService";
import { colors } from "../../styles/Colors";
import { LogCurveInfoRow } from "../ContentViews/LogCurveInfoListView";
import CopyRangeModal, { CopyRangeModalProps } from "../Modals/CopyRangeModal";
import LogCurveInfoPropertiesModal from "../Modals/LogCurveInfoPropertiesModal";
import SelectIndexToDisplayModal from "../Modals/SelectIndexToDisplayModal";
import ContextMenu from "./ContextMenu";
import { StyledIcon, menuItemText, onClickDeleteComponents, onClickShowObjectOnServer } from "./ContextMenuUtils";
import { onClickCopyCurveToServer } from "./CopyCurveToServer";
import { copyComponents } from "./CopyUtils";
import NestedMenuItem from "./NestedMenuItem";

export interface LogCurveInfoContextMenuProps {
  checkedLogCurveInfoRows: LogCurveInfoRow[];
  dispatchOperation: (action: DisplayModalAction | HideContextMenuAction | HideModalAction) => void;
  dispatchNavigation: (action: SelectLogCurveInfoAction) => void;
  selectedLog: LogObject;
  selectedServer: Server;
  servers: Server[];
}

const LogCurveInfoContextMenu = (props: LogCurveInfoContextMenuProps): React.ReactElement => {
  const { checkedLogCurveInfoRows, dispatchOperation, dispatchNavigation, selectedLog, selectedServer, servers } = props;

  const onClickOpen = () => {
    dispatchOperation({ type: OperationType.HideContextMenu });
    const modalProps = { selectedLogCurveInfoRow: checkedLogCurveInfoRows, selectedLog, dispatchOperation, dispatchNavigation };
    const displayModalAction: DisplayModalAction = { type: OperationType.DisplayModal, payload: <SelectIndexToDisplayModal {...modalProps} /> };
    dispatchOperation(displayModalAction);
  };

  const onClickCopyRange = () => {
    const copyRangeProps: CopyRangeModalProps = {
      mnemonics: checkedLogCurveInfoRows.map((lc) => lc.mnemonic)
    };
    dispatchOperation({ type: OperationType.DisplayModal, payload: <CopyRangeModal {...copyRangeProps} /> });
  };

  const onClickProperties = () => {
    const logCurveInfo = checkedLogCurveInfoRows[0];
    const logCurveInfoPropertiesModalProps = { logCurveInfo, dispatchOperation, selectedLog };
    dispatchOperation({ type: OperationType.DisplayModal, payload: <LogCurveInfoPropertiesModal {...logCurveInfoPropertiesModalProps} /> });
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  const toDelete = createComponentReferences(
    checkedLogCurveInfoRows.map((lc) => lc.mnemonic),
    selectedLog,
    ComponentType.Mnemonic
  );
  return (
    <ContextMenu
      menuItems={[
        <MenuItem key={"open"} onClick={onClickOpen} disabled={checkedLogCurveInfoRows.length === 0}>
          <StyledIcon name="folderOpen" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Open</Typography>
        </MenuItem>,
        <MenuItem
          key={"copy"}
          onClick={() =>
            copyComponents(
              selectedServer,
              checkedLogCurveInfoRows.map((lc) => lc.mnemonic),
              selectedLog,
              dispatchOperation,
              ComponentType.Mnemonic
            )
          }
          disabled={checkedLogCurveInfoRows.length === 0}
        >
          <StyledIcon name="copy" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>{menuItemText("copy", "curve", checkedLogCurveInfoRows)}</Typography>
        </MenuItem>,
        <MenuItem key={"copyRange"} onClick={onClickCopyRange} disabled={checkedLogCurveInfoRows.length === 0}>
          <StyledIcon name="copy" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>{`${menuItemText("copy", "curve", checkedLogCurveInfoRows)} with range`}</Typography>
        </MenuItem>,
        <NestedMenuItem key={"copyToServer"} label={`${menuItemText("copy", "curve", checkedLogCurveInfoRows)} to server`} disabled={checkedLogCurveInfoRows.length < 1}>
          {servers.map(
            (server: Server) =>
              server.id !== selectedServer.id && (
                <MenuItem
                  key={server.name}
                  onClick={() =>
                    onClickCopyCurveToServer({
                      targetServer: server,
                      sourceServer: selectedServer,
                      curvesToCopy: checkedLogCurveInfoRows,
                      dispatchOperation,
                      sourceLog: selectedLog
                    })
                  }
                  disabled={checkedLogCurveInfoRows.length < 1}
                >
                  <Typography color={"primary"}>{server.name}</Typography>
                </MenuItem>
              )
          )}
        </NestedMenuItem>,
        <MenuItem key={"delete"} onClick={() => onClickDeleteComponents(dispatchOperation, toDelete, JobType.DeleteComponents)} disabled={checkedLogCurveInfoRows.length === 0}>
          <StyledIcon name="deleteToTrash" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>{menuItemText("delete", "curve", checkedLogCurveInfoRows)}</Typography>
        </MenuItem>,
        <NestedMenuItem key={"showOnServer"} label={"Show on server"}>
          {servers.map((server: Server) => (
            <MenuItem key={server.name} onClick={() => onClickShowObjectOnServer(dispatchOperation, server, selectedLog, ObjectType.Log)}>
              <Typography color={"primary"}>{server.name}</Typography>
            </MenuItem>
          ))}
        </NestedMenuItem>,
        <Divider key={"divider"} />,
        <MenuItem key={"properties"} onClick={onClickProperties} disabled={checkedLogCurveInfoRows.length !== 1}>
          <StyledIcon name="settings" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Properties</Typography>
        </MenuItem>
      ]}
    />
  );
};

export default LogCurveInfoContextMenu;
