import { Typography } from "@equinor/eds-core-react";
import { Divider, MenuItem } from "@material-ui/core";
import { useQueryClient } from "@tanstack/react-query";
import { BatchModifyMenuItem } from "components/ContextMenus/BatchModifyMenuItem";
import ContextMenu from "components/ContextMenus/ContextMenu";
import {
  StyledIcon,
  menuItemText
} from "components/ContextMenus/ContextMenuUtils";
import { onClickPaste } from "components/ContextMenus/CopyUtils";
import NestedMenuItem from "components/ContextMenus/NestedMenuItem";
import {
  ObjectContextMenuProps,
  ObjectMenuItems
} from "components/ContextMenus/ObjectMenuItems";
import { useClipboardComponentReferencesOfType } from "components/ContextMenus/UseClipboardComponentReferences";
import AnalyzeGapModal, {
  AnalyzeGapModalProps
} from "components/Modals/AnalyzeGapModal";
import CompareLogDataModal from "components/Modals/CompareLogDataModal";
import DeleteEmptyMnemonicsModal, {
  DeleteEmptyMnemonicsModalProps
} from "components/Modals/DeleteEmptyMnemonicsModal";
import LogComparisonModal, {
  LogComparisonModalProps
} from "components/Modals/LogComparisonModal";
import LogDataImportModal, {
  LogDataImportModalProps
} from "components/Modals/LogDataImportModal";
import LogPropertiesModal from "components/Modals/LogPropertiesModal";
import { PropertiesModalMode } from "components/Modals/ModalParts";
import ObjectPickerModal, {
  ObjectPickerProps
} from "components/Modals/ObjectPickerModal";
import { ReportModal } from "components/Modals/ReportModal";
import SpliceLogsModal from "components/Modals/SpliceLogsModal";
import TrimLogObjectModal from "components/Modals/TrimLogObject/TrimLogObjectModal";
import { useConnectedServer } from "contexts/connectedServerContext";
import OperationContext from "contexts/operationContext";
import { DisplayModalAction } from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import { useGetServers } from "hooks/query/useGetServers";
import { useOpenInQueryView } from "hooks/useOpenInQueryView";
import { ComponentType } from "models/componentType";
import CheckLogHeaderJob from "models/jobs/checkLogHeaderJob";
import CompareLogDataJob from "models/jobs/compareLogData";
import { CopyRangeClipboard } from "models/jobs/componentReferences";
import { CopyComponentsJob } from "models/jobs/copyJobs";
import ObjectReference from "models/jobs/objectReference";
import LogObject from "models/logObject";
import ObjectOnWellbore, { toObjectReference } from "models/objectOnWellbore";
import { ObjectType } from "models/objectType";
import { Server } from "models/server";
import React, { useContext } from "react";
import JobService, { JobType } from "services/jobService";
import { colors } from "styles/Colors";
import { v4 as uuid } from "uuid";

