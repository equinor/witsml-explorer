import { Divider, Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@material-ui/core";
import React from "react";
import {
  DisplayModalAction,
  HideContextMenuAction,
  HideModalAction
} from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import { ComponentType } from "../../models/componentType";
import { createComponentReferences } from "../../models/jobs/componentReferences";
import LogObject from "../../models/logObject";
import { ObjectType } from "../../models/objectType";
import { Server } from "../../models/server";
import Well from "../../models/well";
import Wellbore from "../../models/wellbore";
import { JobType } from "../../services/jobService";
import { colors } from "../../styles/Colors";
import { WITSML_INDEX_TYPE_MD } from "../Constants";
import { LogCurveInfoRow } from "../ContentViews/LogCurveInfoListView";
import AnalyzeGapModal, {
  AnalyzeGapModalProps
} from "../Modals/AnalyzeGapModal";
import CopyRangeModal, { CopyRangeModalProps } from "../Modals/CopyRangeModal";
import LogCurveInfoPropertiesModal from "../Modals/LogCurveInfoPropertiesModal";
import { IndexCurve } from "../Modals/LogPropertiesModal";
import SelectIndexToDisplayModal from "../Modals/SelectIndexToDisplayModal";
import ContextMenu from "./ContextMenu";
import {
  StyledIcon,
  menuItemText,
  onClickDeleteComponents,
  onClickShowObjectOnServer
} from "./ContextMenuUtils";
import { CopyComponentsToServerMenuItem } from "./CopyComponentsToServer";
import { copyComponents } from "./CopyUtils";
import NestedMenuItem from "./NestedMenuItem";

export interface LogCurveInfoContextMenuProps {
  checkedLogCurveInfoRows: LogCurveInfoRow[];
  dispatchOperation: (
    action: DisplayModalAction | HideContextMenuAction | HideModalAction
  ) => void;
  selectedLog: LogObject;
  selectedServer: Server;
  selectedWell: Well;
  selectedWellbore: Wellbore;
  servers: Server[];
}

const LogCurveInfoContextMenu = (
  props: LogCurveInfoContextMenuProps
): React.ReactElement => {
  const {
    checkedLogCurveInfoRows,
    dispatchOperation,
    selectedLog,
    selectedServer,
    selectedWell,
    selectedWellbore,
    servers
  } = props;

  const onClickOpen = () => {
    dispatchOperation({ type: OperationType.HideContextMenu });
    const modalProps = {
      wellUid: selectedWell.uid,
      wellboreUid: selectedWellbore.uid,
      log: selectedLog,
      logCurveInfoRows: checkedLogCurveInfoRows
    };
    const displayModalAction: DisplayModalAction = {
      type: OperationType.DisplayModal,
      payload: <SelectIndexToDisplayModal {...modalProps} />
    };
    dispatchOperation(displayModalAction);
  };

  const onClickCopyRange = () => {
    const copyRangeProps: CopyRangeModalProps = {
      logObject: selectedLog,
      mnemonics: checkedLogCurveInfoRows.map((lc) => lc.mnemonic)
    };
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: <CopyRangeModal {...copyRangeProps} />
    });
  };

  const onClickProperties = () => {
    const logCurveInfo = checkedLogCurveInfoRows[0].logCurveInfo;
    const logCurveInfoPropertiesModalProps = {
      logCurveInfo,
      dispatchOperation,
      selectedLog
    };
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: (
        <LogCurveInfoPropertiesModal {...logCurveInfoPropertiesModalProps} />
      )
    });
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  const onClickAnalyzeGaps = () => {
    const logObject = selectedLog;
    const mnemonics = checkedLogCurveInfoRows.map((lc) => lc.mnemonic);
    const analyzeGapModalProps: AnalyzeGapModalProps = { logObject, mnemonics };
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: <AnalyzeGapModal {...analyzeGapModalProps} />
    });
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
        <MenuItem
          key={"open"}
          onClick={onClickOpen}
          disabled={checkedLogCurveInfoRows.length === 0}
        >
          <StyledIcon
            name="folderOpen"
            color={colors.interactive.primaryResting}
          />
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
          <Typography color={"primary"}>
            {menuItemText(
              "copy",
              ComponentType.Mnemonic,
              checkedLogCurveInfoRows
            )}
          </Typography>
        </MenuItem>,
        <MenuItem
          key={"copyRange"}
          onClick={onClickCopyRange}
          disabled={checkedLogCurveInfoRows.length === 0}
        >
          <StyledIcon name="copy" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>{`${menuItemText(
            "copy",
            ComponentType.Mnemonic,
            checkedLogCurveInfoRows
          )} with range`}</Typography>
        </MenuItem>,
        <CopyComponentsToServerMenuItem
          key={"copyComponentToServer"}
          componentType={ComponentType.Mnemonic}
          componentsToCopy={checkedLogCurveInfoRows}
          sourceParent={selectedLog}
        />,
        <MenuItem
          key={"delete"}
          onClick={() =>
            onClickDeleteComponents(
              dispatchOperation,
              toDelete,
              JobType.DeleteComponents
            )
          }
          disabled={checkedLogCurveInfoRows.length === 0}
        >
          <StyledIcon
            name="deleteToTrash"
            color={colors.interactive.primaryResting}
          />
          <Typography color={"primary"}>
            {menuItemText(
              "delete",
              ComponentType.Mnemonic,
              checkedLogCurveInfoRows
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
                  selectedLog,
                  ObjectType.Log,
                  selectedLog.indexType === WITSML_INDEX_TYPE_MD
                    ? IndexCurve.Depth
                    : IndexCurve.Time
                )
              }
            >
              <Typography color={"primary"}>{server.name}</Typography>
            </MenuItem>
          ))}
        </NestedMenuItem>,
        <MenuItem
          key={"analyzeGaps"}
          onClick={
            onClickAnalyzeGaps
          } /*disabled={checkedLogCurveInfoRows.length !== 1}*/
        >
          <StyledIcon name="beat" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Analyze gaps</Typography>
        </MenuItem>,
        <Divider key={"divider"} />,
        <MenuItem
          key={"properties"}
          onClick={onClickProperties}
          disabled={checkedLogCurveInfoRows.length !== 1}
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

export default LogCurveInfoContextMenu;
