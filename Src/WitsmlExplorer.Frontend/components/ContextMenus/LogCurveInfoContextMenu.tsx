import { Divider, Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@material-ui/core";
import { WITSML_INDEX_TYPE_MD } from "components/Constants";
import { LogCurveInfoRow } from "components/ContentViews/LogCurveInfoListView";
import ContextMenu from "components/ContextMenus/ContextMenu";
import {
  StyledIcon,
  menuItemText,
  onClickDeleteComponents,
  onClickShowObjectOnServer
} from "components/ContextMenus/ContextMenuUtils";
import { CopyComponentsToServerMenuItem } from "components/ContextMenus/CopyComponentsToServer";
import { copyComponents } from "components/ContextMenus/CopyUtils";
import NestedMenuItem from "components/ContextMenus/NestedMenuItem";
import AnalyzeGapModal, {
  AnalyzeGapModalProps
} from "components/Modals/AnalyzeGapModal";
import CopyRangeModal, {
  CopyRangeModalProps
} from "components/Modals/CopyRangeModal";
import LogCurveInfoPropertiesModal from "components/Modals/LogCurveInfoPropertiesModal";
import {
  LogCurvePriorityModal,
  LogCurvePriorityModalProps
} from "components/Modals/LogCurvePriorityModal";
import { IndexCurve } from "components/Modals/LogPropertiesModal";
import SelectIndexToDisplayModal from "components/Modals/SelectIndexToDisplayModal";
import {
  DisplayModalAction,
  HideContextMenuAction,
  HideModalAction
} from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import { ComponentType } from "models/componentType";
import { createComponentReferences } from "models/jobs/componentReferences";
import LogObject from "models/logObject";
import { ObjectType } from "models/objectType";
import { Server } from "models/server";
import Well from "models/well";
import Wellbore from "models/wellbore";
import React from "react";
import { JobType } from "services/jobService";
import LogCurvePriorityService from "services/logCurvePriorityService";
import { colors } from "styles/Colors";
import LogCurveInfoBatchUpdateModal from "../Modals/LogCurveInfoBatchUpdateModal";

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
  prioritizedCurves: string[];
  setPrioritizedCurves: (prioritizedCurves: string[]) => void;
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
    servers,
    prioritizedCurves,
    setPrioritizedCurves
  } = props;

  const onlyPrioritizedCurvesAreChecked = checkedLogCurveInfoRows.every(
    (row, index) =>
      prioritizedCurves.includes(row.mnemonic) ||
      (checkedLogCurveInfoRows.length > 1 && index === 0)
  );

  const checkedLogCurveInfoRowsWithoutIndexCurve =
    checkedLogCurveInfoRows.filter(
      (lc) => lc.mnemonic !== selectedLog.indexCurve
    );

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
    dispatchOperation({ type: OperationType.HideContextMenu });
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
  };

  const onClickBatchUpdate = () => {
    const logCurveInfoRows = checkedLogCurveInfoRows;
    const logCurveInfoBatchUpdateModalProps = {
      logCurveInfoRows,
      selectedLog
    };
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: (
        <LogCurveInfoBatchUpdateModal {...logCurveInfoBatchUpdateModalProps} />
      )
    });
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  const onClickAnalyzeGaps = () => {
    dispatchOperation({ type: OperationType.HideContextMenu });
    const logObject = selectedLog;
    const mnemonics = checkedLogCurveInfoRows.map((lc) => lc.mnemonic);
    const analyzeGapModalProps: AnalyzeGapModalProps = { logObject, mnemonics };
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: <AnalyzeGapModal {...analyzeGapModalProps} />
    });
  };

  const onClickEditPriority = () => {
    dispatchOperation({ type: OperationType.HideContextMenu });
    const logCurvePriorityModalProps: LogCurvePriorityModalProps = {
      wellUid: selectedLog.wellUid,
      wellboreUid: selectedLog.wellboreUid,
      prioritizedCurves,
      setPrioritizedCurves
    };
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: <LogCurvePriorityModal {...logCurvePriorityModalProps} />
    });
  };

  const onClickSetPriority = async () => {
    dispatchOperation({ type: OperationType.HideContextMenu });
    const newCurvesToPrioritize = checkedLogCurveInfoRows.map(
      (lc) => lc.mnemonic
    );
    const curvesToPrioritize = Array.from(
      new Set(prioritizedCurves.concat(newCurvesToPrioritize))
    );
    const newPrioritizedCurves =
      await LogCurvePriorityService.setPrioritizedCurves(
        selectedLog.wellUid,
        selectedLog.wellboreUid,
        curvesToPrioritize
      );
    setPrioritizedCurves(newPrioritizedCurves);
  };

  const onClickRemovePriority = async () => {
    dispatchOperation({ type: OperationType.HideContextMenu });
    const curvesToDelete = checkedLogCurveInfoRows.map((lc) => lc.mnemonic);
    const curvesToPrioritize = prioritizedCurves.filter(
      (curve) => !curvesToDelete.includes(curve)
    );
    const newPrioritizedCurves =
      await LogCurvePriorityService.setPrioritizedCurves(
        selectedLog.wellUid,
        selectedLog.wellboreUid,
        curvesToPrioritize
      );
    setPrioritizedCurves(newPrioritizedCurves);
  };

  const toDelete = createComponentReferences(
    checkedLogCurveInfoRowsWithoutIndexCurve.map((lc) => lc.mnemonic),
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
          key={"copyComponentToServerWithRange"}
          componentType={ComponentType.Mnemonic}
          componentsToCopy={checkedLogCurveInfoRows}
          sourceParent={selectedLog}
          withRange
        />,
        <CopyComponentsToServerMenuItem
          key={"copyComponentToServer"}
          componentType={ComponentType.Mnemonic}
          componentsToCopy={checkedLogCurveInfoRows}
          sourceParent={selectedLog}
          componentsToPreserve={checkedLogCurveInfoRows.filter(
            (lci) => lci.mnemonic === selectedLog.indexCurve
          )}
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
          disabled={checkedLogCurveInfoRowsWithoutIndexCurve.length === 0}
        >
          <StyledIcon
            name="deleteToTrash"
            color={colors.interactive.primaryResting}
          />
          <Typography color={"primary"}>
            {menuItemText(
              "delete",
              ComponentType.Mnemonic,
              checkedLogCurveInfoRowsWithoutIndexCurve
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
          onClick={onClickAnalyzeGaps}
          disabled={checkedLogCurveInfoRowsWithoutIndexCurve.length === 0}
        >
          <StyledIcon name="beat" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Analyze gaps</Typography>
        </MenuItem>,
        <MenuItem
          key={"setPriority"}
          onClick={() =>
            onlyPrioritizedCurvesAreChecked
              ? onClickRemovePriority()
              : onClickSetPriority()
          }
        >
          <StyledIcon
            name={
              onlyPrioritizedCurvesAreChecked
                ? "favoriteFilled"
                : "favoriteOutlined"
            }
            color={colors.interactive.primaryResting}
          />
          <Typography color={"primary"}>
            {onlyPrioritizedCurvesAreChecked
              ? "Remove Priority"
              : "Set Priority"}
          </Typography>
        </MenuItem>,
        <MenuItem key={"editPriority"} onClick={onClickEditPriority}>
          <StyledIcon
            name="favoriteOutlined"
            color={colors.interactive.primaryResting}
          />
          <Typography color={"primary"}>Edit Priority</Typography>
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
        </MenuItem>,
        <MenuItem
          key={"batchUpdate"}
          onClick={onClickBatchUpdate}
          disabled={checkedLogCurveInfoRows.length < 2}
        >
          <StyledIcon
            name="settings"
            color={colors.interactive.primaryResting}
          />
          <Typography color={"primary"}>Batch Update</Typography>
        </MenuItem>
      ]}
    />
  );
};

export default LogCurveInfoContextMenu;