const LogObjectContextMenu = (
  props: ObjectContextMenuProps
): React.ReactElement => {
  const { checkedObjects } = props;
  const { dispatchOperation } = useContext(OperationContext);
  const openInQueryView = useOpenInQueryView();
  const logCurvesReference: CopyRangeClipboard =
    useClipboardComponentReferencesOfType(ComponentType.Mnemonic);
  const { connectedServer } = useConnectedServer();
  const { servers } = useGetServers();
  const queryClient = useQueryClient();

  const onClickProperties = () => {
    dispatchOperation({ type: OperationType.HideContextMenu });
    const logObject = checkedObjects[0];
    const logPropertiesModalProps = {
      mode: PropertiesModalMode.Edit,
      logObject,
      dispatchOperation
    };
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: <LogPropertiesModal {...logPropertiesModalProps} />
    });
  };

  const onClickTrimLogObject = () => {
    const logObject = checkedObjects[0];
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: <TrimLogObjectModal logObject={logObject} />
    });
  };

  const onClickImport = async () => {
    const logDataImportModalProps: LogDataImportModalProps = {
      targetLog: checkedObjects[0]
    };
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: <LogDataImportModal {...logDataImportModalProps} />
    });
  };
  const onClickAnalyzeGaps = () => {
    dispatchOperation({ type: OperationType.HideContextMenu });
    const logObject = checkedObjects[0];
    const analyzeGapModalProps: AnalyzeGapModalProps = {
      logObject,
      mnemonics: []
    };
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: <AnalyzeGapModal {...analyzeGapModalProps} />
    });
  };

  const orderCopyJob = () => {
    dispatchOperation({ type: OperationType.HideContextMenu });
    const targetReference: ObjectReference = toObjectReference(
      checkedObjects[0]
    );
    const copyJob: CopyComponentsJob = {
      source: logCurvesReference,
      target: targetReference,
      startIndex: logCurvesReference.startIndex,
      endIndex: logCurvesReference.endIndex
    };
    JobService.orderJob(JobType.CopyLogData, copyJob);
  };

  const onClickCompareHeader = () => {
    dispatchOperation({ type: OperationType.HideContextMenu });
    const onPicked = (targetObject: ObjectOnWellbore, targetServer: Server) => {
      const props: LogComparisonModalProps = {
        sourceLog: checkedObjects[0],
        sourceServer: connectedServer,
        targetServer,
        targetObject,
        dispatchOperation
      };
      dispatchOperation({
        type: OperationType.DisplayModal,
        payload: <LogComparisonModal {...props} />
      });
    };
    const props: ObjectPickerProps = {
      sourceObject: checkedObjects[0],
      objectType: ObjectType.Log,
      onPicked
    };
    if (checkedObjects.length === 2) {
      onPicked(checkedObjects[1], connectedServer);
    } else {
      dispatchOperation({
        type: OperationType.DisplayModal,
        payload: <ObjectPickerModal {...props} />
      });
    }
  };

  const onClickCompareData = async () => {
    dispatchOperation({ type: OperationType.HideContextMenu });
    const onPicked = async (
      targetObject: ObjectOnWellbore,
      targetServer: Server,
      includeIndexDuplicates: boolean,
      compareAllIndexes: boolean
    ) => {
      const compareLogDataJob: CompareLogDataJob = {
        sourceLog: checkedObjects[0],
        targetLog: targetObject,
        includeIndexDuplicates,
        compareAllIndexes
      };
      const jobId = await JobService.orderJobAtServer(
        JobType.CompareLogData,
        compareLogDataJob,
        targetServer,
        connectedServer
      );
      if (jobId) {
        const reportModalProps = { jobId };
        dispatchOperation({
          type: OperationType.DisplayModal,
          payload: <ReportModal {...reportModalProps} />
        });
      }
    };
    if (checkedObjects.length === 2) {
      dispatchOperation({
        type: OperationType.DisplayModal,
        payload: (
          <CompareLogDataModal
            targetObject={checkedObjects[1]}
            targetServer={connectedServer}
            onPicked={onPicked}
          />
        )
      });
    } else {
      const props: ObjectPickerProps = {
        sourceObject: checkedObjects[0],
        objectType: ObjectType.Log,
        onPicked,
        includeIndexDuplicatesOption: true,
        includeCompareAllLogIndexesOption: true
      };
      dispatchOperation({
        type: OperationType.DisplayModal,
        payload: <ObjectPickerModal {...props} />
      });
    }
  };

  const onClickCheckHeader = async () => {
    dispatchOperation({ type: OperationType.HideContextMenu });
    const logReference: LogObject = checkedObjects[0];
    const checkLogHeaderJob: CheckLogHeaderJob = { logReference };
    const jobId = await JobService.orderJob(
      JobType.CheckLogHeader,
      checkLogHeaderJob
    );
    if (jobId) {
      const reportModalProps = { jobId };
      dispatchOperation({
        type: OperationType.DisplayModal,
        payload: <ReportModal {...reportModalProps} />
      });
    }
  };

  const onClickSplice = () => {
    dispatchOperation({ type: OperationType.HideContextMenu });
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: <SpliceLogsModal checkedLogs={checkedObjects} />
    });
  };

  const onClickCountLogData = async () => {
    dispatchOperation({ type: OperationType.HideContextMenu });
    const logReference: LogObject = checkedObjects[0];
    const checkLogHeaderJob: CheckLogHeaderJob = { logReference };
    const jobId = await JobService.orderJob(
      JobType.CountLogDataRows,
      checkLogHeaderJob
    );
    if (jobId) {
      const reportModalProps = { jobId };
      dispatchOperation({
        type: OperationType.DisplayModal,
        payload: <ReportModal {...reportModalProps} />
      });
    }
  };

  const onClickDeleteEmptyMnemonics = async () => {
    const deleteEmptyMnemonicsModalProps: DeleteEmptyMnemonicsModalProps = {
      logs: checkedObjects
    };
    const action: DisplayModalAction = {
      type: OperationType.DisplayModal,
      payload: <DeleteEmptyMnemonicsModal {...deleteEmptyMnemonicsModalProps} />
    };
    dispatchOperation(action);
  };

  const extraMenuItems = (): React.ReactElement[] => {
    return [
      <MenuItem
        key={"pastelogcurves"}
        onClick={() =>
          onClickPaste(servers, logCurvesReference.serverUrl, orderCopyJob)
        }
        disabled={logCurvesReference === null || checkedObjects.length !== 1}
      >
        <StyledIcon name="paste" color={colors.interactive.primaryResting} />
        <Typography color={"primary"}>
          {menuItemText("paste", "mnemonic", logCurvesReference?.componentUids)}
        </Typography>
      </MenuItem>,
      <NestedMenuItem key={"editlognestedmenu"} label={"Edit"} icon="edit">
        {[
          <MenuItem
            key={"trimlogobject"}
            onClick={onClickTrimLogObject}
            disabled={checkedObjects.length !== 1}
          >
            <StyledIcon
              name="formatLine"
              color={colors.interactive.primaryResting}
            />
            <Typography color={"primary"}>Adjust range</Typography>
          </MenuItem>,
          <MenuItem
            key={"splice"}
            onClick={onClickSplice}
            disabled={checkedObjects.length < 2}
          >
            <StyledIcon
              name="compare"
              color={colors.interactive.primaryResting}
            />
            <Typography color={"primary"}>Splice logs</Typography>
          </MenuItem>,
          <BatchModifyMenuItem
            key="batchModify"
            checkedObjects={checkedObjects}
            objectType={ObjectType.Log}
          />
        ]}
        ,
      </NestedMenuItem>,
      <Divider key={uuid()} />,
      <NestedMenuItem
        key={"agentslognestedmenu"}
        label={"Agents"}
        icon="person"
      >
        {[
          <MenuItem
            key={"comparelogheader"}
            onClick={onClickCompareHeader}
            disabled={checkedObjects.length > 2}
          >
            <StyledIcon
              name="compare"
              color={colors.interactive.primaryResting}
            />
            <Typography color={"primary"}>{`${menuItemText(
              "compare",
              "log",
              []
            )} header`}</Typography>
          </MenuItem>,
          <MenuItem
            key={"comparelogdata"}
            onClick={onClickCompareData}
            disabled={checkedObjects.length > 2}
          >
            <StyledIcon
              name="compare"
              color={colors.interactive.primaryResting}
            />
            <Typography color={"primary"}>{`${menuItemText(
              "compare",
              "log",
              []
            )} data`}</Typography>
          </MenuItem>,
          <MenuItem
            key={"analyzeGaps"}
            onClick={onClickAnalyzeGaps}
            disabled={checkedObjects.length !== 1}
          >
            <StyledIcon name="beat" color={colors.interactive.primaryResting} />
            <Typography color={"primary"}>Analyze gaps</Typography>
          </MenuItem>,
          <MenuItem
            key={"checkHeader"}
            onClick={onClickCheckHeader}
            disabled={checkedObjects.length !== 1}
          >
            <StyledIcon
              name="compare"
              color={colors.interactive.primaryResting}
            />
            <Typography color={"primary"}>{`${menuItemText(
              "check",
              "log header",
              []
            )}`}</Typography>
          </MenuItem>,
          <MenuItem
            key={"countLogData"}
            onClick={onClickCountLogData}
            disabled={checkedObjects.length !== 1}
          >
            <StyledIcon
              name="assignment"
              color={colors.interactive.primaryResting}
            />
            <Typography color={"primary"}>{`${menuItemText(
              "count",
              "log data",
              []
            )}`}</Typography>
          </MenuItem>,
          <MenuItem
            key={"deleteEmptyMnemonics"}
            onClick={onClickDeleteEmptyMnemonics}
          >
            <StyledIcon
              name="deleteToTrash"
              color={colors.interactive.primaryResting}
            />
            <Typography color={"primary"}>Delete empty mnemonics</Typography>
          </MenuItem>
        ]}
      </NestedMenuItem>,
      <Divider key={uuid()} />,
      <MenuItem
        key={"importlogdata"}
        onClick={onClickImport}
        disabled={checkedObjects.length === 0}
      >
        <StyledIcon name="upload" color={colors.interactive.primaryResting} />
        <Typography color={"primary"}>Import log data from .csv</Typography>
      </MenuItem>,
      <Divider key={uuid()} />,
      <MenuItem
        key={"properties"}
        onClick={onClickProperties}
        disabled={checkedObjects.length !== 1}
      >
        <StyledIcon name="settings" color={colors.interactive.primaryResting} />
        <Typography color={"primary"}>Properties</Typography>
      </MenuItem>
    ];
  };

  return (
    <ContextMenu
      menuItems={[
        ...ObjectMenuItems(
          checkedObjects,
          ObjectType.Log,
          connectedServer,
          servers,
          dispatchOperation,
          queryClient,
          openInQueryView,
          extraMenuItems()
        )
      ]}
    />
  );
};

export default LogObjectContextMenu;
