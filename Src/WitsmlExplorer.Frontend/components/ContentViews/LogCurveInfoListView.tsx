import { Switch, Typography } from "@equinor/eds-core-react";
import { ContentTable } from "components/ContentViews/table";
import { getContextMenuPosition } from "components/ContextMenus/ContextMenu";
import LogCurveInfoContextMenu, {
  LogCurveInfoContextMenuProps
} from "components/ContextMenus/LogCurveInfoContextMenu";
import ProgressSpinner from "components/ProgressSpinner";
import { CommonPanelContainer } from "components/StyledComponents/Container";
import { useConnectedServer } from "contexts/connectedServerContext";
import { useCurveThreshold } from "contexts/curveThresholdContext";
import OperationContext from "contexts/operationContext";
import { UserTheme } from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import { useGetComponents } from "hooks/query/useGetComponents";
import { useGetObject } from "hooks/query/useGetObject";
import { useGetServers } from "hooks/query/useGetServers";
import { useExpandSidebarNodes } from "hooks/useExpandObjectGroupNodes";
import { ComponentType } from "models/componentType";
import { ObjectType } from "models/objectType";
import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { truncateAbortHandler } from "services/apiClient";
import LogCurvePriorityService from "services/logCurvePriorityService";
import {
  LogCurveInfoRow,
  columns,
  getTableData
} from "./LogCurveInfoListViewUtils";
import { ItemNotFound } from "routes/ItemNotFound";
import LogObject from "models/logObject";

export default function LogCurveInfoListView() {
  const { curveThreshold } = useCurveThreshold();
  const {
    operationState: { timeZone, dateTimeFormat, theme }
  } = useContext(OperationContext);
  const { dispatchOperation } = useContext(OperationContext);
  const { wellUid, wellboreUid, logType, objectUid } = useParams();
  const { connectedServer } = useConnectedServer();
  const { servers } = useGetServers();
  const {
    object: logObject,
    isFetching: isFetchingLog,
    isFetched: isFetchedLog
  } = useGetObject(
    connectedServer,
    wellUid,
    wellboreUid,
    ObjectType.Log,
    objectUid
  );
  const { components: logCurveInfoList, isFetching: isFetchingLogCurveInfo } =
    useGetComponents(
      connectedServer,
      wellUid,
      wellboreUid,
      objectUid,
      ComponentType.Mnemonic
    );
  const isDepthIndex = !!logCurveInfoList?.[0]?.maxDepthIndex;
  const isFetching = isFetchingLog || isFetchingLogCurveInfo;

  useExpandSidebarNodes(wellUid, wellboreUid, ObjectType.Log, logType);

  const [hideEmptyMnemonics, setHideEmptyMnemonics] = useState<boolean>(false);
  const [showOnlyPrioritizedCurves, setShowOnlyPrioritizedCurves] =
    useState<boolean>(false);
  const [prioritizedCurves, setPrioritizedCurves] = useState<string[]>([]);

  const logObjects = new Map<string, LogObject>([[objectUid, logObject]]);

  useEffect(() => {
    if (logObject) {
      const getLogCurvePriority = async () => {
        const prioritizedCurves =
          await LogCurvePriorityService.getPrioritizedCurves(
            wellUid,
            wellboreUid
          );
        setPrioritizedCurves(prioritizedCurves);
      };

      getLogCurvePriority().catch(truncateAbortHandler);
      setShowOnlyPrioritizedCurves(false);
    }
  }, [logObject]);

  const onContextMenu = (
    event: React.MouseEvent<HTMLLIElement>,
    {},
    checkedLogCurveInfoRows: LogCurveInfoRow[]
  ) => {
    const contextMenuProps: LogCurveInfoContextMenuProps = {
      checkedLogCurveInfoRows,
      dispatchOperation,
      selectedLog: logObject,
      selectedServer: connectedServer,
      servers,
      prioritizedCurves,
      setPrioritizedCurves
    };
    const position = getContextMenuPosition(event);
    dispatchOperation({
      type: OperationType.DisplayContextMenu,
      payload: {
        component: <LogCurveInfoContextMenu {...contextMenuProps} />,
        position
      }
    });
  };

  if (isFetching) {
    return <ProgressSpinner message={`Fetching Log.`} />;
  }

  if (isFetchedLog && !logObject) {
    return <ItemNotFound itemType={ObjectType.Log} />;
  }

  const panelElements = [
    <CommonPanelContainer key="hideEmptyMnemonics">
      <Switch
        checked={hideEmptyMnemonics}
        onChange={() => setHideEmptyMnemonics(!hideEmptyMnemonics)}
        size={theme === UserTheme.Compact ? "small" : "default"}
      />
      <Typography>Hide Empty Curves</Typography>
    </CommonPanelContainer>,
    <CommonPanelContainer key="showPriority">
      <Switch
        checked={showOnlyPrioritizedCurves}
        disabled={prioritizedCurves.length === 0 && !showOnlyPrioritizedCurves}
        onChange={() =>
          setShowOnlyPrioritizedCurves(!showOnlyPrioritizedCurves)
        }
        size={theme === UserTheme.Compact ? "small" : "default"}
      />
      <Typography>Show Only Prioritized Curves</Typography>
    </CommonPanelContainer>
  ];

  return (
    logObjects && (
      <ContentTable
        viewId={
          isDepthIndex
            ? "depthLogCurveInfoListView"
            : "timeLogCurveInfoListView"
        }
        panelElements={panelElements}
        columns={columns(
          isDepthIndex,
          showOnlyPrioritizedCurves,
          prioritizedCurves,
          logObjects,
          hideEmptyMnemonics,
          true
        )}
        data={getTableData(
          logCurveInfoList,
          logObjects,
          timeZone,
          dateTimeFormat,
          curveThreshold,
          objectUid
        )}
        onContextMenu={onContextMenu}
        checkableRows
        showRefresh
        downloadToCsvFileName={`LogCurveInfo_${logObject.name}`}
      />
    )
  );
}
