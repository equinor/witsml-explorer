import { Typography } from "@equinor/eds-core-react";
import { Divider, MenuItem } from "@material-ui/core";
import React, { useContext } from "react";
import ModificationType from "../../contexts/modificationType";
import NavigationContext from "../../contexts/navigationContext";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import { ComponentType } from "../../models/componentType";
import { CopyRangeClipboard } from "../../models/jobs/componentReferences";
import { CopyComponentsJob } from "../../models/jobs/copyJobs";
import ObjectReference from "../../models/jobs/objectReference";
import { toObjectReference } from "../../models/objectOnWellbore";
import { ObjectType } from "../../models/objectType";
import { Server } from "../../models/server";
import JobService, { JobType } from "../../services/jobService";
import ObjectService from "../../services/objectService";
import { colors } from "../../styles/Colors";
import LogComparisonModal, { LogComparisonModalProps } from "../Modals/LogComparisonModal";
import LogDataImportModal, { LogDataImportModalProps } from "../Modals/LogDataImportModal";
import LogPropertiesModal from "../Modals/LogPropertiesModal";
import { PropertiesModalMode } from "../Modals/ModalParts";
import TrimLogObjectModal, { TrimLogObjectModalProps } from "../Modals/TrimLogObject/TrimLogObjectModal";
import ContextMenu from "./ContextMenu";
import { menuItemText, StyledIcon } from "./ContextMenuUtils";
import { onClickPaste } from "./CopyUtils";
import NestedMenuItem from "./NestedMenuItem";
import { ObjectContextMenuProps, ObjectMenuItems } from "./ObjectMenuItems";
import { useClipboardComponentReferencesOfType } from "./UseClipboardComponentReferences";

const LogObjectContextMenu = (props: ObjectContextMenuProps): React.ReactElement => {
  const { checkedObjects, wellbore } = props;
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { servers, selectedServer } = navigationState;
  const { dispatchOperation } = useContext(OperationContext);
  const logCurvesReference: CopyRangeClipboard = useClipboardComponentReferencesOfType(ComponentType.Mnemonic);

  const onClickProperties = () => {
    const logObject = checkedObjects[0];
    const logPropertiesModalProps = { mode: PropertiesModalMode.Edit, logObject, dispatchOperation };
    dispatchOperation({ type: OperationType.DisplayModal, payload: <LogPropertiesModal {...logPropertiesModalProps} /> });
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  const onClickTrimLogObject = () => {
    const logObject = checkedObjects[0];
    const trimLogObjectProps: TrimLogObjectModalProps = { dispatchNavigation, dispatchOperation, logObject };
    dispatchOperation({ type: OperationType.DisplayModal, payload: <TrimLogObjectModal {...trimLogObjectProps} /> });
  };

  const onClickImport = async () => {
    const logDataImportModalProps: LogDataImportModalProps = { targetLog: checkedObjects[0], dispatchOperation };
    dispatchOperation({ type: OperationType.DisplayModal, payload: <LogDataImportModal {...logDataImportModalProps} /> });
  };

  const onClickRefresh = async () => {
    const log = await ObjectService.getObject(checkedObjects[0].wellUid, checkedObjects[0].wellboreUid, checkedObjects[0].uid, ObjectType.Log);
    dispatchNavigation({
      type: ModificationType.UpdateLogObject,
      payload: { log: log }
    });
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  const orderCopyJob = () => {
    const targetReference: ObjectReference = toObjectReference(checkedObjects[0]);
    const copyJob: CopyComponentsJob = {
      source: logCurvesReference,
      target: targetReference,
      startIndex: logCurvesReference.startIndex,
      endIndex: logCurvesReference.endIndex
    };
    JobService.orderJob(JobType.CopyLogData, copyJob);
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  const onClickCompareLogToServer = async (targetServer: Server) => {
    dispatchOperation({ type: OperationType.HideContextMenu });
    const props: LogComparisonModalProps = { sourceLog: checkedObjects[0], sourceServer: selectedServer, targetServer, dispatchOperation };
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: <LogComparisonModal {...props} />
    });
  };

  return (
    <ContextMenu
      menuItems={[
        <MenuItem key={"refreshlog"} onClick={onClickRefresh} disabled={checkedObjects.length !== 1}>
          <StyledIcon name="refresh" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Refresh log</Typography>
        </MenuItem>,
        ...ObjectMenuItems(checkedObjects, ObjectType.Log, navigationState, dispatchOperation, wellbore),
        <MenuItem
          key={"pastelogcurves"}
          onClick={() => onClickPaste(servers, logCurvesReference.serverUrl, orderCopyJob)}
          disabled={logCurvesReference === null || checkedObjects.length !== 1}
        >
          <StyledIcon name="paste" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>{menuItemText("paste", "log curve", logCurvesReference?.componentUids)}</Typography>
        </MenuItem>,
        <NestedMenuItem key={"compareToServer"} label={`${menuItemText("Compare", "log", [])} to server`} disabled={checkedObjects.length != 1} icon="compare">
          {servers.map(
            (server: Server) =>
              server.id !== selectedServer.id && (
                <MenuItem key={server.name} onClick={() => onClickCompareLogToServer(server)} disabled={checkedObjects.length != 1}>
                  <Typography color={"primary"}>{server.name}</Typography>
                </MenuItem>
              )
          )}
        </NestedMenuItem>,
        <MenuItem key={"trimlogobject"} onClick={onClickTrimLogObject} disabled={checkedObjects.length !== 1}>
          <StyledIcon name="formatLine" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Adjust range</Typography>
        </MenuItem>,
        <MenuItem key={"importlogdata"} onClick={onClickImport} disabled={checkedObjects.length === 0}>
          <StyledIcon name="upload" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Import log data from .csv</Typography>
        </MenuItem>,
        <Divider key={"divider"} />,
        <MenuItem key={"properties"} onClick={onClickProperties} disabled={checkedObjects.length !== 1}>
          <StyledIcon name="settings" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Properties</Typography>
        </MenuItem>
      ]}
    />
  );
};

export default LogObjectContextMenu;
